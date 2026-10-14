import json, requests, logging
from src.models.manuscript import ScientificArticle

# Configuración del logging para el módulo de generación de evaluaciones
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class LlamusHandler:
    def __init__(self, api_url, llamus_key, chat_model='llama2:13b-chat', temperature=0.8):
        self.api_url = api_url
        self.llamus_key = llamus_key
        self.chat_model = chat_model
        self.temperature = temperature

    def request(self, system_prompt, user_prompt):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.llamus_key}'
        }
        data = {
            'stream': False,
            'model': self.chat_model,
            'temperature': self.temperature,
            'messages': [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "assistant",
                    "content": user_prompt + "\n\n Section Evaluation:"
                }]
        }

        response = requests.post(self.api_url, headers=headers, data=json.dumps(data))
        if response.status_code == 200:  # Checking if the request was successful
            try:
                logging.info(response.text)
                return response.json()
            except json.decoder.JSONDecodeError:  # Catching JSON decode errors
                logging.error(f'Failed to decode JSON. Response: {response.content}')
        else:
            logging.error(f'Request failed. Status Code:  {response.status_code}')
            logging.error(f'Response: {response.content}')
        return None