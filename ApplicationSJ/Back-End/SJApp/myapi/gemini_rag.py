import os
from pypdf import PdfReader
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
import google.generativeai as genai
from chromadb import Documents, EmbeddingFunction, Embeddings
import chromadb
import re
from dotenv import load_dotenv

# NLTK sentiment analysis
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Download the VADER lexicon
nltk.download('vader_lexicon')

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

def run_llm(query):
    pdf_upload_path = os.getenv("PDF_UPLOAD_PATH")
    pdf_file_name = os.getenv("PDF_FILE_NAME")

    if not pdf_upload_path or not pdf_file_name:
        raise ValueError("PDF_UPLOAD_PATH or PDF_FILE_NAME not provided. Please provide them as environment variables")

    # Ensure the path is absolute
    pdf_upload_path = os.path.abspath(pdf_upload_path)
    pdf_path = os.path.join(pdf_upload_path, pdf_file_name)

    # Load the PDF file
    reader = PdfReader(pdf_path)
    
    # Loop over each page and store it in a variable
    text = ""
    for page in reader.pages:
        text += page.extract_text()

    # Initialize the VADER sentiment intensity analyzer
    sid = SentimentIntensityAnalyzer()

    scores = sid.polarity_scores(text)
    
    print(scores)

    # Split
    split_text = re.split('\n \n', text)
    splits = [i for i in split_text if i != ""]

    gen_answer_var = None

    try:
        db = load_chroma_collection("\\", name="sjt")
        gen_answer_var = db
    except Exception as e:
        db = None
  
    if db is None:
        db = create_chroma_db(documents=splits, path="\\", name="sjt")
        gen_answer_var = db[0]

    answer = generate_answer(gen_answer_var, query=query)
    return answer


