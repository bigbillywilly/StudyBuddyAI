from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "StudyBuddy AI backend is running 🚀"}
