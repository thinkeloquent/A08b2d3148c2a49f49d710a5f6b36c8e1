```
    # api_key = resolve_api_key(provider_config)
    # if not api_key:
    #     client_logger.error(f"No API key available for {provider_name}")
    #     result["error"] = "API key not configured"
    #     result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
    #     result["diagnostics"].append({"name": "request:error", "timestamp": time.time(), "duration": time.time() - start_time, "error": result["error"]})
    #     return result
```
