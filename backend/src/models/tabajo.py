from typing import List
from mongoengine import Document, StringField, DateTimeField, ReferenceField, ListField, ObjectIdField, DictField, get_db, LazyReferenceField, BooleanField
from mongoengine.base import BaseField
from mongoengine.errors import ValidationError
from datetime import datetime
from bson import ObjectId
import pymongo
from pymongo import GridFS
import bson
import json
from mongoengine.base.fields import BaseField 

import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from src.app import mongo, mongo_engine
from src.models.user import User

class ProcessingState(BaseField):
    STATES = ('Done', 'On Process', 'Fail')

    def validate(self, value):
        if value not in self.STATES:
            raise ValidationError('Invalid Processing State')

class ScientificArticle(Document):
    meta = {'alias': 'default'}
    user = StringField(max_length=200) 
    title = StringField(required=True, max_length=200)
    description = StringField(required=True, max_length=500)
    key_words = ListField(StringField(required=True, max_length=50))
    submission_date = DateTimeField(default=datetime.utcnow)
    processing_state = ProcessingState(default='On Process')
    content = DictField()
    summary = DictField()
    evaluation = DictField()
    reviewer = StringField(max_length=200)
    review = DictField()
    latex_project_id = ObjectIdField()
    submitted_pdf_id = ObjectIdField()

    def __init__(self, *args, **kwargs):
        latex_project = kwargs.pop('latex_project', None)
        super().__init__(*args, **kwargs)
        
        if latex_project:
            self.save_files(submitted_pdf=latex_project)

    def update_properties(self,latex_project_id = None, submitted_pdf_id = None,  title: str = None, content: str = None, key_words: List[str] = None, summary: str = None, evaluation: str = None, reviewer: str = None, processing_state: bool = None):
        if title:
            self.title = title
        if content:
            self.content = content
        if key_words:
            self.key_words = key_words
        if summary:
            self.summary = summary
        if evaluation:
            self.evaluation = evaluation
        if reviewer:
            self.reviewer = reviewer
        if processing_state is not None:
            self.processing_state = processing_state
        if latex_project_id:
            self.latex_project_id = latex_project_id
        if submitted_pdf_id:
            self.submitted_pdf_id = submitted_pdf_id

        self.save()
    def set_latex_project_url(self, file_id):
        self.latex_project_url = file_id

    def save_files(self, latex_project=None, submitted_pdf=None): 
        print(type(mongo.db))  # Check the type of mongo.db
    
        # Ensure mongo.db is an instance of Database
        if not isinstance(mongo.db, pymongo.database.Database):
            raise TypeError("mongo.db must be an instance of Database")

        fs = GridFS(mongo.db)
        if latex_project: 
            print(latex_project)
            self.update_properties(latex_project_id=fs.put(latex_project) )

        if submitted_pdf:
            print(latex_project)

            self.update_properties(submited_pdf_id=fs.put(submitted_pdf))
    
    def get_file_url(self, file_id):
        if file_id:
            fs = GridFS(mongo.db)
            try:
                filename = fs.find_one({'_id': bson.ObjectId(str(file_id))}).filename
            except:
                filename = None
            if filename:
                return f"/file/{str(file_id)}"
        return None
    
        
    def get_latex_project(self):
        if self.latex_project_id:
            latex_project_data = get_file(self.latex_project_id)
            if latex_project_data is None:
                return
            else:
                return latex_project_data

    

    def to_dict(self):
        return {
            'user': self.user if self.user else None,
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
        return json.dumps(self.to_dict())
    


def get_file(file_id):
    fs = GridFS(mongo.db)
    try:
        return fs.get(ObjectId(file_id)).read()
    except Exception as err:
        print(f'Error getting file: {err}')
