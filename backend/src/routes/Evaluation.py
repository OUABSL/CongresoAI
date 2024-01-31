import sys
sys.path.append('.')
from typing import Type
from app import app, base
from dataPreparation import content_extracted
from langchain import ChatOpenAI, LLMChain, StuffDocumentsChain, PromptTemplate

from openai import * 

db = base.trabajos


def generate_evaluation_prompt(pdf_content, title):
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

Once again, we thank you for taking your valuable time to review our manuscript and we look forward to your comments and any questions that may arise.
    
    Write a concise evaluation of the given text in Spanish, 
    generating a markdown file with bullet points for the main ideas, the text:
    "{pdf_content}"
    CONCISE EVALUATION:"""

    
    prompt = PromptTemplate.from_template(prompt_template)
    return prompt


def generate_prompt(template: str, **kwargs) -> Type[PromptTemplate]:
    filled_template = template.format(**kwargs)
    prompt = PromptTemplate.from_template(filled_template)
    return prompt

def evaluation(document, loader, title):
        prompt = generate_evaluation_prompt(document, title)

        llm = ChatOpenAI(temperature=0, model_name="gpt-4")
        llm_chain = LLMChain(llm=llm, prompt=prompt)

        stuff_chain = StuffDocumentsChain(
        llm_chain=llm_chain, document_variable_name="text")

        docs = loader.load()
        print(docs)
        #Almacenar el resumen en la base de datos
        return stuff_chain.run(docs)

  