import nltk
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('omw-1.4')
nltk.download('stopwords') 
from nltk.tokenize import word_tokenize
from nltk.probability import FreqDist
import re
from nltk.corpus import stopwords
from nltk.probability import FreqDist
import PyPDF2

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
        # Open the text file and read its content
        with open(file_path, 'r', encoding='utf-8') as file:
            text = file.read()

    # Extract sections based on LaTeX-style tags (\section{})
    sections = extract_sections(text)

    # Create a dictionary to store keyword frequencies for each section
    section_keywords = {}

    # Process each section and get keyword frequencies
    for section_title, section_text in sections.items():
        print(section_title)
        if section_text:
            # Process the section text to get keyword frequency
            section_keywords[section_title] = process_text(section_text)
    
    return section_keywords

# Example usage:
# file_path = 'file1.pdf'
# section_keywords = get_keywords(file_path)

# # Print the keyword frequency by section
# for section, keywords in section_keywords.items():
#     print(f"{section}: {keywords}")
