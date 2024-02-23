import os, json, requests, sys
sys.path[0] = os.path.join(os.getcwd(), "backend")
print(sys.path[0])
from src.app import mongo, LLAMUS_KEY
from bson.objectid import ObjectId
from src.models.tabajo import ScientificArticle


SYSTEM_PROMPT_BASE = ("""You are an expert tutor specializing in reviewing and evaluating scientific research articles within the technology domain. Your focus lies on the '{section_name}' section of a manuscript titled "{title}"
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

                Section Text:
                """
)

class PreEvaluation:
    def __init__(self, db, query, system_prompt_base, llamus_key):
        self.API_URL = "https://llamus.cs.us.es/api/chat"
        self.LLAMUS_KEY = llamus_key
        self.chat_model = 'TheBloke.llama-2-13b-chat.Q5_K_M.gguf'
        self.temperature = 0.5
        self.DB = db.db.articles
        self.SYSTEM_PROMPT_BASE = system_prompt_base
        self.query = query
        self.article = self.get_article(self.query)
        self.title = "Logical-Mathematical Foundations of a Graph Query Framework for Relational Learning." #self.get_article(query).title
        try:
            self.article_content = dict(self.article["content"])
        except KeyError:
            print('KeyError: Article contents not found')
            self.article_content = {}


    def llamus_request(self, system_prompt, user_prompt):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.LLAMUS_KEY}'
        }
        data = {
            'model': self.chat_model,
            'prompt': system_prompt,
            'messages': [{'role': 'assistant', 'content': user_prompt + "\n\n Section Evaluation:"}],
            'temperature': self.temperature,
            'trimWhitespaceSuffix': False
        }

        response = requests.post(self.API_URL, headers=headers, data=json.dumps(data))
        if response.status_code == 200:  # Checking if the request was successful
            try:
                print(response.text)
                return response.json()
            except json.decoder.JSONDecodeError:  # Catching JSON decode errors
                print('Failed to decode JSON. Response:', response.content)
        else:
            print('Request failed. Status Code:', response.status_code)
            print('Response:', response.content)

    def get_article(self, query)->ScientificArticle:
        return self.DB.find_one(query)

    def updateEvaluationdb(self, value):
        evaluationState = dict(self.article['evaluation'])
        evaluationState[value[0]] = value[1]
        newvalues = { "$set": { "evaluation": evaluationState } }
        self.DB.update_one(self.query,newvalues)
        self.article = self.get_article(self.query)
        print(f"\nUpdated the evaluation of {value[0]} in memory!\n")

    def run(self):
        for section_name, section_content in self.article_content.items():
            system_prompt = self.SYSTEM_PROMPT_BASE.format(section_name = section_name, title = self.title)
            section_evaluation = self.llamus_request(system_prompt, section_content)
            if section_evaluation:
                tmp = dict(section_evaluation)
                res = tmp['response']
                value = (section_name, res)
                # Está pensado actualizar el resumen de todas las secciones en la bd de una vez
                self.updateEvaluationdb(value)


if __name__ == "__main__":
    myquery = {"_id": ObjectId("65d35430bb52400ef325f827")}
    evaluation_instance = PreEvaluation(mongo, myquery,  SYSTEM_PROMPT_BASE, LLAMUS_KEY)
    evaluation_instance.run()