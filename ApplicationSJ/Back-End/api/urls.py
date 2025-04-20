from django.urls import path
from . import views

urlpatterns = [

    path('upload/', views.upload_file, name='upload_file'),
    path('keywords/', views.get_keywords, name='get_keywords'),
    path('dotplot/', views.dotplot, name='dotplot'),
   
]