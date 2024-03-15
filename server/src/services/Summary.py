from typing import Type
import requests, json, os, sys
from bson.objectid import ObjectId
from app import mongo, llamus_key
from models.tabajo import ScientificArticle

SYSTEM_PROMPT_BASE = """Act as a research paper summarizer. I will provide you with a research paper section by section, and you will create a summary of the main points and findings of the paper section. 
                        Your focus lies on the '{section_name}' section of a manuscript titled {article_title}, Process the provided {section_name} section, summarize it according to the following instructions:
                        Your summary should be concise and should accurately and objectively communicate the key points of the paper. 
                        You should not include any personal opinions or interpretations in your summary, but rather focus on objectively presenting the information from the paper.
                        Your summary should be written in your own words and should not include any direct quotes from the paper. Please ensure that your summary is clear, concise, and accurately reflects the content of the original paper.
                        Section text:"""

class ArticleSummarizer:
    def __init__(self, db, system_prompt_base, llamus_key, article:ScientificArticle):
        self.API_URL = "https://llamus.cs.us.es/ollama/v1/chat/completions"
        self.LLAMUS_KEY = llamus_key
        self.temperature = 0.8
        self.chat_model = 'falcon:180b-chat-Q4_K_M'
        self.DB = db.db.scientific_article
        self.SYSTEM_PROMPT_BASE = system_prompt_base
        self.article = article
        try:
            self.article_content = dict(self.article["content"])
        except KeyError:
            print('KeyError: Article contents not found')
            self.article_content = {} 
        self.title = self.article['title']



    def llamus_request(self, system_prompt, user_prompt):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.LLAMUS_KEY}'
        }
        data = {
            'stream': False,
            'model':"llama2:7b-chat",
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
                #print(response.text)
                return response.json()
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
        res = self.article["summary"]

        for section_name, section_content in self.article_content.items():
            try:  # Add try block here
                system_prompt = self.SYSTEM_PROMPT_BASE.format(section_name=section_name, article_title=self.title)
                section_summary = self.llamus_request(system_prompt, section_content)
                if section_summary:
                    tmp = dict(section_summary)
                    choices = tmp.get('choices', [])
                    if choices and isinstance(choices, list):
                        msg = choices[0].get('message', {})
                        response = msg.get('content', '')
                    else:
                        response = ''
                    res[section_name] = response
            except Exception:  # Catch all types of exceptions
                print(f"An error occurred while processing the '{section_name}' section")
                res[section_name] = "Error"  # Set the value to an empty string
                continue  # Continue to the next iteration of the loop

        return res
        #self.article.update_properties(summary=res)