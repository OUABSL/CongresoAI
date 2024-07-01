from typing import Type
import requests, json, os, sys
from bson.objectid import ObjectId
from src.app import mongo, llamus_key
from src.models.manuscript import ScientificArticle
import logging

SYSTEM_PROMPT_BASE = """Act as a research paper summarizer. I will provide you with a research paper section by section, and you will create a summary of the main points and findings of the paper section. 
                        Your focus lies on the '{section_name}' section of a manuscript titled {article_title}, Process the provided {section_name} section, summarize it according to the following instructions:
                        Your summary should be concise and should accurately and objectively communicate the key points of the paper. 
                        You should not include any personal opinions or interpretations in your summary, but rather focus on objectively presenting the information from the paper.
                        Your summary should be written in your own words and should not include any direct quotes from the paper. Please ensure that your summary is clear, concise, and accurately reflects the content of the original paper.
                        Section text:"""

class ArticleSummarizer:
    """ Definir la configuración inicial de la instancia, el desarrollo de la inicialización de una instancia de la clase
    ArticleSummarizer permite a sus elementos usar el valor establecido por defecto, o bien estar restablecido mediante parámetrización.
    """
    def __init__(self, db, system_prompt_base, llamus_key, article:ScientificArticle):
        self.API_URL = "https://llamus.cs.us.es/ollama/v1/chat/completions"
        # Definir la clave de conexión con la API de Llamus, el modelo seleccionado y la temperatura de respuesta generada
        self.LLAMUS_KEY = llamus_key
        self.chat_model = "llama2:7b-chat" #Alternativa posible: 'falcon:180b-chat-Q4_K_M'
        self.temperature = 0.8
        # Definir el prompt de sistema base para la pétición
        self.SYSTEM_PROMPT_BASE = system_prompt_base
        # Recoger el manuscrito a procesar
        self.article = article
        # Definir la colección de base de datos, está en desuso por cambios de lógica
        self.DB = db.db.scientific_article

        #Recoger el título y contenido del manuscrito con manejo de errores.
        self.title = self.article['title']
        try:
            self.article_content = dict(self.article["content"])
        except KeyError:
            logging.error('KeyError: Contenido de manuscrito no recibido <ArticleSummarizer>')
            self.article_content = {} 



    def llamus_request(self, system_prompt, user_prompt):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.LLAMUS_KEY}'
        }
        data = {
            'stream': False,
            'model':self.chat_model,
            'temperature':self.temperature,
            'messages':[
                {
                    "role":"system",
                    "content":system_prompt
                },
                {
                    "role":"user",
                    "content":user_prompt + "\n\n Section Evaluation:"
                }]
        }

        response = requests.post(self.API_URL, headers=headers, data=json.dumps(data))
        if response.status_code == 200:  # Checking if the request was successful
            try:
                logging.info(response.text)
                return response.json()
            except json.decoder.JSONDecodeError:  # Catching JSON decode errors
                logging.error(f'Failed to decode JSON. Response: {response.content}')
        else:
            logging.error(f'Request failed. Status Code:  {response.status_code}')
            logging.error(f'Response: {response.content}')


    """ Esta función es responsable de ejecutar el flujo de trabajo del proceso, resume un manuscrito haciendo una solicitud a la API LLAMUS para cada sección del artículo.
    - Si una sección se resume con éxito, su contenido resumido se agrega bajo su nombre en el diccionario.
    - En caso contrario, se agrega bajo el nombre de la sección en el diccionario el valor <Error> que sería procesado en otros componentes del sistema.
    Salida: Devuelve un diccionario que contiene el resumen generado para cada sección.
    """
    def run(self):
        # Comenzar con el atributo summary ya proporcionado del manuscrito o que ya ha sido inicializado con {} en el servicio de Procesamiento de manuscrito
        res = self.article["summary"]
        
        # Iterar sobre cada sección en el contenido del artículo
        for section_name, section_content in self.article_content.items():
            try:
                # Formatear el prompt del sistema agregando el nombre de la sección y el título del artículo
                system_prompt = self.SYSTEM_PROMPT_BASE.format(section_name=section_name, article_title=self.title)
                user_prompt = section_content
                # Invocar el modelo seleccionado de LlamUs para obtener el resumen de la sección actual
                section_summary = self.llamus_request(system_prompt, user_prompt)
                if section_summary:
                    tmp = dict(section_summary)
                    choices = tmp.get('choices', [])
                    if choices and isinstance(choices, list):
                        msg = choices[0].get('message', {})
                        response = msg.get('content', '')
                    else:
                        response = ''
                    res[section_name] = response
            #Manejar los errores que se pueden generar durante la ejecución del proceso
            except Exception: 
                logging.error(f"Error al resumir la sección <{section_name}>")
                # El valor Erroe será posteriormente comprobado en funciones de routes 
                res[section_name] = "Error" 
                break 

        return res
