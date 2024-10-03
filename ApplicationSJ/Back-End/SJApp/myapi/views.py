from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.http import FileResponse
import os
from django.conf import settings

from myapi.gemini_rag import run_llm 

@api_view(['GET'])
def search_view(request):
    query = request.GET.get('query', '')
    if not query:
        return JsonResponse({'error': 'Query parameter is required'}, status=400)
    
    # Run the LLM function with the provided query
    answer = run_llm(query=query)
    
    return JsonResponse({'answer': answer})

@api_view(['GET'])
def hello_world(request):
    return Response({'message': 'Hello, world!'})

@api_view(['POST'])
def upload_file(request):
    if request.method == 'POST' and request.FILES.get('file'):
        uploaded_file = request.FILES['file']
        
        # Check if the file is a PDF
        if uploaded_file.name.endswith('.pdf'):
            # Define the path where you want to store the PDF files
            pdf_upload_path = os.path.join(settings.MEDIA_ROOT, 'pdf_uploads')
            
            # Create the directory if it doesn't exist
            os.makedirs(pdf_upload_path, exist_ok=True)
            
            # Construct the full path for the uploaded PDF file
            file_path = os.path.join(pdf_upload_path, uploaded_file.name)
            
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)
            
            return JsonResponse({'message': 'PDF file uploaded successfully', 'file_path': file_path}, status=200)
        else:
            return JsonResponse({'message': 'Only PDF files are accepted'}, status=400)
    else:
        return JsonResponse({'message': 'No file provided'}, status=400)
    


