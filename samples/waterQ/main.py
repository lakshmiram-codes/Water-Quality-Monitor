from fastapi import FastAPI
from fastapi import HTTPException
from pydantic import BaseModel
from .models import *
from .setup_db import engine

app = FastAPI()

@app.get("/")
def root():
    return {"status": "FastAPI is running"}

class LoginRequest(BaseModel):
    email:str
    password:str

@app.post("/login")
def login(data: LoginRequest):

    with Session(engine) as session:
        statement = select(User).where((User.email == data.email) and (User.password == data.password))
        """select * from user where email = 'data.email' and password = '...'"""
        user = session.exec(statement).first()

        if user:
            return {"accessToken":"abc123"}

        print(user)
    # if == "admin@gmail.com" and data.password=="1234":
    
    raise HTTPException(status_code=401, detail="Invalid Credentials")



@app.post("/register")
def register(user: User):
    print(user)

    with Session(engine) as session:
        statement = select(User).where(User.email == user.email)
        is_existing_user = session.exec(statement).first()
        if is_existing_user:
            raise HTTPException(status_code=400, detail="User exists")
    
        session.add(user)
        session.commit()

        return { 'success': "User added"}

    raise HTTPException(status_code=401, detail="Invalid Credentials")