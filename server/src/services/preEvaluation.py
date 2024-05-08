import json, requests
import logging
from src.app import mongo, llamus_key
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

                Section Text:\n
                """
)



SYSTEM_PROMPT_RESUBMIT = ("""You are an expert tutor specializing in reviewing and evaluating scientific research articles within the technology domain. Your focus lies on the '{section_name}' section of a manuscript titled "{title}".

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
                
                      Evaluation format: 
                      Evaluation Criteria: Evaluation Level, Evaluation justification and exemples from the evaluated section.
                      
                      This section is a resubmission of the previous version. Considering the previous review of the section: {review_section}, ensure that improvements have been made as per the reviewer's comments: {review_comments}.

                Section Text:\n
                """
)


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class PreEvaluation:
    def __init__(self, db, system_prompt_base, llamus_key, article : ScientificArticle, is_resubmited:bool=False):
        self.API_URL = "https://llamus.cs.us.es/ollama/v1/chat/completions"
        self.LLAMUS_KEY = llamus_key
        self.temperature = 0.8
        self.chat_model = 'llama2:13b-chat'
        self.temperature = 0.8
        self.DB = db.db.scientific_article
        self.SYSTEM_PROMPT_BASE = system_prompt_base
        self.article = article
        self.is_resubmited = is_resubmited
        try:
            self.article_content = dict(self.article["content"])
        except KeyError:
            logging.error('KeyError: Article contents not found')
            self.article_content = {}

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
                logging.error('Failed to decode JSON. Response:', response.content)
        else:
            logging.error('Request failed. Status Code:', response.status_code)
            logging.error('Response:', response.content)

    def get_article(self, query)->ScientificArticle:
        return self.DB.find_one(query)

    def updateEvaluationdb(self, value):
        evaluationState = dict(self.article['evaluation'])
        evaluationState[value[0]] = value[1]
        newvalues = { "$set": { "evaluation": evaluationState } }
        self.DB.update_one(self.query,newvalues)
        self.article = self.get_article(self.query)
        logging.info(f"\nUpdated the evaluation of {value[0]} in memory!\n")

    def run(self):
        res = self.article["evaluation"]
        content = dict(self.article['content'])

        for section_name, section_content in content.items():
            try:  # Add try block 
                if(not(self.is_resubmited)):
                    system_prompt = self.SYSTEM_PROMPT_BASE.format(section_name=section_name, title=self.article['title'])
                else:
                    review_section = dict(self.article["review"][section_name])
                    review_comments = review_section["comment"]
                    review_section.pop("comment")
                    system_prompt = self.SYSTEM_PROMPT_BASE.format(section_name=section_name, title=self.article['title'], review_section=review_section, review_comments=review_comments)
     
                section_evaluation = self.llamus_request(system_prompt, section_content)

                
                if section_evaluation:
                    tmp = dict(section_evaluation)
                    choices = tmp.get('choices', [])
                    if choices and isinstance(choices, list):
                        msg = choices[0].get('message', {})
                        response = msg.get('content', '')
                    else:
                        response = ''
                    res[section_name] = response
            except Exception as e:
                logging.error(f"error evaluacion {section_name}:\n {e}")
                logging.error(f"An error occurred while processing the '{section_name}' section \n{e}")
                res[section_name] = ""  # Set the value to an empty string
                res['error'] = True
                continue  # Continue to the next iteration of the loop
        return res