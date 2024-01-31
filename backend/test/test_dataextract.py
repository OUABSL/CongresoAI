import re
import fitz  # PyMuPDF
from sympy import sympify

def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page_num in range(doc.page_count):
        page = doc[page_num]
        text += page.get_text()
    return text

def extract_and_correct_math_formulas(text):
    # Definir el patrón de las fórmulas matemáticas en el formato \( ... \) o \[ ... \]
    pattern = r'(?<!\\)\$(.*?)(?<!\\)\$|\\\((.*?)\\\)|\\\[(.*?)\\\]'

    # Encontrar todas las coincidencias en el texto
    formulas = re.findall(pattern, text)
    print("lfi" , formulas)
    # Iterar sobre las fórmulas y corregirlas
    for i, (parentheses, brackets) in enumerate(formulas):
        formula = parentheses or brackets

        try:
            # Intentar evaluar la fórmula con sympy
            corrected_formula = sympify(formula, evaluate=False)
        except Exception as e:
            # Capturar excepciones si la fórmula es inválida
            corrected_formula = f'Error en la fórmula {i + 1}: {e}'

        # Reemplazar la fórmula original con la corregida
        text = text.replace(formula, str(corrected_formula))

    return text

# Ruta del PDF
pdf_path = r"C:\Users\Ouael\OneDrive\Desktop\TI4\TFG\CongresoAI_V2\backend\test\prueba.pdf"

# Extraer texto del PDF
pdf_text = extract_text_from_pdf(pdf_path)

# Extraer y corregir fórmulas matemáticas
corrected_text = extract_and_correct_math_formulas(pdf_text)

# Imprimir el texto corregido
print(corrected_text)
