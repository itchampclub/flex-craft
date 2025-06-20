
import React, { useState } from 'react';
import Modal from './Modal';
import { AppState, Action } from '../../hooks/useAppReducer';
import { Design } from '../../types'; // Corrected import path for Design
// import { stripIds } from '../../utils/flexTransform'; // If needed for thumbnail

interface MyDesignsModalProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

// Simple placeholder for thumbnail generation
const generateThumbnail = (design: Design): string => {
  // In a real app, this might render a small version of the Flex Message to a canvas and get a data URL
  // For now, a placeholder based on type
  const type = design.flexMessage.type;
  let text = type.charAt(0).toUpperCase() + type.slice(1);
  if (type === 'carousel' && design.flexMessage.contents.length > 0) {
    text += ` (${design.flexMessage.contents.length})`;
  }
  return `https://via.placeholder.com/120x72/E0E0E0/888888?text=${text}`;
};


const MyDesignsModal: React.FC<MyDesignsModalProps> = ({ state, dispatch }) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const handleLoad = (id: string) => {
    dispatch({ type: 'LOAD_DESIGN', payload: id });
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isMyDesignsModalOpen', isOpen: false } });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      dispatch({ type: 'DELETE_SAVED_DESIGN', payload: id });
    }
  };

  const handleStartRename = (design: Design) => {
    setRenamingId(design.id);
    setNewName(design.name);
  };
  
  const handleConfirmRename = () => {
    if (renamingId && newName.trim()) {
      dispatch({ type: 'RENAME_SAVED_DESIGN', payload: { id: renamingId, newName: newName.trim() } });
      setRenamingId(null);
      setNewName('');
    } else if (renamingId) { // If newName is empty, cancel rename
      setRenamingId(null);
      setNewName('');
    }
  };

  const handleDuplicate = (id: string) => {
    dispatch({ type: 'DUPLICATE_SAVED_DESIGN', payload: id });
  };

  return (
    <Modal
      isOpen={state.isMyDesignsModalOpen}
      onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isMyDesignsModalOpen', isOpen: false } })}
      title="My Saved Designs"
      size="lg"
    >
      {state.designs.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">You have no saved designs yet. Click "Save" in the toolbar to save your current work.</p>
      ) : (
        <ul className="space-y-3">
          {state.designs.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((design) => (
            <li key={design.id} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 flex-grow min-w-0"> {/* flex-grow and min-w-0 for truncation */}
                <img src={design.thumbnail || generateThumbnail(design)} alt={design.name} className="w-20 h-12 object-cover rounded bg-gray-200 dark:bg-slate-600 flex-shrink-0" />
                <div className="min-w-0"> {/* min-w-0 for truncation of text */}
                  {renamingId === design.id ? (
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={handleConfirmRename}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmRename(); if (e.key === 'Escape') { setRenamingId(null); setNewName('');} }}
                      className="text-sm font-medium px-2 py-1 border rounded dark:bg-slate-600 dark:border-slate-500 w-full" 
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate" title={design.name}>{design.name}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(design.updatedAt).toLocaleDateString()} {new Date(design.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="space-x-1.5 flex items-center flex-shrink-0 ml-2">
                {renamingId === design.id ? (
                   <button onClick={handleConfirmRename} className="px-2.5 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"><i className="fas fa-check"></i></button>
                ) : (
                   <button onClick={() => handleStartRename(design)} title="Rename" className="px-2.5 py-1 text-xs bg-yellow-400 text-gray-800 rounded hover:bg-yellow-500"><i className="fas fa-edit"></i></button>
                )}
                <button onClick={() => handleLoad(design.id)} title="Load" className="px-2.5 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"><i className="fas fa-upload"></i></button>
                <button onClick={() => handleDuplicate(design.id)} title="Duplicate" className="px-2.5 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600"><i className="fas fa-copy"></i></button>
                <button onClick={() => handleDelete(design.id, design.name)} title="Delete" className="px-2.5 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"><i className="fas fa-trash"></i></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

export default MyDesignsModal;
