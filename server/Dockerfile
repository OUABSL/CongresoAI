FROM python:3.10.7-slim

ENV CONTAINER_HOME=/server

WORKDIR $CONTAINER_HOME


COPY ./requirements.txt .

ENV FLASK_ENV production

RUN pip install --upgrade pip 
RUN pip install -r ./requirements.txt
RUN python -m spacy download en_core_web_lg

# Instalar el compilador Latex
RUN apt-get update && apt-get install -y \
texlive-full \
&& apt-get clean

    
#RUN pip install -U langchain-community
# RUN pip install -U langchain langchain-openai pydantic


