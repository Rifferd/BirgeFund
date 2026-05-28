FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip

EXPOSE 8000

CMD ["python", "-c", "import time; print('BirgeFund backend container is ready'); time.sleep(10**9)"]
