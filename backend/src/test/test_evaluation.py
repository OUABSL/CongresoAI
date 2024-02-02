import os
import json
import requests
from typing import Type
from langchain.prompts import PromptTemplate


class ChatBotAPI:


    def __init__(self):
        """ Initializes necessary constants, and the headers and data required for the API connection """
        self.api_url = 'https://llamus.cs.us.es/api/chat'
        self.chat_model = 'TheBloke.falcon-180b-chat.Q4_K_M.gguf'
        self.pdf_content = self.generet_content()
        self.system_prompt = self.generate_system_prompt("title", self.pdf_content)
        self.temperature = 0.2
        self.use_stream = True
        self.headers = self.create_headers()
        self.data = self.create_data()

    @staticmethod
    def create_headers():
        """ Returns the headers required for the API connection """
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-8c5be95827ad677b1c760ea7e2b21c774f67b50473444576'
        }


    
    def generate_system_prompt(pdf_content, title):
        prompt_template = """Do the rule of a reviewer of scientific paper and articles, you need to reviewing our manuscript titled {title}. Ignore all latex code and take into account just the content of the article 'Text, Tables and mathematical formulas' 
    In order for us to improve the quality of our work and advance the publication process, we kindly ask that in your review report you can provide us with:
    - If the topic of the work is appropriate to the theme of the congress
    - A general evaluation of the relevance of the topic, the originality and the significance of the results presented.
    - Your opinion on the clarity of the introduction and whether it provides the context and information necessary to understand the work.
    - specific feedback on the robustness of the methodology and statistical analyses, if applicable.
    - Comments on the suitability of the references and whether they adequately represent the state of the art of the topic.
    - Your perspective regarding the clarity of the presentation of the results and whether the figures and tables are interpreted in a self-contained way.
    - Recommendations on how to improve the discussion and conclusions of the study.
    - Any suggestions that help enrich the quality of the manuscript and its potential contribution to the field.
    - If considered appropriate, the identification of relevant works that have been omitted from the bibliography.
        
        Write a concise evaluation of the given section of the article, 
        
    """

        
        prompt = PromptTemplate.from_template(prompt_template)
        return prompt


    def generate_prompt(template: str, **kwargs) -> Type[PromptTemplate]:
        filled_template = template.format(**kwargs)
        prompt = PromptTemplate.from_template(filled_template)
        return prompt
    
    def generet_content():
        return """**5. Conclusions and Future Work**

This paper introduces a pioneering framework for graph queries, marked by its distinctive feature of enabling the polynomial cyclic evaluation of queries and refinements through atomic operations. The framework also exhibits proficiency in applying refinements within relational learning processes. It addresses several crucial requirements, employing consistent grammar for queries and structures, facilitating subgraph assessment beyond individual nodes, and supporting cyclic queries within polynomial time constraints.

Unlike graph isomorphism-based query systems with exponential complexity in handling cyclic queries, our framework assesses the existence/non-existence of paths and nodes, allowing for the evaluation of cyclic patterns in polynomial time. The system also provides a controlled and automated query construction via refinements, where refinement sets act as embedded partitions of the evaluated structure set, serving as effective tools for top-down learning techniques.

A proof-of-concept implementation demonstrated the capabilities of the graph query framework through experimentation, particularly in relational learning procedures outlined in Section 4.2. Results illustrated that meaningful patterns could be extracted from relational data, significantly impacting explainable learning and automatic feature extraction tasks. Graphs representing these results were generated using our proof-of-concept implementation on a graph database and the matplotlib library [36].

While the presented query definition focuses on binary graph datasets, it is adaptable to hypergraph data. Despite the simplicity of binary cases due to the absence of true hypergraph databases, the framework's potential in universal cases will be realized as hypergraph usage becomes more widespread.

In Section 3.3, a fundamental set of refinement operations is presented, but they may not be universally suitable for all learning tasks. To enhance query space coverage and prevent plateaus, more complex refinement families can be established. The integration of operations or the unification of refinements based on structural occurrences frequency could lead to faster learning algorithms.

Future research will concentrate on automating the generation of refinement sets tailored to specific learning tasks and graph dataset characteristics. Extracting statistics from the graph data for set generation holds promise for significant optimizations.

In conclusion, this work demonstrates the feasibility of effective techniques for matching graph patterns and learning symbolic relationships. The systematic exploration of the pattern space, high query expressiveness, and reasonable computational costs are achieved. Patterns from obtained decision trees' leaves can categorize subgraphs and justify decisions in sensitive applications. These patterns can serve as features in other machine learning methods, enabling non-relational machine learning techniques to learn from them. Investigating probabilistic query amalgamation for pattern generation is crucial, especially in ensemble methods like random forests. Additionally, exploring other machine learning algorithms alongside this query framework offers further opportunities for relational learning."""

    def create_data(self):
        """ Returns the data required for the API connection """
        section_content = self.generet_content
        return {
            'model': self.chat_model,
            'messages': [
                {
                    'role': 'user',
                    'content': '{section_content}'
                }
            ],
            'prompt': self.system_prompt,
            'temperature': self.temperature,
            'useStream': self.use_stream
        }

    def send_request(self):
        """ Sends a post request to the API and returns the response """
        return requests.post(self.api_url, headers=self.headers, data=json.dumps(self.data), stream=self.use_stream)

    @staticmethod
    def process_response(response):
        """ Handles the response from the API """
        try:
            for chunk in response.iter_content():
                if chunk:
                    print(chunk.decode('utf-8'))
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
    chat_bot_api = ChatBotAPI()
    chat_bot_api.chat()

if __name__ == "__main__":
    main()