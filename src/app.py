"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from api.models import UserHabit, HabitCompletion

from flask_jwt_extended import JWTManager
from flask_cors import CORS





# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "*"}})
app.url_map.strict_slashes = False


#check this is correct ... 
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key' 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  
jwt = JWTManager(app)


# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response

# Function to reset habits daily
def reset_habits():
    today = datetime.utcnow().date()

    user_habits = UserHabit.query.all()
    for user_habit in user_habits:
        # Create a new HabitCompletion record for today if it doesn't already exist
        if not HabitCompletion.query.filter_by(userhabit_id=user_habit.uid, date=today).first():
            habit_completion = HabitCompletion(
                userhabit_id=user_habit.uid,
                date=today,
                completed=False  # Reset status to incomplete
            )
            db.session.add(habit_completion)
    
    db.session.commit()
    print("Habits reset for a new day")

# Setup the scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(func=reset_habits, trigger="cron", hour=0, minute=0)  # Run at midnight every day
scheduler.start()

# To shut down the scheduler when exiting the app
import atexit
atexit.register(lambda: scheduler.shutdown())


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)


