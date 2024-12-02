import logging
from langchain_openai import OpenAI  # Updated import
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain

# Configuración del logging para el módulo de generación de evaluaciones
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class GptHandler:
    def __init__(self, openai_api_key, system_prompt_base, temperature=0.8, max_tokens=150):
        self.temperature = temperature
        self.system_prompt_base = system_prompt_base
        self.max_tokens = max_tokens
        
        # Inicializa el modelo de OpenAI (GPT-4)
        self.llm = OpenAI(
            openai_api_key=openai_api_key,
            model="gpt-4o",
            temperature=self.temperature,
            max_tokens=self.max_tokens
        )
        self.conversation_history = []

    # Función para hacer una solicitud a GPT-4 usando Langchain
    def gpt_request(self, system_prompt, user_prompt):
        print(f"Entramos a gpt_request - GPTHANDLER")

        # Validación de entrada
        if not isinstance(user_prompt, str) or not user_prompt.strip():
            logging.error("El prompt del usuario no es válido.")
            return "Por favor, proporciona un prompt válido."

        # Crea un prompt para el modelo
        prompt = ChatPromptTemplate.from_messages([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt + "\n\n Section Evaluation:"}
        ])

        # Crea una cadena de LLM
        chain = LLMChain(llm=self.llm, prompt=prompt)

        try:
            # Ejecuta la cadena y obtiene la respuesta
            response = chain.run()
            self.conversation_history.append({"user": user_prompt, "response": response})
            logging.info(response)
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