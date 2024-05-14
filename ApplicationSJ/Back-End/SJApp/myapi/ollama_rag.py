from pathlib import Path
import bs4
from langchain import hub
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import (
    
    RunnablePassthrough,
)
from langchain_community.llms import Ollama
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.document_loaders import PyPDFLoader
import os
from django.conf import settings

BASE_DIR = Path(__file__).resolve().parent.parent

#### INDEXING ####
# Load Documents
# loader = WebBaseLoader(
#     web_paths=("https://lilianweng.github.io/posts/2023-06-23-agent/",),
#     bs_kwargs=dict(
#         parse_only=bs4.SoupStrainer(
#             class_=("post-content", "post-title", "post-header")
#         )
#     ),
# )
# docs = loader.load()

# Replace 'path/to/your/file.pdf' with the actual path to your PDF file
def run_llm():
    pdf_upload_path = os.path.join(os.path.join(BASE_DIR, 'media'), 'pdf_uploads')
    pdf_path = pdf_upload_path+'/file1.pdf'

    # Load the PDF file
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()

    # Split
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)

    # Embed
    model_path = "orca-mini"  # Replace with the path to your Llama model
    embeddings = OllamaEmbeddings(model=model_path)
    vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings)
    retriever = vectorstore.as_retriever()

    #### RETRIEVAL and GENERATION ####
    # Prompt
    prompt = hub.pull("rlm/rag-prompt")

    # LLM
    llm = Ollama(model=model_path)  # Replace with the path to your Llama model

    # Post-processing
    def format_docs(docs):
        
        val="\n\n".join(doc.page_content for doc in docs)
        #print(val);
        return val;

    # Chain
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    # Question
    result= rag_chain.invoke("Tell me what are the attendance requirements ?")

    print(result);

if __name__== "__main__":
    run_llm()

