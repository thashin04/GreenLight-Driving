Requirements:
- Make sure you have the dependencies installed by being in the backend directory and running 'pip install -r requirements.txt'

Run with 'uvicorn main:app --reload'

Can test APIs by going to http://127.0.0.1:8000/docs

To authenticate in this testing env, login first. Get the authorization token from the response, then press the authorize button at the top of this testing interface and input your auth token

also need serviceAccountKey and env variables to connect to firebase