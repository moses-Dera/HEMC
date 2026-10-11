import os
import joblib

class IntentRecognizer:
    def __init__(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, 'artifacts', 'model.joblib')
        
        if os.path.exists(model_path):
            self.pipeline = joblib.load(model_path)
        else:
            self.pipeline = None
            print("Warning: NLP model not found. Run train.py first.")

    def predict(self, text: str):
        if not self.pipeline:
            return "unknown", 0.0
            
        intent = self.pipeline.predict([text])[0]
        probs = self.pipeline.predict_proba([text])[0]
        confidence = float(max(probs))
        
        return intent, confidence

# Singleton instance
recognizer = IntentRecognizer()

def get_intent(text: str):
    return recognizer.predict(text)
