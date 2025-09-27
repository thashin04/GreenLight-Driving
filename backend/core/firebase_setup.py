import firebase_admin
from firebase_admin import credentials, auth, firestore

# IMPORTANT: must have service account json
cred = credentials.Certificate("serviceAccountKey.json")

firebase_app = firebase_admin.initialize_app(cred)

db = firestore.client()

firebase_auth = auth