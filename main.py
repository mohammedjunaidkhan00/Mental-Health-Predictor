import pandas as pd
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from typing import Literal
from pydantic import BaseModel, Field
import joblib
from pathlib import Path



MODEL_PATH = Path("model/mental_health_model.pkl")
model = joblib.load(MODEL_PATH)
top_countries = ['Other', 'India', 'USA', 'Canada', 'Australia', 'UK', 'Germany', 'Turkey', 'Mexico', 'France'] 


col = ['Age', 'Gender', 'Country', 'Academic_Level', 'Most_Used_Platform',
       'Purpose_Of_Use', 'Avg_Daily_Usage_Hours', 'Daily_Unlocks',
       'Study_Hours', 'Physical_Activity_Hours', 'Sleep_Hours_Per_Night',
       'Stress_Level', 'Mental_Health_Score', 'Group_Country']

app = FastAPI()


app.add_middleware(CORSMiddleware,
                   allow_origins=["*"],
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"])


class StudentData(BaseModel):
    age                     : int   = Field(..., ge=10, le=100, description="Student age in years", examples=[25])
    gender                  : Literal['Male', 'Female']
    country                 : str   = Field(..., min_length=2, examples=["India"])
    academic_level          : Literal['Undergraduate', 'Graduate', 'High School'] = Field(..., examples=["Graduate"])
    most_used_platform      : Literal['Facebook', 'LinkedIn', 'Instagram', 'Snapchat', 'Twitter', 'YouTube', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp', 'WeChat'] = Field(..., examples=["LinkedIn"])
    purpose_of_use          : Literal['Networking', 'Education', 'Entertainment', 'News'] = Field(..., examples=["Networking"])
    avg_daily_usage_hours   : float = Field(..., ge=0.0, le=24.0, examples=[8])
    daily_unlocks           : int   = Field(..., ge=0, examples=[77])
    study_hours             : float = Field(..., ge=0.0, le=24.0, examples=[8])
    physical_activity_hours : float = Field(..., ge=0.0, le=24.0, examples=[1.5])
    sleep_hours_per_night   : float = Field(..., ge=0.0, le=24.0, examples=[7.5])
    stress_level            : Literal['Low', 'Medium', 'High', 'Very High'] = Field(..., examples=["Medium"])


class PredictionResponse(BaseModel):
    predicted_mental_health_score: float


@app.get("/")
def home():
    return "Welcome 😀😀"


@app.post("/predict", response_model=PredictionResponse)
def predict(data: StudentData):

    group_country = data.country if data.country in top_countries else "Other"

    row_input = pd.DataFrame([{
        'Age'                    : data.age,
        'Gender'                 : data.gender,
        'Country'                : data.country,
        'Academic_Level'         : data.academic_level,
        'Most_Used_Platform'     : data.most_used_platform,
        'Purpose_Of_Use'         : data.purpose_of_use,
        'Avg_Daily_Usage_Hours'  : data.avg_daily_usage_hours, 
        'Daily_Unlocks'          : data.daily_unlocks, 
        'Study_Hours'            : data.study_hours, 
        'Physical_Activity_Hours': data.physical_activity_hours, 
        'Sleep_Hours_Per_Night'  : data.sleep_hours_per_night, 
        'Stress_Level'           : data.stress_level,  
        'Group_Country'          : group_country}])

    prediction = model.predict(row_input)[0]

    return PredictionResponse(predicted_mental_health_score=prediction)
    