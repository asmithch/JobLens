from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from pdfminer.high_level import extract_text
import docx
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

nlp = spacy.load('en_core_web_sm')

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def extract_text_from_file(file):
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    print(f"✅ Saved file to: {filepath}")

    if file.filename.endswith('.pdf'):
        return extract_text(filepath)
    elif file.filename.endswith('.docx'):
        doc = docx.Document(filepath)
        return '\n'.join([para.text for para in doc.paragraphs])
    else:
        print(f"❌ Unsupported file type: {file.filename}")
        return None

def preprocess_text(text):
    doc = nlp(text)
    return ' '.join([token.text.lower() for token in doc if token.is_alpha])

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'resume' not in request.files or 'job_description' not in request.files:
        print("❗ Missing resume or job_description in form-data")
        return jsonify({'error': 'Missing resume or job description file'}), 400

    resume = request.files['resume']
    jd = request.files['job_description']

    print(f"📄 Received files: {resume.filename}, {jd.filename}")

    try:
        resume_text = extract_text_from_file(resume)
        jd_text = extract_text_from_file(jd)

        if not resume_text or not jd_text:
            return jsonify({'error': 'Unsupported file format'}), 400

        resume_processed = preprocess_text(resume_text)
        jd_processed = preprocess_text(jd_text)

        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform([resume_processed, jd_processed])
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        match_percentage = round(similarity * 100, 2)

        resume_words = set(resume_processed.split())
        jd_words = set(jd_processed.split())
        missing = list(jd_words - resume_words)

        print(f"✅ Match: {match_percentage}% | Missing keywords: {len(missing)}")

        return jsonify({
            'match_percentage': match_percentage,
            'missing_keywords': missing
        })

    except Exception as e:
        print(f"❌ Error in analysis: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)
