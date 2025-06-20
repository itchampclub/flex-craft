
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { AppState, Action } from '../../hooks/useAppReducer';

interface AiSettingsModalProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AiSettingsModal: React.FC<AiSettingsModalProps> = ({ state, dispatch }) => {
  const [geminiKey, setGeminiKey] = useState('');
  // const [lineToken, setLineToken] = useState(''); // Removed

  useEffect(() => {
    if (state.isAiSettingsModalOpen) {
      setGeminiKey(state.geminiApiKey || '');
      // setLineToken(state.lineChannelAccessToken || ''); // Removed
    }
  }, [state.isAiSettingsModalOpen, state.geminiApiKey]); // state.lineChannelAccessToken removed from deps

  const handleSave = () => {
    dispatch({ type: 'SET_GEMINI_API_KEY', payload: geminiKey.trim() || null });
    // dispatch({ type: 'SET_LINE_CHANNEL_TOKEN', payload: lineToken.trim() || null }); // Removed
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isAiSettingsModalOpen', isOpen: false } });
    alert("Settings saved to browser's local storage.");
  };
  
  const closeModal = () => {
    setGeminiKey(state.geminiApiKey || '');
    // setLineToken(state.lineChannelAccessToken || ''); // Removed
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isAiSettingsModalOpen', isOpen: false } });
  };


  return (
    <Modal
      isOpen={state.isAiSettingsModalOpen}
      onClose={closeModal}
      title="API Settings"
    >
      <div className="space-y-4 text-sm">
        <div>
          <label htmlFor="geminiApiKey" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gemini API Key
          </label>
          <input
            type="password"
            id="geminiApiKey"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="Enter your Gemini API Key"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-gray-200"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Needed for AI Assistant features. Your key is stored locally in your browser.
            <br />
            You can get your API key from{' '}
            <a 
              href="https://aistudio.google.com/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Google AI Studio <i className="fas fa-external-link-alt fa-xs"></i>
            </a>.
          </p>
        </div>

        {/* LINE Channel Access Token Input Removed */}
        
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 p-3 rounded-md">
          <p className="text-yellow-700 dark:text-yellow-300">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            <strong>Security Note:</strong> API keys are stored in your browser's local storage. Avoid using this tool on shared or public computers if you input sensitive credentials.
          </p>
        </div>

        <div className="flex justify-end pt-2 space-x-2">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AiSettingsModal;
