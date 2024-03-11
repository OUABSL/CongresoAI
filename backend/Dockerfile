FROM python:3.10.7-slim

ENV CONTAINER_HOME=/var/www/backend  

WORKDIR $CONTAINER_HOME


RUN pip install --upgrade pip
COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./ .  

EXPOSE 5000

CMD ["python", "src/app.py"] 
