from django.urls import path
from . import views

urlpatterns = [
    path('folders/', views.folders_list),
    path('folders/create/', views.create_folder),
    path('folders/<str:folder_name>/', views.delete_folder_view),
    path('files/<str:prefix>/', views.files_by_prefix),
    path('files/upload/<str:folder>/', views.upload_file_to_folder),
    path('files/delete/<path:file_path>/', views.delete_file_view),
    path('files/preview/<path:file_path>/', views.file_preview),
]