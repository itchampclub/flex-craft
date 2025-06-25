
import React, { useState, useEffect, useRef } from 'react';
import { AppState, Action } from '../hooks/useAppReducer';
import { TEMPLATES } from '../constants'; // Ensure this is an ES module import

interface ToolbarProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const ToolbarButton: React.FC<{ onClick?: () => void; children: React.ReactNode; title?: string; isActive?: boolean; className?: string, 'aria-expanded'?: boolean, 'aria-haspopup'?: boolean }> = 
    ({ onClick, children, title, isActive, className, ...ariaProps }) => (
  <button
    title={title}
    onClick={onClick}
    className={`px-3 py-2 text-sm font-medium rounded-md hover:bg-primary-500 hover:text-white dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-colors duration-150
                ${isActive ? 'bg-primary-500 text-white' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700'} ${className}`}
    {...ariaProps}
  >
    {children}
  </button>
);

const Toolbar: React.FC<ToolbarProps> = ({ state, dispatch }) => {
  const [designName, setDesignName] = useState('My Flex Design');
  const [isDevLinksOpen, setIsDevLinksOpen] = useState(false);
  const devLinksRef = useRef<HTMLDivElement>(null);

  const handleNew = () => {
    const choice = window.prompt("Create new: 'bubble', 'carousel', or choose a template by typing its name (e.g., 'E-commerce Product Card').\nAvailable templates:\n" + TEMPLATES.map(t => `- ${t.name}`).join("\n"), "bubble");
    if (!choice) return; // User cancelled

    const lowerChoice = choice.toLowerCase();
    if (lowerChoice === 'bubble' || lowerChoice === 'carousel') {
      dispatch({ type: 'NEW_DESIGN', payload: { type: lowerChoice } });
    } else {
      const foundTemplate = TEMPLATES.find(t => t.name.toLowerCase() === lowerChoice);
      if (foundTemplate) {
        dispatch({ type: 'NEW_DESIGN', payload: { type: 'template', templateName: foundTemplate.name } });
      } else {
        alert(`Template "${choice}" not found. Creating an empty bubble instead.`);
        dispatch({ type: 'NEW_DESIGN', payload: { type: 'bubble' } });
      }
    }
  };
  

  const handleSave = () => {
    if (!state.currentDesign) {
      alert("Nothing to save!");
      return;
    }
    const name = window.prompt("Enter a name for your design:", designName);
    if (name && name.trim()) {
      setDesignName(name.trim());
      dispatch({ type: 'SAVE_DESIGN', payload: name.trim() });
      alert(`Design "${name.trim()}" saved!`);
    } else if (name !== null) { // User entered empty string
        alert("Design name cannot be empty.");
    }
  };

  const handleToggleDarkMode = () => {
    dispatch({ type: 'SET_DARK_MODE', payload: !state.isDarkMode });
  };

  const toggleDevLinks = () => setIsDevLinksOpen(!isDevLinksOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (devLinksRef.current && !devLinksRef.current.contains(event.target as Node)) {
        setIsDevLinksOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const devLinks = [
    { name: "LINE Flex Simulator", url: "https://developers.line.biz/flex-simulator/", icon: "fas fa-flask" },
    { name: "LINE Developers Console", url: "https://developers.line.biz/console/", icon: "fas fa-terminal" },
    { name: "LINE OA Manager", url: "https://manager.line.biz/", icon: "fas fa-user-cog" },
    { name: "Sourcecode", url: "https://github.com/itchampclub/flex-craft", icon: "fab fa-github" }
  ];

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md p-3 flex items-center justify-between border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
          <i className="fas fa-drafting-compass mr-2"></i>FlexCraft Studio
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        <ToolbarButton onClick={handleNew} title="New Design">
          <i className="fas fa-plus mr-1"></i> New
        </ToolbarButton>
        <ToolbarButton onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isMyDesignsModalOpen', isOpen: true } })} title="My Designs">
          <i className="fas fa-folder-open mr-1"></i> My Designs
        </ToolbarButton>
        <ToolbarButton onClick={handleSave} title="Save Current Design">
          <i className="fas fa-save mr-1"></i> Save
        </ToolbarButton>
        <ToolbarButton onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isJsonViewModalOpen', isOpen: true } })} title="View/Copy JSON">
          <i className="fas fa-code mr-1"></i> View JSON
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isAiAssistantModalOpen', isOpen: true } })} 
          title="AI Assistant (Gemini)"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
        >
          <i className="fas fa-wand-magic-sparkles mr-1"></i> AI Assistant
        </ToolbarButton>
        {/* Test Send Button Removed */}
      </div>
      <div className="flex items-center space-x-3">
        <div className="relative" ref={devLinksRef}>
            <ToolbarButton 
                onClick={toggleDevLinks} 
                title="Developer Links"
                aria-expanded={isDevLinksOpen}
                aria-haspopup={true}
            >
                <i className="fas fa-link"></i> Dev Links <i className={`fas fa-xs fa-chevron-down ml-1 transition-transform ${isDevLinksOpen ? 'rotate-180' : ''}`}></i>
            </ToolbarButton>
            {isDevLinksOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-700 rounded-md shadow-lg py-1 z-20 border dark:border-slate-600">
                    {devLinks.map(link => (
                        <a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                        >
                            <i className={`${link.icon} mr-2 w-4 text-center`}></i> {link.name}
                        </a>
                    ))}
                </div>
            )}
        </div>
         <ToolbarButton onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isAiSettingsModalOpen', isOpen: true } })} title="Settings">
          <i className="fas fa-cog"></i>
        </ToolbarButton>
        <ToolbarButton onClick={handleToggleDarkMode} title={state.isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          <i className={`fas ${state.isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </ToolbarButton>
      </div>
    </header>
  );
};

export default Toolbar;