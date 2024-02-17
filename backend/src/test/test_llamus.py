import os
import json
import streamlit as st
import requests
import os, sys
sys.path[0] = os.getcwd()
from config import LLAMUS_KEY
from chromadb import Client
from chromadb.utils import embedding_functions
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import FAISS
# from langchain.chains import ConversationalRetrievalChain
# from langchain.memory import ConversationBufferMemory
# from langchain.embeddings.huggingface import HuggingFaceEmbeddings

API_URL = "https://llamus.cs.us.es/api/chat"
SYSTEM_PROMPT = ("""Play the role of a LaTeX expert. You will receive LaTeX sections in LaTeX code format.
        The submit section name is from an article titled '{title}'.
        Your task is to perform the following functions on each received LaTeX section: 
        Keep only the text appearing in the section: remove LaTeX commands and LaTeX grammar.
        When detecting code for inserting a figure, do not make any changes to the text of the section.
        When detecting a citation to a reference, do not remove it.

                 """
)
        

def llamus_request(system_prompt, user_prompt):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {LLAMUS_KEY}'
    }
    data = {
        'model': 'TheBloke.falcon-180b-chat.Q4_K_M.gguf',
        'messages': [{'role': 'assistant', 'content': user_prompt}],
        'prompt': system_prompt,
        'temperature': 0.4,
        'trimWhitespaceSuffix': False
    }
    response = requests.post(API_URL, headers=headers, data=json.dumps(data))
    return response.json()


def create_vector_store(chunks: list):  # Might remove or modify further

    chroma_client = Client(host='localhost', port=8000)

    embedding = SentenceTransformerEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )

    if not os.path.exists("./db"):
        print("CREATING DB")
        vectorstore = FAISS.from_documents(chunks, embedding)
        vectorstore.save_local("./db")
    else:
        print("LOADING DB")
        vectorstore = FAISS.load_local("./db", embedding)

    return vectorstore


def get_conversation_chain(system_message, human_message):  # Might remove or modify further
    vector_store = create_vector_store([])
    llm = llamus_request(system_prompt=system_message, user_prompt=human_message)

    # Below code is commented for the time being.
    # conversation_chain = ConversationalRetrievalChain.from_llm(llm=llm, retriever=vector_store.as_retriever())

    return True


def setup_page():
    st.set_page_config(
        page_title="Documentation Chatbot",
        page_icon=":books:",
    )
    st.title("Documentation Chatbot")
    st.subheader("Chat with LangChain's documentation!")
    st.image("https://images.unsplash.com/photo-1485827404703-89b55fcc595e")


def main():
    setup_page()
    user_question = st.text_input("Ask your question")

    if user_question:
        chat = get_conversation_chain(SYSTEM_PROMPT, user_question)
        st.write(chat.response)

if __name__ == "__main__":
    main()