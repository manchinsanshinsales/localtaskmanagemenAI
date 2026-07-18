import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from .database import engine_sqlite, engine_postgres, Base, get_sqlite_db, get_postgres_db, get_duckdb_connection
from . import models, sync
from .ollama_client import OllamaClient

# 起動時にSQLiteとPostgreSQLのテーブルを自動作成
# (本番環境ではマイグレーションツールを利用するが、デモのポータビリティ優先のため)
Base.metadata.create_all(bind=engine_sqlite)
try:
    Base.metadata.create_all(bind=engine_postgres)
except Exception as e:
    # Postgresが起動していない場合(ローカル単体起動テスト時など)は警告に留める
    print(f"Warning: Could not create tables in PostgreSQL: {e}")

app = FastAPI(title="Smart Data Analyst API")

# CORS設定 (Next.jsからのアクセスを許可)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # デモ用のため全て許可
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydanticモデル定義
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "todo"

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    is_synced: bool

    class Config:
        from_attributes = True

class LogCreate(BaseModel):
    task_id: int
    duration_minutes: int
    category: str
    description: Optional[str] = None

class LogResponse(BaseModel):
    id: int
    task_id: int
    duration_minutes: int
    category: str
    description: Optional[str]
    recorded_at: datetime
    is_synced: bool

    class Config:
        from_attributes = True

class AnalyzeRequest(BaseModel):
    query: str

class AnalyzeResponse(BaseModel):
    sql: str
    raw_data: List[dict]
    report: str

# API エンドポイント

@app.post("/api/tasks", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_sqlite_db)):
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_sqlite_db)):
    return db.query(models.Task).all()

@app.post("/api/logs", response_model=LogResponse)
def create_log(log: LogCreate, db: Session = Depends(get_sqlite_db)):
    # タスクの存在確認
    task = db.query(models.Task).filter(models.Task.id == log.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    db_log = models.ActivityLog(**log.model_dump())
    db.add(db_log)
    
    # ログ追加時に、関連タスクの同期フラグもリセット(更新されたため)
    task.is_synced = False
    
    db.commit()
    db.refresh(db_log)
    return db_log

@app.get("/api/logs", response_model=List[LogResponse])
def get_logs(db: Session = Depends(get_sqlite_db)):
    return db.query(models.ActivityLog).all()

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_data(req: AnalyzeRequest):
    client = OllamaClient()
    
    # 1. 自然言語からSQLを生成
    generated_sql = await client.generate_sql(req.query)
    
    # 生成されたクエリの簡易セキュリティチェック
    forbidden_keywords = ["insert", "update", "delete", "drop", "alter", "create", "truncate"]
    if any(keyword in generated_sql.lower() for keyword in forbidden_keywords):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Forbidden operation detected in generated SQL query. Only SELECT queries are permitted."
        )
    
    try:
        # 2. DuckDBでSQLクエリを実行
        duck_conn = get_duckdb_connection()
        
        # クエリを実行し、結果を辞書のリストに変換
        result = duck_conn.execute(generated_sql)
        columns = [desc[0] for desc in result.description]
        raw_data = [dict(zip(columns, row)) for row in result.fetchall()]
        
        duck_conn.close()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute generated SQL in DuckDB: {str(e)}. Generated SQL: {generated_sql}"
        )
        
    # 3. 実行結果からAIレポートを生成
    report = await client.generate_report(req.query, generated_sql, raw_data)
    
    return AnalyzeResponse(
        sql=generated_sql,
        raw_data=raw_data,
        report=report
    )

@app.post("/api/sync")
def sync_to_cloud(
    sqlite_db: Session = Depends(get_sqlite_db), 
    postgres_db: Session = Depends(get_postgres_db)
):
    try:
        result = sync.sync_data(sqlite_db, postgres_db)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database synchronization failed: {str(e)}"
        )
