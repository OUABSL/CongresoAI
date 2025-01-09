import re
from langchain_openai import ChatOpenAI
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.chains import LLMChain

from tiktoken import get_encoding  # Para manejar conteo de tokens directamente
from langchain.text_splitter import RecursiveCharacterTextSplitter

from pydantic import BaseModel

import logging

# Configuración del logging para el módulo de generación de evaluaciones
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Diccionario con las propiedades de los modelos
MODEL_PROPERTIES = {
    "gpt-3.5-turbo": {
        "max_tokens": 4096
    },
    "gpt-4o": {
        "max_tokens": 4096
    },
    "gpt-4o-mini": {
        "max_tokens": 16384
    },
    "gpt-4-turbo": {
        "max_tokens": 4096
    },
    "gpt-4-turbo": {
        "max_tokens": 4096
    },
    "gpt-4" : {
        "max_tokens": 8192
    }
}

class GptHandler:
    def __init__(self, openai_api_key, system_prompt_base, temperature=0.8, model="gpt-3.5-turbo"):
        self.temperature = temperature
        self.system_prompt_base = system_prompt_base
        self.model = model


        logging.info(f"Generación: {self.model} - {self.temperature}")
        # Ajustar max_tokens según el modelo
        if model in MODEL_PROPERTIES:
            self.max_tokens = MODEL_PROPERTIES[model]["max_tokens"]
        else:
            self.max_tokens = 4096
        
        # Inicializa el modelo de OpenAI
        self.llm = ChatOpenAI(
            openai_api_key=openai_api_key,
            model=self.model,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )

        # Inicializa el tokenizador
        self.tokenizer = get_encoding("cl100k_base")  # Utiliza el tokenizador adecuado para GPT-3.5/GPT-4

        self.conversation_history = []

    def _count_tokens(self, content):
        """
        Calcula el número de tokens en el contenido utilizando el tokenizador.
        """
        return len(self.tokenizer.encode(content))


    def _chunk_content_smart_with_langchain(self, content, max_tokens):
        """
        Usa LangChain para dividir el contenido en fragmentos inteligentes,
        manejando específicamente las fórmulas matemáticas.
        """
        # Detectar secciones con fórmulas matemáticas
        math_pattern = r'[A-Za-z0-9_]+[\^_{}⟶⇝·∈]+'  # Patrón para identificar fórmulas
        math_sections = re.findall(math_pattern, content)
        
        if math_sections:
            logging.info("Se detectaron fórmulas matemáticas. Procesando con cuidado...")

        # Proseguir con el chunking inteligente
        avg_token_length = 4
        chunk_size_characters = max_tokens * avg_token_length

        text_splitter = RecursiveCharacterTextSplitter(
            separators=["\n\n", "\n", ". ", " "],
            chunk_size=chunk_size_characters,
            chunk_overlap=avg_token_length * 50,
            length_function=lambda text: self._count_tokens(text),
        )

        chunks = text_splitter.split_text(content)
        refined_chunks = []

        for chunk in chunks:
            if self._count_tokens(chunk) > max_tokens:
                refined_chunks.extend(self._split_large_chunk(chunk, max_tokens))
            else:
                refined_chunks.append(chunk)

        return refined_chunks

    def _split_large_chunk(self, content, max_tokens):
        """
        Divide un fragmento largo en frases más pequeñas.
        """
        import re
        sentences = re.split(r'(?<=[.!?]) +', content)  # Divide por frases completas
        chunks = []
        current_chunk = []

        for sentence in sentences:
            current_chunk.append(sentence)
            if self._count_tokens(" ".join(current_chunk)) > max_tokens:
                chunks.append(" ".join(current_chunk[:-1]))
                current_chunk = [sentence]

        # Agregar el último fragmento si queda algo
        if current_chunk:
            chunks.append(" ".join(current_chunk))

        return chunks

    def gpt_request(self, system_prompt, user_prompt, max_context_length=16385):
        max_safe_tokens = max_context_length - self.max_tokens

        try:
            # Validar entradas
            if not isinstance(user_prompt, str) or not user_prompt.strip():
                logging.error("El prompt del usuario no es válido.")
                return "Por favor, proporciona un prompt válido."

            if not isinstance(system_prompt, str) or not system_prompt.strip():
                logging.error("El prompt del sistema no es válido.")
                return "Por favor, proporciona un prompt de sistema válido."

            logging.info(f"Tokens calculados: {self._count_tokens(user_prompt)}, Límite seguro: {max_safe_tokens}")

            # Si el contenido excede el límite, dividirlo
            if self._count_tokens(user_prompt) > max_safe_tokens:
                logging.info("Fragmentación necesaria. Dividiendo contenido...")
                chunks = self._chunk_content_smart_with_langchain(user_prompt, max_safe_tokens)

                # Procesar fragmentos y combinar respuestas
                results = []
                for i, chunk in enumerate(chunks):
                    logging.info(f"Procesando fragmento {i + 1}/{len(chunks)}")
                    response = self._process_single_request(system_prompt, chunk)
                    results.append(response)

                # Generar un resumen final
                combined_summary = " ".join(results)
                logging.info("Generando resumen combinado de los fragmentos.")
                final_response = self._process_single_request(system_prompt, combined_summary)
                return final_response

            # Si no se excede el límite, procesar directamente
            else:
                return self._process_single_request(system_prompt, user_prompt)

        except Exception as e:
            logging.error(f"Error al realizar la solicitud a GPT-4: {e}")
            return "Ocurrió un error al procesar tu solicitud."

    def _process_single_request(self, system_prompt, content):
        """
        Procesa una única solicitud a OpenAI, garantizando que el contenido sea válido.
        """
        try:
            # Asegurarse de que el contenido es una cadena de texto
            content = str(content)

            # Crear plantillas de mensaje, asegurándose de que los valores sean válidos
            if not system_prompt.strip() or not content.strip():
                logging.error("El prompt del sistema o del usuario está vacío.")
                return "Por favor, proporciona un prompt válido."

            system_message_template = SystemMessagePromptTemplate.from_template(system_prompt)
            #user_message_template = HumanMessagePromptTemplate.from_template(content)

            # Crear el ChatPromptTemplate usando las plantillas
            #chat_prompt = ChatPromptTemplate.from_messages([system_message_template, user_message_template])
            chat_prompt = ChatPromptTemplate.from_messages([
                system_message_template,
                HumanMessage(content)
            ])

            logging.info(f"El contenido del chatPrompt: \n\n {chat_prompt}\n\n-----------------------------------------------------")

            # Crear y ejecutar la cadena utilizando LLMChain
            chain = LLMChain(prompt=chat_prompt, llm=self.llm)
            response = chain.run({})
            return response

        except Exception as e:
            logging.error(f"Error en la solicitud individual a GPT: {e}")
            return "Error al procesar el fragmento."