import os
import json
import httpx

GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]

url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"

schema = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "priority": {"type": "string", "enum": ["low", "medium", "high"]},
        "tags": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["title", "priority", "tags"],
    "additionalProperties": False,
}

payload = {
    "model": "gemini-3-flash-preview",
    "messages": [
        {"role": "system", "content": "Return ONLY valid JSON that matches the schema."},
        {"role": "user", "content": "Create a task for 'pay rent' with priority high and tags finance, home."},
    ],
    # OpenAI-style structured output request
    "response_format": {
        "type": "json_schema",
        "json_schema": {
            "name": "Task",
            "schema": schema,
            "strict": True
        }
    },
}

headers = {
    "Authorization": f"Bearer {GEMINI_API_KEY}",
    "Content-Type": "application/json",
}

with httpx.Client(timeout=30.0) as client:
    r = client.post(url, headers=headers, json=payload)
    r.raise_for_status()
    data = r.json()

content = data["choices"][0]["message"]["content"]
task = json.loads(content)

print(task)
