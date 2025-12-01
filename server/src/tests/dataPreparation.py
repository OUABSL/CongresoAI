import subprocess
from pathlib import Path
import zipfile
import re, io, os
from src.app import mongo
from src.models.manuscript import ScientificArticle
from bson.objectid import ObjectId
import logging

# Configurar el logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class DataHandler:

    def __init__(self, article: ScientificArticle, dest_path: str):
        self.article = article
        self.db = mongo.db.articulo
        self.dest_path = Path(dest_path)

    def _perform_extraction(self, dest_path: Path):
        """Extract files from the provided source ZIP to the destination folder"""
        try:
            with zipfile.ZipFile(io.BytesIO(self.article.get_latex_project()), 'r') as file:
                file.extractall(dest_path)
        except zipfile.BadZipFile as e:
            logging.error(f"Failed to extract ZIP file: {e}")
            raise

    def _clean_adjustwidth_tag(self, latex_text):
        latex_text = re.sub(r'\\begin{adjustwidth}(\[.*?\])?{.*?}', '', latex_text)
        latex_text = re.sub(r'\\end{adjustwidth}', '', latex_text)
        return latex_text

    def _read_file_data(self, file_path: Path):
        """Read and return the contents of the provided file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                latex_text = file.read()
                return self._clean_adjustwidth_tag(latex_text)
        except FileNotFoundError as e:
            logging.error(f"File not found: {e}")
            raise

    def _get_tex(self):
        tex_files = [archivo for archivo in os.listdir(self.dest_path) if archivo.endswith('.tex')]
        if not tex_files:
            logging.error("No .tex file found in the directory")
            return None
        return tex_files[0]  # Assuming we need the first .tex file

    def _get_pdf(self):
        """Return the name of the first .pdf file in the destination directory."""
        pdf_files = [archivo for archivo in os.listdir(self.dest_path) if archivo.endswith('.pdf')]
        return pdf_files[0] if pdf_files else ''

    @staticmethod
    def _parse_document_content(data):
        begin_pos = data.find(r'\begin{document}') + len(r'\begin{document}')
        end_pos = data.find(r'\end{document}')
        return data[begin_pos:end_pos] if begin_pos != -1 and end_pos != -1 else None

    @staticmethod
    def _get_section_data(document_content):
        """Extract and return section data from document content."""
        section_matcher = re.compile(r'\\section\*?\{([^}]*)\}')
        sections = section_matcher.findall(document_content)
        positions = [m.start() for m in section_matcher.finditer(document_content)]
        positions.append(len(document_content))
        section_contents = {}
        sections_orden = [section_name for section_name in sections if section_name != "Acknowledgements"]
        for idx, section_name in enumerate(sections):
            if section_name != "Acknowledgements":
                if idx + 1 >= len(positions):
                    continue
                section_content = document_content[positions[idx]:positions[idx + 1]].strip()
                section_contents[section_name] = section_content
        return section_contents, sections_orden

    def _convert_to_markdown(self, latex_text):
        """
        Convert LaTeX content to Markdown using Pandoc.

        Parameters:
            latex_text (str): The LaTeX content.

        Returns:
            str: The Markdown content.
        """
        try:
            # Write LaTeX to a temporary file
            temp_tex_path = self.dest_path / "temp.tex"
            temp_tex_path.write_text(latex_text, encoding='utf-8')

            # Run pandoc to convert LaTeX to Markdown
            temp_md_path = self.dest_path / "temp.md"
            subprocess.run(
                ["pandoc", str(temp_tex_path), "-f", "latex", "-t", "markdown", "-o", str(temp_md_path)],
                check=True
            )

            # Read and return the Markdown content
            return temp_md_path.read_text(encoding='utf-8')

        except subprocess.CalledProcessError as e:
            logging.error(f"Pandoc conversion failed: {e}")
            return ""

    def _process_graphics(self, markdown_text):
        """Replace LaTeX graphic commands with AI-readable descriptions."""
        graphic_pattern = re.compile(r'\\includegraphics(?:\[.*?\])?\{.*?\}')
        caption_pattern = re.compile(r'\\caption\{([^}]*)\}')

        def replace_graphic_with_caption(match):
            caption_match = caption_pattern.search(markdown_text, match.end())
            if caption_match:
                caption = caption_match.group(1).strip()
                return f"![Graphic: {caption}](description_placeholder)"
            return "![Graphic without description](description_placeholder)"

        return graphic_pattern.sub(replace_graphic_with_caption, markdown_text)

    def _extract_just_markdown(self, section_content):
        """
        Extract Markdown content from a LaTeX section.

        Parameters:
            section_content (str): The LaTeX content for the section.

        Returns:
            str: Processed Markdown content.
        """
        try:
            # Remove commented lines
            cleaned_content = self._remove_commented_lines(section_content)

            # Convert LaTeX to Markdown using Pandoc
            markdown_content = self._convert_to_markdown(cleaned_content)

            # Process graphics
            markdown_content = self._process_graphics(markdown_content)

        except Exception as e:
            logging.error(f"Failed to process section content: {section_content}\nError: {e}")
            raise

        return markdown_content

    @staticmethod
    def _remove_commented_lines(content):
        """Remove commented lines from content."""
        return "\n".join([line for line in content.split("\n") if not line.strip().startswith("%")])

    @staticmethod
    def _save_sections(sections: dict, destination: Path):
        """Save the provided sections dictionary as Markdown files."""
        destination.mkdir(parents=True, exist_ok=True)
        for idx, (section_name, section_content) in enumerate(sections.items(), start=1):
            file_name = f"section_{idx}_{section_name.replace('/', '_')}.md"
            (destination / file_name).write_text(section_content, encoding='utf-8')

    def run(self):
        try:
            self._perform_extraction(self.dest_path)
            latex_file_name = self._get_tex()
            if not latex_file_name:
                return

            latex_file_path = self.dest_path / latex_file_name
            latex_file_text = self._read_file_data(latex_file_path)

            document_content = self._parse_document_content(latex_file_text)
            if document_content is None:
                logging.error("Failed to parse document content")
                return

            document_sections, sections_orden = self._get_section_data(document_content)

            document_sections_processed = {section: self._extract_just_markdown(text) for section, text in document_sections.items()}

            evaluation_init = {key: "" for key in document_sections_processed.keys()}
            summary_init = {key: "" for key in document_sections_processed.keys()}

            self.article.update_properties(content=document_sections_processed, sections_orden=sections_orden, 
                                           evaluation=evaluation_init, summary=summary_init)

            #self._save_sections(document_sections_processed, self.dest_path / "markdown_output")

            return document_sections_processed

        except Exception as e:
            logging.error(f"An error occurred during processing: {e}")
            raise
