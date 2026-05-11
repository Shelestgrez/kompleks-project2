from sqlalchemy import inspect, text

from app.database import engine


def run_sqlite_migrations() -> None:
    if not str(engine.url).startswith("sqlite"):
        return
    insp = inspect(engine)
    if not insp.has_table("tasks"):
        return
    cols = {c["name"] for c in insp.get_columns("tasks")}
    with engine.begin() as conn:
        if "updated_at" not in cols:
            conn.execute(text("ALTER TABLE tasks ADD COLUMN updated_at DATETIME"))
            conn.execute(text("UPDATE tasks SET updated_at = created_at WHERE updated_at IS NULL"))
