
import React from 'react';
import { useAppReducer } from './hooks/useAppReducer';
import Toolbar from './components/Toolbar';
import ComponentLibraryPanel from './components/ComponentLibraryPanel';
import CanvasPanel from './components/CanvasPanel';
import PreviewPanel from './components/PreviewPanel';
import PropertiesPanel from './components/PropertiesPanel';
import MyDesignsModal from './components/modals/MyDesignsModal';
import AiSettingsModal from './components/modals/AiSettingsModal';
import AiAssistantModal from './components/modals/AiAssistantModal';
// import TestSendModal from './components/modals/TestSendModal'; // Removed
import JsonViewModal from './components/modals/JsonViewModal';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const App: React.FC = () => {
  const { state, dispatch, findComponentById } = useAppReducer();
  const selectedComponent = findComponentById(state.selectedComponentId);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`flex flex-col h-screen font-sans antialiased ${state.isDarkMode ? 'dark' : ''}`}>
        <Toolbar state={state} dispatch={dispatch} />
        <div className="flex flex-1 overflow-hidden">
          {/* Panel 1: Component Library */}
          <ComponentLibraryPanel dispatch={dispatch} selectedComponentId={state.selectedComponentId} currentDesign={state.currentDesign} />

          {/* Panel 2: The Canvas (Editor) */}
          <main className="flex-1 p-4 overflow-y-auto bg-gray-200 dark:bg-slate-800 transition-colors duration-300">
            {state.currentDesign ? (
              <CanvasPanel
                flexContainer={state.currentDesign}
                selectedComponentId={state.selectedComponentId}
                dispatch={dispatch}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <p>Loading design or no design selected. Click "New" to start.</p>
              </div>
            )}
          </main>

          {/* Panel 3 & 4: Live Preview & Properties */}
          <aside className="w-[480px] flex flex-col bg-white dark:bg-slate-950 shadow-lg border-l border-gray-300 dark:border-slate-700 transition-colors duration-300">
            {/* Panel 3: Live Preview */}
            <div className="flex-1 p-1 md:p-2 overflow-y-auto">
              {state.currentDesign && <PreviewPanel flexMessage={state.currentDesign} />}
            </div>
            
            {/* Divider */}
            <div className="h-px bg-gray-300 dark:bg-slate-700"></div>

            {/* Panel 4: Properties */}
            <div className="h-[40%] p-4 overflow-y-auto">
              {selectedComponent ? (
                <PropertiesPanel
                  key={selectedComponent.id} // Ensures re-render on selection change
                  component={selectedComponent}
                  dispatch={dispatch}
                />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 pt-10">
                  <i className="fas fa-mouse-pointer text-3xl mb-2"></i>
                  <p>Select a component on the canvas to edit its properties.</p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Modals */}
        <MyDesignsModal state={state} dispatch={dispatch} />
        <AiSettingsModal state={state} dispatch={dispatch} />
        <AiAssistantModal state={state} dispatch={dispatch} />
        {/* <TestSendModal state={state} dispatch={dispatch} /> // Removed */}
        <JsonViewModal state={state} dispatch={dispatch} />

        {/* AI Loading Indicator */}
        {state.isLoadingAi && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl flex items-center space-x-3">
              <i className="fas fa-spinner fa-spin text-2xl text-primary-500"></i>
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">AI is thinking...</span>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default App;
