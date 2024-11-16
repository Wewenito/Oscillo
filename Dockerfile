FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc python3-dev libmariadb-dev pkg-config

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY ./ /app/

ENV DJANGO_SECRET_KEY='django-insecure-i@tx#rkiqy!_1qh!ifpy^c&%(ku*$86edfeef-$jdb-3c)t^m5'
ENV DJANGO_DEBUG=True
ENV DJANGO_ALLOWED_HOSTS=*

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
