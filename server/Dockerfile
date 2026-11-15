FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir "fastapi>=0.110" "uvicorn>=0.29" "httpx>=0.27" "python-multipart>=0.0.9"
COPY app.py seed_projects.json ./
ENV KYO_DATA=/data PYTHONUNBUFFERED=1
USER nobody
EXPOSE 8000
CMD ["uvicorn", "app:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
