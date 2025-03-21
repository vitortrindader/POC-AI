from google.cloud import storage
from django.conf import settings
import os

def get_folders_list():
    """Recupera a lista de pastas do arquivo no Google Cloud Storage"""
    try:
        storage_client = storage.Client.from_service_account_json(
            settings.GOOGLE_CLOUD_CREDENTIALS
        )
        
        bucket = storage_client.bucket(settings.GOOGLE_CLOUD_BUCKET_NAME)
        blob = bucket.blob('pastas.txt')
        
        content = blob.download_as_text()
        folders = [line.strip() for line in content.split('\n') if line.strip()]
        
        return folders
    except Exception as e:
        print(f"Erro ao buscar pastas: {str(e)}")
        raise