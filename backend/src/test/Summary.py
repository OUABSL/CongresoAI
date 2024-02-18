#from langchain import ChatOpenAI, LLMChain, StuffDocumentsChain, PromptTemplate
from typing import Type
import requests, json, os, sys
from bson.objectid import ObjectId
sys.path[0] = os.path.join(os.getcwd(), "backend")
print(sys.path[0])
from src.app import mongo, LLAMUS_KEY
from src.models.tabajo import ScientificArticle




SYSTEM_PROMPT_BASE = """Act as a research paper summarizer. I will provide you with a research paper section by section, and you will create a summary of the main points and findings of the paper section. 
                        Your focus lies on the '{section_name}' section of a manuscript titled {article_title}, Process the provided {section_name} section, summarize it according to the following instructions:
                        Your summary should be concise and should accurately and objectively communicate the key points of the paper. 
                        You should not include any personal opinions or interpretations in your summary, but rather focus on objectively presenting the information from the paper.
                        Your summary should be written in your own words and should not include any direct quotes from the paper. Please ensure that your summary is clear, concise, and accurately reflects the content of the original paper.
                        Section text:"""

class ArticleSummarizer:
    def __init__(self, db, system_prompt_base, query, llamus_key):
        self.API_URL = "https://llamus.cs.us.es/api/chat"
        self.LLAMUS_KEY = llamus_key
        self.chat_model = 'TheBloke.llama-2-13b-chat.Q5_K_M.gguf'
        self.temperature = 0.5
        self.DB = db.db.articles
        self.query = query
        self.SYSTEM_PROMPT_BASE = system_prompt_base
        self.article = self.get_article(self.query)
        try:
            self.article_content = dict(self.article["content"])
        except KeyError:
            print('KeyError: Article contents not found')
            self.article_content = {} 
        self.title = "Logical-Mathematical Foundations of a Graph Query Framework for Relational Learning" #self.get_article(query).title



    def llamus_request(self, system_prompt, user_prompt):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.LLAMUS_KEY}'
        }
        data = {
            'model': self.chat_model,
            'prompt': system_prompt,
            'messages': [{'role': 'assistant', 'content': user_prompt}],
            'temperature': self.temperature,
            'trimWhitespaceSuffix': False
        }

        response = requests.post(self.API_URL, headers=headers, data=json.dumps(data))
        if response.status_code == 200:  # Checking if the request was successful
            try:
                res = response.text
                return res
                
            except json.decoder.JSONDecodeError:  # Catching JSON decode errors
                print('Failed to decode JSON. Response:', response.content)
        else:
            print('Request failed. Status Code:', response.status_code)
            print('Response:', response.content)


    def get_article(self, query)->ScientificArticle:
        return self.DB.find_one(query)

    def update_summary_db(self, value):
        summary_state = dict(self.article['summary'])
        summary_state[value[0]] = value[1]
        self.DB.update_one(self.query, {"$set": {"summary": summary_state}})
        self.article = self.get_article(self.query)
        print(f"\nUpdated the summary of {value[0]} srction in database!")


    def run(self):
        for section_name, section_content in self.article_content.items():
            system_prompt = self.SYSTEM_PROMPT_BASE.format(section_name = section_name, article_title = self.title)
            section_summury = self.llamus_request(system_prompt, section_content)
            if section_summury:
                value = (section_name, section_summury)
                # Está pensado actualizar el resumen de todas las secciones en la bd de una vez
                self.update_summary_db(value)


if __name__ == "__main__":
    #    def __init__(self, db, system_prompt_base, query, llamus_key):
    myquery = {"_id": ObjectId("65d22d8d9a142a7b8be3d0e7")}
    evaluation_instance = ArticleSummarizer(mongo, SYSTEM_PROMPT_BASE, myquery,  LLAMUS_KEY)
    evaluation_instance.run()

# Example usage:
# summarizer = DocumentSummarizer(PyPDFLoader(pdf_path))
# summarizer.insert_db(data)
# document = summarizer.load_document()
# summarizer.generate_summary(document, "Document Title")