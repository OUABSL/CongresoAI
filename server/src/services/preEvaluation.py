import json, requests, logging
from src.models.manuscript import ScientificArticle



SYSTEM_PROMPT_BASE = ("""You are an expert tutor specializing in reviewing and evaluating scientific manuscripts within the technology domain. Your focus lies on the '{section_name}' section of a manuscript titled "{title}" that have as key words: {key_words}
                      Process the provided {section_name} section, evaluate it according to the following criteria and respecting the defined evaluation format:

                      Evaluation Levels:                 
                      - YES: The criterion is fully met in the provided section.
                      - Can be improved: The criterion is partially met but could be strengthened.                    
                      - Must be Improved: The criterion is not adequately met, but there's potential for enhancement.                 
                      - Not Applicable: The criterion doesn't apply to this type of article.

                      Criteria for Evaluation:                 
                      - Motivation:                 
                      Clarity: Does the section clearly explain the study's significance and relevance? Are the problem's importance and its wider impacts justified? (Provide specific examples from the text).                 
                      Improvement: Suggest ways to strengthen the motivation, such as using data or references to highlight the problem's importance.                 
                      - Novelty:                              
                      Originality: Does the section clearly describe the proposed approach's novelty or originality? Does it differentiate itself from existing work? (Provide specific examples from the text).                                   
                      Improvement: Suggest ways to emphasize the novelty, such as explicitly comparing with related work and highlighting unique contributions.
                      - Clarity:                 
                      Comprehension: Is the section well-written and easy to understand? Does it use appropriate terminology and avoid ambiguity? (Provide specific examples from the text).                 
                      Improvement: Suggest ways to improve clarity, such as restructuring complex sentences, defining technical terms, and using illustrative examples.                 
                      - Grammar and Style:                 
                      Correctness: Is the section free of grammatical and stylistic errors? Does it use language appropriate for an academic setting? (Provide specific examples from the text).                 
                      Improvement: Suggest specific grammatical corrections and stylistic improvements, such as using more concise and precise language.          
                      - Typos and Errors:                 
                      Accuracy: Is the section free of typos and other errors? (Provide specific examples from the text).
                      Improvement: Suggest specific corrections for typos and other errors.

                      
                
                      Evaluation format: 
                      Evaluation Criteria: Evaluation Level, Evaluation justification and exemples from the evaluated section.

                Section Text:\n
                """
)

SYSTEM_PROMPT_RESUBMIT = ("""You are an expert tutor specializing in reviewing and evaluating scientific research articles within the technology domain. Your focus lies on the '{section_name}' section of a manuscript titled "{title} that have as key words: {key_words}
                    
                    
                    Evaluate it according to the following criteria and respecting the defined evaluation format:
                            
                      Evaluation Levels:                 
                      - YES: The criterion is fully met in the provided section.
                      - Can be improved: The criterion is partially met but could be strengthened.                    
                      - Must be Improved: The criterion is not adequately met, but there's potential for enhancement.                 
                      - Not Applicable: The criterion doesn't apply to this type of article.

                      Criteria for Evaluation:                 
                      - Motivation:                 
                      Clarity: Does the section clearly explain the study's significance and relevance? Are the problem's importance and its wider impacts justified? (Provide specific examples from the text).                 
                      Improvement: Suggest ways to strengthen the motivation, such as using data or references to highlight the problem's importance.                 
                      - Novelty:                              
                      Originality: Does the section clearly describe the proposed approach's novelty or originality? Does it differentiate itself from existing work? (Provide specific examples from the text).                                   
                      Improvement: Suggest ways to emphasize the novelty, such as explicitly comparing with related work and highlighting unique contributions.
                      - Clarity:                 
                      Comprehension: Is the section well-written and easy to understand? Does it use appropriate terminology and avoid ambiguity? (Provide specific examples from the text).                 
                      Improvement: Suggest ways to improve clarity, such as restructuring complex sentences, defining technical terms, and using illustrative examples.                 
                      - Grammar and Style:                 
                      Correctness: Is the section free of grammatical and stylistic errors? Does it use language appropriate for an academic setting? (Provide specific examples from the text).                 
                      Improvement: Suggest specific grammatical corrections and stylistic improvements, such as using more concise and precise language.          
                      - Typos and Errors:                 
                      Accuracy: Is the section free of typos and other errors? (Provide specific examples from the text).
                      Improvement: Suggest specific corrections for typos and other errors.
                          
                     This section is a resubmission of the previous version. Considering the previous review made by the expert reviewer of the section: {review_section}, ensure that improvements have been made as per the reviewer's comments: {review_comments}.

                
                      Evaluation format: 
                      Evaluation Criteria: Evaluation Level, If the new section version Evaluation justification and exemples from the evaluated section.
                      

                Section Text:\n
                """
)

