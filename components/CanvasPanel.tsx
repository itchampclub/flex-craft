import React from 'react';
import { FlexContainer, FlexComponent, FlexBox, FlexBubble, FlexCarousel, AnySpecificComponentDefinition, ComponentType, AnyFlexComponent, FlexText, FlexImage, FlexButton } from '../types';
import { Action } from '../hooks/useAppReducer';
import { useDrop } from 'react-dnd'; 

interface CanvasDropZoneProps {
  parentId: string | null; 
  parentType?: ComponentType;
  acceptedTypes: ComponentType[];
  dispatch: React.Dispatch<Action>;
  children?: React.ReactNode;
  className?: string;
  isBubbleSection?: 'header' | 'hero' | 'body' | 'footer';
  isEmpty?: boolean; 
}

const CanvasDropZone: React.FC<CanvasDropZoneProps> = ({ parentId, acceptedTypes, dispatch, children, className, isBubbleSection, isEmpty }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'component', 
    canDrop: (item: { definition: AnySpecificComponentDefinition }) => {
      if (isBubbleSection) {
        if (isBubbleSection === 'hero' && (item.definition.type === 'box' || item.definition.type === 'image')) return true;
        if (['header', 'body', 'footer'].includes(isBubbleSection) && item.definition.type === 'box') return true;
        return false;
      }
      return acceptedTypes.includes(item.definition.type);
    },
    drop: (item: { definition: AnySpecificComponentDefinition }) => {
      // parentId must not be null for adding into existing components. 
      // If parentId is null, it implies a root-level operation, typically handled by NEW_DESIGN actions rather than direct drop.
      if (parentId === null) {
        console.warn("CanvasDropZone received a drop with parentId null. This scenario should ideally be handled by specific 'New Design' or 'New Root Component' logic.");
        // Potentially dispatch a NEW_DESIGN based on item.definition.type if it's a root container type like bubble/carousel.
        // For now, this assumes parentId will be valid for drops onto existing structures.
        return; 
      }
      dispatch({ type: 'ADD_COMPONENT', payload: { parentId: parentId, componentDefinition: item.definition, asBubbleSection: isBubbleSection } });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [parentId, acceptedTypes, dispatch, isBubbleSection]);

  const baseClasses = "relative transition-all duration-150";
  const dropStateClasses = isOver && canDrop ? 'bg-green-100 dark:bg-green-800 ring-2 ring-green-500 ring-offset-2 dark:ring-offset-slate-800' : 
                         isOver && !canDrop ? 'bg-red-100 dark:bg-red-800 ring-2 ring-red-500' :
                         canDrop ? 'hover:bg-gray-100 dark:hover:bg-slate-700' : '';
  const emptyClasses = isEmpty ? 'min-h-[80px] border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center text-gray-400 dark:text-slate-500 rounded-md p-4' : '';


  return (
    <div ref={drop} className={`${baseClasses} ${dropStateClasses} ${emptyClasses} ${className}`}>
      {children}
      {isEmpty && canDrop && <span className="text-sm">Drop here</span>}
      {isEmpty && !canDrop && isOver && <span className="text-sm text-red-500">Cannot drop here</span>}
    </div>
  );
};


interface CanvasBlockProps {
  component: AnyFlexComponent;
  selectedComponentId: string | null;
  dispatch: React.Dispatch<Action>;
  path: string; 
}

