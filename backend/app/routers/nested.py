import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app import models, schemas
from app.deps import get_current_user

router = APIRouter(prefix="/projects/{project_id}", tags=["project-data"])


def _get_project(db: Session, project_id: int) -> models.Project:
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Проект не найден")
    return p


# --- Contracts ---


@router.get("/contracts", response_model=list[schemas.ContractOut])
def list_contracts(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    _get_project(db, project_id)
    return db.query(models.Contract).filter(models.Contract.project_id == project_id).all()


@router.post("/contracts", response_model=schemas.ContractOut, status_code=status.HTTP_201_CREATED)
def create_contract(
    project_id: int,
    body: schemas.ContractCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    _get_project(db, project_id)
    c = models.Contract(project_id=project_id, **body.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


# --- Phases ---


@router.get("/phases", response_model=list[schemas.PhaseOut])
def list_phases(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    _get_project(db, project_id)
    return (
        db.query(models.ProjectPhase)
        .filter(models.ProjectPhase.project_id == project_id)
        .order_by(models.ProjectPhase.sort_order)
        .all()
    )


@router.post("/phases", response_model=schemas.PhaseOut, status_code=status.HTTP_201_CREATED)
def create_phase(
    project_id: int,
    body: schemas.PhaseCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    _get_project(db, project_id)
    ph = models.ProjectPhase(project_id=project_id, **body.model_dump())
    db.add(ph)
    db.commit()
    db.refresh(ph)
    return ph


# --- Tasks ---


@router.get("/tasks", response_model=list[schemas.TaskOut])
def list_tasks(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    _get_project(db, project_id)
    return (
        db.query(models.Task)
        .filter(models.Task.project_id == project_id)
        .order_by(models.Task.due_date.asc().nulls_last(), models.Task.id)
        .all()
    )


@router.post("/tasks", response_model=schemas.TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    project_id: int,
    body: schemas.TaskCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    _get_project(db, project_id)
    now = datetime.now(timezone.utc)
    t = models.Task(
        project_id=project_id,
        title=body.title,
        description=body.description,
        status=models.TaskStatus(body.status.value),
        priority=body.priority,
        assignee_id=body.assignee_id,
        phase_id=body.phase_id,
        due_date=body.due_date,
        updated_at=now,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.patch("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(
    project_id: int,
    task_id: int,
    body: schemas.TaskUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    _get_project(db, project_id)
    t = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.project_id == project_id)
        .first()
    )
    if not t:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    data = body.model_dump(exclude_unset=True)
    if "status" in data and data["status"] is not None:
        data["status"] = models.TaskStatus(data["status"].value)
    for k, v in data.items():
        setattr(t, k, v)
    if data:
        t.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(t)
    return t


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    project_id: int,
    task_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    _get_project(db, project_id)
    t = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.project_id == project_id)
        .first()
    )
    if not t:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    db.delete(t)
    db.commit()
    return None


# --- Documents ---


@router.get("/documents", response_model=list[schemas.DocumentOut])
def list_documents(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    _get_project(db, project_id)
    return (
        db.query(models.Document)
        .filter(models.Document.project_id == project_id)
        .order_by(models.Document.created_at.desc())
        .all()
    )


@router.post("/documents", response_model=schemas.DocumentOut, status_code=status.HTTP_201_CREATED)
def create_document(
    project_id: int,
    body: schemas.DocumentCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[models.User, Depends(get_current_user)],
):
    _get_project(db, project_id)
    d = models.Document(
        project_id=project_id,
        title=body.title,
        doc_type=body.doc_type,
        version=body.version,
        status=models.DocumentStatus(body.status.value),
        uploaded_by_id=user.id,
    )
    db.add(d)
    db.commit()
    db.refresh(d)
    return d


@router.post("/documents/upload", response_model=schemas.DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[models.User, Depends(get_current_user)],
    file: UploadFile = File(...),
    title: str = Form(""),
    doc_type: str | None = Form(None),
):
    _get_project(db, project_id)
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    ext = Path(file.filename or "").suffix or ".bin"
    safe_name = f"{uuid.uuid4().hex}{ext}"
    dest = settings.upload_dir / safe_name
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    name = title.strip() or (file.filename or "Файл")
    d = models.Document(
        project_id=project_id,
        title=name,
        doc_type=doc_type,
        version="1.0",
        status=models.DocumentStatus.draft,
        file_path=f"uploads/{safe_name}",
        uploaded_by_id=user.id,
    )
    db.add(d)
    db.commit()
    db.refresh(d)
    return d


# --- Test records (испытания) ---


@router.get("/tests", response_model=list[schemas.TestRecordOut])
def list_tests(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    _get_project(db, project_id)
    return db.query(models.TestRecord).filter(models.TestRecord.project_id == project_id).all()


@router.post("/tests", response_model=schemas.TestRecordOut, status_code=status.HTTP_201_CREATED)
def create_test(
    project_id: int,
    body: schemas.TestRecordCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    _get_project(db, project_id)
    tr = models.TestRecord(project_id=project_id, **body.model_dump())
    db.add(tr)
    db.commit()
    db.refresh(tr)
    return tr


@router.delete("/tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test(
    project_id: int,
    test_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[models.User, Depends(get_current_user)],
):
    _get_project(db, project_id)
    tr = (
        db.query(models.TestRecord)
        .filter(models.TestRecord.id == test_id, models.TestRecord.project_id == project_id)
        .first()
    )
    if not tr:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    db.delete(tr)
    db.commit()
    return None
