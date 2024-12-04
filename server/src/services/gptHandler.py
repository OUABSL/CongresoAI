from langchain.chat_models import ChatOpenAI
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.chains import LLMChain
from tiktoken import get_encoding  # Para manejar conteo de tokens directamente

import logging

# Configuración del logging para el módulo de generación de evaluaciones
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


class GptHandler:
    def __init__(self, openai_api_key, system_prompt_base, temperature=0.8, max_tokens=4096, model="gpt-3.5-turbo"):
        self.temperature = temperature
        self.system_prompt_base = system_prompt_base
        self.max_tokens = max_tokens
        self.model = model

        # Inicializa el modelo de OpenAI
        self.llm = ChatOpenAI(
            openai_api_key=openai_api_key,
            model=self.model,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )

        # Inicializa el tokenizador para el modelo
        self.tokenizer = get_encoding("cl100k_base")  # Utiliza el tokenizador adecuado para GPT-3.5/GPT-4

        self.conversation_history = []

    def _count_tokens(self, content):
        """
        Calcula el número de tokens en el contenido utilizando el tokenizador.
        """
        return len(self.tokenizer.encode(content))

    def _chunk_content(self, content, max_tokens):
        """
        Divide el contenido en fragmentos asegurando que cada uno no exceda el límite de tokens.
        """
        words = content.split()
        chunks = []
        current_chunk = []

        for word in words:
            current_chunk.append(word)
            if self._count_tokens(" ".join(current_chunk)) > max_tokens:
                chunks.append(" ".join(current_chunk[:-1]))
                current_chunk = [word]

        # Agregar el último fragmento si queda algo
        if current_chunk:
            chunks.append(" ".join(current_chunk))

        return chunks


    def gpt_request(self, system_prompt, user_prompt):
        
        max_context_length = 16385  # Máximo permitido por GPT-3-turbo
        
        # Validar entradas
        if not isinstance(user_prompt, str) or not user_prompt.strip():
            logging.error("El prompt del usuario no es válido.")
            return "Por favor, proporciona un prompt válido."

        if not isinstance(system_prompt, str) or not system_prompt.strip():
            logging.error("El prompt del sistema no es válido.")
            return "Por favor, proporciona un prompt de sistema válido."

        logging.info(f"ENRANDO EN EL TRY: {type(system_prompt)} - {type(user_prompt)}")

        try:
            # Calcular tokens del prompt y verificar si requiere fragmentación
            total_prompt = f"{system_prompt}\n\n{user_prompt}"
            num_tokens = self._count_tokens(total_prompt)
            max_safe_tokens = max_context_length - self.max_tokens
            logging.info(f"Tokens calculados: {num_tokens}, Límite seguro: {max_safe_tokens}")

            if num_tokens > max_safe_tokens:
                logging.info("El contenido es demasiado largo. Realizando fragmentación...")
                chunk_size = max_safe_tokens - 1000  # Deja un margen para el prompt del sistema
                chunks = self._chunk_content(user_prompt, chunk_size)

                results = []
                for i, chunk in enumerate(chunks):
                    logging.info(f"Procesando fragmento {i + 1}/{len(chunks)}")
                    response = self._process_single_request(system_prompt, chunk)
                    results.append(response)

                # Generar un resumen de los fragmentos
                combined_summary = " ".join(results)
                logging.info("Generando resumen combinado de fragmentos.")
                final_response = self._process_single_request(system_prompt, combined_summary)
                return final_response


            else:
                # Procesar directamente si el contenido no requiere fragmentación
                return self._process_single_request(system_prompt, user_prompt)

        except Exception as e:
            logging.error(f"Error al realizar la solicitud a GPT-4: {e}")
            return "Ocurrió un error al procesar tu solicitud."

    def _process_single_request(self, system_prompt, content):
        """
        Procesa una única solicitud a OpenAI, garantizando que el contenido sea un string.
        """
        try:
            # Forzar que el contenido sea un string
            content = str(content)

            # Crear plantillas de mensaje
            system_message_template = SystemMessagePromptTemplate.from_template(system_prompt)
            user_message_template = HumanMessagePromptTemplate.from_template(content)

            # Crear el ChatPromptTemplate usando las plantillas
            chat_prompt = ChatPromptTemplate.from_messages([system_message_template, user_message_template])

            # Crear y ejecutar la cadena LLM
            chain = LLMChain(llm=self.llm, prompt=chat_prompt)
            response = chain.run({})
            return response

        except Exception as e:
            logging.error(f"Error en la solicitud individual a GPT: {e}")
            return "Error al procesar el fragmento."

    # Función para obtener el historial de la conversación
    def get_conversation_history(self):
        return self.conversation_history

    # Función para ajustar la temperatura
    def set_temperature(self, new_temperature):
        self.temperature = new_temperature
        self.llm.temperature = new_temperature
        logging.info(f"Temperatura ajustada a: {new_temperature}")
