# Import required libraries
from pathlib import Path
from pylatexenc.latex2text import LatexNodes2Text
import zipfile
import re, io, os, sys 
from src.app import mongo
from src.models.manuscript import ScientificArticle
from bson.objectid import ObjectId
import logging

# Configurar el logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

"""Esta clase lleva a cabo las tareas de extracción, procesamiento y almacenamiento de datos de manuscritos entregados.""" 
class DataHandler:
    
    """
    Constructor de la clase.
    Entrada: 
        article (ScientificArticle) - Artículo científico a trabajar.
        dest_path (str) - Ruta de destino donde se guardarán los archivos.
    """
    def __init__(self, article: ScientificArticle, dest_path: str):
        self.article = article
        self.db = mongo.db.articulo
        self.dest_path = Path(dest_path)

    """
        Extraer archivos del ZIP proporcionado al directorio de destino.
        Entrada: 
          dest_path (Path) - Ruta donde se extraerán los archivos.
    """
    def _perform_extraction(self, dest_path: Path):
        """Extract files from the provided source ZIP to the destination folder"""
        with zipfile.ZipFile(io.BytesIO(self.article.get_latex_project()), 'r') as file:
            file.extractall(dest_path)
    
    """
        Limpia las etiquetas de ajuste de ancho en el texto LaTeX.
        Entrada: 
          latex_text (str) - Texto LaTeX para limpiar.
        Salida:
          latex_text (str) - Texto LaTeX limpio.
    """
    def _clean_adjustwidth_tag(self, latex_text):
        latex_text = re.sub(r'\\begin{adjustwidth}(\[.*?\])?{.*?}', '', latex_text)
        latex_text = re.sub(r'\\end{adjustwidth}', '', latex_text)
        return latex_text

    """
        Leer y devolver el contenido del archivo proporcionado.
        Entrada: 
          file_path (Path) - Ruta del archivo a leer.
        Salida: 
          latex_text (str) - Texto contenido en el archivo.
    """
    def _read_file_data(self, file_path: Path):
        """Read and return the contents of the provided file."""
        with open(file_path, 'r', encoding='utf-8') as file:
            latex_text = file.read()
            return self._clean_adjustwidth_tag(latex_text)
        
    """
        Devuelve el nombre del primer archivo .tex en el directorio de destino.
        Salida: 
          tex_file (str) - Nombre del archivo .tex en el directorio de destino.
    """
    def _get_tex(self):
        tex_file = ''
        for archivo in os.listdir(self.dest_path):
            if re.search(r'\.tex$', archivo):
                tex_file = archivo
        return tex_file

    """
        Devuelve el nombre del primer archivo .pdf en el directorio de destino.
        Salida: 
          pdf_file (str) - Nombre del archivo .pdf en el directorio de destino.
    """
    def _get_pdf(self):
        pdf_file = ''
        for archivo in os.listdir(self.dest_path):
            if re.search(r'\.pdf$', archivo):
                pdf_file = archivo
        return pdf_file

    """
        Extrae y devuelve el contenido del documento del texto LaTeX.
        Entrada: 
          data (str) - Texto LaTeX del documento a parsear.
        Salida: 
          data[begin_pos:end_pos] (str) - Contenido del documento en formato LaTeX.
    """
    @staticmethod
    def _parse_document_content(data):
        begin_pos = data.find(r'\begin{document}') + len(r'\begin{document}')
        end_pos = data.find(r'\end{document}')
        return data[begin_pos:end_pos] if begin_pos != -1 and end_pos != -1 else None
    
    """
         Elimina líneas comentadas del contenido.
         Entrada: 
          content (str) - Contenido con líneas que podrían empezar por "%".
         Salida: 
          (str) - Contenido sin las líneas que comienzan por "%".
    """
    @staticmethod
    def _remove_commented_lines(content):
         return "\n".join([line for line in content.split("\n") if not line.strip().startswith("%")])

    """
        Extrae información de secciones del contenido del documento LaTeX.
        Entrada: 
          document_content (str) - Contenido del documento LaTeX.
        Salida: 
          (tuple) - Tupla que contiene un diccionario con los nombres de las secciones como claves y su contenido como valor, y una lista con los nombres de las secciones en orden.
    """
    @staticmethod
    def _get_section_data(document_content):
        section_matcher = re.compile(r'\\section\*?\{([^}]*)\}')
        sections = section_matcher.findall(document_content)
        positions = [m.start() for m in section_matcher.finditer(document_content)]
        positions.append(len(document_content))  # end position of the last section
        section_contents = {}
        sections_orden = [section_name for section_name in sections if section_name != "Acknowledgements"]
        for idx, section_name in enumerate(sections):
            if section_name != "Acknowledgements":
                if idx + 1 >= len(positions):
                    logging.error(f"Index out of range: idx={idx}, positions={positions}")
                    continue
                section_content = document_content[positions[idx]:positions[idx + 1]].strip()
                section_contents[section_name] = section_content
        
        return section_contents, sections_orden

    """
        Extrae únicamente el texto de la sección del contenido proporcionada.
        Usa la bibleotica pylatexenc para realizar la tarea de limpieza de latex.
        Entrada: 
          section_content (str) - Contenido de la sección a procesar.
        Salida: 
          res (str) - Texto extraído de la sección.
    """  
    def _extract_just_text(self, section_content):
        try:
            res = LatexNodes2Text().latex_to_text(section_content)
        except IndexError as e:
            logging.error(f"Failed to process section content: {section_content}")
            raise 

        return res

    """
        Guarda el diccionario de secciones proporcionado como archivos individuales en la ubicación de destino.
        Entrada: 
          sections (dict) - Diccionario con nombres de las secciones y su contenido.
          destination (Path) - Ruta de destino donde se guardarán las secciones.
    """
    @staticmethod
    def _save_sections(sections: dict, destination: Path, esResFinal = False):
        destination.mkdir(parents=True, exist_ok=True)
        for idx, (section_name, section_content) in enumerate(sections.items(), start=1):
            content_buffer = f"\n\n{section_content}\n---------------------------fin chunk----------------\n" if esResFinal else section_content
            (destination / f"section_{idx}_{section_name.replace('/', '_')}.txt").write_text(content_buffer, encoding='utf-8')
    

    """
    Método principal que maneja la ejecución de las tareas de la clase.
    Ordena la extracción de archivos, la obtención de archivos pdf y .tex, 
    guarda el PDF, procesa el texto para extracción de secciones, y las guarda.
    Salida: 
      document_sections_processed (dict) - Diccionario con nombres de las secciones y su contenido procesado.
    """
    def run(self):
        # Extracción de los archivos latex desde zip en la ruta de destino
        self._perform_extraction(self.dest_path)
        logging.info("Extraction completed")

        # Recuperando el nombre del fichero .tex del directorio de destino
        latex_file_name = self._get_tex()
        if not latex_file_name:
            logging.error("No .tex file found in the directory")
            return

        # Generando la ruta completa del fichero .tex 
        latex_file_path = self.dest_path / latex_file_name
        # Leyendo el contenido del fichero .tex
        latex_file_text = self._read_file_data(latex_file_path)

        # Obteniendo el nombre del fichero .pdf en el directorio de destino
        pdf_file_name = self._get_pdf()
        if not pdf_file_name:
            logging.error("No .pdf file found in the directory")
            return

        # Generando la ruta completa del fichero .pdf 
        pdf_file_path = self.dest_path / pdf_file_name
        # Abriendo el archivo .pdf en modo binario y guardándolo
        with open(pdf_file_path, "rb") as pdf_file:
            self.article.save_files(submitted_pdf=pdf_file)
        logging.info("PDF file saved")

        # Procesando el texto LaTeX y extrayendo el contenido del documento
        document_content = self._parse_document_content(latex_file_text)
        if document_content is None:
            logging.error("Failed to parse document content")
            return

        # Extrayendo información de las secciones de contenido del documento
        document_sections, sections_orden = self._get_section_data(document_content)
        logging.debug(f"Document sections: {document_sections.keys()}")

        # Procesando secciones LaTeX en texto plano, Usa la bibleotica pylatexenc para realizar la tarea de limpieza de latex.
        document_sections_processed = {section: self._extract_just_text(text) for section, text in document_sections.items() if section != "Acknowledgements"}
        logging.debug(f"Processed document sections: {document_sections_processed.keys()}")

        # Inicializando la evaluación y resumen (parámetros vacíos) para el manuscrito
        evaluation_init = {key: "" for key in document_sections_processed.keys()}
        summary_init = {key: "" for key in document_sections_processed.keys()}

        # Actualizando las propiedades del manuscrito con nuevas secciones y el resumen y la evaluación vacía
        self.article.update_properties(content=document_sections_processed, sections_orden=sections_orden, 
                                    evaluation=evaluation_init, summary=summary_init)
        logging.info("Article properties updated")

        # Devolviendo las secciones procesadas del manuscrito
        return document_sections_processed
