from fastapi import APIRouter, HTTPException, status, Depends
from schemas.user import UserCreate, UserLogin
from core.firebase_setup import firebase_auth, db
from firebase_admin import auth, exceptions
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY")
# Firebase Auth endpoint
rest_api_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate):
    try:
        new_user = firebase_auth.create_user(
            email=user_data.email,
            password=user_data.password,
            display_name=user_data.name
        )
        
        user_doc_ref = db.collection('users').document(new_user.uid)
        user_doc_ref.set({
            'email': new_user.email,
            'name': new_user.display_name,
            'createdAt': new_user.user_metadata.creation_timestamp,
        })

        return {"message": "User created successfully", "uid": new_user.uid}
    
    except auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    except exceptions.FirebaseError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Firebase error: {str(e)}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.post("/login")
def login_user(user_data: UserLogin):
    try:
        payload = {
            "email": user_data.email,
            "password": user_data.password,
            "returnSecureToken": True
        }
        
        response = requests.post(rest_api_url, json=payload)
        response_data = response.json()
        
        if response.status_code != 200:
            error_detail = response_data.get("error", {}).get("message", "Invalid credentials.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_detail
            )
        
        # auth token
        id_token = response_data.get("idToken")
        
        return {"token_type": "bearer", "access_token": id_token}

    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Could not connect to Firebase Auth API: {str(e)}"
        )