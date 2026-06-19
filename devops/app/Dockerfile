FROM python:3.12-slim

WORKDIR /app

# Layer 1: dependencies (cached unless requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Layer 2: application code
COPY . .

# Non-root user for security
RUN useradd -r appuser && chown -R appuser /app
USER appuser

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "vector_api:app"]
