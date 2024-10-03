import os
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.probability import FreqDist
from nltk.tokenize.treebank import TreebankWordDetokenizer

# Ensure the required NLTK data files are downloaded
nltk.download('punkt')
nltk.download('stopwords')

def summarize_text(file_path):
    if not file_path:
        raise ValueError("The file path must be a valid string representing the path to the file.")
    
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()
    
    # Tokenize the text into sentences
    sentences = sent_tokenize(text)
    
    # Tokenize the text into words
    words = word_tokenize(text.lower())
    
    # Remove stop words and punctuation
    stop_words = set(stopwords.words('english'))
    filtered_words = [word for word in words if word.isalnum() and word not in stop_words]
    
    # Compute word frequency distribution
    freq_dist = FreqDist(filtered_words)
    
    # Get the most common words
    most_common_words = [word for word, freq in freq_dist.most_common(100)]
    
    # Score sentences based on the occurrence of the most common words
    sentence_scores = {}
    for sentence in sentences:
        sentence_words = word_tokenize(sentence.lower())
        score = sum(1 for word in sentence_words if word in most_common_words)
        sentence_scores[sentence] = score
    
    # Sort sentences by score and select the top 5 sentences
    summarized_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:5]
    
    # Join the summarized sentences into a single text
    summary = TreebankWordDetokenizer().detokenize(summarized_sentences)
    
    return summary

