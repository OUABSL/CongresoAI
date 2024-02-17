import os
import json
import requests
import os, sys
sys.path[0] = os.getcwd() + "/backend"
from src.config import LLAMUS_KEY
from src.app import mongo
from bson.objectid import ObjectId

API_URL = "https://llamus.cs.us.es/api/chat"
DB = mongo.db.articles


SYSTEM_PROMPT_BASE = ("""You are an expert tutor specializing in reviewing and evaluating scientific research articles within the technology domain. Your focus lies on the '{section_name}' section of a manuscript titled "Logical-Mathematical Foundations of a Graph Query Framework for Relational Learning."
                 Process the provided '{section_name}' section, evaluate it according to the following criteria:

                 Evaluation Levels:

                 YES: The criterion is fully met in the provided section.
                 Can be improved: The criterion is partially met but could be strengthened.
                 Must be Improved: The criterion is not adequately met, but there's potential for enhancement.
                 Not Applicable: The criterion doesn't apply to this type of article.

                 """
)
        

def llamus_request(system_prompt, user_prompt):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {LLAMUS_KEY}'
    }
    data = {
        'model': 'TheBloke.llama-2-13b-chat.Q5_K_M.gguf',
        'prompt': system_prompt,
        'messages': [{'role': 'assistant', 'content': user_prompt}],
        'temperature': 0.5,
        'trimWhitespaceSuffix': False
    }

    response = requests.post(API_URL, headers=headers, data=json.dumps(data))
    if response.status_code == 200:  # Checking if the request was successful
        try:
            return response.json()
        except json.decoder.JSONDecodeError:  # Catching JSON decode errors
            print('Failed to decode JSON. Response:', response.content)
    else:
        print('Request failed. Status Code:', response.status_code)
        print('Response:', response.content)

def get_article(query):
    return DB.find_one(query)

def updateEvaluationdb(article, query, value):
    evaluationState = dict(article['evaluation'])
    evaluationState[value[0]] = value[1]
    newvalues = { "$set": { "evaluation": evaluationState } }
    DB.update_one(query,newvalues)
    print(f"\nUpdated the evaluation of {value[0]} in memorie!")



def run():
    #section = st.text_input("Ask your question")
    myquery = {"_id": ObjectId("65d0f693650a61d37039b6e3")}
    article = get_article(myquery)
    article_content = dict(article["content"])
    for section_name, section_content in article_content.items():
        system_prompt = SYSTEM_PROMPT_BASE.format(section_name = section_name)
        section_evaluation = llamus_request(system_prompt, section_content)
        if section_evaluation:
            #if section_name == "Relational machine learning":
            #print(f"\n\n para la seccion {section_name} el prompt es:\n\n {system_prompt}")
            value = (section_name, section_evaluation)
            updateEvaluationdb(article, myquery, value)

    
if __name__ == "__main__":
    run()