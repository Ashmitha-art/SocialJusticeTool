from django.urls import path
from . import views

urlpatterns = [
    path('hello-world/', views.hello_world, name='hello_world'),
    path('upload/', views.upload_file, name='upload_file'),
    path('search/', views.search_view, name='search_view'),
]