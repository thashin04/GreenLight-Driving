import firebase_admin
from firebase_admin import credentials, auth, firestore, storage

# IMPORTANT: must have service account json
cred = credentials.Certificate("serviceAccountKey.json")

firebase_app = firebase_admin.initialize_app(cred, {
        'storageBucket': 'driving-analysis---greenlight.firebasestorage.app'
    })

db = firestore.client()

firebase_auth = auth

bucket = storage.bucket()