import os
import fitz  # PyMuPDF
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
import google.generativeai as genai
from chromadb import Documents, EmbeddingFunction, Embeddings
import chromadb
import re
from dotenv import load_dotenv
from myapi.summarize import summarize_text
import json

# NLTK sentiment analysis
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Pandas to save data to Excel
import pandas as pd

# Download the VADER lexicon and other necessary NLTK data
nltk.download('vader_lexicon')
nltk.download('punkt')
nltk.download('stopwords')

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

class GeminiEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("Gemini API Key not provided. Please provide GEMINI_API_KEY as an environment variable")
        genai.configure(api_key=gemini_api_key)
        model = "models/embedding-001"
        title = "Custom query"
        return genai.embed_content(model=model,
                                   content=input,
                                   task_type="retrieval_document",
                                   title=title)["embedding"]

def create_chroma_db(documents, path, name):
    chroma_db = chromadb.PersistentClient(path=path)
    collection = chroma_db.create_collection(name=name, embedding_function=GeminiEmbeddingFunction(), metadata={"key": "value"})

    for i, d in enumerate(documents):
        collection.add(
            documents=d,
            ids=str(i),
            metadatas={"docId": i}
        )

    return collection, name

def load_chroma_collection(path, name):
    chroma_client = chromadb.PersistentClient(path=path)
    db = chroma_client.get_collection(name=name, embedding_function=GeminiEmbeddingFunction())

    return db

def get_relevant_passage(query, db, n_results):
    passage = db.query(query_texts=[query], n_results=n_results)["documents"][0]
    return passage

def make_rag_prompt(query, relevant_passage):
    escaped = relevant_passage.replace("'", "").replace('"', "").replace("\n", " ")
    prompt = ("""You are a helpful and informative bot that answers questions using the context below \
    QUESTION: '{query}'
    CONTEXT: '{relevant_passage}'

    ANSWER:
    """).format(query=query, relevant_passage=escaped)

    return prompt

def generate_response(prompt):
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("Gemini API Key not provided. Please provide GEMINI_API_KEY as an environment variable")
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-pro')
    answer = model.generate_content(prompt)
    return answer.text

def generate_answer(db, query):
    # Retrieve top 3 relevant text chunks
    relevant_text = get_relevant_passage(query, db, n_results=4)
    prompt = make_rag_prompt(query, 
                             relevant_passage="".join(relevant_text)) # Joining the relevant chunks to create a single passage
    answer = generate_response(prompt)
    return answer

def read_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = fitz.open(file_path)
        number_of_pages = len(reader)
        
        text = ""
        for page_num in range(number_of_pages):
            page = reader.load_page(page_num)
            text += page.get_text()
        
        # Define subheadings
        subheadings = [
            'Course Description',
            'Instructor Contact'
            'Class Communications',
            'Course Objectives',
            'Teaching Methods',
            'Course Outcomes',
            'Grading',
            'Attendance policy'
        ]
        
        # Use regular expressions to split text based on subheadings
        pattern = '|'.join([re.escape(heading) for heading in subheadings])
        sections = re.split(f"({pattern})", text)
        
        # Create a dictionary to store sections based on subheadings
        section_data = {}
        current_section = None
        
        for part in sections:
            part = part.strip()
            if part in subheadings:
                current_section = part
                section_data[current_section] = ""
            elif current_section:
                section_data[current_section] += part + "\n"
        
    return section_data


def get_sentiment_data(section_data, output_excel_path="sentiment_analysis_results.xlsx", output_csv_path="sentiment_analysis_results.csv"):
    sid = SentimentIntensityAnalyzer()
    sentiment_data = []

    for heading, text in section_data.items():
        ss = sid.polarity_scores(text)
        sentiment_data.append({
            'subheading': heading,
            'text': text.strip(),
            'compound': ss['compound'],  # Overall sentiment score
            'pos': ss['pos'],
            'neu': ss['neu'],
            'neg': ss['neg']
        })

    # Save sentiment data to Excel and CSV files
    df = pd.DataFrame(sentiment_data)
    df.to_excel(output_excel_path, index=False)
    df.to_csv(output_csv_path, index=False)

    print(f"Sentiment analysis saved to {output_excel_path} and {output_csv_path}")
    return sentiment_data



def run_llm(query):
    
    pdf_upload_path ="/Users/supriya/SF state/research project/SocialJusticeTool/ApplicationSJ/Back-End/SJApp/media/pdf_uploads"
    pdf_path = pdf_upload_path+'/file1.pdf'

    # Load the PDF file
    reader = PdfReader(pdf_path)
    
     # Loop over each page and store it in a variable
    text = ""
    for page in reader.pages:
        text += page.extract_text()

    # Load and split the PDF into sections
    section_data = read_pdf(pdf_path)

    # Perform sentiment analysis on the sections
    sentiment_data = get_sentiment_data(section_data)
    print("Sentiment Data:", sentiment_data)

    # Initialize ChromaDB and add documents
    try:
        db = load_chroma_collection("\\", name="sjt")
    except Exception as e:
        db = None
  
    if db is None:
        db = create_chroma_db(documents=list(section_data.values()), path="\\", name="sjt")

    # Generate an answer using the LLM
    answer = generate_answer(db, query=query)
    return answer
