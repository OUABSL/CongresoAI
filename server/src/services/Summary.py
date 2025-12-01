import json
import logging
from src.models.manuscript import ScientificArticle
from src.services.gptHandler import GptHandler

# Configuración del logging para el módulo de generación de evaluaciones
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

SYSTEM_PROMPT_BASE = """Act as a research paper summarizer. I will provide you with a research paper section by section, and you will create a summary of the main points and findings of the paper section. 
                        Your focus lies on the '{section_name}' section of a manuscript titled {article_title}, Process the provided {section_name} section, summarize it according to the following instructions:
                        Your summary should be concise and should accurately and objectively communicate the key points of the paper. 
                        You should not include any personal opinions or interpretations in your summary, but rather focus on objectively presenting the information from the paper.
                        Your summary should be written in your own words and should not include any direct quotes from the paper. Please ensure that your summary is clear, concise, and accurately reflects the content of the original paper.
                        
                        The summary generated for section {section_name} must be in Markdown format.

                        Section text:"""

class ArticleSummarizer:
    """ Clase para resumir artículos científicos utilizando GptHandler para interactuar con GPT-4. """
    
    def __init__(self, system_prompt_base, gpt_key, article: ScientificArticle, temperature = 0.8, model= "gpt-3.5-turbo"):
        self.SYSTEM_PROMPT_BASE = system_prompt_base
        self.article = article
        self.title = self.article['title']
        self.model=model
        self.temperature = temperature
        self.gpt_handler = GptHandler(openai_api_key=gpt_key, system_prompt_base=system_prompt_base, model=self.model, temperature=self.temperature)

        
        try:
            self.article_content = dict(self.article["content"])
        except KeyError:
            logging.error('KeyError: Contenido de manuscrito no recibido <ArticleSummarizer>')
            self.article_content = {}

    """ Esta función es responsable de ejecutar el flujo de trabajo del proceso, resume un manuscrito haciendo una solicitud a GPT-4 para cada sección del artículo.
    - Si una sección se resume con éxito, su contenido resumido se agrega bajo su nombre en el diccionario.
    - En caso contrario, se agrega bajo el nombre de la sección en el diccionario el valor <Error> que sería procesado en otros componentes del sistema.
    Salida: Devuelve un diccionario que contiene el resumen generado para cada sección.
    """
    def run(self):
        print("Entrando en run summary")
        # Comenzar con el atributo summary ya proporcionado del manuscrito o que ya ha sido inicializado con {} en el servicio de Procesamiento de manuscrito
        res = self.article.summary if self.article.summary else {}
        aimodel = f"Model: {self.model} - Temperature: {self.temperature}"
        # Iterar sobre cada sección en el contenido del artículo
        for section_name, section_content in self.article_content.items():
            try:
                 # Convertir section_content a cadena si es un diccionario
                if isinstance(section_content, dict):
                    section_content = json.dumps(section_content)
                elif not isinstance(section_content, str):
                    raise ValueError(f"Tipo de contenido de sección no soportado: {type(section_content)}")
                
                system_prompt = self.SYSTEM_PROMPT_BASE.format(section_name=section_name, article_title=self.title)
                user_prompt = section_content
                
                # Invocar el método de GptHandler para obtener el resumen de la sección actual
                section_summary = self.gpt_handler.gpt_request(system_prompt, user_prompt)
                
                if section_summary:
                    res[section_name] = section_summary
                else:
                    res[section_name] = "Error en la generación del resumen"
                    
            # Manejar los errores que se pueden generar durante la ejecución del proceso
            except Exception as e: 
                logging.error(f"Error al resumir la sección <{section_name}>: {e}")
                res[section_name] = "Error" 

        return (res, aimodel)