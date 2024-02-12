import os
import json
import requests
import os, sys
sys.path[0] = os.getcwd()
from app import mongo
from typing import Type
from langchain.prompts import PromptTemplate
from app import mongo
from config import LLAMUS_KEY


class ChatBotAPI:
    def __init__(self, article):
        """ Initializes necessary constants, and the headers and data required for the API connection """
        self.api_url = 'https://llamus.cs.us.es/api/chat'
        self.key = LLAMUS_KEY
        self.chat_model = 'TheBloke.falcon-180b-chat.Q4_K_M.gguf'
        self.title = article["title"]
        self.content = self.generete_content(self, article)
        self.system_prompt = self.generate_system_prompt(self.title, self.content)
        self.temperature = 0.2
        self.use_stream = True
        self.headers = self.create_headers()
        self.data = self.create_data()

    def create_headers(self):
        """ Returns the headers required for the API connection """
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {}'.format(self.key)
        }

    @staticmethod
    def generate_system_prompt(title, pdf_content):
        prompt_template = f"""Do the rule of a reviewer of scientific paper and articles, you need to reviewing our manuscript titled {title}. Ignore all latex code and take into account just the content of the article 'Text, Tables and mathematical formulas'  
        """
        prompt = prompt_template
        return prompt

    @staticmethod
    def generete_content(self, article):
        sections = dict(article["content"])
        sections_name= list(sections.keys())
        chunks = [[] for _ in range(len(sections_name))]  # initialize chunks with empty lists
        for i, section_name in enumerate(sections_name):
           sections_name[i] = (i+1, section_name)
           chunks[i].append(self.prepare_data((section_name, sections[section_name])))
        
        print(chunks)
        
        print(sections_name)

        return chunks

    def prepare_data(self, tuple_data):
        

        return []
    def create_data(self):
        """ Returns the data required for the API connection """
        return {
            'model': self.chat_model,
            'messages': [
                {
                    'role': 'assistant',
                    'content': '{section_content}'
                }
            ],
            'prompt': self.system_prompt,
            'temperature': self.temperature,
            'useStream': self.use_stream
        }

    def send_request(self):
        """ Sends a post request to the API and returns the response """
        return requests.post(self.api_url, headers=self.headers, data=json.dumps(self.data), stream=self.use_stream, timeout=5)

    def process_response(self, response):
        """ Handles the response from the API """
        try:
            for chunk in response.iter_content():
                if chunk:
                    print(chunk.decode('utf-8'))
        except requests.exceptions.RequestException as e:
            print("Timeout error..")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            response.close()

    def chat(self):
        """ Connects to the API, handles the response and carries out the chat operations """
        response = self.send_request()
        if self.use_stream:
            self.process_response(response)

def main():
    """ Instanciates the ChatBotAPI class and calls the chat method """
    article = mongo.db.articles.find_one({"user": "beta user"})
    chat_bot_api = ChatBotAPI(article)
    #chat_bot_api.chat()

if __name__ == "__main__":
    main()