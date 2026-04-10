from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse
from db_connection_redis import RedisConfig, get_async_redis_client


def mount(app: FastAPI):
    """
    Mount Redis data-exploration routes.
    Read-only endpoints for browsing keys, values, and namespaces.
    """

    @app.get("/healthz/redis/keys")
    async def redis_keys(
        request: Request,
        pattern: str = "*",
        cursor: int = 0,
        count: int = 50,
    ):
        count_val = min(200, max(1, count))
        client = None
        try:
            config = RedisConfig()
            client = await get_async_redis_client(config)
            next_cursor, raw_keys = await client.scan(
                cursor=cursor, match=pattern, count=count_val
            )

            # Get type for each key via pipeline
            pipe = client.pipeline()
            for key in raw_keys:
                pipe.type(key)
            types = await pipe.execute()

            keys = [
                {"key": k, "type": t}
                for k, t in zip(raw_keys, types)
            ]

            # Derive namespaces
            ns_set = set()
            for key in raw_keys:
                idx = key.find(":")
                if idx > 0:
                    ns_set.add(key[:idx])

            return {
                "cursor": str(next_cursor),
                "keys": keys,
                "namespaces": sorted(ns_set),
                "db": config.db,
            }
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )
        finally:
            if client:
                await client.aclose()

    @app.get("/healthz/redis/key")
    async def redis_key_detail(
        request: Request,
        name: str = Query(..., description="Key name"),
    ):
        client = None
        try:
            config = RedisConfig()
            client = await get_async_redis_client(config)
            key_type = await client.type(name)

            if key_type == "none":
                return JSONResponse(
                    status_code=404,
                    content={"error": f"Key not found: {name}"},
                )

            ttl = await client.ttl(name)
            value = None

            if key_type == "string":
                value = await client.get(name)
            elif key_type == "hash":
                value = await client.hgetall(name)
            elif key_type == "list":
                length = await client.llen(name)
                items = await client.lrange(name, 0, 99)
                value = {"items": items, "length": length}
            elif key_type == "set":
                members = list(await client.smembers(name))
                value = {"members": members, "size": len(members)}
            elif key_type == "zset":
                raw = await client.zrange(name, 0, 99, withscores=True)
                items = [{"member": m, "score": s} for m, s in raw]
                card = await client.zcard(name)
                value = {"items": items, "size": card}

            return {"key": name, "type": key_type, "ttl": ttl, "value": value}
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )
        finally:
            if client:
                await client.aclose()

    @app.get("/healthz/redis/namespaces")
    async def redis_namespaces(request: Request):
        client = None
        try:
            config = RedisConfig()
            client = await get_async_redis_client(config)
            ns_map: dict[str, int] = {}
            cur = 0

            # Scan all keys to collect namespace prefixes
            while True:
                cur, keys = await client.scan(cursor=cur, count=500)
                for key in keys:
                    idx = key.find(":")
                    ns = key[:idx] if idx > 0 else "(root)"
                    ns_map[ns] = ns_map.get(ns, 0) + 1
                if cur == 0:
                    break

            db_size = await client.dbsize()

            namespaces = sorted(
                [{"name": n, "count": c} for n, c in ns_map.items()],
                key=lambda x: x["name"],
            )

            return {"db": config.db, "dbSize": db_size, "namespaces": namespaces}
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )
        finally:
            if client:
                await client.aclose()
