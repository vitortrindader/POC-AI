import datetime
from google.cloud import storage
from django.conf import settings
import logging
import mimetypes

logger = logging.getLogger(__name__)

def get_folders_list():
    """Recupera a lista de pastas do bucket"""
    try:
        storage_client = storage.Client.from_service_account_json(
            settings.GOOGLE_CLOUD_CREDENTIALS
        )
        
        bucket = storage_client.bucket(settings.GOOGLE_CLOUD_BUCKET_NAME)
        blobs = list(bucket.list_blobs())
        
        folders = set()
        for blob in blobs:
            path_parts = blob.name.split('/')
            if len(path_parts) > 1:
                folders.add(path_parts[0])
        
        return sorted(list(folders))
    except Exception as e:
        logger.error(f"Erro ao listar pastas: {str(e)}")
        raise

def add_new_folder(folder_name):
    """Cria uma nova pasta no bucket"""
    try:
        storage_client = storage.Client.from_service_account_json(
            settings.GOOGLE_CLOUD_CREDENTIALS
        )
        
        bucket = storage_client.bucket(settings.GOOGLE_CLOUD_BUCKET_NAME)
        blob = bucket.blob(f"{folder_name}/.keep")
        blob.upload_from_string('')
        
        return folder_name
    except Exception as e:
        logger.error(f"Erro ao criar pasta: {str(e)}")
        raise

def get_files_by_prefix(prefix):
    """Recupera todos os arquivos com um determinado prefixo"""
    try:
        storage_client = storage.Client.from_service_account_json(
            settings.GOOGLE_CLOUD_CREDENTIALS
        )
        
        bucket = storage_client.bucket(settings.GOOGLE_CLOUD_BUCKET_NAME)
        blobs = bucket.list_blobs(prefix=prefix)
        
        files = []
        for blob in blobs:
            if not blob.name.endswith('/.keep'):
                # Forçar o content_type se não estiver definido
                if not blob.content_type:
                    blob.content_type = guess_content_type(blob.name)
                    blob.patch()

                files.append({
                    'name': blob.name,
                    'size': blob.size,
                    'updated': blob.updated.isoformat(),
                    'type': 'file',
                    'content_type': blob.content_type,
                    'path': blob.name
                })
        
        return files
    except Exception as e:
        logger.error(f"Erro ao buscar arquivos: {str(e)}")
        raise

def guess_content_type(filename):
    """Tenta adivinhar o content type baseado na extensão do arquivo"""
    content_type, _ = mimetypes.guess_type(filename)
    return content_type or 'application/octet-stream'

def delete_folder(folder_name):
    """Deleta uma pasta e todos os seus arquivos"""
    try:
        storage_client = storage.Client.from_service_account_json(
            settings.GOOGLE_CLOUD_CREDENTIALS
        )
        
        bucket = storage_client.bucket(settings.GOOGLE_CLOUD_BUCKET_NAME)
        blobs = bucket.list_blobs(prefix=f"{folder_name}/")
        
        for blob in blobs:
            blob.delete()
            
        return True
    except Exception as e:
        logger.error(f"Erro ao deletar pasta: {str(e)}")
        raise

def delete_file(file_path):
    """Deleta um arquivo específico"""
    try:
        storage_client = storage.Client.from_service_account_json(
            settings.GOOGLE_CLOUD_CREDENTIALS
        )
        
        bucket = storage_client.bucket(settings.GOOGLE_CLOUD_BUCKET_NAME)
        blob = bucket.blob(file_path)
        blob.delete()
        
        return True
    except Exception as e:
        logger.error(f"Erro ao deletar arquivo: {str(e)}")
        raise

def upload_file(folder_name, file_obj, file_name):
    """Upload de arquivo para uma pasta específica"""
    try:
        storage_client = storage.Client.from_service_account_json(
            settings.GOOGLE_CLOUD_CREDENTIALS
        )
        
        bucket = storage_client.bucket(settings.GOOGLE_CLOUD_BUCKET_NAME)
        blob_name = f"{folder_name}/{file_name}"
        blob = bucket.blob(blob_name)
        
        blob.upload_from_file(file_obj)
        
        return {
            'name': blob_name,
            'size': blob.size,
            'updated': blob.updated.isoformat(),
            'type': 'file',
            'content_type': blob.content_type,
            'path': blob_name
        }
    except Exception as e:
        logger.error(f"Erro ao fazer upload do arquivo: {str(e)}")
        raise

def get_file_preview(file_path):
    """Recupera o conteúdo do arquivo para preview"""
    try:
        storage_client = storage.Client.from_service_account_json(
            settings.GOOGLE_CLOUD_CREDENTIALS
        )
        
        bucket = storage_client.bucket(settings.GOOGLE_CLOUD_BUCKET_NAME)
        blob = bucket.blob(file_path)
        
        # Garantir que temos um content_type
        if not blob.content_type:
            blob.content_type = guess_content_type(file_path)
            blob.patch()
        
        # Gerar URL assinada temporária para arquivos de mídia e PDFs
        if (blob.content_type and (
            blob.content_type.startswith(('image/', 'video/', 'audio/')) or
            blob.content_type == 'application/pdf'
        )):
            url = blob.generate_signed_url(
                version="v4",
                expiration=datetime.timedelta(minutes=15),
                method="GET"
            )
            return {
                'type': 'media',
                'url': url,
                'content_type': blob.content_type
            }
        
        # Para arquivos de texto, retornar o conteúdo
        if blob.content_type and (
            blob.content_type.startswith('text/') or 
            blob.content_type in ['application/json', 'application/xml']
        ):
            content = blob.download_as_string().decode('utf-8')
            return {
                'type': 'text',
                'content': content,
                'content_type': blob.content_type
            }
            
        # Para outros tipos de arquivo, retornar apenas metadados
        return {
            'type': 'other',
            'content_type': blob.content_type,
            'size': blob.size,
            'name': blob.name
        }
        
    except Exception as e:
        logger.error(f"Erro ao gerar preview do arquivo: {str(e)}")
        raise