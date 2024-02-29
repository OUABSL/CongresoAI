import pymongo
# from mongoengine import Document, StringField, DateTimeField, ReferenceField, ListField
from mongoengine import Document
from datetime import datetime
import json
import gridfs
import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from src.app import mongo
from src.models.user import User



class Articulo(Document):

    def __init__(self, user_id, title, description, key_words, content, knowledge_field, summary, evaluation, reviewer, latex_project=None,submitted_pdf=None):
 
        self.user_id = user_id #ReferenceField(User, required=True)  # Assuming a separate 'Usuario' model
        self.title = title #StringField(required=True)
        self.description = description # StringField(required=True)
        self.key_words = key_words #ListField(StringField(required=True))
        self.submission_date = datetime.utcnow # DateTimeField(default=datetime.utcnow)
        self.content = content # StringField()
        self.summary = summary #StringField()
        self.evaluation = evaluation #StringField()
        self.reviewer = reviewer #StringField()

    def save_files(self, latex_project=None, submitted_pdf=None):
        """
        Saves the provided ZIP and PDF files to GridFS and updates the document with file IDs.

        Args:
            latex_project (bytes): The binary content of the ZIP file.
            submitted_pdf (bytes): The binary content of the PDF file.

        Returns:
            None
        """

        if not self.pk:  # Ensure document is saved before storing files
            self.save()

        # client = pymongo.MongoClient()  # Commented out or removed
        db = mongo.db  # Use directly

        fs = gridfs.GridFS(db)

        if latex_project:
            self.latex_project_id = fs.put(latex_project, filename="latex_project.zip")
        else:
            self.latex_project_id = None

        if submitted_pdf:
            self.submitted_pdf_id = fs.put(submitted_pdf, filename="submitted_pdf.pdf")
        else:
            self.submitted_pdf_id = None

        self.reload()  # Update the document with file IDs

    def get_file_url(self, file_id):
        """
        Retrieves the download URL for the file with the given ID from GridFS.

        Args:
            file_id (ObjectId): The ID of the file in GridFS.

        Returns:
            str: The download URL for the file, or None if not found.
        """

        try:
            #client = pymongo.MongoClient()
            client = mongo.db
            db = client['articles']
            fs = gridfs.GridFS(db)
            file = fs.get(file_id)
            return file.url
        except gridfs.errors.NoFile:
            return None

    def to_dict(self):
        """
        Converts the document to a dictionary representation.

        Returns:
            dict: A dictionary containing the document's fields and file download URLs.
        """

        return {
            'user_id': str(self.user_id) if self.user_id else None,
            'title': self.title,
            'content': self.content,
            'submission_date': self.submission_date.strftime('%Y-%m-%d %H:%M:%S'),
            'keywords': self.key_words,
            'summary': self.summary,
            'evaluation': self.evaluation,
            'reviewer': self.reviewer,
            'latex_project_url': self.get_file_url(self.latex_project_id),
            'submitted_pdf_url': self.get_file_url(self.submitted_pdf_id),
        }

    def to_json(self):
        """
        Serializes the document dictionary to JSON format.

        Returns:
            str: The JSON representation of the document.
        """

        return json.dumps(self.to_dict())
