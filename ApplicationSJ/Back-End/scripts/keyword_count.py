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

def extract_section(text, start_keyword, end_keyword=None):
    """
    Extract the section of the text between two keywords.
    """
    start_index = text.find(start_keyword)
    end_index = text.find(end_keyword, start_index) if end_keyword else len(text)
    
    if start_index != -1:
        return text[start_index:end_index].strip()
    return None

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

def get_keyword_frequency_by_section(file_path):
    # Open the text file and read its content
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()

    # Define the section titles based on your syllabus
    sections = {
        'CourseDescription': 'Course Description',
        'InstructorContact': 'Instructor Contact',
        'ClassCommunications': 'Class communications',
        'CourseObjectives': 'Course Objectives',
        'TeachingMethods': 'Teaching Methods',
        'StudentLearningOutcomes': 'Student Learning Outcomes',
        'Grading': 'Grading'
        
    }

    # Create a dictionary to store keyword frequencies for each section
    section_keywords = {}

    # Process each section and get keyword frequencies
    for section, start_keyword in sections.items():
        # Extract the section text
        section_text = extract_section(text, start_keyword)

        if section_text:
            # Process the section text to get keyword frequency
            section_keywords[section] = process_text(section_text)
    
    return section_keywords

# Example usage:
# file_path = '../media/text_uploads/sample_syllabus.txt'
# section_keywords = get_keyword_frequency_by_section(file_path)

# # Print the keyword frequency by section
# for section, keywords in section_keywords.items():
#     print(f"{section}: {keywords}")