from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
from db_connection_postgres import PostgresConfig, DatabaseManager


def mount(app: FastAPI):
    """
    Mount postgres data-exploration routes.
    Read-only endpoints for browsing schemas, tables, rows, and columns.
    """

    @app.get("/healthz/postgres/schemas")
    async def postgres_schemas(request: Request):
        db_manager = None
        try:
            config = PostgresConfig()
            db_manager = DatabaseManager(config)
            async with db_manager.async_session() as session:
                result = await session.execute(
                    text(
                        "SELECT schema_name "
                        "FROM information_schema.schemata "
                        "WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast') "
                        "ORDER BY schema_name"
                    )
                )
                rows = result.fetchall()
                schemas = [r[0] for r in rows]

            return {
                "configuredSchema": config.schema or "public",
                "schemas": schemas,
            }
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )
        finally:
            if db_manager:
                try:
                    await db_manager.dispose()
                except Exception:
                    pass

    @app.get("/healthz/postgres/schemas/{schema}/tables")
    async def postgres_tables(request: Request, schema: str):
        db_manager = None
        try:
            config = PostgresConfig()
            db_manager = DatabaseManager(config)
            async with db_manager.async_session() as session:
                result = await session.execute(
                    text(
                        "SELECT table_name, table_type, "
                        "(SELECT reltuples::bigint FROM pg_class "
                        " WHERE relname = t.table_name "
                        "   AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.table_schema)"
                        ") AS estimated_rows "
                        "FROM information_schema.tables t "
                        "WHERE table_schema = :schema "
                        "ORDER BY table_name"
                    ),
                    {"schema": schema},
                )
                rows = result.fetchall()
                tables = [
                    {
                        "name": r[0],
                        "type": r[1],
                        "estimatedRows": int(r[2]) if r[2] is not None else 0,
                    }
                    for r in rows
                ]

            return {"schema": schema, "tables": tables}
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )
        finally:
            if db_manager:
                try:
                    await db_manager.dispose()
                except Exception:
                    pass

    @app.get("/healthz/postgres/schemas/{schema}/tables/{table}/columns")
    async def postgres_columns(request: Request, schema: str, table: str):
        db_manager = None
        try:
            config = PostgresConfig()
            db_manager = DatabaseManager(config)
            async with db_manager.async_session() as session:
                result = await session.execute(
                    text(
                        "SELECT column_name, data_type, is_nullable, column_default, "
                        "character_maximum_length, numeric_precision "
                        "FROM information_schema.columns "
                        "WHERE table_schema = :schema AND table_name = :table "
                        "ORDER BY ordinal_position"
                    ),
                    {"schema": schema, "table": table},
                )
                rows = result.fetchall()
                columns = [
                    {
                        "name": r[0],
                        "type": r[1],
                        "nullable": r[2] == "YES",
                        "default": r[3],
                        "maxLength": r[4],
                        "precision": r[5],
                    }
                    for r in rows
                ]

            return {"schema": schema, "table": table, "columns": columns}
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )
        finally:
            if db_manager:
                try:
                    await db_manager.dispose()
                except Exception:
                    pass

    @app.get("/healthz/postgres/schemas/{schema}/tables/{table}/rows")
    async def postgres_rows(
        request: Request,
        schema: str,
        table: str,
        offset: int = 0,
        limit: int = 20,
    ):
        offset_val = max(0, offset)
        limit_val = min(100, max(1, limit))

        db_manager = None
        try:
            config = PostgresConfig()
            db_manager = DatabaseManager(config)
            async with db_manager.async_session() as session:
                # Validate table exists in schema to prevent injection via identifiers
                check = await session.execute(
                    text(
                        "SELECT 1 FROM information_schema.tables "
                        "WHERE table_schema = :schema AND table_name = :table"
                    ),
                    {"schema": schema, "table": table},
                )
                if check.first() is None:
                    return JSONResponse(
                        status_code=404,
                        content={"error": f"Table {schema}.{table} not found"},
                    )

                # Quote identifiers safely
                quoted_schema = schema.replace('"', '""')
                quoted_table = table.replace('"', '""')
                qualified = f'"{quoted_schema}"."{quoted_table}"'

                count_result = await session.execute(
                    text(f"SELECT COUNT(*) AS total FROM {qualified}")
                )
                total = int(count_result.scalar() or 0)

                rows_result = await session.execute(
                    text(
                        f"SELECT * FROM {qualified} LIMIT :limit OFFSET :offset"
                    ),
                    {"limit": limit_val, "offset": offset_val},
                )
                columns = list(rows_result.keys())
                raw_rows = rows_result.fetchall()
                rows = [dict(zip(columns, r)) for r in raw_rows]

            return {
                "schema": schema,
                "table": table,
                "total": total,
                "offset": offset_val,
                "limit": limit_val,
                "rows": rows,
            }
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )
        finally:
            if db_manager:
                try:
                    await db_manager.dispose()
                except Exception:
                    pass
