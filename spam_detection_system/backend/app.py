from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from spam_classifier import BayesianSpamClassifier
from data_processor import DataProcessor
import traceback

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize classifier and data processor
classifier = BayesianSpamClassifier()
data_processor = DataProcessor()

# Global variables
model_trained = False
data_loaded = False

@app.route('/')
def home():
    """
    Home endpoint with API information
    """
    return jsonify({
        "message": "Spam Detection API",
        "version": "1.0",
        "endpoints": {
            "/predict": "POST - Predict if a message is spam",
            "/train": "POST - Train the model",
            "/status": "GET - Get model and data status",
            "/samples": "GET - Get sample messages",
            "/bayesian-info": "GET - Get Bayesian network information"
        }
    })

@app.route('/status')
def status():
    """
    Get the current status of the model and data
    """
    return jsonify({
        "model_trained": model_trained,
        "data_loaded": data_loaded,
        "ready_for_prediction": model_trained
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict if a message is spam or ham
    """
    try:
        if not model_trained:
            return jsonify({
                "error": "Model not trained yet. Please train the model first.",
                "success": False
            }), 400
        
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                "error": "Please provide a 'message' field in the request body",
                "success": False
            }), 400
        
        message = data['message'].strip()
        if not message:
            return jsonify({
                "error": "Message cannot be empty",
                "success": False
            }), 400
        
        # Make prediction
        result = classifier.predict(message)
        
        return jsonify({
            "success": True,
            "message": message,
            "prediction": result['prediction'],
            "is_spam": result['is_spam'],
            "confidence": result['confidence']
        })
    
    except Exception as e:
        return jsonify({
            "error": f"Prediction failed: {str(e)}",
            "success": False
        }), 500

@app.route('/train', methods=['POST'])
def train_model():
    """
    Train the Bayesian classifier
    """
    try:
        global model_trained, data_loaded
        
        data_path = "../data/SMSSpamCollection.txt"
        
        if not os.path.exists(data_path):
            return jsonify({
                "error": f"Training data not found at {data_path}",
                "success": False
            }), 400
        
        # Load data for statistics
        data_processor.load_dataset(data_path)
        data_loaded = True
        
        # Train the model
        accuracy = classifier.train(data_path)
        
        # Save the trained model
        classifier.save_model("../models")
        model_trained = True
        
        return jsonify({
            "success": True,
            "message": "Model trained successfully!",
            "accuracy": accuracy,
            "model_saved": True
        })
    
    except Exception as e:
        return jsonify({
            "error": f"Training failed: {str(e)}",
            "success": False,
            "traceback": traceback.format_exc()
        }), 500

@app.route('/bayesian-info')
def get_bayesian_info():
    """
    Get information about how Bayesian networks work for spam detection
    """
    return jsonify({
        "success": True,
        "bayesian_info": {
            "algorithm": "Multinomial Naive Bayes",
            "assumption": "Features are conditionally independent given the class",
            "formula": "P(Spam|Words) = P(Words|Spam) × P(Spam) / P(Words)",
            "features": "TF-IDF weighted word frequencies",
            "preprocessing": [
                "Lowercase conversion",
                "URL and email removal", 
                "Stop word removal",
                "Porter stemming",
                "Special character filtering"
            ],
            "advantages": [
                "Fast training and prediction",
                "Works well with small datasets",
                "Handles irrelevant features well",
                "Provides probability estimates"
            ],
            "network_structure": {
                "class_node": "Spam/Ham classification",
                "feature_nodes": "Individual words/tokens",
                "independence_assumption": "Words are independent given the class"
            }
        }
    })

@app.route('/samples')
def get_samples():
    """
    Get sample spam and ham messages
    """
    global data_loaded
    try:
        if not data_loaded:
            # Try to load data
            data_path = "../data/SMSSpamCollection.txt"
            if os.path.exists(data_path):
                data_processor.load_dataset(data_path)
                data_loaded = True
            else:
                return jsonify({
                    "error": "Dataset not loaded and data file not found",
                    "success": False
                }), 400
        
        count = request.args.get('count', 5, type=int)
        samples = data_processor.get_sample_messages(count)
        
        return jsonify({
            "success": True,
            "samples": samples
        })
    
    except Exception as e:
        return jsonify({
            "error": f"Failed to get samples: {str(e)}",
            "success": False
        }), 500

def initialize_app():
    """
    Initialize the application by loading existing model if available
    """
    global model_trained, data_loaded
    
    # Try to load existing model
    model_dir = "../models"
    if os.path.exists(model_dir):
        if classifier.load_model(model_dir):
            model_trained = True
            print("Loaded existing trained model")
    
    # Try to load dataset for statistics
    data_path = "../data/SMSSpamCollection.txt"
    if os.path.exists(data_path):
        data_processor.load_dataset(data_path)
        data_loaded = True
        print("Loaded dataset for statistics")

if __name__ == '__main__':
    print("Starting Spam Detection API...")
    initialize_app()
    
    print(f"Model trained: {model_trained}")
    print(f"Data loaded: {data_loaded}")
    print("API running on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
