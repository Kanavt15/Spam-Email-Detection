import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer
import re
import joblib
import os

class BayesianSpamClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000, stop_words='english', lowercase=True)
        self.classifier = MultinomialNB()
        self.is_trained = False
        
        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords')
        
        self.stemmer = PorterStemmer()
        self.stop_words = set(stopwords.words('english'))
    
    def preprocess_text(self, text):
        """
        Preprocess text for better classification
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove phone numbers
        text = re.sub(r'\b\d{10,}\b', '', text)
        
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and stem
        tokens = [self.stemmer.stem(token) for token in tokens if token not in self.stop_words and len(token) > 2]
        
        return ' '.join(tokens)
    
    def load_data(self, data_path):
        """
        Load and preprocess the SMS spam collection data
        """
        # Read the data
        df = pd.read_csv(data_path, sep='\t', header=None, names=['label', 'message'])
        
        # Preprocess messages
        df['processed_message'] = df['message'].apply(self.preprocess_text)
        
        # Convert labels to binary (0: ham, 1: spam)
        df['label_binary'] = df['label'].map({'ham': 0, 'spam': 1})
        
        return df
    
    def train(self, data_path):
        """
        Train the Bayesian classifier
        """
        print("Loading and preprocessing data...")
        df = self.load_data(data_path)
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            df['processed_message'], 
            df['label_binary'], 
            test_size=0.2, 
            random_state=42,
            stratify=df['label_binary']
        )
        
        print("Vectorizing text data...")
        # Fit and transform training data
        X_train_vectorized = self.vectorizer.fit_transform(X_train)
        X_test_vectorized = self.vectorizer.transform(X_test)
        
        print("Training Bayesian classifier...")
        # Train the classifier
        self.classifier.fit(X_train_vectorized, y_train)
        
        # Evaluate the model
        y_pred = self.classifier.predict(X_test_vectorized)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Training completed!")
        print(f"Accuracy: {accuracy:.4f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=['Ham', 'Spam']))
        
        self.is_trained = True
        return accuracy
    
    def predict(self, message):
        """
        Predict if a message is spam or ham
        """
        if not self.is_trained:
            raise Exception("Model needs to be trained first!")
        
        # Preprocess the message
        processed_message = self.preprocess_text(message)
        
        # Vectorize
        message_vectorized = self.vectorizer.transform([processed_message])
        
        # Predict
        prediction = self.classifier.predict(message_vectorized)[0]
        probability = self.classifier.predict_proba(message_vectorized)[0]
        
        # Get confidence scores
        ham_probability = probability[0]
        spam_probability = probability[1]
        
        result = {
            'prediction': 'spam' if prediction == 1 else 'ham',
            'confidence': {
                'ham': float(ham_probability),
                'spam': float(spam_probability)
            },
            'is_spam': bool(prediction == 1)
        }
        
        return result
    
    def save_model(self, model_dir):
        """
        Save the trained model and vectorizer
        """
        if not self.is_trained:
            raise Exception("Model needs to be trained first!")
        
        os.makedirs(model_dir, exist_ok=True)
        
        # Save vectorizer and classifier
        joblib.dump(self.vectorizer, os.path.join(model_dir, 'tfidf_vectorizer.pkl'))
        joblib.dump(self.classifier, os.path.join(model_dir, 'bayesian_classifier.pkl'))
        
        print(f"Model saved to {model_dir}")
    
    def load_model(self, model_dir):
        """
        Load a pre-trained model and vectorizer
        """
        vectorizer_path = os.path.join(model_dir, 'tfidf_vectorizer.pkl')
        classifier_path = os.path.join(model_dir, 'bayesian_classifier.pkl')
        
        if os.path.exists(vectorizer_path) and os.path.exists(classifier_path):
            self.vectorizer = joblib.load(vectorizer_path)
            self.classifier = joblib.load(classifier_path)
            self.is_trained = True
            print("Model loaded successfully!")
            return True
        else:
            print("Model files not found!")
            return False

if __name__ == "__main__":
    # Example usage
    classifier = BayesianSpamClassifier()
    
    # Train the model
    data_path = "../data/SMSSpamCollection.txt"
    if os.path.exists(data_path):
        classifier.train(data_path)
        classifier.save_model("../models")
    else:
        print(f"Data file not found: {data_path}")
