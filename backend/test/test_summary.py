import os
from langchain.chains import LLMChain
from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from langchain.prompts import PromptTemplate
from typing import Type
from langchain_community.chat_models import ChatOpenAI
from langchain_community.document_loaders import PyPDFLoader

class DocumentSummarizer:
    def __init__(self):
        self.pdf_loader = PyPDFLoader(os.path.join('.', 'prueba.pdf'))

    def load_document(self):
        return self.pdf_loader.load_and_split()

    def generate_summary_prompt(self, pdf_content: str, title: str) -> Type[PromptTemplate]:
        template = """
        Write a concise summary of the given cientific article in Spanish, generating a markdown file with bullet points for the main ideas. The text is:
        "{pdf_content}"

        CONCISE SUMMARY:"""
        return PromptTemplate.from_template(template.format(pdf_content=pdf_content, title=title))

    def generate_summary(self, document: str, title: str):
        prompt = self.generate_summary_prompt(document, title)

        llm = ChatOpenAI(temperature=0.1)
        llm_chain = LLMChain(llm=llm, prompt=prompt)

        stuff_chain = StuffDocumentsChain(llm_chain=llm_chain, document_variable_name="text")

        return stuff_chain.run(self.pdf_loader.load())

# Example usage:
pdf_path = "prueba.pdf"
summarizer = DocumentSummarizer()
document = summarizer.load_document()
summarizer.generate_summary(document, "Document Title")
