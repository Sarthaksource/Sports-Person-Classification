from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import util

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/classify_image")
async def classify_image(image_data: str = Form(...)):
	result = util.classify_image(image_data)
	# print(result)
	return result

@app.on_event("startup")
def startup_event():
    print("Starting FastAPI Server For Sports Celebrity Image Classification")
    util.load_saved_artifacts()
