import os
from pathlib import Path
import tempfile
import logging
from pylatex import Document, Section, Subsection, Command, NoEscape
from pylatex.utils import bold
from src.models.manuscript import ScientificArticle

# Configurar el logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

class ReportGenerator:
    def __init__(self, scientific_article: ScientificArticle, dest_path: str = None):
        """
        Inicializa el generador de reportes.

        Args:
            scientific_article: Instancia de ScientificArticle con los datos del manuscrito.
            dest_path: Ruta destino para guardar los archivos generados. Si no se especifica, se utiliza una carpeta temporal.
        """
        self.scientific_article = scientific_article
        self.dest_path = Path(dest_path) if dest_path else Path(tempfile.mkdtemp(dir="./data"))

    def generate_report(self):
        try:
            doc = self.create_latex_document()
            pdf_path = self.compile_latex_to_pdf(doc)
            self.save_pdf_to_db(pdf_path)
            return pdf_path
        except Exception as e:
            logging.error(f"Failed to generate report: {e}")
            raise
        finally:
            self.clean_up()

    def create_latex_document(self):
        doc = Document()
        # Agregar el paquete geometry con el margen superior ajustado
        doc.preamble.append(NoEscape(r'\usepackage[top=1in]{geometry}'))
        doc.preamble.append(NoEscape(r'\usepackage{amsmath}'))             # Paquete para matemáticas avanzadas
        doc.preamble.append(NoEscape(r'\usepackage{graphicx}'))            # Paquete para gráficos
        doc.preamble.append(NoEscape(r'\usepackage{hyperref}'))            # Paquete para enlaces
        doc.preamble.append(NoEscape(r'\usepackage[utf8]{inputenc}'))  # Paquete para codificación UTF-8
        doc.preamble.append(NoEscape(r'\usepackage{lmodern}'))         # Paquete para fuentes compatibles con Unicode

        doc.preamble.append(Command('title', f'Reporte del manuscrito - {self.scientific_article.title}'))
        doc.preamble.append(Command('author', ''))
        doc.preamble.append(Command('date', NoEscape(r'\today')))
        doc.append(NoEscape(r'\maketitle'))

        with doc.create(Section('Información del Manuscrito')):
            doc.append(bold('Autor: '))
            doc.append(self.scientific_article.author)
            doc.append(NoEscape(r'\\'))
            doc.append(bold('Revisor: '))
            doc.append(self.scientific_article.reviewer)
            doc.append(NoEscape(r'\\'))
            doc.append(bold('Resultado de la Revisión: '))
            doc.append(self.scientific_article.review_result)
            doc.append(NoEscape(r'\\'))
            doc.append(bold('Número de Envío: '))
            doc.append(str(self.scientific_article.submit_number))
            doc.append(NoEscape(r'\\'))
            doc.append(bold('Descripción del manuscrito: '))
            doc.append(self.scientific_article.description)
            doc.append(NoEscape(r'\\'))
            doc.append(bold('Palabras Clave: '))
            doc.append(', '.join(self.scientific_article.key_words))
            doc.append(NoEscape(r'\\'))
            doc.append(bold('Fecha de Envío: '))
            doc.append(self.scientific_article.submission_date.strftime('%Y-%m-%d'))
            doc.append(NoEscape(r'\\'))
            doc.append(bold('Generación del resúmen: '))
            doc.append(self.scientific_article.aimodel["summary"])
            doc.append(NoEscape(r'\\'))
            doc.append(bold('Generación de la evaluación: '))
            doc.append(self.scientific_article.aimodel["evaluation"])

        for section in self.scientific_article.sections_orden:
            with doc.create(Section(section)):
                with doc.create(Subsection('Resumen')):
                    doc.append(self.scientific_article.summary.get(section, ''))
                with doc.create(Subsection('Evaluación Inicial')):
                    doc.append(self.scientific_article.evaluation.get(section, ''))
                if self.scientific_article.review_result != "Pending Review" and self.scientific_article.review.get(section):
                    with doc.create(Subsection('Revisión')):
                        for key, value in self.scientific_article.review[section].items():
                            doc.append(bold(f'{key}: '))
                            doc.append(value)
                            doc.append(NoEscape(r'\\'))

        return doc

    def compile_latex_to_pdf(self, doc):
        try:
            sanitized_title = self.scientific_article.title.replace(' ', '_')
            # Asegúrate de que pdf_path tenga la extensión .pdf al generar el nombre
            files_path = os.path.join(self.dest_path, f'report_{sanitized_title}')
            pdf_path = f"{files_path}.pdf"
            tex_path = f"{files_path}.tex"
            logging.info(f"Generating PDF at: {pdf_path}")
            logging.info(f"The Latex file's name: {tex_path}")

            doc.generate_pdf(files_path, clean_tex=False)

            # Verificar si se generó el archivo .tex
            if not os.path.exists(tex_path):
                logging.error(f"LaTeX file not found: {tex_path}")
                raise FileNotFoundError(f"LaTeX file not found: {tex_path}")

            # Verificar si se generó el archivo .pdf
            if not os.path.exists(pdf_path):
                logging.error(f"PDF file not found: {pdf_path}")
                raise FileNotFoundError(f"PDF file not found: {pdf_path}")

            logging.info(f"PDF successfully generated at: {pdf_path}")
            return pdf_path
        except Exception as e:
            logging.error(f"Failed to compile LaTeX to PDF: {e}")
            raise

    def save_pdf_to_db(self, pdf_path):
        try:
            with open(pdf_path, 'rb') as f:
                pdf_content = f.read()

            # Use the save_files method of ScientificArticle to save the PDF
            self.scientific_article.save_files(report_pdf=pdf_content)

        except Exception as e:
            logging.error(f"Failed to save PDF to database: {e}")
            raise

    def clean_up(self):
        """
        Limpia los archivos y directorios temporales creados.
        """
        if os.path.isdir(self.dest_path):
            try:
                for file in os.listdir(self.dest_path):
                    file_path = os.path.join(self.dest_path, file)
                    os.remove(file_path)
                os.rmdir(self.dest_path)
                logging.info(f"Temporary directory {self.dest_path} cleaned up.")
            except Exception as e:
                logging.warning(f"Failed to clean up temporary directory: {e}")
