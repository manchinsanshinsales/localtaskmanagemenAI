from sqlalchemy.orm import Session
from .models import Task as SQLiteTask, ActivityLog as SQLiteActivityLog
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import logging

logger = logging.getLogger(__name__)

def sync_data(sqlite_db: Session, postgres_db: Session):
    """
    SQLiteの未同期データをPostgreSQLへ同期します。
    """
    try:
        # 1. 未同期のタスクを取得
        unsynced_tasks = sqlite_db.query(SQLiteTask).filter(SQLiteTask.is_synced == False).all()
        
        # PostgreSQLにインポートするためのインクリメンタルなマップ/バルク挿入
        # PostgreSQL側のセッションで書き込みを行う
        from sqlalchemy import text
        
        synced_task_ids = []
        for task in unsynced_tasks:
            # PostgresにINSERTまたはUPDATE (UPSERT)
            # SQL記述でUPSERTを行う（SQLAlchemy Core or raw SQL）
            upsert_task_sql = text("""
                INSERT INTO tasks (id, title, description, status, created_at, updated_at)
                VALUES (:id, :title, :description, :status, :created_at, :updated_at)
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    status = EXCLUDED.status,
                    updated_at = EXCLUDED.updated_at;
            """)
            postgres_db.execute(
                upsert_task_sql,
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "status": task.status,
                    "created_at": task.created_at,
                    "updated_at": task.updated_at
                }
            )
            synced_task_ids.append(task.id)
        
        # 2. 未同期のアクティビティログを取得
        unsynced_logs = sqlite_db.query(SQLiteActivityLog).filter(SQLiteActivityLog.is_synced == False).all()
        
        synced_log_ids = []
        for log in unsynced_logs:
            # PostgresにINSERTまたはUPDATE (UPSERT)
            upsert_log_sql = text("""
                INSERT INTO activity_logs (id, task_id, duration_minutes, category, description, recorded_at)
                VALUES (:id, :task_id, :duration_minutes, :category, :description, :recorded_at)
                ON CONFLICT (id) DO UPDATE SET
                    task_id = EXCLUDED.task_id,
                    duration_minutes = EXCLUDED.duration_minutes,
                    category = EXCLUDED.category,
                    description = EXCLUDED.description,
                    recorded_at = EXCLUDED.recorded_at;
            """)
            postgres_db.execute(
                upsert_log_sql,
                {
                    "id": log.id,
                    "task_id": log.task_id,
                    "duration_minutes": log.duration_minutes,
                    "category": log.category,
                    "description": log.description,
                    "recorded_at": log.recorded_at
                }
            )
            synced_log_ids.append(log.id)
            
        # PostgreSQLのコミット
        postgres_db.commit()
        
        # SQLite側の同期済みフラグの更新
        if synced_task_ids:
            sqlite_db.query(SQLiteTask).filter(SQLiteTask.id.in_(synced_task_ids)).update(
                {"is_synced": True}, synchronize_session=False
            )
        if synced_log_ids:
            sqlite_db.query(SQLiteActivityLog).filter(SQLiteActivityLog.id.in_(synced_log_ids)).update(
                {"is_synced": True}, synchronize_session=False
            )
        
        sqlite_db.commit()
        
        return {
            "status": "success",
            "synced_tasks_count": len(synced_task_ids),
            "synced_logs_count": len(synced_log_ids)
        }
        
    except Exception as e:
        postgres_db.rollback()
        sqlite_db.rollback()
        logger.error(f"Sync failed: {str(e)}")
        raise e
