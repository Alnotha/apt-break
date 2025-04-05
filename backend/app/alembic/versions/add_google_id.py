"""add google_id column

Revision ID: add_google_id_column
Revises: 
Create Date: 2024-04-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'add_google_id_column'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add google_id column
    op.add_column('user', sa.Column('google_id', sa.String(), nullable=True))
    op.create_index(op.f('ix_user_google_id'), 'user', ['google_id'], unique=True)


def downgrade() -> None:
    # Remove google_id column
    op.drop_index(op.f('ix_user_google_id'), table_name='user')
    op.drop_column('user', 'google_id') 