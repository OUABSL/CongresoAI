from langchain_community.vectorstores import FAISS
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModel
from typing import List, Dict
from langchain.text_splitter import CharacterTextSplitter


# Carga el modelo LLaMA2-13B-Psyfighter2-GGUF
model_name = "KoboldAI/llama-13B-psyfighter2-gguf"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)


def create_chunks(section, chunk_size=300) -> List[str]:
        """
    Crea "chunks" (fragmentos) de información a partir del conjunto de datos proporcionado.
        """
        text_splitter = text_chunks = CharacterTextSplitter.from_tiktoken_encoder(
            chunk_size, chunk_overlap=20)
        text_chunks = text_splitter.split_text(section)

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

        # Define la función para dividir el texto en chunks
        def chunk_text(text, chunk_size):
            chunks = []
            for i in range(0, len(text), chunk_size):
                chunks.append(text[i:i+chunk_size])
            return chunks

        """
        return text_chunks

# Define la función para generar embeddings de los chunks
def generate_embeddings(chunks):
    embeddings = []
    for chunk in chunks:
        input_ids = tokenizer.encode(chunk, return_tensors="pt")
        with torch.no_grad():
            model_output = model(input_ids)
        embeddings.append(model_output[0][0].numpy())
    return np.array(embeddings)

def process_sections(self, sections: Dict[str, str]):
    for section_name, section in sections.items():
        chunks = create_chunks(section, 400)
    print(chunks)
    return chunks

# Define el texto de ejemplo y el tamaño del chunk
text = "Este es un texto de ejemplo que se utilizará para demostrar cómo funciona el código."
chunk_size = 10

# Divide el texto en chunks
chunks = create_chunks(text, chunk_size)

# Genera embeddings de los chunks
embeddings = generate_embeddings(chunks)



# Realiza una consulta para cada uno de los chunks
for i, chunk in enumerate(chunks):
    query = chunk
    query_embedding = generate_embeddings([query])[0]
    print(f"Chunk {i+1}: {chunk}")
