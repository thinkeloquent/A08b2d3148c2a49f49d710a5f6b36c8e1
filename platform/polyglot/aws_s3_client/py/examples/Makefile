# AWS S3 Client Python Examples
.PHONY: install start dev serve-aiobotocore

install:
	pip install -e ..

start:
	python basic_usage.py

dev:
	uvicorn fastapi_app.main:app --reload --port 8000

serve-aiobotocore:
	python aiobotocore_example.py
