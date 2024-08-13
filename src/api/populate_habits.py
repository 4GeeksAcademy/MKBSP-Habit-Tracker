
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask_sqlalchemy import SQLAlchemy
from app import app, db  # Adjusted import path to include src
from models import Habit

# List of habits categorized with descriptions
habits = {
    "Physical Health & Fitness": [
        {"title": "Exercise for 15 minutes", "description": "A short exercise routine to maintain fitness."},
        {"title": "Go for a 30-minute walk", "description": "Daily walk for better health."},
        {"title": "Run for 20 minutes", "description": "A quick run to boost your cardio fitness."},
        {"title": "Do 10 push-ups", "description": "Strengthen your upper body with push-ups."},
        {"title": "Stretch for 10 minutes", "description": "Improve flexibility with daily stretching."},
        {"title": "Do yoga for 15 minutes", "description": "Relax and stretch with a short yoga session."},
        {"title": "Drink 8 glasses of water daily", "description": "Stay hydrated with sufficient water intake."},
        {"title": "Take the stairs instead of the elevator", "description": "Increase daily physical activity with stairs."},
        {"title": "Do a 10-minute HIIT workout", "description": "Intense workout for a quick fitness boost."},
        {"title": "Practice deep breathing exercises", "description": "Calm your mind with focused breathing."},
        {"title": "Get enough sleep (7-8 hours)", "description": "Ensure proper rest with sufficient sleep."},
        {"title": "Go to bed 30 minutes earlier", "description": "Improve your sleep routine by sleeping earlier."},
        {"title": "Take cold showers", "description": "Refresh and boost circulation with cold showers."},
        {"title": "Regular health check-ups (annual, dental)", "description": "Keep track of your health with regular check-ups."},
        {"title": "Limit processed foods", "description": "Improve your diet by reducing processed foods."},
        {"title": "Swap soft drinks for water", "description": "Reduce sugar intake by drinking water instead of soda."}
    ],
    "Mental Health & Wellness": [
        {"title": "Meditate for 10 minutes", "description": "Meditation to calm your mind."},
        {"title": "Practice gratitude journaling", "description": "Writing down things you're thankful for."},
        {"title": "Spend 5 minutes in silence", "description": "Take time for quiet reflection."},
        {"title": "Write down 3 things you’re thankful for", "description": "Practice gratitude by listing blessings."},
        {"title": "Disconnect from social media for a day", "description": "Take a break from social media for mental clarity."},
        {"title": "Practice positive affirmations", "description": "Boost your self-esteem with affirmations."},
        {"title": "Take a 5-minute mental break every hour", "description": "Refresh your mind with regular breaks."},
        {"title": "Spend 10 minutes outdoors", "description": "Enjoy fresh air and nature daily."},
        {"title": "Try a new relaxation technique (e.g., aromatherapy)", "description": "Experiment with different relaxation methods."},
        {"title": "Spend time in nature regularly", "description": "Reduce stress by spending time in natural settings."},
        {"title": "Practice self-compassion", "description": "Be kind and understanding toward yourself."},
        {"title": "Avoid negative self-talk", "description": "Improve your mental health by focusing on positivity."},
        {"title": "Reduce screen time before bed", "description": "Prepare for sleep by limiting screen use."},
        {"title": "Practice mindfulness in daily activities", "description": "Be present and mindful in everything you do."}
    ],
    "Healthy Eating": [
        {"title": "Eat a serving of fruits with every meal", "description": "Increase fruit intake for better health."},
        {"title": "Have a vegetable smoothie for breakfast", "description": "Start your day with a nutritious smoothie."},
        {"title": "Avoid processed foods for a day", "description": "Focus on whole, natural foods for better health."},
        {"title": "Eat a salad for lunch or dinner", "description": "Incorporate more greens with a salad meal."},
        {"title": "Drink green tea instead of coffee", "description": "Swap coffee for antioxidant-rich green tea."},
        {"title": "Replace sugary snacks with nuts or fruits", "description": "Choose healthier snacks like nuts or fruits."},
        {"title": "Cook a healthy meal at home", "description": "Prepare a nutritious meal yourself."},
        {"title": "Eat mindfully without distractions", "description": "Focus on your food and enjoy each bite."},
        {"title": "Drink a glass of water before each meal", "description": "Hydrate before eating to aid digestion."},
        {"title": "Try a new healthy recipe", "description": "Experiment with new recipes for a healthier diet."},
        {"title": "Reduce sugar intake by half", "description": "Cut down on sugar for better health."},
        {"title": "Limit portion sizes", "description": "Control your portions to manage weight."}
    ],
    "Education & Personal Growth": [
        {"title": "Read for 20 minutes", "description": "Expand your knowledge with daily reading."},
        {"title": "Listen to an educational podcast", "description": "Learn something new with an educational podcast."},
        {"title": "Watch a documentary", "description": "Explore new topics with an informative documentary."},
        {"title": "Take an online course", "description": "Enhance your skills by taking an online course."},
        {"title": "Learn a new word and use it", "description": "Expand your vocabulary with a new word daily."},
        {"title": "Write down your goals for the day", "description": "Set daily goals to stay focused."},
        {"title": "Spend 15 minutes learning a new language", "description": "Practice a new language for 15 minutes daily."},
        {"title": "Practice a hobby or skill", "description": "Dedicate time to develop a personal hobby."},
        {"title": "Set aside time for creative writing", "description": "Enhance creativity through writing."},
        {"title": "Reflect on your progress weekly", "description": "Review your goals and progress weekly."},
        {"title": "Embrace constructive criticism", "description": "Learn and grow from constructive feedback."},
        {"title": "Ask for help when needed", "description": "Reach out when you need support."},
        {"title": "Learn to handle rejection gracefully", "description": "Develop resilience by gracefully handling rejection."}
    ],
    "Productivity & Time Management": [
        {"title": "Plan your day the night before", "description": "Prepare for a productive day by planning ahead."},
        {"title": "Set daily priorities", "description": "Focus on the most important tasks each day."},
        {"title": "Limit multitasking to focus on one task", "description": "Improve focus by reducing multitasking."},
        {"title": "Use a timer to work in 25-minute intervals", "description": "Boost productivity with time-blocking techniques."},
        {"title": "Review your to-do list at the end of the day", "description": "Evaluate your tasks to improve efficiency."},
        {"title": "Avoid checking emails first thing in the morning", "description": "Start your day with productive tasks, not emails."},
        {"title": "Break down large tasks into smaller steps", "description": "Make big tasks manageable by breaking them down."},
        {"title": "Declutter your workspace", "description": "Increase focus by keeping your workspace tidy."},
        {"title": "Set a time limit for each task", "description": "Stay on track by setting time limits for tasks."},
        {"title": "Review and update your goals monthly", "description": "Keep your goals relevant by reviewing them monthly."},
        {"title": "Use time-blocking techniques", "description": "Organize your day by blocking out time for tasks."},
        {"title": "Create and follow a morning routine", "description": "Start your day with a consistent morning routine."},
        {"title": "Practice intentional spending", "description": "Be mindful of your financial habits."}
    ],
    "Relationships & Social Life": [
        {"title": "Spend quality time with family", "description": "Strengthen family bonds by spending time together."},
        {"title": "Call a friend or loved one", "description": "Maintain relationships by keeping in touch."},
        {"title": "Write a thank-you note", "description": "Show appreciation by writing thank-you notes."},
        {"title": "Compliment someone genuinely", "description": "Brighten someone's day with a sincere compliment."},
        {"title": "Avoid gossip for a day", "description": "Focus on positive communication by avoiding gossip."},
        {"title": "Plan a date night with your partner", "description": "Strengthen your relationship with regular date nights."},
        {"title": "Volunteer for a cause you care about", "description": "Give back by volunteering for a meaningful cause."},
        {"title": "Set boundaries and practice saying no", "description": "Protect your time and energy by setting boundaries."},
        {"title": "Plan a get-together with friends", "description": "Maintain friendships by planning social events."},
        {"title": "Listen actively during conversations", "description": "Enhance communication by listening actively."},
        {"title": "Foster positive relationships", "description": "Focus on building positive, supportive relationships."},
        {"title": "Practice forgiveness regularly", "description": "Let go of grudges by practicing forgiveness."}
    ],
    "Financial Health": [
        {"title": "Track your expenses daily", "description": "Improve financial awareness by tracking expenses."},
        {"title": "Set a weekly budget", "description": "Manage your finances by setting a weekly budget."},
        {"title": "Avoid unnecessary purchases", "description": "Reduce expenses by avoiding impulse buys."},
        {"title": "Save 10% of your income", "description": "Build savings by setting aside a portion of your income."},
        {"title": "Cook at home instead of eating out", "description": "Save money by cooking meals at home."},
        {"title": "Review your financial goals regularly", "description": "Stay on track by reviewing your financial goals."},
        {"title": "Invest in learning about personal finance", "description": "Improve financial literacy through education."},
        {"title": "Avoid impulse buying", "description": "Make thoughtful purchases by avoiding impulsive decisions."},
        {"title": "Pay bills on time", "description": "Maintain good credit by paying bills promptly."},
        {"title": "Plan for a debt-free future", "description": "Work toward financial freedom by planning to be debt-free."},
        {"title": "Diversify your income streams", "description": "Increase financial stability by diversifying income."},
        {"title": "Live below your means", "description": "Save money by living within your financial limits."}
    ],
    "Environmental Consciousness": [
        {"title": "Use reusable bags for shopping", "description": "Reduce waste by using reusable shopping bags."},
        {"title": "Recycle at home", "description": "Help the environment by recycling household items."},
        {"title": "Reduce plastic use", "description": "Protect the environment by reducing plastic consumption."},
        {"title": "Walk or bike instead of driving", "description": "Reduce your carbon footprint by walking or biking."},
        {"title": "Plant a tree or garden", "description": "Contribute to a greener planet by planting trees or gardens."},
        {"title": "Save electricity by unplugging devices", "description": "Conserve energy by unplugging electronics when not in use."},
        {"title": "Use a reusable water bottle", "description": "Reduce plastic waste by using a reusable water bottle."},
        {"title": "Participate in a community cleanup", "description": "Make a difference by joining local cleanup efforts."}
    ]
}

# Function to populate the database with habits
def populate_habits():
    for category, habits_list in habits.items():
        for habit in habits_list:
            new_habit = Habit(
                title=habit['title'],
                category=category,
                description=habit['description']
            )
            db.session.add(new_habit)
    
    db.session.commit()
    print("Habits added to the database.")

if __name__ == '__main__':
    with app.app_context():
        populate_habits()
