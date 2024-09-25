"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Habit, Friend, Report, LevelAccess, HabitHistory, UserHabit, HabitCompletion
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token
from functools import wraps
import uuid
import smtplib
import requests
from email.mime.text import MIMEText
from api.utils import APIException
import os





api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

# Test
#@api.route('/hello', methods=['POST', 'GET'])
#def handle_hello():
#
#    response_body = {
#        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
#    }
#
#    return jsonify(response_body), 200

#Create a new User
@api.route('/createUser', methods=['POST'])
def handle_createUser():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    is_active =  data.get('is_active', True)
    role =  data.get('role', 'normal')
    invitation_code =  data.get('invitation_code')

    #Validations here:
    # Validation: Check if required fields are present
    if not email or not username or not password:
        return jsonify({"message": "Email, username, and password are required"}), 400

    # Validation: Validate email format
    import re
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email):
        return jsonify({"message": "Invalid email format"}), 400

    # Validation: Check for existing email
    if User.query.filter_by(email=email).first() is not None:
        return jsonify({"message": "Email is already registered"}), 400

    # Validation: Check for existing username
    if User.query.filter_by(username=username).first() is not None:
        return jsonify({"message": "Username is already taken"}), 400

    # Validation: Validate role
    allowed_roles = ['normal', 'admin']
    if role not in allowed_roles:
        return jsonify({"message": f"Invalid role. Allowed roles are: {allowed_roles}"}), 400

    response_body = {
        "message": "User was created successfully"
    }

    #Defining the user her
    user = User (
        email=email,
        username=username,
        is_active=is_active,
        role=role,
        invitation_code=invitation_code
    )

    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify(response_body), 201

#Get user info
@api.route('/getUser/<uuid:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        raise APIException("User not found", status_code=404)
    
    return jsonify(user.serialize()), 200

# Route to update user details
@api.route('/updateUser/<uuid:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    
    # Find the user by ID
    user = User.query.get(user_id)
    if user is None:
        raise APIException("User not found", status_code=404)
    
    # Update the fields if they are provided
    if 'email' in data:
        user.email = data['email']
    if 'username' in data:
        user.username = data['username']
    if 'password' in data:
        user.set_password(data['password'])  # Set the new password
    
    db.session.commit()
    
    return jsonify({"message": "User updated successfully"}), 200



#Login Route
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Validate the email and password
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password"}), 401

    # Generate a JWT token
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "user": user.serialize()
    }), 200


