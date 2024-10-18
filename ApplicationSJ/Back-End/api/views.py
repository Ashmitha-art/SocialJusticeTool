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

def get_keywords(request):
    # Define the folder where the files are uploaded
    print("get_keywords",request)
    
    upload_folder = './media/file_uploads/'
    
    # Get the list of all files in the folder
    files = [f for f in os.listdir(upload_folder) if os.path.isfile(os.path.join(upload_folder, f))]

    if not files:
        return JsonResponse({"error": "No files found in the upload folder"}, status=400)

    # Sort files by modification date (newest first)
    files.sort(key=lambda f: os.path.getmtime(os.path.join(upload_folder, f)), reverse=True)

    # Pick the most recent file
    latest_file = files[0]
    file_path = os.path.join(upload_folder, latest_file)

    # Now use this file in your keyword processing function
    keywords = keyword_count.get_keywords(file_path)
    
    return JsonResponse(keywords, safe=False)

@api_view(['GET'])
def hello_world(request):
    return Response({'message': 'Hello, world!'})

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





    


