from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import (
    get_folders_list, 
    get_files_by_prefix, 
    add_new_folder, 
    upload_file, 
    delete_folder, 
    delete_file,
    get_file_preview  # Adicione esta linha
)
import urllib.parse
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
def folders_list(request):
    try:
        folders = get_folders_list()
        return Response(folders)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def create_folder(request):
    try:
        folder_name = request.data.get('folder_name')
        if not folder_name:
            return Response(
                {'error': 'Nome da pasta é obrigatório'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        new_folder = add_new_folder(folder_name)
        return Response({'folder': new_folder}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def files_by_prefix(request, prefix):
    try:
        files = get_files_by_prefix(prefix)
        return Response(files)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def upload_file_to_folder(request, folder):
    try:
        if 'file' not in request.FILES:
            return Response(
                {'error': 'Nenhum arquivo enviado'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        file_obj = request.FILES['file']
        file_info = upload_file(folder, file_obj, file_obj.name)
        return Response(file_info, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def delete_folder_view(request, folder_name):
    try:
        delete_folder(folder_name)
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def delete_file_view(request, file_path):
    try:
        delete_file(file_path)
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def file_preview(request, file_path):
    """
    Retorna uma URL assinada ou o conteúdo do arquivo para preview
    """
    try:
        # Decodificar o caminho do arquivo
        decoded_path = '/'.join(urllib.parse.unquote(part) for part in file_path.split('/'))
        preview_data = get_file_preview(decoded_path)
        
        return Response({
            'type': 'file',
            'url': preview_data['url'],
            'content_type': preview_data['content_type'],
            'size': preview_data['size'],
            'name': preview_data['name']
        })
    except Exception as e:
        logger.error(f"Erro ao gerar preview do arquivo: {str(e)}")
        return Response(
            {'error': 'Erro ao gerar preview do arquivo'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )