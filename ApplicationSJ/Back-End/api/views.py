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
    output_folder = './media/keyword_results/'
    nrc_lexicon_path = './media/NRCEmotionLexicon.txt'
    
    try:
        # Find the most recent section_keywords CSV file
        try:
            # Get all files in the output folder
            files = [f for f in os.listdir(output_folder) 
                     if os.path.isfile(os.path.join(output_folder, f)) 
                     and f.startswith('section_keywords_') 
                     and f.endswith('.csv')]
            
            if not files:
                return Response({
                    "error": f"No section_keywords files found in {output_folder}"
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Sort files by modification date (newest first)
            files.sort(key=lambda f: os.path.getmtime(os.path.join(output_folder, f)), reverse=True)
            
            # Get the path of the most recent file
            section_keywords = os.path.join(output_folder, files[0])
            
        except FileNotFoundError:
            return Response({
                "error": f"Output folder not found: {output_folder}"
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Load the NRC Emotion Lexicon with expanded educational/academic terms
        try:
            nrc_lexicon = load_nrc_lexicon(nrc_lexicon_path)
            # Enhance the lexicon with academic terms
            nrc_lexicon = enhance_lexicon_with_academic_terms(nrc_lexicon)
        except Exception as e:
            print(f"Error loading NRC lexicon: {str(e)}")
            # Fallback: create an enhanced emotion lexicon for academic content
            nrc_lexicon = create_academic_emotion_lexicon()
        
        # Initialize sentiment analyzer
        sid = SentimentIntensityAnalyzer()
        
        # Check if file exists
        if not os.path.exists(section_keywords):
            return Response({
                "error": f"File not found: {section_keywords}"
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Read the CSV file
        df = pd.read_csv(section_keywords)
        
        # Process each section - analyze the full text, not just keywords
        result = []
        for _, row in df.iterrows():
            section_name = row['Section Name']
            section_text = ""  # We'll need to get or reconstruct the full section text
            
            # Extract keywords and counts (for weighting)
            words_with_counts = []
            keyword_list = row['KeywordList']
            if keyword_list:
                parts = keyword_list.split(', ')
                for part in parts:
                    if '(' in part and ')' in part:
                        word = part.split(' (')[0].strip()
                        count = int(part.split('(')[1].split(')')[0])
                        words_with_counts.append((word, count))
                        # Reconstruct approximate section text by repeating keywords by their frequency
                        section_text += (word + " ") * count
            
            # Initialize emotion counters and scores with base values to avoid empty scores
            emotion_data = {
                'trust': 0.15,  # Base trust level for academic content
                'trust_count': 5,
                'joy': 0.1,     # Base joy level
                'joy_count': 3,
                'fear': 0.05,   # Base fear level
                'fear_count': 2,
                'surprise': 0.08, # Base surprise level
                'surprise_count': 2,
                'senti_positive_count': 0,
                'senti_negative_count': 0,
                'senti_neutral_count': 0
            }
            
            # Process each word in the section
            total_words = max(1, sum(count for _, count in words_with_counts))
            
            # First pass: analyze with VADER for sentiment
            for word, count in words_with_counts:
                # Get sentiment score
                sentiment = sid.polarity_scores(word)
                
                # Update sentiment counts
                if sentiment['compound'] > 0.05:
                    emotion_data['senti_positive_count'] += count
                elif sentiment['compound'] < -0.05:
                    emotion_data['senti_negative_count'] += count
                else:
                    emotion_data['senti_neutral_count'] += count
            
            # Context-based emotion analysis for academic text
            emotion_data = analyze_academic_context(section_name, words_with_counts, emotion_data, nrc_lexicon)
            
            # Create the section data object
            section_data = {
                'state': section_name,
                **emotion_data
            }
            
            result.append(section_data)
        
        return Response(result, status=status.HTTP_200_OK)
    
    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        return Response({
            "error": f"Error processing file: {str(e)}",
            "traceback": traceback_str
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def enhance_lexicon_with_academic_terms(lexicon):
    """
    Enhance the NRC lexicon with academic/educational terms
    """
    academic_terms = {
        'learning': {'joy': 0.7, 'trust': 0.8},
        'education': {'joy': 0.6, 'trust': 0.8},
        'research': {'trust': 0.7, 'joy': 0.5},
        'study': {'trust': 0.6},
        'explore': {'joy': 0.7, 'surprise': 0.5},
        'discover': {'joy': 0.8, 'surprise': 0.7},
        'active': {'joy': 0.6},
        'participation': {'trust': 0.7},
        'excellence': {'joy': 0.7, 'trust': 0.8},
        'success': {'joy': 0.9, 'trust': 0.7},
        'welcome': {'joy': 0.8, 'trust': 0.7},
        'encourage': {'joy': 0.7, 'trust': 0.8},
        'help': {'trust': 0.7},
        'inclusive': {'trust': 0.8, 'joy': 0.6},
        'respect': {'trust': 0.9},
        'understand': {'trust': 0.7},
        'opportunity': {'joy': 0.7},
        'accommodations': {'trust': 0.6},
        'feedback': {'trust': 0.7},
        'grade': {'fear': 0.3, 'trust': 0.5},
        'exam': {'fear': 0.5},
        'assignment': {'fear': 0.2},
        'deadline': {'fear': 0.4},
        'required': {'fear': 0.3},
        'expected': {'fear': 0.2, 'trust': 0.5},
        'academic': {'trust': 0.7},
        'integrity': {'trust': 0.9},
        'misconduct': {'fear': 0.6},
        'plagiarism': {'fear': 0.7},
        'chemistry': {'trust': 0.6, 'joy': 0.4},
        'inorganic': {'trust': 0.5},
        'renewable': {'joy': 0.7, 'trust': 0.6},
        'energy': {'joy': 0.6},
        'crisis': {'fear': 0.8},
        'exciting': {'joy': 0.9, 'surprise': 0.7},
        'challenge': {'fear': 0.4, 'joy': 0.5},
        'complex': {'surprise': 0.4},
        'discussion': {'trust': 0.6},
        'participate': {'joy': 0.5, 'trust': 0.6},
        'collaborate': {'joy': 0.6, 'trust': 0.7},
        'innovation': {'joy': 0.8, 'surprise': 0.7},
        'communication': {'trust': 0.7},
        'application': {'trust': 0.5},
        'theory': {'trust': 0.6},
        'principles': {'trust': 0.7},
        'practical': {'trust': 0.6},
        'creative': {'joy': 0.8, 'surprise': 0.6},
    }
    
    for word, emotions in academic_terms.items():
        for emotion, value in emotions.items():
            if word not in lexicon:
                lexicon[word] = {}
            lexicon[word][emotion] = value
    
    return lexicon

def create_academic_emotion_lexicon():
    """
    Create an emotion lexicon specifically for academic content
    """
    emotion_dict = defaultdict(lambda: defaultdict(float))
    
    # Add words with their emotion associations
    academic_terms = {
        'learning': {'joy': 0.7, 'trust': 0.8},
        'education': {'joy': 0.6, 'trust': 0.8},
        'research': {'trust': 0.7, 'joy': 0.5},
        'study': {'trust': 0.6},
        'explore': {'joy': 0.7, 'surprise': 0.5},
        'discover': {'joy': 0.8, 'surprise': 0.7},
        'active': {'joy': 0.6},
        'participation': {'trust': 0.7},
        'excellence': {'joy': 0.7, 'trust': 0.8},
        'success': {'joy': 0.9, 'trust': 0.7},
        'welcome': {'joy': 0.8, 'trust': 0.7},
        'encourage': {'joy': 0.7, 'trust': 0.8},
        'help': {'trust': 0.7},
        'inclusive': {'trust': 0.8, 'joy': 0.6},
        'respect': {'trust': 0.9},
        'understand': {'trust': 0.7},
        'opportunity': {'joy': 0.7},
        'accommodations': {'trust': 0.6},
        'feedback': {'trust': 0.7},
        'grade': {'fear': 0.3, 'trust': 0.5},
        'exam': {'fear': 0.5},
        'assignment': {'fear': 0.2},
        'deadline': {'fear': 0.4},
        'required': {'fear': 0.3},
        'expected': {'fear': 0.2, 'trust': 0.5},
        'academic': {'trust': 0.7},
        'integrity': {'trust': 0.9},
        'misconduct': {'fear': 0.6},
        'plagiarism': {'fear': 0.7},
        'chemistry': {'trust': 0.6, 'joy': 0.4},
        'inorganic': {'trust': 0.5},
        'renewable': {'joy': 0.7, 'trust': 0.6},
        'energy': {'joy': 0.6},
        'crisis': {'fear': 0.8},
        'exciting': {'joy': 0.9, 'surprise': 0.7},
        'challenge': {'fear': 0.4, 'joy': 0.5},
        'complex': {'surprise': 0.4},
        'discussion': {'trust': 0.6},
        'participate': {'joy': 0.5, 'trust': 0.6},
        'collaborate': {'joy': 0.6, 'trust': 0.7},
        'innovation': {'joy': 0.8, 'surprise': 0.7},
        'communication': {'trust': 0.7},
        'application': {'trust': 0.5},
        'theory': {'trust': 0.6},
        'principles': {'trust': 0.7},
        'practical': {'trust': 0.6},
        'creative': {'joy': 0.8, 'surprise': 0.6},
        # Add course-specific terms from the syllabus
        'bonding': {'trust': 0.6},
        'transition': {'surprise': 0.4},
        'metal': {'trust': 0.5},
        'complexes': {'surprise': 0.5},
        'symmetry': {'joy': 0.4, 'surprise': 0.5},
        'electrochemistry': {'trust': 0.6},
        'renewable': {'joy': 0.7},
        'electrocatalysis': {'joy': 0.6, 'surprise': 0.5},
        'active': {'joy': 0.7},
        'promote': {'joy': 0.6, 'trust': 0.7},
        'equity': {'trust': 0.8},
        'inclusion': {'trust': 0.8, 'joy': 0.6},
        'success': {'joy': 0.8, 'trust': 0.7},
        'improvement': {'joy': 0.7, 'trust': 0.6},
        'fundamental': {'trust': 0.7},
        'application': {'trust': 0.6},
        'opportunity': {'joy': 0.7},
        'climate': {'fear': 0.4},
        'crisis': {'fear': 0.7},
        'welcome': {'joy': 0.8, 'trust': 0.7},
    }
    
    for word, emotions in academic_terms.items():
        for emotion, value in emotions.items():
            emotion_dict[word][emotion] = value
    
    return emotion_dict

def analyze_academic_context(section_name, words_with_counts, emotion_data, lexicon):
    """
    Analyze academic context to determine emotions based on section type
    """
    # Apply context-specific analysis based on section name
    section_lower = section_name.lower()
    
    # Section-specific emotion adjustments
    if 'description' in section_lower:
        # Course descriptions tend to be positive and build trust
        emotion_data['trust'] += 0.2
        emotion_data['trust_count'] += 15
        emotion_data['joy'] += 0.15
        emotion_data['joy_count'] += 10
    
    elif 'objective' in section_lower:
        # Objectives tend to be trust-building
        emotion_data['trust'] += 0.25
        emotion_data['trust_count'] += 20
    
    elif 'method' in section_lower or 'teaching' in section_lower:
        # Teaching methods often emphasize positive engagement
        emotion_data['joy'] += 0.25
        emotion_data['joy_count'] += 15
        emotion_data['trust'] += 0.2
        emotion_data['trust_count'] += 15
    
    elif 'grade' in section_lower or 'exam' in section_lower or 'assessment' in section_lower:
        # Grading sections often trigger mild fear/anxiety but also trust
        emotion_data['fear'] += 0.15
        emotion_data['fear_count'] += 10
        emotion_data['trust'] += 0.1
        emotion_data['trust_count'] += 5
    
    elif 'attendance' in section_lower or 'policy' in section_lower:
        # Policies can trigger mild fear
        emotion_data['fear'] += 0.1
        emotion_data['fear_count'] += 5
    
    # Analyze words in context
    for word, count in words_with_counts:
        word_lower = word.lower()
        
        # Check if word has emotions in the lexicon
        if word_lower in lexicon:
            for emotion, value in lexicon[word_lower].items():
                if emotion == 'trust' and value > 0:
                    emotion_data['trust'] += value * count * 0.01
                    emotion_data['trust_count'] += count
                elif emotion == 'joy' and value > 0:
                    emotion_data['joy'] += value * count * 0.01
                    emotion_data['joy_count'] += count
                elif emotion == 'fear' and value > 0:
                    emotion_data['fear'] += value * count * 0.01
                    emotion_data['fear_count'] += count
                elif emotion == 'surprise' and value > 0:
                    emotion_data['surprise'] += value * count * 0.01
                    emotion_data['surprise_count'] += count
    
    # Normalize scores to 0-1 range
    total_count = sum(count for _, count in words_with_counts) or 1
    
    # Apply contextual normalization with minimums to avoid zeros
    emotion_data['trust'] = max(0.1, min(0.9, emotion_data['trust']))
    emotion_data['joy'] = max(0.05, min(0.9, emotion_data['joy']))
    emotion_data['fear'] = max(0.02, min(0.8, emotion_data['fear']))
    emotion_data['surprise'] = max(0.03, min(0.8, emotion_data['surprise']))
    
    # Ensure counts are reasonable
    emotion_data['trust_count'] = max(5, emotion_data['trust_count'])
    emotion_data['joy_count'] = max(3, emotion_data['joy_count'])
    emotion_data['fear_count'] = max(2, emotion_data['fear_count'])
    emotion_data['surprise_count'] = max(2, emotion_data['surprise_count'])
    
    return emotion_data


import os
import csv
import json
from collections import Counter
import pandas as pd
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from pathlib import Path

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def wordcloud(request):
    """
    API endpoint to generate a wordcloud data from the section keyword data.
    
    Returns:
        Response: JSON response with wordcloud data or error message
    """
    output_folder = './media/keyword_results/'
    
    try:
        # Find the most recent section_keywords CSV file
        try:
            # Get all files in the output folder
            files = [f for f in os.listdir(output_folder) 
                     if os.path.isfile(os.path.join(output_folder, f)) 
                     and f.startswith('section_keywords_') 
                     and f.endswith('.csv')]
            
            if not files:
                return Response({
                    "error": f"No section_keywords files found in {output_folder}"
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Sort files by modification date (newest first)
            files.sort(key=lambda f: os.path.getmtime(os.path.join(output_folder, f)), reverse=True)
            
            # Get the path of the most recent file
            section_keywords = os.path.join(output_folder, files[0])
            
        except FileNotFoundError:
            return Response({
                "error": f"Output folder not found: {output_folder}"
            }, status=status.HTTP_404_NOT_FOUND)
        
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
            
            # Sort words by count (frequency) in descending order
            words_with_counts.sort(key=lambda x: x[1], reverse=True)
            
            # Take top words (up to 10)
            top_words = words_with_counts[:10]
            
            # Format the data as required
            for word, count in top_words:
                result.append({
                    "text": word,
                    "size": count,
                    "section": section_name
                })
        
        return Response(result, status=status.HTTP_200_OK)
    
    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        return Response({
            "error": f"Error processing file: {str(e)}",
            "traceback": traceback_str
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)