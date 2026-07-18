from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="todo")  # todo, in_progress, done
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # 同期ステータス（ローカル用）
    is_synced = Column(Boolean, default=False)

    logs = relationship("ActivityLog", back_populates="task", cascade="all, delete-orphan")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    category = Column(String, nullable=False)  # development, debugging, meeting, documentation, other
    description = Column(Text, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 同期ステータス（ローカル用）
    is_synced = Column(Boolean, default=False)

    task = relationship("Task", back_populates="logs")
