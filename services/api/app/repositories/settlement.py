from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.settlement import Settlement
from app.schemas.settlement import SettlementCreate, SettlementUpdate


def get_settlement_by_id(db: Session, settlement_id: UUID) -> Settlement | None:
    stmt = select(Settlement).where(Settlement.id == settlement_id)
    return db.execute(stmt).scalar_one_or_none()


def get_group_settlements(
    db: Session, group_id: UUID, skip: int = 0, limit: int = 50
) -> list[Settlement]:
    stmt = (
        select(Settlement)
        .where(Settlement.group_id == group_id)
        .order_by(Settlement.date.desc(), Settlement.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())


def get_user_settlements(
    db: Session, user_id: UUID, skip: int = 0, limit: int = 50
) -> list[Settlement]:
    stmt = (
        select(Settlement)
        .where(
            (Settlement.paid_by_id == user_id)
            | (Settlement.received_by_id == user_id)
            | (Settlement.created_by_id == user_id)
        )
        .order_by(Settlement.date.desc(), Settlement.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())


def create_settlement(db: Session, schema: SettlementCreate) -> Settlement:
    settlement = Settlement(
        amount=schema.amount,
        currency=schema.currency,
        note=schema.note,
        date=schema.date,
        group_id=schema.group_id,
        paid_by_id=schema.paid_by_id,
        received_by_id=schema.received_by_id,
        created_by_id=schema.created_by_id,
    )
    db.add(settlement)
    db.commit()
    db.refresh(settlement)
    return settlement


def update_settlement(
    db: Session, settlement: Settlement, schema: SettlementUpdate
) -> Settlement:
    update_data = schema.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settlement, field, value)
    db.add(settlement)
    db.commit()
    db.refresh(settlement)
    return settlement


def delete_settlement(db: Session, settlement: Settlement) -> bool:
    db.delete(settlement)
    db.commit()
    return True
