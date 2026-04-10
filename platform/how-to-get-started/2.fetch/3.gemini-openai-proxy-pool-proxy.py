#!/usr/bin/env python3
"""
Gemini OpenAI-Compatible Proxy Pool Example (Manual Proxy Config)

Uses httpx with manually configured proxy settings and connection pooling.
Demonstrates singleton pattern for proxy connection management.

Run: python 3.gemini-openai-proxy-pool-proxy.py

Requirements: pip install httpx
"""
import os
import json
import httpx

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable is required")
    exit(1)

# ============================================================
# MANUAL PROXY CONFIGURATION - Edit these values
# ============================================================
PROXY_CONFIG = {
    "url": "http://127.0.0.1:8080",  # Proxy URL
    "username": None,                 # Proxy username (None if no auth)
    "password": None,                 # Proxy password (None if no auth)
}
# ============================================================

# Gemini OpenAI-compatible endpoint
ORIGIN = "https://generativelanguage.googleapis.com"
CHAT_PATH = "/v1beta/openai/chat/completions"

# Singleton client instance
_client_instance = None


def get_proxy_url():
    """Build proxy URL with auth if configured."""
    if PROXY_CONFIG["username"] and PROXY_CONFIG["password"]:
        # Parse and rebuild URL with auth
        from urllib.parse import urlparse, urlunparse
        parsed = urlparse(PROXY_CONFIG["url"])
        auth_url = urlunparse((
            parsed.scheme,
            f"{PROXY_CONFIG['username']}:{PROXY_CONFIG['password']}@{parsed.netloc}",
            parsed.path,
            parsed.params,
            parsed.query,
            parsed.fragment
        ))
        return auth_url
    return PROXY_CONFIG["url"]


def get_client():
    """Get or create singleton httpx client with proxy and connection pooling."""
    global _client_instance
    if _client_instance is None:
        proxy_url = get_proxy_url()
        _client_instance = httpx.Client(
            proxy=proxy_url,
            limits=httpx.Limits(
                max_connections=100,
                max_keepalive_connections=100,
                keepalive_expiry=60.0,
            ),
            timeout=httpx.Timeout(60.0, connect=10.0),
        )
    return _client_instance


def close_client():
    """Close the singleton client."""
    global _client_instance
    if _client_instance is not None:
        _client_instance.close()
        _client_instance = None


def chat_completion(messages, **options):
    """Send a chat completion request to Gemini."""
    client = get_client()

    payload = {
        "model": options.get("model", "gemini-2.0-flash"),
        "messages": messages,
        "temperature": options.get("temperature", 0.7),
        "max_tokens": options.get("max_tokens", 1000),
        **{k: v for k, v in options.items() if k not in ("model", "temperature", "max_tokens")},
    }

    response = client.post(
        f"{ORIGIN}{CHAT_PATH}",
        headers={
            "Authorization": f"Bearer {GEMINI_API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
    )

    if response.status_code >= 400:
        raise Exception(f"{response.status_code}: {response.text}")

    return response.json()


def main():
    print("=" * 60)
    print("Gemini OpenAI-Compatible Proxy Pool Example (Manual Config)")
    print("=" * 60)
    print()

    print(f"Origin: {ORIGIN}")
    print(f"Endpoint: {CHAT_PATH}")
    print(f"Proxy: {PROXY_CONFIG['url']}")
    print(f"Proxy Auth: {'Yes' if PROXY_CONFIG['username'] else 'No'}")
    print()

    # Example 1: Simple chat completion
    print("--- Example 1: Simple Chat Completion ---")
    try:
        response = chat_completion(
            [{"role": "user", "content": 'Say "Hello from Gemini Proxy Pool!" in exactly 5 words.'}],
            temperature=0.7,
            max_tokens=50,
        )
        print(f"Model: {response['model']}")
        print(f"Response: {response['choices'][0]['message']['content']}")
        print(f"Finish reason: {response['choices'][0]['finish_reason']}")
        if "usage" in response:
            print(f"Usage: {response['usage']}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 2: JSON mode
    print("--- Example 2: JSON Mode ---")
    try:
        response = chat_completion(
            [{"role": "user", "content": "Return a JSON object with keys: name, status, timestamp"}],
            response_format={"type": "json_object"},
            temperature=0,
        )
        raw_content = response["choices"][0]["message"]["content"]
        print(f"Raw response: {raw_content}")
        parsed = json.loads(raw_content)
        print(f"Parsed JSON: {parsed}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 3: System message
    print("--- Example 3: System Message ---")
    try:
        response = chat_completion(
            [
                {"role": "system", "content": "You are a helpful assistant that responds in haiku format."},
                {"role": "user", "content": "Describe proxy connections."},
            ],
            temperature=0.8,
        )
        print("Response:")
        print(response["choices"][0]["message"]["content"])
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 4: Multi-turn conversation
    print("--- Example 4: Multi-turn Conversation ---")
    try:
        response = chat_completion(
            [
                {"role": "user", "content": "My name is Alice."},
                {"role": "assistant", "content": "Hello Alice! Nice to meet you."},
                {"role": "user", "content": "What is my name?"},
            ],
            temperature=0,
        )
        print(f"Response: {response['choices'][0]['message']['content']}")
    except Exception as e:
        print(f"Error: {e}")
    print()

    # Example 5: Demonstrate client reuse
    print("--- Example 5: Client Reuse ---")
    client1 = get_client()
    client2 = get_client()
    print(f"Same client instance: {client1 is client2}")
    print()

    # Clean up
    close_client()
    print("Client closed.")


if __name__ == "__main__":
    main()
