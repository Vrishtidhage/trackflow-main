from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.schemas.user import CreateUserPayload, UpdateUserPayload
from app.utils.password import hash_password
from app.models import User, UserRole
from app.utils.logger import logger


class UserService:
    @staticmethod
    def create_user(db: Session, user_data: CreateUserPayload) -> User:
        try:
            user_dict = user_data.model_dump()
            logger.debug(f"Creating new user: {user_dict['email']}")

            user_dict["password"] = hash_password(user_dict["password"])

            new_user = User(**user_dict)
            new_user.email = new_user.email.strip().lower()
            if not new_user.role:
                new_user.role = UserRole.developer
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            logger.info(
                "Successfully created new user: "
                f"ID: {new_user.id}, "
                f"Email: {new_user.email}"
            )

            return new_user
        except IntegrityError as e:
            db.rollback()
            logger.warning(
                f"Integrity error during user creation - Email: {user_data.email}, Error: {str(e)}"
            )

            if "unique constraint" in str(e).lower() or "duplicate" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A user with this email already exists.",
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database integrity error: {str(e)}",
            )
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(
                f"Database error during user creation - Email: {user_data.email}, "
                f"Error: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

        except Exception as e:
            db.rollback()
            logger.critical(
                f"Unexpected error during user creation - Email: {user_data.email}, "
                f"Error: {str(e)}",
                exc_info=True,
            )
            raise

    @staticmethod
    def get_all_users(db: Session) -> list[User]:
        logger.debug("Fetching all users from database")
        try:
            users = db.query(User).all()
            logger.info(f"Successfully fetched {len(users)} users.")
            return users

        except SQLAlchemyError as e:
            logger.error(f"Database error while fetching all users: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        logger.debug(f"Fetching user by ID: {user_id}")
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                logger.warning(f"User not found - ID: {user_id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"User with id {user_id} not found.",
                )
            logger.info(
                f"Successfully retrieved user - ID: {user_id}, Email: {user.email}"
            )
            return user
        except HTTPException:
            raise

        except SQLAlchemyError as e:
            logger.error(f"Database error while fetching user {user_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def update_user(
        db: Session, user_id: int, update_data: UpdateUserPayload, current_user: User
    ) -> User:
        logger.debug(f"Updating user - ID: {user_id}")
        user = UserService.get_user_by_id(db, user_id)

        if current_user.id != user.id and current_user.role != UserRole.admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized access. You can not edit other users details.",
            )

        try:
            update_dict = update_data.model_dump(exclude_unset=True)
            fields_to_update = [k for k in update_dict.keys() if k != "password"]
            if fields_to_update:
                logger.debug(
                    f"Updating fields for user {user_id}: {', '.join(fields_to_update)}"
                )

            if "password" in update_dict and update_dict["password"]:
                logger.debug(f"Password update requested for user {user_id}")
                update_dict["password"] = hash_password(update_dict["password"])

            for field, value in update_dict.items():
                setattr(user, field, value)

            db.commit()
            db.refresh(user)
            logger.info(
                f"Successfully updated user - ID: {user_id}, Email: {user.email}"
            )
            return user
        except IntegrityError as e:
            db.rollback()
            logger.warning(
                f"Integrity error during user update - ID: {user_id}, Error: {str(e)}"
            )
            if "unique constraint" in str(e).lower() or "duplicate" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A user with this email already exists.",
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database integrity error: {str(e)}",
            )
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(
                f"Database error during user update - ID: {user_id}, Error: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def delete_user(db: Session, user_id: int, current_user: User) -> User:
        logger.debug(f"Attempting to delete user - ID: {user_id}")
        user = UserService.get_user_by_id(db, user_id)
        if current_user.id != user.id and current_user.role != UserRole.admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized access. You can not delete other user.",
            )
        try:
            user_email = user.email
            db.delete(user)
            db.commit()
            logger.info(
                f"Successfully deleted user - ID: {user_id}, Email: {user_email}"
            )
            return user
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(
                f"Database error during user deletion - ID: {user_id}, Error: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    @staticmethod
    def update_user_role(db: Session, user_id: int, role: UserRole) -> User:
        logger.debug(f"Updating user role - ID: {user_id}, role: {role.value}")
        user = UserService.get_user_by_id(db, user_id)

        try:
            user.role = role
            db.commit()
            db.refresh(user)
            logger.info(
                f"Successfully updated role - ID: {user_id}, role: {user.role.value}"
            )
            return user
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(
                f"Database error during role update - ID: {user_id}, Error: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )
