from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse
from db_connection_elasticsearch import ElasticsearchConfig, get_elasticsearch_client


def mount(app: FastAPI):
    """
    Mount Elasticsearch data-exploration routes.
    Read-only endpoints for browsing indices, documents, and field mappings.
    """

    @app.get("/healthz/elasticsearch/indices")
    async def elasticsearch_indices(request: Request):
        client = None
        try:
            config = ElasticsearchConfig()
            client = await get_elasticsearch_client(config)
            raw = await client.cat.indices(format="json")

            indices = [
                {
                    "index": r.get("index"),
                    "health": r.get("health"),
                    "status": r.get("status"),
                    "docsCount": r.get("docs.count"),
                    "storeSize": r.get("store.size"),
                }
                for r in raw
            ]

            return {
                "configuredIndex": config.index or None,
                "indices": indices,
            }
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )
        finally:
            if client:
                await client.close()

    @app.get("/healthz/elasticsearch/indices/{index_name}/mappings")
    async def elasticsearch_index_mappings(index_name: str, request: Request):
        client = None
        try:
            config = ElasticsearchConfig()
            client = await get_elasticsearch_client(config)
            raw = await client.indices.get_mapping(index=index_name)
            mappings = raw.get(index_name, {}).get("mappings", {})
            return {"index": index_name, "mappings": mappings}
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )
        finally:
            if client:
                await client.close()

    @app.get("/healthz/elasticsearch/indices/{index_name}/documents")
    async def elasticsearch_index_documents(
        index_name: str,
        request: Request,
        from_: int = Query(0, alias="from"),
        size: int = 20,
    ):
        from_val = max(0, from_)
        size_val = min(100, max(1, size))

        client = None
        try:
            config = ElasticsearchConfig()
            client = await get_elasticsearch_client(config)
            raw = await client.search(
                index=index_name,
                from_=from_val,
                size=size_val,
                body={"query": {"match_all": {}}},
            )

            total_hits = raw["hits"]["total"]
            total = total_hits if isinstance(total_hits, int) else total_hits.get("value", 0)

            documents = [
                {"_id": hit["_id"], "_source": hit["_source"]}
                for hit in raw["hits"]["hits"]
            ]

            return {
                "index": index_name,
                "total": total,
                "from": from_val,
                "size": size_val,
                "documents": documents,
            }
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )
        finally:
            if client:
                await client.close()
