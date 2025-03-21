from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import get_folders_list

@api_view(['GET'])
def folders_list(request):
    """Endpoint para listar as pastas"""
    try:
        folders = get_folders_list()
        return Response(folders)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )