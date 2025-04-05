"""make hashed_password nullable

Revision ID: make_password_nullable
Revises: add_google_id_column_v2
Create Date: 2024-04-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'make_password_nullable'
down_revision: Union[str, None] = 'add_google_id_column_v2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make hashed_password nullable
    op.alter_column('user', 'hashed_password',
               existing_type=sa.VARCHAR(),
               nullable=True)


def downgrade() -> None:
    # Make hashed_password non-nullable again
    op.alter_column('user', 'hashed_password',
               existing_type=sa.VARCHAR(),
               nullable=False) 