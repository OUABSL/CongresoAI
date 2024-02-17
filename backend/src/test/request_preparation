import os
import sys
from typing import Dict, List
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.embeddings import LlamaCppEmbeddings
from langchain_community.vectorstores import FAISS
sys.path[0] = os.getcwd()
from app import mongo

class VectorStoreCreator:
    DB_PATH = "./db"

    def __init__(self):
        self.text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
            chunk_size=400, chunk_overlap=20)

    def _create_chunks(self, section_name, section) -> List[str]:
        """
    Crea "chunks" (fragmentos) de información a partir del conjunto de datos proporcionado.
        """
        text_chunks = self.text_splitter.split_text(section)
        print(text_chunks)

    # agregar metadatos a los fragmentos para facilitar la recuperación.
        #Esto incluye extraer información como el título, la descripción, el contenido del cuerpo y
        #la URL de cada fragmento y agregarla al contenido del fragmento mismo.
        """for i, chunk in enumerate(text_chunks):
            title = section_name
            content = chunk
            #print(f"longitud es: {len(text_chunks)} numero de chunk es {i}\n {chunk}")
            updated_chunk = {section_name: (i+1,content)}
            text_chunks[i] = updated_chunk            #chunk.content = final_content
        print(text_chunks)
        """
        return text_chunks
        
    def create_or_get_vector_store(self, chunks: List[str]) -> FAISS:
        if not os.path.exists(self.DB_PATH):
            vectorstore = FAISS.from_documents(chunks, self.embeddings)
            vectorstore.save_local(self.DB_PATH)
        else:
            vectorstore = FAISS.load_local(self.DB_PATH, self.embeddings)
        return vectorstore

    def process_sections(self, sections: Dict[str, str]):
        for section_name, section in sections.items():
            chunks = self._create_chunks(section_name, section)
            self.create_or_get_vector_store(chunks)

if __name__ == "__main__":
    article = mongo.db.articles.find_one({"user": "beta user"})
    sections = dict(article["content"])
    vector_store_creator = VectorStoreCreator()
    vector_store_creator.process_sections(sections)