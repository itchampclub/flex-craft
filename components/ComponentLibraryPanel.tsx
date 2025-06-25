import React, { useState } from 'react';
import { COMPONENT_DEFINITIONS } from '../constants';
import { Action } from '../hooks/useAppReducer';
import { AnySpecificComponentDefinition, FlexContainer, FlexComponent } from '../types';
import { useDrag } from 'react-dnd';

const DraggableComponentItem: React.FC<{ definition: AnySpecificComponentDefinition; onDrop: (definition: AnySpecificComponentDefinition) => void }> = ({ definition }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { definition }, // definition is now AnySpecificComponentDefinition
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        // onDrop is handled by the drop target (CanvasPanel or CanvasBlock)
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      className={`p-3 m-1.5 border border-gray-300 dark:border-slate-600 rounded-md cursor-grab flex items-center space-x-3 
                  bg-white dark:bg-slate-700 hover:bg-primary-50 dark:hover:bg-slate-600 shadow-sm transition-all duration-150
                  ${isDragging ? 'opacity-50 ring-2 ring-primary-500' : ''}`}
    >
      <span className="text-primary-500 dark:text-primary-400">{definition.icon}</span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{definition.name}</span>
    </div>
  );
};


interface ComponentLibraryPanelProps {
  dispatch: React.Dispatch<Action>;
  selectedComponentId: string | null; // To determine where to drop
  currentDesign: FlexContainer | null;
}

const ComponentLibraryPanel: React.FC<ComponentLibraryPanelProps> = ({ dispatch, selectedComponentId, currentDesign }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleDropComponent = (definition: AnySpecificComponentDefinition) => {
    // This is primarily for react-dnd, the actual add logic is in CanvasDropZone
    let parentToDropIn = selectedComponentId;
    if (!parentToDropIn && currentDesign) {
        if (currentDesign.type === 'bubble' && currentDesign.body) {
            parentToDropIn = currentDesign.body.id;
        } else if (currentDesign.type === 'carousel' && currentDesign.contents.length > 0) {
            const lastBubble = currentDesign.contents[currentDesign.contents.length - 1];
            if (lastBubble.body) {
                 parentToDropIn = lastBubble.body.id;
            } else {
                 parentToDropIn = lastBubble.id; // Drop into bubble itself if no body
            }
        } else {
            parentToDropIn = currentDesign.id; // Fallback to root container
        }
    }
    
    // asBubbleSection logic is for pre-built blocks which are now removed.
    // Keeping it for future use or if some components naturally fit sections.
    // For now, it won't be triggered by current COMPONENT_DEFINITIONS.
    let asBubbleSection: 'header' | 'hero' | 'body' | 'footer' | undefined = undefined;
    if (definition.isBlockElement) { // isBlockElement is no longer used by current components
        if (definition.name.toLowerCase().includes('header')) asBubbleSection = 'header';
        else if (definition.name.toLowerCase().includes('hero')) asBubbleSection = 'hero';
        else if (definition.name.toLowerCase().includes('body')) asBubbleSection = 'body';
        else if (definition.name.toLowerCase().includes('footer')) asBubbleSection = 'footer';
    }

    dispatch({ type: 'ADD_COMPONENT', payload: { parentId: parentToDropIn, componentDefinition: definition, asBubbleSection } });
  };
  
  const filteredComponents = COMPONENT_DEFINITIONS.filter(def => 
    def.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    // Ensure removed block elements are not shown
    !def.isBlockElement 
  );


  const componentGroups = {
    Container: filteredComponents.filter(c => c.type === 'bubble' || c.type === 'carousel'),
    Component: filteredComponents.filter(c => 
      !(c.type === 'bubble' || c.type === 'carousel') // Everything that is not a Bubble or Carousel
    ),
  };

  return (
    <aside className="w-72 bg-gray-50 dark:bg-slate-800 p-4 border-r border-gray-300 dark:border-slate-700 overflow-y-auto shadow-md transition-colors duration-300">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Component Library</h2>
      <input
        type="search"
        placeholder="Search components..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 mb-4 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-gray-200"
      />
      {Object.entries(componentGroups).map(([groupName, components]) => {
        if (components.length === 0) return null;
        return (
          <div key={groupName} className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{groupName}</h3>
            {components.map(definition => (
              <DraggableComponentItem key={definition.name} definition={definition} onDrop={handleDropComponent} />
            ))}
          </div>
        );
      })}
    </aside>
  );
};

export default ComponentLibraryPanel;