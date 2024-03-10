FROM python:3.10.7-slim

ENV CONTAINER_HOME=/var/www/backend  

WORKDIR $CONTAINER_HOME

COPY ./backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .  

EXPOSE 5000

CMD ["python", "src/app.py"] 
