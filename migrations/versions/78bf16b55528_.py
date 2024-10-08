"""empty message

Revision ID: 78bf16b55528
Revises: 
Create Date: 2024-08-12 14:30:19.872628

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '78bf16b55528'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('habit_table',
    sa.Column('uid', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('category', sa.String(length=255), nullable=False),
    sa.Column('description', sa.String(length=255), nullable=False),
    sa.PrimaryKeyConstraint('uid')
    )
    op.create_table('user',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('email', sa.String(length=128), nullable=False),
    sa.Column('username', sa.String(length=128), nullable=False),
    sa.Column('password_hash', sa.String(length=128), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('role', sa.String(length=128), nullable=False),
    sa.Column('invitation_code', sa.String(length=20), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('id'),
    sa.UniqueConstraint('invitation_code'),
    sa.UniqueConstraint('username')
    )
    op.create_table('friend_table',
    sa.Column('uid', sa.Integer(), nullable=False),
    sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('friend_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('status', sa.String(length=50), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('uid')
    )
    op.create_table('levelaccess_table',
    sa.Column('uid', sa.Integer(), nullable=False),
    sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('level', sa.String(length=50), nullable=False),
    sa.Column('access_status', sa.Boolean(), nullable=False),
    sa.Column('unlock_criteria', sa.String(length=255), nullable=False),
    sa.Column('unlock_date', sa.Date(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('uid')
    )
    op.create_table('report_table',
    sa.Column('uid', sa.Integer(), nullable=False),
    sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('content', sa.String(length=255), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('uid')
    )
    op.create_table('userhabit_table',
    sa.Column('uid', sa.Integer(), nullable=False),
    sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('habit_id', sa.Integer(), nullable=False),
    sa.Column('habit_category', sa.String(length=255), nullable=False),
    sa.Column('level', sa.Integer(), nullable=False),
    sa.Column('status', sa.Boolean(), nullable=False),
    sa.Column('progress_streak', sa.Integer(), nullable=False),
    sa.Column('last_completed_date', sa.Date(), nullable=False),
    sa.ForeignKeyConstraint(['habit_id'], ['habit_table.uid'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('uid')
    )
    op.create_table('habithistory_table',
    sa.Column('uid', sa.Integer(), nullable=False),
    sa.Column('userhabit_id', sa.Integer(), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.ForeignKeyConstraint(['userhabit_id'], ['userhabit_table.uid'], ),
    sa.PrimaryKeyConstraint('uid')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('habithistory_table')
    op.drop_table('userhabit_table')
    op.drop_table('report_table')
    op.drop_table('levelaccess_table')
    op.drop_table('friend_table')
    op.drop_table('user')
    op.drop_table('habit_table')
    # ### end Alembic commands ###
