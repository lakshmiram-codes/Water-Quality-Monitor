from sqlmodel import Field, SQLModel, create_engine, Session, select
from .models import *

engine = create_engine("sqlite:///database.db")

if __name__ == '__main__':
    # SQLModel.metadata.create_all(engine)

    # admin_user = User(name="admin", email="admin@123", password="admin123")

    with Session(engine) as session:
        # session.add(admin_user)
        # session.commit()

        users = session.exec(select(User)).all()
        print(users)



