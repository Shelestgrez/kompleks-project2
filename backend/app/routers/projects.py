from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[schemas.ProjectOut])
def list_projects(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    return db.query(models.Project).order_by(models.Project.created_at.desc()).all()


@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def dashboard_stats(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    from datetime import date

    today = date.today()
    total = db.query(func.count(models.Project.id)).scalar() or 0
    active = (
        db.query(func.count(models.Project.id))
        .filter(models.Project.status == models.ProjectStatus.active)
        .scalar()
        or 0
    )
    open_tasks = (
        db.query(func.count(models.Task.id))
        .filter(
            models.Task.status.in_(
                [models.TaskStatus.todo, models.TaskStatus.in_progress, models.TaskStatus.review]
            )
        )
        .scalar()
        or 0
    )
    overdue = (
        db.query(func.count(models.Task.id))
        .filter(
            models.Task.due_date.isnot(None),
            models.Task.due_date < today,
            models.Task.status != models.TaskStatus.done,
        )
        .scalar()
        or 0
    )
    return schemas.DashboardStats(
        projects_total=total,
        projects_active=active,
        tasks_open=open_tasks,
        tasks_overdue=overdue,
    )


@router.get("/dashboard/insights", response_model=schemas.DashboardInsights)
def dashboard_insights(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    tasks_by_status: dict[str, int] = {}
    for st in models.TaskStatus:
        n = db.query(func.count(models.Task.id)).filter(models.Task.status == st).scalar() or 0
        tasks_by_status[st.value] = n

    projects_by_status: dict[str, int] = {}
    for st in models.ProjectStatus:
        n = db.query(func.count(models.Project.id)).filter(models.Project.status == st).scalar() or 0
        projects_by_status[st.value] = n

    docs = db.query(func.count(models.Document.id)).scalar() or 0
    tests = db.query(func.count(models.TestRecord.id)).scalar() or 0

    return schemas.DashboardInsights(
        tasks_by_status=tasks_by_status,
        projects_by_status=projects_by_status,
        documents_total=docs,
        tests_total=tests,
    )


@router.get("/dashboard/recent-tasks", response_model=list[schemas.RecentTaskOut])
def dashboard_recent_tasks(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
    limit: Annotated[int, Query(ge=1, le=40)] = 12,
):
    rows = (
        db.query(models.Task, models.Project, models.User)
        .join(models.Project, models.Task.project_id == models.Project.id)
        .outerjoin(models.User, models.Task.assignee_id == models.User.id)
        .order_by(models.Task.updated_at.desc().nulls_last(), models.Task.id.desc())
        .limit(limit)
        .all()
    )
    out: list[schemas.RecentTaskOut] = []
    for task, project, assignee in rows:
        out.append(
            schemas.RecentTaskOut(
                id=task.id,
                title=task.title,
                status=schemas.TaskStatusEnum(task.status.value),
                project_id=project.id,
                project_code=project.code,
                project_name=project.name,
                due_date=task.due_date,
                updated_at=task.updated_at,
                assignee_name=assignee.full_name if assignee else None,
            )
        )
    return out


@router.post("", response_model=schemas.ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    body: schemas.ProjectCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    if db.query(models.Project).filter(models.Project.code == body.code).first():
        raise HTTPException(status_code=400, detail="Код проекта уже занят")
    p = models.Project(
        name=body.name,
        code=body.code,
        description=body.description,
        customer_name=body.customer_name,
        object_address=body.object_address,
        status=models.ProjectStatus(body.status.value),
        start_date=body.start_date,
        end_date=body.end_date,
        manager_id=body.manager_id,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Проект не найден")
    return p


@router.patch("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    body: schemas.ProjectUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Проект не найден")
    data = body.model_dump(exclude_unset=True)
    if "status" in data and data["status"] is not None:
        data["status"] = models.ProjectStatus(data["status"].value)
    for k, v in data.items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[models.User, Depends(get_current_user)],
):
    if user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Только администратор может удалять проекты")
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Проект не найден")
    db.delete(p)
    db.commit()
    return None
