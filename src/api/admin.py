import os
from flask_admin import Admin
from .models import db, User
from flask_admin.contrib.sqla import ModelView

# Custom ModelView to show the UUID in Flask Admin
class UserModelView(ModelView):
    column_list = ('id', 'email', 'username', 'is_active', 'role', 'invitation_code')  # Include the UUID field
    form_columns = ('email', 'username', 'is_active', 'role', 'invitation_code')  # Fields for editing/creating

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='4Geeks Admin', template_mode='bootstrap3')

    # Use the custom UserModelView
    admin.add_view(UserModelView(User, db.session))

    # You can duplicate that line to add new models
    # admin.add_view(ModelView(YourModelName, db.session))
