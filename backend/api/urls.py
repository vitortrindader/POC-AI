from django.urls import path
from . import views

urlpatterns = [
    path('folders/', views.folders_list, name='folders-list'),
]