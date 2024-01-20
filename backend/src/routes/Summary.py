import sys
sys.path.append('.')
from app import app, base

db = base.trabajos
result = db.insert_one(data)
inserted_id = str(result.inserted_id)
#loader = PyPDFLoader("./tests/prueba.py")
loader = PyPDFLoader(pdf_path)

document = loader.load_and_split()


# Obtener la respuesta completa de OpenAI
result = summary(document, loader, title)




def generate_summary_prompt(pdf_content, title):
    prompt_template = """Write a concise summary of the given text in Spanish, generating a markdown file with bullet points for the main ideas, the text:
    "{text}"
    CONCISE SUMMARY:"""
    prompt = PromptTemplate.from_template(prompt_template)
    return prompt

def summary(document, loader, title):
        prompt = generate_summary_prompt(document, title)

        llm = ChatOpenAI(temperature=0, model_name="gpt-4")
        llm_chain = LLMChain(llm=llm, prompt=prompt)

        stuff_chain = StuffDocumentsChain(
        llm_chain=llm_chain, document_variable_name="text")

        docs = loader.load()
        print(docs)
        #Almacenar el resumen en la base de datos
        return stuff_chain.run(docs)