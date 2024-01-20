from app import mongo, base
import re
import PyPDF2
from models.trabajo import TrabajoCientifico
import datetime



@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        # Leer el contenido del PDF cargado
        pdf_file = request.files["pdf_file"]
        title = request.form["title"]
        current_datetime = datetime.datetime.now()

        # Format the date and time as a string
        formatted_datetime = current_datetime.strftime("%Y-%m-%d %H:%M:%S")
        # Crear un objeto TrabajoCientifico
        trabajo = TrabajoCientifico(
            userId=user_id,  # replace this with the actual user id
            titulo=title,
            contenido=text,
            fecha_entrega= formatted_datetime,
            area_conocimiento='Some Knowledge Area'  
        )
        # Almacenar el objeto en la base de datos
        mongo.db.trabajos.insert_one(trabajo.to_bson())

        # Save the uploaded file to a temporary directory
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            pdf_file.save(tmp.name)
            pdf_path = tmp.name

        #loader = PyPDFLoader("./tests/prueba.py")
        loader = PyPDFLoader(pdf_path)
        document = loader.load_and_split()


        # Obtener la respuesta completa de OpenAI
        result = summary(document, loader, title)

        return render_template("index.html", result=result)
    
    return render_template("index.html")


def extract_text_from_pdf(pdf_path):
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfFileReader(file)
        text = ""
        for page_num in range(pdf_reader.numPages):
            page = pdf_reader.getPage(page_num)
            text += page.extract_text()
    return text



def extract_math_formulas(text, formulas_dict):
    # Count the number of occurrences of the math formula pattern in the input text
    pattern = r'\$[^\$]*\$'
    formulas = re.findall(pattern, text)
    count = len(formulas)

    # Replace each occurrence of the math formula pattern with the corresponding value
    for i in range(1, count + 1):
        pattern = r'\$[^\$]*\$(?!\s*\()'
        match = re.search(pattern, text)
        if match:
            formula = match.group(0)
            value = formulas_dict.get(formula, formula)
            text = text.replace(formula, value)

    return text
pdf_path = "tu_archivo.pdf"
pdf_text = extract_text_from_pdf(pdf_path)
math_formulas = extract_math_formulas(pdf_text)

# Imprimir las fórmulas extraídas
for i, formula in enumerate(math_formulas):
    print(f"Fórmula {i + 1}:\n{formula}\n")
