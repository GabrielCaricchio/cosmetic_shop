FROM python:3.14-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY Back/requirements.txt ./Back/requirements.txt
RUN pip install --no-cache-dir -r Back/requirements.txt

COPY Back ./Back

EXPOSE 8000

CMD ["uvicorn", "Back.main:app", "--host", "0.0.0.0", "--port", "8000"]
