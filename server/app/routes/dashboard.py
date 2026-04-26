from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Bug
from app.models.bug import BugStatus
from app.models import User
from app.utils.auth import get_current_admin
from app.utils.logger import logger

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):

    try:
        # ✅ Basic counts
        total_bugs = db.query(func.count(Bug.id)).scalar()

        open_bugs = db.query(func.count(Bug.id))\
            .filter(Bug.status != BugStatus.done)\
            .scalar()

        closed_bugs = db.query(func.count(Bug.id))\
            .filter(Bug.status == BugStatus.done)\
            .scalar()

        # ✅ Optimized project-wise aggregation (NO loop)
        project_data = (
            db.query(Bug.project_id, func.count(Bug.id))
            .group_by(Bug.project_id)
            .all()
        )

        # Convert to frontend-friendly format
        bugs_per_project = [
            {
                "project": f"Project {item[0]}",  # replace with name later
                "count": item[1]
            }
            for item in project_data
        ]

        return {
            "total_bugs": total_bugs,
            "open_bugs": open_bugs,
            "closed_bugs": closed_bugs,
            "bugs_per_project": bugs_per_project
        }

    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        return {
            "error": "Failed to load dashboard data",
            "details": str(e)
        }
