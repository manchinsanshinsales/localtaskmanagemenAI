import os
import json
import httpx

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://host.docker.internal:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma2:9b") # デフォルトはgemma2だが、軽量なモデルも選べるようにする

class OllamaClient:
    def __init__(self, host: str = OLLAMA_HOST, model: str = OLLAMA_MODEL):
        self.host = host.rstrip("/")
        self.model = model

    async def _send_request(self, system_prompt: str, user_prompt: str) -> str:
        url = f"{self.host}/api/generate"
        payload = {
            "model": self.model,
            "prompt": f"System: {system_prompt}\nUser: {user_prompt}",
            "stream": False,
            "options": {
                "temperature": 0.1 # 正確性を高めるため低めの温度設定
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "").strip()
                else:
                    return f"Error: Ollama API returned status code {response.status_code}"
        except Exception as e:
            return f"Error connecting to Ollama at {self.host}: {str(e)}"

    async def generate_sql(self, natural_query: str) -> str:
        """
        ユーザーの自然言語クエリから、DuckDB(SQLiteアタッチ済)向けのSQLクエリを生成します。
        """
        system_prompt = """
You are a expert data analyst. Generate a valid DuckDB SQL query to answer the user's question.
The database schema consists of two tables attached from SQLite:
- sqlite_db.tasks (id INTEGER primary key, title VARCHAR, description TEXT, status VARCHAR, created_at TIMESTAMP, updated_at TIMESTAMP)
- sqlite_db.activity_logs (id INTEGER primary key, task_id INTEGER, duration_minutes INTEGER, category VARCHAR, description TEXT, recorded_at TIMESTAMP)
  Note: category values are typically 'development', 'debugging', 'meeting', 'documentation', 'other'.
  Note: status values are typically 'todo', 'in_progress', 'done'.

CRITICAL RULES:
1. Return ONLY the executable SQL query string. Do NOT include markdown code blocks like ```sql, do not explain the SQL, and do not write anything else.
2. Ensure tables are correctly prefixed with 'sqlite_db.' (e.g., sqlite_db.tasks and sqlite_db.activity_logs).
3. Do not perform write operations (INSERT, UPDATE, DELETE). Only SELECT queries are allowed.
4. Keep the query optimized.
        """
        
        user_prompt = f"Question: {natural_query}\nSQL:"
        raw_sql = await self._send_request(system_prompt, user_prompt)
        
        # もしLLMがマークダウンブロックで囲んでしまった場合のクリーンアップ
        cleaned_sql = raw_sql
        if "```" in cleaned_sql:
            # 最初の ```sql や ``` を除去
            lines = cleaned_sql.split("\n")
            cleaned_lines = [l for l in lines if not l.strip().startswith("```")]
            cleaned_sql = "\n".join(cleaned_lines)
            
        return cleaned_sql.strip()

    async def generate_report(self, natural_query: str, sql_query: str, query_result: list) -> str:
        """
        SQLの実行結果から、ユーザー向けの要約・分析レポート（Markdown形式）を生成します。
        """
        system_prompt = """
You are a helpful AI Data Analyst. Analyze the query results and generate a clear, professional, and insight-rich markdown report for the user.
Your response should be in Japanese.
Highlight key takeaways, anomalies, and recommended actions based on the analysis.
Format your output using clean markdown (bullet points, tables, bold text, and code syntax where appropriate). Do not wrap the whole response in a code block.
        """
        
        formatted_result = json.dumps(query_result, indent=2, default=str)
        user_prompt = f"""
User's Question: {natural_query}
Executed SQL Query:
```sql
{sql_query}
```
Query Execution Result Data (JSON):
```json
{formatted_result}
```

Please generate a Japanese analysis report.
"""
        return await self._send_request(system_prompt, user_prompt)