# Configuración del logging para el módulo de generación de evaluaciones
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class PreEvaluation:
    # Configuración inicial de la evaluación
    def __init__(self, db, system_prompt_base, llamus_key, article : ScientificArticle, is_resubmited:bool=False):
        self.API_URL = "https://llamus.cs.us.es/ollama/v1/chat/completions"
        self.LLAMUS_KEY = llamus_key
        self.temperature = 0.8
        self.chat_model = 'llama2:13b-chat'
        self.temperature = 0.8
        self.DB = db.db.scientific_article
        self.system_prompt_base = system_prompt_base
        self.article = article
        self.is_resubmited = is_resubmited
        # Se recoge el contenido del manuscrito de la base de datos 
        try:
            self.article_content = dict(self.article["content"])
        except KeyError:
            logging.error('KeyError: Article contents not found')
            self.article_content = {}

    # Función para hacer una solicitud a la API LLAMUS
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
                    "role":"assistant",
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
    
    """
    Función para manejar el proceso de la evaluación inicial mediante peticiones a modelos de llamus.
    1- Se recogen las variables y se limpia el error de ejecuión de un proceso anteriro
    2- 
    """
    # Función para realizar el proceso de pre-evaluación
    def run(self):
        # Obtener la evaluación almacenada del artículo
        res = self.article["evaluation"]
        # Comprobar si existe un error prevenido de procesos anteriores, en caso afirmativo, eliminarlo
        if 'error' in res:
            del res['error']
        # Convertir el contenido del artículo a un diccionario
        content = dict(self.article['content'])     
        # Crear una lista de palabras clave del artículo
        key_words = ', '.join(self.article["key_words"]) if isinstance(self.article["key_words"], list) and self.article["key_words"] else str(self.article["key_words"])

        # Si el artículo ya tiene una evaluación, obtener esa evaluación
        if res.keys():
            self.article["evaluation"]
        res = self.article["evaluation"]

        # Si se trata de segunda entrega, obtener la revisión de la entrega anterior.
        if(self.is_resubmited):
            review = dict(self.article["review"])

        # Para cada sección en el contenido del artículo
        for section_name, section_content in content.items():
            try: 
                # Si el artículo no ha sido reenviado para revisión, crear el prompt del sistema correspondiente
                if(not(self.is_resubmited)):
                    system_prompt = self.system_prompt_base.format(section_name=section_name, title=self.article['title'], key_words = key_words)
                else:
                    # Si se trata de segunda entrega, obtener la sección revisada y los comentarios para esa sección
                    if review:
                        review_section = dict(review.get(section_name, {}))
                        review_comments = review_section.get('comment', '')
                        if review_comments != '':
                            review_section.pop("comment")
                        system_prompt = self.system_prompt_base.format(section_name=section_name, title=self.article['title'], key_words = key_words, review_section=review_section, review_comments=review_comments)
                    else:
                        logging.error("No se ha recibido la revisión del articulo")
                section_evaluation = self.llamus_request(system_prompt, section_content)

                # Si se obtiene una evaluación de la sección, almacenarla en "res"
                if section_evaluation:
                    tmp = dict(section_evaluation)
                    choices = tmp.get('choices', [])
                    if choices and isinstance(choices, list):
                        try:
                            msg = choices[0].get('message', {})
                            response = msg.get('content', '')

                        except IndexError:
                            logging.error(f"Error al recibir la variable choice en la respuesta Llamus para la sección <{section_name}>")      
                            continue               
                    else:
                        response = ''
                    res[section_name] = response
            except Exception as e:
                # Registrar en log cualquier error que ocurra durante la evaluación de la sección
                logging.error(f"Ha sucecido un error en la generación de evaluación de sección <{section_name}> \n{e}")
                # Marcar la evaluación de la sección como "Error", el valor Error se gestiona posteriormente en los módulos del componente <Routes>
                res[section_name] = "Error"
                continue 
        # Devolver las evaluaciones de las secciones
        return res