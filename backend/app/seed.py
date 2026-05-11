from datetime import date, timedelta

from sqlalchemy.orm import Session

from app import models
from app.security import get_password_hash


def seed_if_empty(db: Session) -> None:
    if db.query(models.User).first():
        return

    admin = models.User(
        email="admin@kompleks.local",
        hashed_password=get_password_hash("admin123"),
        full_name="Администратор",
        role=models.UserRole.admin,
    )
    pm = models.User(
        email="pm@kompleks.local",
        hashed_password=get_password_hash("pm123"),
        full_name="Иванов И.И.",
        role=models.UserRole.pm,
    )
    eng = models.User(
        email="engineer@kompleks.local",
        hashed_password=get_password_hash("eng123"),
        full_name="Петрова А.С.",
        role=models.UserRole.engineer,
    )
    db.add_all([admin, pm, eng])
    db.commit()
    db.refresh(admin)
    db.refresh(pm)
    db.refresh(eng)

    today = date.today()
    p = models.Project(
        name="Инженерные изыскания — жилой комплекс «Северный»",
        code="PRJ-2026-001",
        description="Комплекс инженерно-геологических и геотехнических изысканий.",
        customer_name="ТОО «Застройщик»",
        object_address="г. Алматы, мкр. Северный",
        status=models.ProjectStatus.active,
        start_date=today - timedelta(days=30),
        end_date=today + timedelta(days=120),
        manager_id=pm.id,
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    db.add(
        models.Contract(
            project_id=p.id,
            number="Д-145/2026",
            signed_date=today - timedelta(days=35),
            amount=12_500_000.00,
            notes="Аванс 30%",
        )
    )
    ph1 = models.ProjectPhase(
        project_id=p.id, name="Сбор исходных данных и выезд на объект", sort_order=1, start_date=today - timedelta(days=30), end_date=today - timedelta(days=20)
    )
    ph2 = models.ProjectPhase(
        project_id=p.id, name="Полевые работы и отбор проб", sort_order=2, start_date=today - timedelta(days=20), end_date=today + timedelta(days=14)
    )
    ph3 = models.ProjectPhase(
        project_id=p.id, name="Камеральная обработка и отчёт", sort_order=3, start_date=today + timedelta(days=14), end_date=today + timedelta(days=90)
    )
    db.add_all([ph1, ph2, ph3])
    db.commit()
    db.refresh(ph1)
    db.refresh(ph2)

    db.add_all(
        [
            models.Task(
                project_id=p.id,
                phase_id=ph1.id,
                title="Согласование программы изысканий",
                status=models.TaskStatus.done,
                assignee_id=pm.id,
                due_date=today - timedelta(days=25),
            ),
            models.Task(
                project_id=p.id,
                phase_id=ph2.id,
                title="Шурфование и отбор монолитов грунта",
                status=models.TaskStatus.in_progress,
                assignee_id=eng.id,
                due_date=today + timedelta(days=7),
            ),
            models.Task(
                project_id=p.id,
                phase_id=ph3.id,
                title="Подготовка технического отчёта",
                status=models.TaskStatus.todo,
                assignee_id=eng.id,
                due_date=today + timedelta(days=60),
            ),
        ]
    )
    db.add(
        models.Document(
            project_id=p.id,
            title="Техническое задание",
            doc_type="ТЗ",
            version="1.1",
            status=models.DocumentStatus.approved,
            uploaded_by_id=pm.id,
        )
    )
    db.add(
        models.TestRecord(
            project_id=p.id,
            name="Испытание грунта на сжатие",
            test_type="Лабораторные испытания",
            location="Площадка А, шурф Ш-3",
            performed_at=today - timedelta(days=5),
            result_summary="Сопротивление в пределах нормы для проектного положения фундаментов.",
            protocol_ref="ПР-2026-014",
        )
    )
    db.commit()
