from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import get_settings

settings = get_settings()

if not settings.database_url:
    raise ValueError("DB_URL environment variable is not set!")

database_url = settings.database_url
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ ADD THIS AT THE BOTTOM
def init_db():
    from app.models import User, Bug  # import models so SQLAlchemy sees them
    Base.metadata.create_all(bind=engine)
    _ensure_user_role_column()
    _ensure_bug_solution_columns()


def _ensure_user_role_column():
    inspector = inspect(engine)
    columns = [column["name"] for column in inspector.get_columns("user")]
    with engine.begin() as connection:
        if "role" not in columns:
            # SQLite-compatible migration path for existing local databases.
            connection.execute(
                text('ALTER TABLE "user" ADD COLUMN role VARCHAR(20) DEFAULT \'developer\'')
            )

        connection.execute(
            text('UPDATE "user" SET role = \'developer\' WHERE role IS NULL OR role = \'\'')
        )


def _ensure_bug_solution_columns():
    inspector = inspect(engine)
    columns = [column["name"] for column in inspector.get_columns("bug")]
    with engine.begin() as connection:
        if "solution" not in columns:
            connection.execute(text("ALTER TABLE bug ADD COLUMN solution TEXT"))
        if "solution_updated_at" not in columns:
            connection.execute(text("ALTER TABLE bug ADD COLUMN solution_updated_at DATETIME"))
        if "solution_by_id" not in columns:
            connection.execute(text("ALTER TABLE bug ADD COLUMN solution_by_id INTEGER"))
