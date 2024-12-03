FROM python:3.10.7-slim

ENV CONTAINER_HOME=/server

WORKDIR $CONTAINER_HOME


COPY ./requirements.txt .

ENV FLASK_ENV production

RUN pip install -r ./requirements.txt
RUN python -m spacy download en_core_web_lg
RUN pip install -U langchain-community

