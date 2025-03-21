import React from 'react';

interface NewFolderFormProps {
    folderName: string;
    onSubmit: (e: React.FormEvent) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCancel: () => void;
  }
  
  const NewFolderForm = ({ folderName, onSubmit, onChange, onCancel }: NewFolderFormProps) => {
    return (
      <form onSubmit={onSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={folderName}
            onChange={onChange}
            placeholder="Nome da nova pasta"
            className="flex-1 p-2 border border-gray-300 rounded-lg"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Criar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  };
  
  export default NewFolderForm;