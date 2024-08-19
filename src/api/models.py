from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime  # Ensure datetime is imported for default value in Report
import uuid 
from sqlalchemy.dialects.postgresql import UUID





db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'  # Explicitly define the table name
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    username = db.Column(db.String(128), unique=True, nullable=False)
    password_hash = db.Column(db.String(500), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False)
    role = db.Column(db.String(128), nullable=False)  # admin, normal user
    invitation_code = db.Column(db.String(20), unique=True, nullable=True)  # Use snake_case for consistency

    def __repr__(self):
        return f'<User {self.email}>'
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def serialize(self):
        return {
            "id": str(self.id),  # Convert UUID to string for serialization
            "email": self.email,
            "username": self.username,
            "is_active": self.is_active,
            "role": self.role,
            "invitation_code": self.invitation_code
        }

class Habit(db.Model):
    __tablename__ = 'habit_table'
    uid = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=False)

class UserHabit(db.Model):
    __tablename__ = 'userhabit_table'
    uid = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'), nullable=False)
    habit_id = db.Column(db.Integer, db.ForeignKey('habit_table.uid'), nullable=False)
    habit_category = db.Column(db.String(255), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Boolean, nullable=False)
    progress_streak = db.Column(db.Integer, nullable=False)
    last_completed_date = db.Column(db.Date, nullable=False)

    user = db.relationship("User", backref="user_habits")
    habit = db.relationship("Habit", backref="user_habits")

class HabitHistory(db.Model):
    __tablename__ = 'habithistory_table'
    uid = db.Column(db.Integer, primary_key=True)
    userhabit_id = db.Column(db.Integer, db.ForeignKey('userhabit_table.uid'), nullable=False)
    date = db.Column(db.Date, nullable=False)

    userhabit = db.relationship("UserHabit", backref="habit_history")

class LevelAccess(db.Model):
    __tablename__ = 'levelaccess_table'
    uid = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'), nullable=False)
    level = db.Column(db.String(50), nullable=False)
    access_status = db.Column(db.Boolean, nullable=False)
    unlock_criteria = db.Column(db.String(255), nullable=False)
    unlock_date = db.Column(db.Date, nullable=False)

    user = db.relationship("User", backref="level_accesses")

class Friend(db.Model):
    __tablename__ = 'friend_table'
    uid = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'), nullable=False)
    friend_id = db.Column(UUID(as_uuid=True), nullable=False)
    status = db.Column(db.String(50), nullable=False)

    user = db.relationship("User", backref="friends")

class Report(db.Model):
    __tablename__ = 'report_table'
    uid = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.String(255), nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Use DateTime for timestamps

    user = db.relationship("User", backref="reports")

#Habit tracking. 
# I was not seeing how I could have a functional app without this table
class HabitCompletion(db.Model):
    __tablename__ = 'habitcompletion_table'
    uid = db.Column(db.Integer, primary_key=True)
    userhabit_id = db.Column(db.Integer, db.ForeignKey('userhabit_table.uid'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    completed = db.Column(db.Boolean, nullable=False)

    userhabit = db.relationship("UserHabit", backref="habit_completions")
