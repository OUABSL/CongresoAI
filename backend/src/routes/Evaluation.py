import os, sys
import json
import requests
sys.path[0] = os.getcwd()
from src.config import LLAMUS_KEY
from src.app import mongo
from bson.objectid import ObjectId

API_URL = "https://llamus.cs.us.es/api/chat"
DB = mongo.db.articles


SYSTEM_PROMPT_BASE = ("""You are an expert tutor specializing in reviewing and evaluating scientific research articles within the technology domain. Your focus lies on the "Introduction" section of a manuscript titled "Logical-Mathematical Foundations of a Graph Query Framework for Relational Learning."
                 Process the provided {section_name} section, evaluate it according to the following criteria:

                 Evaluation Levels:

                 YES: The criterion is fully met in the provided section.
                 Can be improved: The criterion is partially met but could be strengthened.
                 Must be Improved: The criterion is not adequately met, but there's potential for enhancement.
                 Not Applicable: The criterion doesn't apply to this type of article.

                 Criteria for Evaluation:
                 Motivation:
                 Clarity: Does the section clearly explain the study's significance and relevance? Are the problem's importance and its wider impacts justified? (Provide specific examples from the text).
                 Improvement: Suggest ways to strengthen the motivation, such as using data or references to highlight the problem's importance.
                 Novelty:
                 Originality: Does the section clearly describe the proposed approach's novelty or originality? Does it differentiate itself from existing work? (Provide specific examples from the text).
                 Improvement: Suggest ways to emphasize the novelty, such as explicitly comparing with related work and highlighting unique contributions.
                 Clarity:
                 Comprehension: Is the section well-written and easy to understand? Does it use appropriate terminology and avoid ambiguity? (Provide specific examples from the text).
                 Improvement: Suggest ways to improve clarity, such as restructuring complex sentences, defining technical terms, and using illustrative examples.
                 Grammar and Style:
                 Correctness: Is the section free of grammatical and stylistic errors? Does it use language appropriate for an academic setting? (Provide specific examples from the text).
                 Improvement: Suggest specific grammatical corrections and stylistic improvements, such as using more concise and precise language.
                 Typos and Errors:
                 Accuracy: Is the section free of typos and other errors? (Provide specific examples from the text).
                 Improvement: Suggest specific corrections for typos and other errors.
                 Please note: This model's performance may be limited by the quality of the input text and potential biases.

                 Section Text:
                 """
)


def create_request_headers_and_data(user_prompt, system_prompt):
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
    return headers, data

def handle_llamus_response(response):
    if response.status_code == 200:
        try:
            return response.json()
        except json.decoder.JSONDecodeError:
            print('Failed to decode JSON. Response:', response.content)
    else:
        print('Request failed. Status Code:', response.status_code)
        print('Response:', response.content)

def update_evaluation_db(article, query, value):
    evaluation_state = article['evaluation']
    evaluation_state[value[0]] = value[1]
    DB.update_one(query, {"$set": {"evaluation": evaluation_state}})
    print(f"\nUpdated the evaluation of {value[0]} srction in database!")

def evaluate_article_sections():
    query = {"_id": ObjectId("65d0f693650a61d37039b6e3")}
    article = DB.find_one(query)

    for section_name, section_content in article["content"].items():
        system_prompt = SYSTEM_PROMPT_BASE.format(section_name=section_name)
        headers, data = create_request_headers_and_data(section_content, system_prompt)
        response = requests.post(API_URL, headers=headers, data=json.dumps(data))
        section_evaluation = handle_llamus_response(response)
        
        if section_evaluation:
            update_evaluation_db(article, query, (section_name, section_evaluation))

if __name__ == "__main__":
    evaluate_article_sections()