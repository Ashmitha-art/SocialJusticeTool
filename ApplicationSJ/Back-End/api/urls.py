from django.urls import path
from . import views

urlpatterns = [
    path('hello-world/', views.hello_world, name='hello_world'),
    path('upload/', views.upload_file, name='upload_file'),
    path('keywords/', views.get_keywords, name='get_keywords'),
    path('keywords/questions/<int:questionId>/', views.get_keyword_questions, name='get_keyword_questions')
   
]