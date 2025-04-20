from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse, FileResponse
import os
from django.conf import settings
from scripts import keyword_count
import csv
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from collections import Counter
import pandas as pd
import re
from pathlib import Path
import PyPDF2
from rest_framework import status
import json
from collections import defaultdict
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Download required NLTK data (run once)
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('vader_lexicon')
nltk.download('punkt')

@api_view(['GET'])
def get_keywords(request):
    """
    API endpoint to extract keywords from the most recent PDF upload.
    
    Returns:
        Response: JSON response with keyword data or error message
    """
    upload_folder = './media/file_uploads/'
    output_folder = './media/keyword_results/'
    
    # Create output folder if it doesn't exist
    Path(output_folder).mkdir(parents=True, exist_ok=True)
    
    # Get the list of all files in the folder
    try:
        files = [f for f in os.listdir(upload_folder) if os.path.isfile(os.path.join(upload_folder, f))]
    except FileNotFoundError:
        return Response(
            {"error": f"Upload folder not found: {upload_folder}"},
            status=status.HTTP_404_NOT_FOUND
        )

    if not files:
        return Response(
            {"error": "No files found in the upload folder"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Sort files by modification date (newest first)
    files.sort(key=lambda f: os.path.getmtime(os.path.join(upload_folder, f)), reverse=True)

    # Pick the most recent file
    latest_file = files[0]
    file_path = os.path.join(upload_folder, latest_file)
    
    # Check if file is PDF
    if not file_path.lower().endswith('.pdf'):
        return Response(
            {"error": "Only PDF files are supported"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Extract keywords from the file
        keywords = _extract_keywords_from_pdf(file_path)
        
        # Define CSV file path for output
        output_filename = f"keywords_{os.path.splitext(latest_file)[0]}.csv"
        csv_path = os.path.join(output_folder, output_filename)
        
        # Save keywords to CSV
        _save_keywords_to_csv(keywords, csv_path)

        
        # Extract sections and keywords
        section_keywords = _extract_sections_and_keywords(file_path)
        
        # Define CSV file path for section keywords output
        section_output_filename = f"section_keywords_{os.path.splitext(latest_file)[0]}.csv"
        section_csv_path = os.path.join(output_folder, section_output_filename)
        
        # Save section keywords to CSV
        _save_section_keywords_to_csv(section_keywords, section_csv_path)
        
        return Response({
            "success": True,
            "message": f"Keywords extracted and saved to {csv_path}",
            "file_processed": latest_file,
            "csv_path": csv_path
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(str(e))
        return Response({
            "error": f"Error processing file: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def _extract_sections_and_keywords(file_path):
    """
    Private helper function to extract sections and keywords from a PDF file using LaTeX-style tags.
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        list: List of dictionaries containing section info and keywords
    """
    # Extract text from PDF
    text = ""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page_num in range(len(reader.pages)):
            text += reader.pages[page_num].extract_text() + "\n"
    
    # Extract sections
    sections = extract_sections_latex(text)
    
    if not sections:
        # Fallback: if no LaTeX sections found, treat entire document as one section
        sections = {"Document": text}
    
    # Get stop words (filler words)
    stop_words = set(stopwords.words('english'))
    
    # Add additional filler words
    additional_filler_words = {
        'also', 'etc', 'e.g', 'i.e', 'would', 'could', 'should', 'may', 
        'might', 'must', 'need', 'shall', 'will', 'can', 'due', 'using'
    }
    stop_words.update(additional_filler_words)
    
    # Process each section for keywords
    section_results = []
    for i, (section_name, section_text) in enumerate(sections.items()):
        # Tokenize words
        tokens = word_tokenize(section_text.lower())
        
        # Count total words (including stop words)
        total_words = len([word for word in tokens if word.isalpha()])
        
        # Remove punctuation, numbers, and short words
        filtered_words = [
            word for word in tokens 
            if word.isalpha() and     # Remove non-alphabetic tokens
            len(word) > 2 and         # Remove very short words
            word not in stop_words    # Remove stopwords
        ]
        
        # Count word frequencies
        word_counts = Counter(filtered_words)
        
        # Convert to list of (word, count) tuples, sorted by frequency
        keywords = [(word, count) for word, count in word_counts.most_common()]
        
        # Format keywords as a string: "word1 (count1), word2 (count2), ..."
        keyword_list = ", ".join([f"{word} ({count})" for word, count in keywords])
        
        section_results.append({
            "id": i,
            "name": section_name,
            "keyword_list": keyword_list,
            "num_words": total_words
        })
    
    return section_results

def extract_sections_latex(text):
    """
    Extract sections from text using LaTeX-style tags.
    
    Args:
        text: Text to extract sections from
        
    Returns:
        dict: Dictionary with section names as keys and section content as values
    """
    sections = {}
    # Regex to capture sections marked with \section{}
    matches = re.findall(r'\\section\{(.*?)\}(.*?)(?=\\section|$)', text, re.DOTALL)
    for title, content in matches:
        sections[title.strip()] = content.strip()
    return sections

def _save_section_keywords_to_csv(section_results, csv_path):
    """
    Private helper function to save section keywords to a CSV file in the format:
    Section Id, Section Name, KeywordList, NumberOf Words
    
    Args:
        section_results: List of dictionaries with section info and keywords
        csv_path: Path to save the CSV file
    """
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        # Write header
        writer.writerow(['Section Id', 'Section Name', 'KeywordList', 'NumberOf Words'])
        
        # Write data for each section
        for section in section_results:
            writer.writerow([
                section["id"],
                section["name"],
                section["keyword_list"],
                section["num_words"]
            ])
def _extract_keywords_from_pdf(file_path):
    """
    Private helper function to extract keywords from a PDF file, removing filler words.
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        list: Keywords sorted by frequency [(word, count), ...]
    """
    # Extract text from PDF
    text = ""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page_num in range(len(reader.pages)):
            text += reader.pages[page_num].extract_text() + "\n"
    
    # Tokenize words
    tokens = word_tokenize(text.lower())
    
    # Get stop words (filler words)
    stop_words = set(stopwords.words('english'))
    
    # Add additional filler words
    additional_filler_words = {
        'also', 'etc', 'e.g', 'i.e', 'would', 'could', 'should', 'may', 
        'might', 'must', 'need', 'shall', 'will', 'can', 'due', 'using'
    }
    stop_words.update(additional_filler_words)
    
    # Remove punctuation, numbers, and short words
    words = [
        word for word in tokens 
        if word.isalpha() and     # Remove non-alphabetic tokens
        len(word) > 2 and         # Remove very short words
        word not in stop_words    # Remove stopwords
    ]
    
    # Count word frequencies
    word_counts = Counter(words)
    
    # Convert to list of (word, count) tuples, sorted by frequency
    keywords = [(word, count) for word, count in word_counts.most_common()]
    
    return keywords

def _save_keywords_to_csv(keywords, csv_path):
    """
    Private helper function to save keywords to a CSV file.
    
    Args:
        keywords: List of (word, count) tuples
        csv_path: Path to save the CSV file
    """
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['Keyword', 'Frequency'])  # Header
        writer.writerows(keywords)  # Data


@api_view(['POST'])
def upload_file(request):
    if request.method == 'POST' and request.FILES.get('file'):
        uploaded_file = request.FILES['file']
        
        # Determine file type and set upload directory
        if uploaded_file.name.endswith('.pdf') or uploaded_file.name.endswith('.txt'):
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'file_uploads')
        else:
            return JsonResponse({'message': 'Only PDF and text files are accepted'}, status=400)
        
        # Save the file and return response
        file_path = save_file(uploaded_file, upload_dir)
        return JsonResponse({'message': f'{uploaded_file.name} uploaded successfully', 'file_path': file_path}, status=200)
    
    else:
        return JsonResponse({'message': 'No file provided'}, status=400)


def save_file(uploaded_file, upload_dir):
    """Helper function to save the uploaded file to the specified directory."""
    os.makedirs(upload_dir, exist_ok=True)  # Ensure the directory exists
    file_path = os.path.join(upload_dir, uploaded_file.name)  # Full file path
    
    # Save the file
    with open(file_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
    # Save keyword to database: todo
    
    return file_path

import os
import csv
import json
from collections import defaultdict
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import pandas as pd

# Download necessary NLTK resources
nltk.download('vader_lexicon')
nltk.download('punkt')
nltk.download('stopwords')

# Import NRC Emotion Lexicon (you'll need to download this separately)
# The NRC Emotion Lexicon is available at: http://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm
def load_nrc_lexicon(filepath):
    emotion_dict = defaultdict(lambda: defaultdict(float))
    with open(filepath, 'r', encoding='utf-8') as file:
        for line in file:
            if line.startswith('#'):
                continue
            word, emotion, value = line.strip().split('\t')
            emotion_dict[word][emotion] = float(value)
    return emotion_dict

@api_view(['GET'])
def dotplot(request):
    """
    API endpoint to generate a dotplot from the keyword data.
    
    Returns:
        Response: JSON response with dotplot data or error message
    """
    section_keywords = './media/keyword_results/section_keywords_sample_with_laTex.csv'
    nrc_lexicon_path = './media/NRCEmotionLexicon.txt'  # Update with actual path
    
    try:
        # Load the NRC Emotion Lexicon
        try:
            nrc_lexicon = load_nrc_lexicon(nrc_lexicon_path)
        except Exception as e:
            # Fallback: create a simple emotion lexicon for demo purposes
            nrc_lexicon = create_simple_emotion_lexicon()
        
        # Initialize sentiment analyzer
        sid = SentimentIntensityAnalyzer()
        
        # Check if file exists
        if not os.path.exists(section_keywords):
            return Response({
                "error": f"File not found: {section_keywords}"
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Read the CSV file
        df = pd.read_csv(section_keywords)
        
        # Process each section
        result = []
        for _, row in df.iterrows():
            section_name = row['Section Name']
            keyword_list = row['KeywordList'] 
            
            # Extract words and counts from the keyword list
            words_with_counts = []
            if keyword_list:
                parts = keyword_list.split(', ')
                for part in parts:
                    if '(' in part and ')' in part:
                        word = part.split(' (')[0].strip()
                        count = int(part.split('(')[1].split(')')[0])
                        words_with_counts.append((word, count))
            
            # Initialize emotion counters and scores
            emotion_data = {
                'trust': 0.0,
                'trust_count': 0,
                'joy': 0.0,
                'joy_count': 0,
                'fear': 0.0,
                'fear_count': 0,
                'surprise': 0.0,
                'surprise_count': 0,
                'senti_positive_count': 0,
                'senti_negative_count': 0,
                'senti_neutral_count': 0
            }
            
            # Process each word in the keyword list
            total_words = 0
            for word, count in words_with_counts:
                total_words += count
                
                # Get sentiment score
                sentiment = sid.polarity_scores(word)
                
                # Update sentiment counts
                if sentiment['compound'] > 0.05:
                    emotion_data['senti_positive_count'] += count
                elif sentiment['compound'] < -0.05:
                    emotion_data['senti_negative_count'] += count
                else:
                    emotion_data['senti_neutral_count'] += count
                
                # Get emotion scores from NRC lexicon
                if word in nrc_lexicon:
                    if 'trust' in nrc_lexicon[word] and nrc_lexicon[word]['trust'] > 0:
                        emotion_data['trust_count'] += count
                        emotion_data['trust'] += nrc_lexicon[word]['trust'] * count
                    
                    if 'joy' in nrc_lexicon[word] and nrc_lexicon[word]['joy'] > 0:
                        emotion_data['joy_count'] += count
                        emotion_data['joy'] += nrc_lexicon[word]['joy'] * count
                    
                    if 'fear' in nrc_lexicon[word] and nrc_lexicon[word]['fear'] > 0:
                        emotion_data['fear_count'] += count
                        emotion_data['fear'] += nrc_lexicon[word]['fear'] * count
                    
                    if 'surprise' in nrc_lexicon[word] and nrc_lexicon[word]['surprise'] > 0:
                        emotion_data['surprise_count'] += count
                        emotion_data['surprise'] += nrc_lexicon[word]['surprise'] * count
            
            # Normalize emotion scores
            if emotion_data['trust_count'] > 0:
                emotion_data['trust'] = round(emotion_data['trust'] / total_words, 2)
            
            if emotion_data['joy_count'] > 0:
                emotion_data['joy'] = round(emotion_data['joy'] / total_words, 2)
            
            if emotion_data['fear_count'] > 0:
                emotion_data['fear'] = round(emotion_data['fear'] / total_words, 2)
            
            if emotion_data['surprise_count'] > 0:
                emotion_data['surprise'] = round(emotion_data['surprise'] / total_words, 2)
            
            # Create the section data object
            section_data = {
                'state': section_name,
                **emotion_data
            }
            
            result.append(section_data)
        
        return Response(result, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            "error": f"Error processing file: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def create_simple_emotion_lexicon():
    """
    Create a simple emotion lexicon for demo purposes in case the NRC lexicon is not available.
    """
    emotion_dict = defaultdict(lambda: defaultdict(float))
    
    # Trust words
    trust_words = ['reliable', 'honest', 'truth', 'confidence', 'faith', 'believe', 'support', 'secure', 'stable']
    for word in trust_words:
        emotion_dict[word]['trust'] = 0.8
    
    # Joy words
    joy_words = ['happy', 'joy', 'delight', 'pleasure', 'excited', 'glad', 'cheerful', 'jubilation', 'elated']
    for word in joy_words:
        emotion_dict[word]['joy'] = 0.8
    
    # Fear words
    fear_words = ['afraid', 'fear', 'terror', 'dread', 'horror', 'panic', 'anxiety', 'worry', 'frightened']
    for word in fear_words:
        emotion_dict[word]['fear'] = 0.8
    
    # Surprise words
    surprise_words = ['surprise', 'amazed', 'astonished', 'unexpected', 'shocking', 'startled', 'stunned', 'wonder']
    for word in surprise_words:
        emotion_dict[word]['surprise'] = 0.8
    
    # Add some common academic/research words with their emotion associations
    research_words = {
        'research': {'trust': 0.6, 'joy': 0.2},
        'study': {'trust': 0.5},
        'analysis': {'trust': 0.5},
        'data': {'trust': 0.7},
        'method': {'trust': 0.6},
        'theory': {'trust': 0.4},
        'results': {'trust': 0.5, 'surprise': 0.3},
        'findings': {'trust': 0.5, 'surprise': 0.4},
        'experiment': {'trust': 0.6, 'joy': 0.2},
        'evidence': {'trust': 0.8},
        'significant': {'trust': 0.5, 'joy': 0.3},
        'discover': {'joy': 0.6, 'surprise': 0.7},
        'innovation': {'joy': 0.7, 'surprise': 0.6},
        'challenge': {'fear': 0.4},
        'risk': {'fear': 0.7},
        'error': {'fear': 0.5},
        'uncertainty': {'fear': 0.6},
        'unexpected': {'surprise': 0.8, 'fear': 0.3},
        'breakthrough': {'joy': 0.8, 'surprise': 0.7}
    }
    
    for word, emotions in research_words.items():
        for emotion, value in emotions.items():
            emotion_dict[word][emotion] = value
    
    return emotion_dict





    


