import os
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

def train():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, 'data', 'intents.csv')
    artifacts_dir = os.path.join(current_dir, 'artifacts')
    os.makedirs(artifacts_dir, exist_ok=True)

    # Load data
    df = pd.read_csv(data_path)
    X = df['text']
    y = df['intent']

    # Create and train pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(lowercase=True, stop_words='english', ngram_range=(1, 2))),
        ('clf', LogisticRegression(random_state=42, class_weight='balanced'))
    ])

    print("Training NLP classifier...")
    pipeline.fit(X, y)
    print(f"Training complete. Classes: {pipeline.classes_}")

    # Save model
    model_path = os.path.join(artifacts_dir, 'model.joblib')
    joblib.dump(pipeline, model_path)
    print(f"Model saved to {model_path}")

if __name__ == '__main__':
    train()
