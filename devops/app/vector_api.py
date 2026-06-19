# Vector API — Builders Lab Hackathon 2026
# Flask + Gunicorn starter service for the DevOps task
#
# POST /vector   — receives a list of numbers and returns stats
# GET  /health   — liveness check

import os
import json
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Fetch connection string from environment variable
# Format: mysql+mysqlconnector://admin:password@endpoint:3306/mydb
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DB_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define the Model
class VectorLog(db.Model):
    __tablename__ = 'vector_logs'
    id = db.Column(db.Integer, primary_key=True)
    received_at = db.Column(db.DateTime, server_default=db.func.now())
    original_vector = db.Column(db.JSON, nullable=False)
    normalized_vector = db.Column(db.JSON, nullable=False)
    source_ip = db.Column(db.String(45), nullable=False)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/vector', methods=['POST'])
def process_vector():
    data = request.get_json()

    if not data or 'vector' not in data:
        return jsonify({"error": "missing 'vector' field"}), 400

    vector = data['vector']

    # Validation and Math
    if not isinstance(vector, list) or not all(isinstance(x, (int, float)) for x in vector):
        return jsonify({"error": "vector must be a list of numbers"}), 400
    
    if len(vector) == 0:
        return jsonify({"error": "vector cannot be empty"}), 400

    n = len(vector)
    magnitude = sum(x ** 2 for x in vector) ** 0.5
    normalized = [x / magnitude for x in vector] if magnitude != 0 else vector

    # Database Insertion
    try:
        new_log = VectorLog(
            original_vector=vector,
            normalized_vector=normalized,
            source_ip=request.remote_addr
        )
        db.session.add(new_log)
        db.session.commit()
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Database write failed"}), 500

    return jsonify({
        "count": n,
        "original": vector,
        "normalized": normalized
    })

if __name__ == '__main__':
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)