const CanvasBlock: React.FC<CanvasBlockProps> = ({ component, selectedComponentId, dispatch, path }) => {
  const isSelected = component.id === selectedComponentId;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    dispatch({ type: 'SELECT_COMPONENT', payload: component.id });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete this ${component.type} component?`)) {
      dispatch({ type: 'DELETE_COMPONENT', payload: component.id });
    }
  };
  
  let styleClasses = `p-2 my-1 border rounded-md cursor-pointer transition-all duration-150 shadow-sm hover:shadow-md
                     ${isSelected ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50 dark:bg-primary-900/50' 
                                 : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-primary-300 dark:hover:border-primary-600'}`;

  const renderInnerContent = () => {
    // Type guards ensure component specific properties are accessible
    switch (component.type) {
      case 'box':
        return (
          <CanvasDropZone
            parentId={component.id}
            parentType={component.type}
            acceptedTypes={['box', 'text', 'image', 'button', 'separator', 'spacer', 'icon']}
            dispatch={dispatch}
            className={`flex ${component.layout === 'horizontal' ? 'flex-row space-x-2' : 'flex-col space-y-2'} p-2 border border-dashed border-gray-200 dark:border-slate-600 rounded min-h-[50px]`}
            isEmpty={component.contents.length === 0}
          >
            {component.contents.map((child, index) => (
              <CanvasBlock key={child.id} component={child} selectedComponentId={selectedComponentId} dispatch={dispatch} path={`${path}.contents.${index}`} />
            ))}
            {component.contents.length === 0 && <span className="text-xs text-gray-400 dark:text-slate-500 p-2">Empty Box. Drag components here.</span>}
          </CanvasDropZone>
        );
      case 'bubble':
        return (
          <div className="space-y-2 p-2 bg-gray-100 dark:bg-slate-800 rounded-lg shadow-inner">
            <h4 className="text-xs uppercase text-gray-500 dark:text-slate-400 font-semibold">Bubble Sections:</h4>
            {(['header', 'hero', 'body', 'footer'] as const).map(sectionName => (
              <div key={sectionName} className="p-1 border-l-2 border-gray-200 dark:border-slate-600 pl-2">
                <span className="text-xs font-medium text-gray-600 dark:text-slate-300 capitalize">{sectionName}:</span>
                <CanvasDropZone
                    parentId={component.id}
                    parentType={component.type}
                    acceptedTypes={sectionName === 'hero' ? ['box', 'image'] : ['box']}
                    dispatch={dispatch}
                    className="ml-2 mt-1 p-1 min-h-[40px] border border-dashed border-gray-300 dark:border-slate-500 rounded"
                    isBubbleSection={sectionName}
                    isEmpty={!component[sectionName]}
                >
                    {component[sectionName] ? (
                        <CanvasBlock component={component[sectionName] as FlexBox | FlexImage} selectedComponentId={selectedComponentId} dispatch={dispatch} path={`${path}.${sectionName}`} />
                    ) : <span className="text-xs text-gray-400 dark:text-slate-500 p-1">Empty {sectionName}</span>}
                </CanvasDropZone>
              </div>
            ))}
          </div>
        );
    case 'carousel':
        return (
            <CanvasDropZone
                parentId={component.id}
                parentType={component.type}
                acceptedTypes={['bubble']}
                dispatch={dispatch}
                className="flex flex-row space-x-2 p-2 overflow-x-auto min-h-[100px] border border-dashed border-gray-200 dark:border-slate-600 rounded"
                isEmpty={component.contents.length === 0}
            >
            {component.contents.map((childBubble, index) => (
                <div key={childBubble.id} className="w-64 flex-shrink-0">
                     <CanvasBlock component={childBubble} selectedComponentId={selectedComponentId} dispatch={dispatch} path={`${path}.contents.${index}`} />
                </div>
            ))}
            {component.contents.length === 0 && <span className="text-xs text-gray-400 dark:text-slate-500 p-2">Empty Carousel. Drag Bubbles here.</span>}
            </CanvasDropZone>
        );
      case 'text':
        return <p className="text-xs truncate dark:text-gray-200">{component.text || "Empty Text"}</p>;
      case 'image':
        return <img src={component.url || 'https://via.placeholder.com/100x50?text=Image'} alt="Canvas representation" className="max-h-20 max-w-full object-contain rounded" />;
      case 'button':
        return <span className="text-xs px-2 py-1 bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 rounded">Button: {component.action.label || "No Label"}</span>;
      default:
        return <p className="text-xs dark:text-gray-300">{component.type} component</p>;
    }
  };

  return (
    <div className={styleClasses} onClick={handleSelect}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase">
          {component.type}
          {component.id === 'root-bubble' || component.id === 'root-carousel' ? ' (Root)' : ''}
        </span>
        {component.id !== 'root-bubble' && component.id !== 'root-carousel' && ( 
          <button
            onClick={handleDelete}
            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs"
            title="Delete component"
            aria-label={`Delete ${component.type} component`}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        )}
      </div>
      {renderInnerContent()}
    </div>
  );
};


interface CanvasPanelProps {
  flexContainer: FlexContainer;
  selectedComponentId: string | null;
  dispatch: React.Dispatch<Action>;
}

const CanvasPanel: React.FC<CanvasPanelProps> = ({ flexContainer, selectedComponentId, dispatch }) => {
  if (!flexContainer) {
    return <div className="p-4 text-center text-gray-500">No design loaded. Click "New" to start.</div>;
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg shadow-inner h-full overflow-y-auto">
       <CanvasBlock
        component={flexContainer}
        selectedComponentId={selectedComponentId}
        dispatch={dispatch}
        path="root"
      />
    </div>
  );
};

export default CanvasPanel;