# Route to deactivate (soft delete) a user
@api.route('/deleteUser/<uuid:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        raise APIException("User not found", status_code=404)
    
    # Mark the user as inactive
    user.is_active = False
    
    # Commit the change to the database
    db.session.commit()
    
    return jsonify({"message": "User has been deactivated"}), 200


# Route to create a habit
@api.route('/createHabit', methods=['POST'])
def create_habit():
    data = request.get_json()
    
    # Validate the data
    if 'title' not in data or 'category' not in data or 'description' not in data:
        raise APIException("Missing habit data", status_code=400)
    
    # Create a new habit
    new_habit = Habit(
        title=data['title'],
        category=data['category'],
        description=data['description']
    )
    
    # Add the habit to the database
    db.session.add(new_habit)
    db.session.commit()
    
    return jsonify({"message": "Habit created successfully", "habit": new_habit.uid}), 201


# Route to assign a habit to a user
@api.route('/assignHabit', methods=['POST'])
def assign_habit():
    data = request.get_json()
    
    # Validate the data
    if 'user_id' not in data or 'habit_id' not in data or 'level' not in data:
        raise APIException("Missing assignment data", status_code=400)
    
    # Ensure the user exists
    user = User.query.get(data['user_id'])
    if not user:
        raise APIException("User not found", status_code=404)
    
    # Ensure the habit exists
    habit = Habit.query.get(data['habit_id'])
    if not habit:
        raise APIException("Habit not found", status_code=404)
    
    # Check the number of habits the user has in this level
    user_habits_in_level = UserHabit.query.filter_by(user_id=user.id, level=data['level']).count()
    if user_habits_in_level >= 10:
        raise APIException(f"User already has 10 habits in level {data['level']}", status_code=400)
    
     # Check if the habit is already assigned to the user in the same level
    existing_user_habit = UserHabit.query.filter_by(user_id=user.id, habit_id=habit.uid, level=data['level']).first()
    if existing_user_habit:
        raise APIException("This habit is already assigned to the user in this level", status_code=400)
    
    # Assign the habit to the user
    user_habit = UserHabit(
        user_id=user.id,
        habit_id=habit.uid,
        habit_category=habit.category,
        level=data['level'],
        status=True,  # Assuming status is true when habit is assigned
        progress_streak=0,  # Initial streak is 0
        last_completed_date=datetime.utcnow()  # Assuming habit assignment sets this date
    )
    
    # Add the user-habit association to the database
    db.session.add(user_habit)
    db.session.commit()
    
    return jsonify({"message": "Habit assigned to user successfully", "user_habit_id": user_habit.uid, "to level":data['level']}), 201



# Route to get a user's habits by level
@api.route('/getUserHabits/<string:user_id>/<int:level>', methods=['GET'])
def get_user_habits(user_id, level):
    # Ensure the user exists
    user = User.query.get(user_id)
    if not user:
        raise APIException("User not found", status_code=404)
    
    # Get the user's habits at the specified level
    user_habits = UserHabit.query.filter_by(user_id=user.id, level=level).all()
    
    if not user_habits:
        return jsonify({"message": f"No habits found for user in level {level}"}), 200
    
    # Serialize the habits
    serialized_habits = []
    for user_habit in user_habits:
        habit = Habit.query.get(user_habit.habit_id)
        serialized_habits.append({
            "user_habit_id": user_habit.uid,  
            "habit_id": habit.uid,
            "title": habit.title,
            "category": habit.category,
            "description": habit.description,
            "progress_streak": user_habit.progress_streak,
            "last_completed_date": user_habit.last_completed_date.strftime('%Y-%m-%d') if user_habit.last_completed_date else None
        })
    
    return jsonify({"user_habits": serialized_habits}), 200

@api.route('/getHabit/<int:habit_id>', methods=['GET'])
def get_habit(habit_id):
    habit = Habit.query.get(habit_id)
    if habit is None:
        raise APIException("Habit not found", status_code=404)
    
    return jsonify({
        "id": habit.uid,
        "title": habit.title,
        "category": habit.category,
        "description": habit.description
    }), 200

# OLD or mistaken... Route to remove a habit assigned to a user
#@api.route('/removeHabit', methods=['DELETE'])
#def remove_habit():
#    data = request.get_json()
#    
#    # Validate the data
#    if 'user_habit_id' not in data:
#        raise APIException("Missing user habit ID", status_code=400)
#    
#    # Find the UserHabit entry
#    user_habit = UserHabit.query.get(data['user_habit_id'])
#    if not user_habit:
#        raise APIException("Habit assignment not found", status_code=404)
#    
#    # Delete the habit assignment
#    db.session.delete(user_habit)
#    db.session.commit()
#    
#    return jsonify({"message": "Habit assignment removed successfully"}), 200

@api.route('/removeHabit/<uuid:user_id>/<int:user_habit_id>', methods=['DELETE'])
def remove_habit(user_id, user_habit_id):
    # Find the UserHabit entry based on user_id and user_habit_id
    user_habit = UserHabit.query.filter_by(user_id=user_id, uid=user_habit_id).first()

    if not user_habit:
        raise APIException("Habit assignment not found", status_code=404)
    
    # Delete the habit assignment
    db.session.delete(user_habit)
    db.session.commit()
    
    return jsonify({"message": "Habit assignment removed successfully"}), 200


# Route to make a habit complete, and modify the Habit_Completion Table
@api.route('/completeHabit', methods=['POST'])
def complete_habit():
    data = request.get_json()

    # Validate the data
    if 'user_habit_id' not in data or 'date' not in data or 'completed' not in data:
        raise APIException("Missing data", status_code=400)
    
    # Parse the date from the data
    completion_date = datetime.strptime(data['date'], '%Y-%m-%d').date()

    # Find the user habit
    user_habit = UserHabit.query.get(data['user_habit_id'])
    if not user_habit:
        raise APIException("User habit not found", status_code=404)

    # Check if the completion record exists for the given date
    habit_completion = HabitCompletion.query.filter_by(userhabit_id=user_habit.uid, date=completion_date).first()
    
    if habit_completion:
        # Update the existing record
        habit_completion.completed = data['completed']
    else:
        # Create a new record
        habit_completion = HabitCompletion(
            userhabit_id=user_habit.uid,
            date=completion_date,
            completed=data['completed']
        )
        db.session.add(habit_completion)

    db.session.commit()

    return jsonify({"message": "Habit completion status updated successfully"}), 200

# Route for getting the habit performance, the Habit Completino info. 
@api.route('/getHabitPerformance/<int:user_habit_id>', methods=['GET'])
def get_habit_performance(user_habit_id):
    # Find the user habit
    user_habit = UserHabit.query.get(user_habit_id)
    if not user_habit:
        raise APIException("User habit not found", status_code=404)

    # Get all completion records for this habit
    completions = HabitCompletion.query.filter_by(userhabit_id=user_habit_id).order_by(HabitCompletion.date).all()

    # Calculate the current streak and serialize the completions
    streak = 0
    serialized_completions = []
    for completion in completions:
        if completion.completed:
            streak += 1
        else:
            streak = 0  # Reset streak if there's a day missed
        
        serialized_completions.append({
            "date": completion.date.strftime('%Y-%m-%d'),
            "completed": completion.completed,
            "current_streak": streak
        })

    return jsonify({"performance": serialized_completions, "current_streak": streak}), 200

# Route to fetch all habits
@api.route('/getAllHabits', methods=['GET'])
def get_all_habits():
    habits = Habit.query.all()
    serialized_habits = [
        {
            "uid": habit.uid,
            "title": habit.title,
            "category": habit.category,
            "description": habit.description
        } for habit in habits
    ]
    return jsonify({"habits": serialized_habits}), 200

@api.route('/getAllUserHabits/<uuid:user_id>', methods=['GET'])
def fetch_all_user_habits(user_id):
    # Query the UserHabit table to get all habits for this user
    user_habits = UserHabit.query.filter_by(user_id=user_id).all()

    if not user_habits:
        return jsonify({"message": "No habits found for this user"}), 404

    # Serialize the results to return in a JSON format
    habits_list = []
    for habit in user_habits:
        habits_list.append({
            "user_habit_id": habit.uid,
            "habit_id": habit.habit_id,
            "level": habit.level,
            "status": habit.status,
            "progress_streak": habit.progress_streak
        })

    return jsonify(habits_list), 200








#I was supposed to have these 2 definitions 
cached_quote = None
last_fetch_date = None

#and this is also right, for somer reason.... 
def daily_cache(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        global cached_quote, last_fetch_date
        today = datetime.now().date()
        
        if cached_quote is None or last_fetch_date != today:
            cached_quote = func(*args, **kwargs)
            last_fetch_date = today
        
        return cached_quote
    return wrapper

#this should be our daily fetching... Don't know if this is better in the dailyquote page
@daily_cache
def fetch_quote():
    try:
        response = requests.get(
            'https://api.api-ninjas.com/v1/quotes?category=learning',
            headers={'X-Api-Key': 'wULAN7kEXbiD1MssUfJGMES0UuRHA4gNMYU1SOTi'},
            timeout=10  
        )
        response.raise_for_status()  
        data = response.json()[0]
        return {
            'text': data['quote'],
            'author': data['author']
        }
    except requests.RequestException as e:
        print(f"Error fetching quote: {e}")
        return {
            'text': 'Failed to fetch quote',
            'author': 'Unknown'
        }

#getting our daily quotes from the API ninja https://api-ninjas.com/api/quotes
@api.route('/api/daily-quote', methods=['GET'])
def get_daily_quote():
    quote = fetch_quote()
    return jsonify(quote)

#this is how I stop the caching
@api.after_request
def add_header(response):
    response.cache_control.no_store = True
    return response


#when the 
@api.route('/request_password_reset', methods=['POST'])
def request_password_reset():
    email = request.json.get('email', None)
    if not email:
        return jsonify({"msg": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "If a user with this email exists, a reset link has been sent."}), 200

    reset_token = str(uuid.uuid4())
    user.password_reset_token = reset_token
    user.password_reset_expires = datetime.utcnow() + timedelta(minutes=15)
    db.session.commit()

    response = send_password_reset_email(user.email, reset_token)
    
    if response and response.status_code == 200:
        return jsonify({"msg": "If a user with this email exists, a reset link has been sent."}), 200
    else:
        print(f"Failed to send email: {response.text if response else 'No response'}")
        return jsonify({"msg": "Failed to send reset email. Please try again later."}), 500
    

@api.route('/reset_password/<token>', methods=['POST'])
def confirm_password_reset(token):
   new_password = request.json.get('new_password', None)
   if not new_password:
       return jsonify({"msg": "New password is required"}), 400

   user = User.query.filter_by(password_reset_token=token).first()
   if not user or user.password_reset_expires < datetime.utcnow():
       return jsonify({"msg": "Invalid or expired password reset token"}), 400

   user.set_password(new_password)
   user.password_reset_token = None
   user.password_reset_expires = None
   db.session.commit()

   return jsonify({"msg": "Password updated successfully"}), 200

def send_password_reset_email(email, reset_token):
    mailgun_domain = os.environ.get('MAILGUN_DOMAIN')
    mailgun_api_key = os.environ.get('MAILGUN_API_KEY')
    
    if not mailgun_domain or not mailgun_api_key:
        print("Mailgun configuration is missing")
        return None
    
    reset_url = f"{current_app.config['FRONTEND_URL']}/reset-password/{reset_token}"
    
    return requests.post(
        f"https://api.mailgun.net/v3/{mailgun_domain}/messages",
        auth=("api", mailgun_api_key),
        data={"from": f"Password Reset <mailgun@{mailgun_domain}>",
              "to": [email],
              "subject": "Password Reset Request",
              "text": f"Please click the following link to reset your password: {reset_url}"})


@api.route('/test_mailgun', methods=['GET'])
def test_mailgun():
    mailgun_domain = os.environ.get('MAILGUN_DOMAIN')
    mailgun_api_key = os.environ.get('MAILGUN_API_KEY')
    recipient_email = "madstrundte@gmail.com"

    if not mailgun_domain or not mailgun_api_key:
        return jsonify({"error": "Mailgun configuration is missing"}), 500

    response = requests.post(
        f"https://api.mailgun.net/v3/{mailgun_domain}/messages",
        auth=("api", mailgun_api_key),
        data={"from": f"Mailgun Test <mailgun@{mailgun_domain}>",
              "to": [recipient_email],
              "subject": "Hello from Flask",
              "text": "This is a test email sent from Flask using Mailgun!"})

    if response.status_code == 200:
        return jsonify({"message": "Test email sent successfully!"}), 200
    else:
        return jsonify({"error": f"Failed to send email. Status code: {response.status_code}", "details": response.text}), 500


#this is what me and David came up with:
#basically, we are calling a previous route to get all the userHabits, which we are then organising their performance. 
@api.route('/performanceByUser/<uuid:user_id>', methods=['GET'])
def get_user_habit_performance(user_id):
    # Get all UserHabits for the user
    user_habits = UserHabit.query.filter_by(user_id=user_id).all()
    

    if not user_habits:
        return jsonify({"message": "No habits found for this user"}), 404
    
    # Calculate date range
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=14)  # 15 days including today
    
    # Prepare the result
    result = []
    
    for user_habit in user_habits:
        habit = Habit.query.get(user_habit.habit_id)
        habit_data = {
            "user_habit_id": user_habit.uid,
            "habit_id": habit.uid,
            "habit_name": habit.title,
            "performance": []
        }
        
        # Get completions for this UserHabit in the date range
        completions = HabitCompletion.query.filter(
            HabitCompletion.userhabit_id == user_habit.uid,
            HabitCompletion.date >= start_date,
            HabitCompletion.date <= end_date
        ).all()
        
        # Create a set of completed dates for easy lookup
        completed_dates = {c.date for c in completions}
        
        # Populate performance data
        current_date = start_date
        while current_date <= end_date:
            habit_data["performance"].append({
                "date": current_date.isoformat(),
                "completed": current_date in completed_dates
            })
            current_date += timedelta(days=1)
        
        result.append(habit_data)
    
    return jsonify(result), 200