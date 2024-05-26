from typing import List
from bson import ObjectId
from mongoengine import Document, StringField, DateTimeField, ListField, ObjectIdField, DictField, ReferenceField, BooleanField, IntField
from mongoengine.base import BaseField
from mongoengine.errors import ValidationError
from datetime import datetime
import pymongo, gridfs, json, bson
from src.app import mongo
from src.models.user import User


class ProcessingState(BaseField):
    STATES = ('Done', 'On Process', 'Fail')


class ReviewResult(BaseField):
    STATES = ("Pending Review", "Approved", "Rejected", "Pending Improvement", "None")

    def validate(self, value):
        if value not in self.STATES:
            raise ValidationError('MongoEng: Invalid review´s state')

class ScientificArticle(Document):
    meta = {'alias': 'default',
            'indexes': [
                {'fields': ['author', 'title'], 'unique': True},
                {'fields': ['submission_id'], 'unique': True}
            ],
    }

    author = StringField(max_length=200) 
    submission_id = StringField(required=True, unique=True, max_length=36)
    title = StringField(required=True, max_length=200)
    description = StringField(required=True, max_length=500)
    key_words = ListField(StringField(required=True, max_length=50))
    submission_date = DateTimeField(default=datetime.now())
    processing_state = ProcessingState(default='On Process')
    content = DictField()
    sections_orden = ListField()
    summary = DictField()
    evaluation = DictField()
    reviewer = StringField(max_length=200)
    sorted_backup_assignment = ListField()
    review = DictField()
    review_result = ReviewResult(default="Pending Review")
    old_review_result = ReviewResult(default="None")
    is_resubmited = BooleanField(default=False)
    submit_number = IntField(default=1)
    last_modified = DateTimeField(default=None)
    latex_project_id = ObjectIdField()
    submitted_pdf_id = ObjectIdField()
    improvements=StringField()

    def __init__(self, *args, **kwargs):
        latex_project = kwargs.pop('latex_project', None)
        super().__init__(*args, **kwargs)
        
        if latex_project:
            self.save_files(submitted_pdf=latex_project)

    def update_properties(self, description: str=None, key_words: List[str]=None, processing_state: str=None, content: dict=None, sections_orden:List[str]=None, summary: dict=None, evaluation: dict=None, reviewer: str=None, sorted_backup_assignment: list=None, review: dict=None, review_result: str=None, old_review_result: str=None, is_resubmited: bool=None, submit_number: int=None, latex_project_id: ObjectId=None, submitted_pdf_id: ObjectId=None, improvements: str=None):
        if description:
            self.description = description
        if key_words:
            self.key_words = key_words
        if processing_state:
            self.processing_state = processing_state
        if content:
            self.content = content
        if sections_orden:
            self.sections_orden = sections_orden
        if summary:
            self.summary = summary
        if evaluation:
            self.evaluation = evaluation
        if reviewer:
            self.reviewer = reviewer
        if sorted_backup_assignment:
            self.sorted_backup_assignment = sorted_backup_assignment
        if review:
            self.review = review
        if review_result:
            self.review_result = review_result
        if old_review_result:
            self.old_review_result = old_review_result
        if is_resubmited:
            self.is_resubmited = is_resubmited
        if submit_number:
            self.submit_number += 1
        if latex_project_id:
            self.latex_project_id = latex_project_id
        if submitted_pdf_id:
            self.submitted_pdf_id = submitted_pdf_id
        if improvements:
            self.improvements = improvements
        
        self.last_modified = datetime.now()
        self.save()


    def set_latex_project_url(self, file_id):
        self.latex_project_url = file_id

    def save_files(self, latex_project=None, submitted_pdf=None): 
        #print(type(mongo.db))  # Check the type of mongo.db
    
        # Ensure mongo.db is an instance of Database
        if not isinstance(mongo.db, pymongo.database.Database):
            raise TypeError("mongo.db must be an instance of Database")

        fs = gridfs.GridFS(mongo.db)
        if latex_project: 
            print(latex_project)
            self.update_properties(latex_project_id=fs.put(latex_project) )

        if submitted_pdf:
            print(submitted_pdf)
            self.update_properties(submitted_pdf_id=fs.put(submitted_pdf))
    
    def get_file_url(self, file_id):
        if file_id:
            fs = gridfs.GridFS(mongo.db)
            try:
                filename = fs.find_one({'_id': bson.ObjectId(str(file_id))}).filename
            except:
                filename = None
            if filename:
                return f"/file/{str(file_id)}"
        return None
    

    def get_latex_project(self):
        if self.latex_project_id:
            return get_file(self.latex_project_id)
        else:
            return None
    
    def get_summary_to_dict(self):
        return {
            'title': self.title,
            'author': self.author,
            'description': self.description,
            'submission_id':self.submission_id,
            'submission_date': self.submission_date.strftime('%Y-%m-%d %H:%M:%S'),
            'submit_number':self.submit_number,
            'keywords': self.key_words,
        }

    def to_dict(self):
        return {
            'author': self.author,
            'title': self.title,
            'content': self.content,
            'submission_date': self.submission_date.strftime('%Y-%m-%d %H:%M:%S'),
            'keywords': self.key_words,
            'summary': self.summary,
            'evaluation': self.evaluation,
            'reviewer': self.reviewer,
            'sorted_backup_assignment' : self.sorted_backup_assignment,
            'las_modified':self.last_modified,
            'latex_project_url': self.get_file_url(self.latex_project_id),
            'submitted_pdf_url': self.get_file_url(self.submitted_pdf_id),
        }
    


    def to_json(self):
        return json.dumps(self.to_dict())
    


def get_file(file_id):
    fs = gridfs.GridFS(mongo.db)
    try:
        return fs.get(ObjectId(file_id)).read()
    except Exception as err:
        print(f'Error getting file: {err}')
