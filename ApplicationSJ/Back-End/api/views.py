from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.http import FileResponse
import os
from django.conf import settings
from scripts import keyword_count



@api_view(['GET'])
def hello_world(request):
    return Response({'message': 'Hello, world!'})

@api_view(['POST'])
def upload_file(request):
    if request.method == 'POST' and request.FILES.get('file'):
        uploaded_file = request.FILES['file']
        
        # Determine file type and set upload directory
        if uploaded_file.name.endswith('.pdf'):
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'pdf_uploads')
        elif uploaded_file.name.endswith('.txt'):
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'text_uploads')
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


@api_view(['GET'])
def get_keywords():
    file_path = '../media/text_uploads/sample_syllabus.txt'
    keywords = keyword_count.get_keyword_frequency_by_section(file_path)
    return Response(keywords)


    


