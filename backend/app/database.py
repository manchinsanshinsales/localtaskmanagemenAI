import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import duckdb

# SQLiteの設定
SQLITE_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "local.sqlite")
DATABASE_URL_SQLITE = f"sqlite:///{SQLITE_DB_PATH}"

engine_sqlite = create_engine(
    DATABASE_URL_SQLITE, connect_args={"check_same_thread": False}
)
SessionLocalSQLite = sessionmaker(autocommit=False, autoflush=False, bind=engine_sqlite)

# PostgreSQL（模擬クラウド）の設定
DATABASE_URL_POSTGRES = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/analytics"
)
engine_postgres = create_engine(DATABASE_URL_POSTGRES)
SessionLocalPostgres = sessionmaker(autocommit=False, autoflush=False, bind=engine_postgres)

Base = declarative_base()

# DuckDBの初期化関数
def get_duckdb_connection():
    # インメモリDuckDBを起動
    conn = duckdb.connect(database=":memory:")
    
    # SQLite拡張機能をインストール＆ロード
    conn.execute("INSTALL sqlite;")
    conn.execute("LOAD sqlite;")
    
    # SQLiteデータベースをアタッチして、DuckDBから直接参照できるようにする
    # sqlite_dbというスキーマ名でSQLite内のテーブルにアクセス可能になる
    # 例: SELECT * FROM sqlite_db.tasks;
    conn.execute(f"ATTACH '{SQLITE_DB_PATH}' AS sqlite_db (TYPE SQLITE);")
    
    return conn

# SQLAlchemy セッション取得用ユーティリティ
def get_sqlite_db():
    db = SessionLocalSQLite()
    try:
        yield db
    finally:
        db.close()

def get_postgres_db():
    db = SessionLocalPostgres()
    try:
        yield db
    finally:
        db.close()
