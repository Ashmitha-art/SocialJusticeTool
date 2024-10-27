import nltk
nltk.download('punkt_tab')
nltk.download('wordnet')
nltk.download('omw-1.4')
nltk.download('stopwords') 
from nltk.tokenize import word_tokenize
from nltk.probability import FreqDist
import re
from nltk.corpus import stopwords
from nltk.probability import FreqDist
import PyPDF2
from collections import Counter
import csv

def load_keywords(csv_file):
    keywords = []
    with open(csv_file, newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            keywords.extend([word.strip().lower() for word in row])
    return keywords

def preprocess_text(file_path):
    stop_words = set(stopwords.words('english'))
    print(file_path)
    if(file_path.endswith('.txt')):
    # Open and read the file content
        with open(file_path, 'r') as file:
            text = file.read()
    elif(file_path.endswith('.pdf')):
        with open(file_path, 'rb') as file:
            pdf = PyPDF2.PdfReader(file)
            text = ''
            for page in pdf.pages:
                text += page.extract_text()
    
    # Tokenize and preprocess text
    words = nltk.word_tokenize(text.lower())
    # Remove stopwords and non-alphabetic words
    filtered_words = [word for word in words if word.isalpha() and word not in stop_words]
    
    return filtered_words


def count_keyword_frequency(keywords, file_path):
    filtered_words = preprocess_text(file_path)
    # Count occurrences of each keyword
    keyword_counter = Counter(word for word in filtered_words if word in keywords)
    
    # Format data as requested
    result = [{"word": word, "frequency": str(count)} for word, count in keyword_counter.items()]
    return result

def get_keyword_questions(csv_path, file_path):
    
    
    keywords = load_keywords(csv_path)
    result = count_keyword_frequency(keywords, file_path)
    
    return result



