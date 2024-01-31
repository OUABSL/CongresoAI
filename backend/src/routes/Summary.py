from app import base
from langchain import ChatOpenAI, LLMChain, StuffDocumentsChain, PromptTemplate
from typing import Type


class DocumentSummarizer:
    def __init__(self, pdf_loader):
        self.pdf_loader = pdf_loader
        
    def insert_db(self, data):
        db = base.trabajos
        result = db.insert_one(data)
        return str(result.inserted_id)

    def load_document(self):
        return self.pdf_loader.load_and_split()

    def generate_summary_prompt(self, pdf_content: str, title: str) -> Type[PromptTemplate]:
        template = """
        Write a concise summary of the given text in Spanish, generating a markdown file with bullet points for the main ideas. The text is:
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
# summarizer = DocumentSummarizer(PyPDFLoader(pdf_path))
# summarizer.insert_db(data)
# document = summarizer.load_document()
# summarizer.generate_summary(document, "Document Title")