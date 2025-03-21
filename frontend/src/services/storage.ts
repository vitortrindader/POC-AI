export const getFoldersList = async (): Promise<string[]> => {
  try {
    const response = await fetch('http://localhost:8000/api/folders/');
    if (!response.ok) {
      throw new Error('Erro ao buscar pastas');
    }
    const folders = await response.json();
    return folders;
  } catch (error) {
    console.error('Erro ao buscar lista de pastas:', error);
    throw error;
  }
};