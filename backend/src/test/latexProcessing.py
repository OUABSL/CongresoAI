from app import mongo, base, app, request
import re
import PyPDF2
from models.tabajo import TrabajoCientifico
import datetime


db = base.trabajos
content_extracted = ''


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
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


