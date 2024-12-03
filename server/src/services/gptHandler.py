import logging
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain

# Configuración del logging para el módulo de generación de evaluaciones
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


class GptHandler:
    def __init__(self, openai_api_key, system_prompt_base, temperature=0.8, max_tokens=150):
        self.temperature = temperature
        self.system_prompt_base = system_prompt_base
        self.max_tokens = max_tokens

        # Inicializa el modelo de OpenAI (GPT-4)
        self.llm = ChatOpenAI(
            openai_api_key=openai_api_key,
            model="gpt-3.5-turbo", #gpt-4oi
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )

        self.conversation_history = []

    def gpt_request(self, system_prompt, user_prompt):
        # Validar entradas
        if not isinstance(user_prompt, str) or not user_prompt.strip():
            logging.error("El prompt del usuario no es válido.")
            return "Por favor, proporciona un prompt válido."

        if not isinstance(system_prompt, str) or not system_prompt.strip():
            logging.error("El prompt del sistema no es válido.")
            return "Por favor, proporciona un prompt de sistema válido."

        logging.info(f"ENRANDO EN EL TRY: {type(system_prompt)} - {type(user_prompt)}")
        try:
            # Crear plantillas de mensaje
            system_message_template = SystemMessagePromptTemplate.from_template(system_prompt)
            user_message_template = HumanMessagePromptTemplate.from_template(user_prompt + "\n\nSection Evaluation:")

            # Crear el ChatPromptTemplate usando las plantillas
            chat_prompt = ChatPromptTemplate.from_messages([system_message_template, user_message_template])

            # Crear y ejecutar la cadena LLM
            chain = LLMChain(llm=self.llm, prompt=chat_prompt)
            response = chain.run({})

            # Registrar el historial
            self.conversation_history.append({"user": user_prompt, "response": response})
            return response

        except Exception as e:
            logging.error(f"Error al realizar la solicitud a GPT-4: {e}")
            return "Ocurrió un error al procesar tu solicitud."

    # Función para obtener el historial de la conversación
    def get_conversation_history(self):
        return self.conversation_history

    # Función para ajustar la temperatura
    def set_temperature(self, new_temperature):
        self.temperature = new_temperature
        self.llm.temperature = new_temperature
        logging.info(f"Temperatura ajustada a: {new_temperature}")
