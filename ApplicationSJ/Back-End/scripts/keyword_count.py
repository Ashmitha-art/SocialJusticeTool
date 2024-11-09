import nltk
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('omw-1.4')
nltk.download('stopwords')
from nltk.tokenize import word_tokenize
from nltk.probability import FreqDist
import re
from nltk.corpus import stopwords
import PyPDF2
import os
import openai  # Ensure the OpenAI package is installed (pip install openai)
from nrclex import NRCLex

# Set your OpenAI API key here

openai.api_key = "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"
def extract_sections(text):
    """
    Extract all sections and their corresponding text between LaTeX \section{} tags.
    """
    # Regex pattern to match sections in LaTeX format (\section{})
    section_pattern = r'\\section\{(.+?)\}'
   
    # Find all section titles
    section_titles = re.findall(section_pattern, text)
    
    # Split the text at each section title
    sections = re.split(section_pattern, text)
    
    # Create a dictionary to store each section's content
    section_dict = {}

    # Loop through the titles and their corresponding content
    for i in range(1, len(sections), 2):  # Start at index 1 for section titles
        title = sections[i]
        content = sections[i + 1].strip() if i + 1 < len(sections) else ''
        section_dict[title] = content
    
    return section_dict

def process_text(text):
    """
    Tokenize the text, filter stopwords and non-alphabetic tokens, and return keyword frequencies.
    """
    # Tokenize the text
    words = word_tokenize(text)

    # Load stop words
    stop_words = set(stopwords.words('english'))

    # Filter out stop words and non-alphabetic tokens
    keywords = [word.lower() for word in words if word.isalpha() and word.lower() not in stop_words]

    # Calculate frequency distribution
    fdist = FreqDist(keywords)

    # Return top 25 keywords in a list of dict format
    return [{"word": word, "frequency": count} for word, count in fdist.most_common(25)]

def openai_keyword_extraction(text):
    """
    Use OpenAI API to extract keywords from the given text.
    """
    try:
        response = openai.Completion.create(
            model="gpt-3.5-turbo",
            prompt=f"Extract the main keywords from the following text:\n\n{text}",
            max_tokens=100,
            n=1,
            stop=None,
            temperature=0.3,
        )
        keywords = response.choices[0].text.strip().split(',')
        return [{"word": keyword.strip(), "frequency": 1} for keyword in keywords]  # OpenAI provides keywords, but we can assume frequency 1
    except Exception as e:
        print(f"Error during OpenAI keyword extraction: {e}")
        return []

def get_keywords(file_path):
    

    text = ''
    
    if file_path.endswith('.pdf'):
        # Open the PDF file
        with open(file_path, 'rb') as file:
            # Create a PDF file reader
            pdf = PyPDF2.PdfReader(file)
            
            # Loop through each page and extract text
            for page_num in range(len(pdf.pages)):
                page = pdf.pages[page_num]
                text += page.extract_text()
                
    elif file_path.endswith('.txt'):
        # Try reading the text file with utf-8 encoding
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()
        except UnicodeDecodeError:
            # If utf-8 fails, attempt reading with a different encoding
            try:
                with open(file_path, 'r', encoding='iso-8859-1') as file:
                    text = file.read()
            except Exception as e:
                print(f"Error reading file with alternative encoding: {e}")
                return {}

    # Extract sections based on LaTeX-style tags (\section{})
    sections = extract_sections(text)

    # Create a dictionary to store keyword frequencies for each section
    section_keywords = {}

    # Process each section and get keyword frequencies
    for section_title, section_text in sections.items():
        if section_text:
            # Try OpenAI keyword extraction first
            openai_keywords = openai_keyword_extraction(section_text)
            if openai_keywords:
                section_keywords[section_title] = openai_keywords
            else:
                # Fallback to NLTK-based keyword extraction if OpenAI fails
                # print("Not working")
                section_keywords[section_title] = process_text(section_text)
                emotion = NRCLex(section_text)
            print(section_title)
            print(emotion.raw_emotion_scores)
            print(emotion.affect_frequencies)
    return section_keywords



# # Print the keyword frequency by section
# for section, keywords in section_keywords.items():
#     print(f"{section}: {keywords}")
