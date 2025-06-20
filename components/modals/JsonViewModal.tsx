
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { AppState, Action } from '../../hooks/useAppReducer'; // Corrected import
import { stripIds } from '../../utils/flexTransform'; // Utility to remove editor IDs

interface JsonViewModalProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const JsonViewModal: React.FC<JsonViewModalProps> = ({ state, dispatch }) => {
  const [jsonString, setJsonString] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (state.isJsonViewModalOpen && state.currentDesign) {
      try {
        const lineApiJson = stripIds(state.currentDesign); // Remove editor IDs
        setJsonString(JSON.stringify(lineApiJson, null, 2));
      } catch (error) {
        console.error("Error stringifying JSON:", error);
        setJsonString("Error generating JSON. The current design might be corrupted.");
      }
    }
  }, [state.isJsonViewModalOpen, state.currentDesign]);

  const handleCopy = async () => {
    if (!jsonString || jsonString.startsWith("Error")) {
        setCopyStatus('error');
        setTimeout(() => setCopyStatus('idle'), 2000);
        return;
    }
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      setCopyStatus('error');
      console.error('Failed to copy JSON: ', err);
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };
  
  const closeModal = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isJsonViewModalOpen', isOpen: false } });
    setCopyStatus('idle');
  };

  return (
    <Modal
      isOpen={state.isJsonViewModalOpen}
      onClose={closeModal}
      title="LINE Flex Message JSON"
      size="xl"
    >
      {state.currentDesign ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            This is the JSON representation of your Flex Message, ready to be used with the LINE Messaging API.
            Editor-specific IDs have been removed.
          </p>
          <div className="relative">
            <textarea
              readOnly
              value={jsonString}
              className="w-full h-80 p-2.5 border border-gray-300 dark:border-slate-600 rounded-md text-xs font-mono bg-gray-50 dark:bg-slate-900 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
              spellCheck="false"
            />
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 px-2.5 py-1 bg-primary-500 text-white text-xs rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
              title="Copy JSON to clipboard"
              disabled={copyStatus !== 'idle' || !jsonString || jsonString.startsWith("Error")}
            >
              {copyStatus === 'idle' && <><i className="fas fa-copy mr-1"></i> Copy</>}
              {copyStatus === 'copied' && <><i className="fas fa-check mr-1"></i> Copied!</>}
              {copyStatus === 'error' && <><i className="fas fa-times mr-1"></i> Error</>}
            </button>
          </div>
           {/* Basic validation information (can be expanded) */}
          {jsonString.startsWith("Error") && <p className="text-red-500 text-xs">{jsonString}</p>}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No design loaded to view as JSON.</p>
      )}
    </Modal>
  );
};

export default JsonViewModal;
