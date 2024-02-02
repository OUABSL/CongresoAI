import sys
from ..app import app



print("sys path is: ", sys.path)

db = app.base.trabajos
content_extracted = ''


@app.route("/", methods=["GET", "POST"])
def index():
    if app.request.method == "POST":
        # Check if a file was uploaded
        if 'pdf_file' not in request.files:
            return 'No file part'

        pdf_file = request.files["pdf_file"]

        # Check if the file is a PDF
        if pdf_file.filename == '':
            return 'No selected file'

        if pdf_file and pdf_file.filename.endswith('.pdf'):
            try:
                # Read the contents of the PDF file
                pdf_data = pdf_file.read()

                # Parse the PDF file
                pdf_file_obj = PyPDF2.PdfFileReader(pdf_data)

                # Extract the text from the PDF file
                content_extracted = extract_text_from_pdf(pdf_file_obj)

            except PyPDF2.utils.PdfReadError:
                return 'Invalid PDF file'

            # Get the title and user ID from the form data
            user_id = ""  # Missing user ID
            title = request.form["title"]
            current_datetime = datetime.datetime.now()

            # Format the date and time as a string
            formatted_datetime = current_datetime.strftime("%Y-%m-%d %H:%M:%S")

            # Create a new TrabajoCientifico object
            trabajo = TrabajoCientifico(
                userId=user_id,
                titulo=title,
                contenido=content_extracted,
                fecha_entrega=formatted_datetime,
                area_conocimiento= extract_knowledge_fields
            )

            # Save the TrabajoCientifico object to the database
            db.insert_one(trabajo.to_dict())

            return 'Trabajo cientifico created successfully'

        else:
            return 'Invalid file type. Please upload a PDF file.'




def extract_knowledge_fields():
    """Obtiene los campos de conocimiento que se pueden utilizar para asignar un articulo a un revisor adecuado"""
    return None


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
