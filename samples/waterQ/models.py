from sqlmodel import Field, SQLModel, create_engine, Session, select


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str
    password: str
