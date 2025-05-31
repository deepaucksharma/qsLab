# test_flask.py - Simple test to verify Flask is working
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
    return jsonify({"message": "Flask is working! But TTS is still installing..."})

@app.route('/api/test')
def test():
    return jsonify({"status": "ok", "message": "API endpoint working"})

if __name__ == '__main__':
    print("Test Flask server running on http://localhost:5000")
    app.run(debug=True, port=5000)
