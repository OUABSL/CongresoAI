import os
import zipfile
import re
import tempfile

def extract_files(submit, dest_path):
    with zipfile.ZipFile(submit, 'r') as zip_ref:
        zip_ref.extractall(dest_path)

def get_tex_data(path):
    with open(path, 'r', encoding='utf-8') as file:
        data = file.read()
    return data

def get_document_content(data):
    begin_pos = data.find(r'\begin{document}')
    end_pos = data.find(r'\end{document}')
    if begin_pos != -1 and end_pos != -1:
        return data[begin_pos + len(r'\begin{document}'):end_pos]
    return None

def get_sections(document_content):
    sections = re.findall(r'\\section\{([^}]*)\}', document_content)
    return sections

def save_section_content(document_content, sections, dest_folder):
    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)
    for i, section_name in enumerate(sections, start=1):
        section_start = document_content.find(r'\section{' + section_name)
        section_end = document_content.find(r'\section{', section_start + 1) if i < len(sections) else len(document_content)
        section_content = document_content[section_start:section_end].strip()
        section_filename = os.path.join(dest_folder, f"section_{i}_{section_name.replace('/', '_')}.txt")
        with open(section_filename, 'w', encoding='utf-8') as section_file:
            section_file.write(section_content)

def main():
    zip_path = os.path.join(os.getcwd(), "test", "article.zip")
    dest_path = tempfile.mkdtemp(dir=os.getcwd())
    path_to_tex_file = os.path.join(dest_path, "PQG.tex")
    
    extract_files(zip_path, dest_path)
    tex_data = get_tex_data(path_to_tex_file)
    document_content = get_document_content(tex_data)
    sections = get_sections(document_content)
    save_section_content(document_content, sections, os.path.join(os.getcwd(), "res"))
    
if __name__ == "__main__":
    main()