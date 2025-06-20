
import { useReducer, useCallback } from 'react';
import { AppState as AppStateDefinition, FlexContainer as FlexContainerDefinition, FlexComponent, FlexBox, FlexBubble, FlexCarousel, Design as DesignDefinition, AnySpecificComponentDefinition, AiMode as AiModeDefinition, AnyFlexComponent, FlexImage, FlexText, LineApiFlexContainer, Design } from '../types';
import { generateId } from '../utils/generateId';
import { COMPONENT_DEFINITIONS, INITIAL_EMPTY_BUBBLE, INITIAL_EMPTY_CAROUSEL, TEMPLATES } from '../constants';
import { addIdsToFlexMessage } from '../utils/flexTransform';

// Exporting types for use in other modules
export type AppState = AppStateDefinition;
export type FlexContainer = FlexContainerDefinition;
// export type Design = DesignDefinition; // Design is imported from types now
export enum AiMode { // Re-exporting enum
  Generate = AiModeDefinition.Generate,
  Improve = AiModeDefinition.Improve,
}


export type Action =
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_CURRENT_DESIGN'; payload: FlexContainer | null }
  | { type: 'SELECT_COMPONENT'; payload: string | null }
  | { type: 'ADD_COMPONENT'; payload: { parentId: string | null; componentDefinition: AnySpecificComponentDefinition, asBubbleSection?: 'header' | 'hero' | 'body' | 'footer' } }
  | { type: 'UPDATE_COMPONENT_PROPS'; payload: { componentId: string; props: Partial<AnyFlexComponent> } }
  | { type: 'DELETE_COMPONENT'; payload: string }
  | { type: 'MOVE_COMPONENT'; payload: { componentId: string; targetParentId: string; newIndex: number } }
  | { type: 'SAVE_DESIGN'; payload: string } // name
  | { type: 'LOAD_DESIGN'; payload: string } // id
  | { type: 'DELETE_SAVED_DESIGN'; payload: string } // id
  | { type: 'RENAME_SAVED_DESIGN'; payload: { id: string, newName: string } }
  | { type: 'DUPLICATE_SAVED_DESIGN'; payload: string } // id
  | { type: 'SET_GEMINI_API_KEY'; payload: string | null }
  // | { type: 'SET_LINE_CHANNEL_TOKEN'; payload: string | null } // Removed
  | { type: 'TOGGLE_MODAL'; payload: { modal: keyof Pick<AppState, 'isMyDesignsModalOpen' | 'isAiSettingsModalOpen' | 'isAiAssistantModalOpen' | 'isJsonViewModalOpen'>; isOpen: boolean } } // Removed isTestSendModalOpen
  | { type: 'SET_LOADING_AI'; payload: boolean }
  | { type: 'NEW_DESIGN'; payload: { type: 'bubble' | 'carousel' | 'template'; templateName?: string } };

const initialState: AppState = {
  currentDesign: INITIAL_EMPTY_BUBBLE(),
  selectedComponentId: null,
  designs: [],
  geminiApiKey: null,
  lineChannelAccessToken: null, // Kept for type conformity, but functionally removed
  isMyDesignsModalOpen: false,
  isAiSettingsModalOpen: false,
  isAiAssistantModalOpen: false,
  isTestSendModalOpen: false, // Kept for type conformity, but functionally removed
  isJsonViewModalOpen: false,
  isDarkMode: false,
  isLoadingAi: false,
};

// Helper to recursively find and update/delete a component
const findAndUpdateRecursive = (current: AnyFlexComponent, targetId: string, updateFn: (comp: AnyFlexComponent) => AnyFlexComponent | null): AnyFlexComponent | null => {
  if (current.id === targetId) {
    return updateFn(current);
  }

  if (current.type === 'box' && current.contents) { // current is FlexBox
    const newContents = current.contents.map(c => findAndUpdateRecursive(c, targetId, updateFn)).filter(c => c !== null) as FlexComponent[];
    if (newContents.length !== current.contents.length || newContents.some((c, i) => c !== current.contents[i])) {
        return { ...current, contents: newContents };
    }
  }
  if (current.type === 'bubble') { // current is FlexBubble
    const bubble = current as FlexBubble; // Explicit cast for clarity within this block
    
    const processedHeader = bubble.header ? findAndUpdateRecursive(bubble.header, targetId, updateFn) : undefined;
    const processedHero = bubble.hero ? findAndUpdateRecursive(bubble.hero, targetId, updateFn) : undefined;
    const processedBody = bubble.body ? findAndUpdateRecursive(bubble.body, targetId, updateFn) : undefined;
    const processedFooter = bubble.footer ? findAndUpdateRecursive(bubble.footer, targetId, updateFn) : undefined;

    // Check if any section has changed (either modified or deleted)
    if (processedHeader !== bubble.header || 
        processedHero !== bubble.hero || 
        processedBody !== bubble.body || 
        processedFooter !== bubble.footer) {
      return { 
        ...bubble, 
        header: processedHeader === null ? undefined : processedHeader as FlexBox | undefined, 
        hero: processedHero === null ? undefined : processedHero as FlexBox | FlexImage | undefined, 
        body: processedBody === null ? undefined : processedBody as FlexBox | undefined, 
        footer: processedFooter === null ? undefined : processedFooter as FlexBox | undefined 
      };
    }
  }
  if (current.type === 'carousel' && current.contents) { // current is FlexCarousel
    const newContents = current.contents.map(b => findAndUpdateRecursive(b, targetId, updateFn)).filter(b => b !== null) as FlexBubble[];
    if (newContents.length !== current.contents.length || newContents.some((b, i) => b !== current.contents[i])) {
         return { ...current, contents: newContents };
    }
  }
  return current; // Return original component if no changes were made below it or to it
};


const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_DARK_MODE':
      localStorage.setItem('darkMode', JSON.stringify(action.payload));
      if (action.payload) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { ...state, isDarkMode: action.payload };
    case 'SET_CURRENT_DESIGN':
      return { ...state, currentDesign: action.payload, selectedComponentId: action.payload?.id || null };
    case 'SELECT_COMPONENT':
      return { ...state, selectedComponentId: action.payload };
    
    case 'ADD_COMPONENT': {
      const { parentId: currentParentId, componentDefinition, asBubbleSection } = action.payload;
      
      if (currentParentId && !state.currentDesign) {
        console.error("ADD_COMPONENT: parentId provided, but currentDesign is null.");
        return state;
      }
      
      // Construct the component.
      // componentDefinition is a discriminated union (AnySpecificComponentDefinition).
      // TypeScript's control flow analysis correctly infers the specific type of
      // componentDefinition.type and the return type of componentDefinition.defaultPropertiesFactory()
      // based on the discriminant.
      // The resulting object is one of the types in AnyFlexComponent.
      const componentToAdd: AnyFlexComponent = {
        id: generateId(),
        type: componentDefinition.type,
        ...componentDefinition.defaultPropertiesFactory(),
      };

      const ensureIdsRecursive = (comp: any): any => { 
        if (!comp) return comp;
        if (typeof comp !== 'object' || comp === null) return comp;

        if (typeof comp.id !== 'string' || comp.id === '') { 
          comp.id = generateId();
        }
        
        if (comp.type === 'box' && comp.contents) {
          comp.contents = comp.contents.map((child: any) => ensureIdsRecursive(child));
        } else if (comp.type === 'bubble') {
            if(comp.header) comp.header = ensureIdsRecursive(comp.header);
            if(comp.hero) comp.hero = ensureIdsRecursive(comp.hero);
            if(comp.body) comp.body = ensureIdsRecursive(comp.body);
            if(comp.footer) comp.footer = ensureIdsRecursive(comp.footer);
        } else if (comp.type === 'carousel' && comp.contents) {
            comp.contents = comp.contents.map((child: any) => ensureIdsRecursive(child));
        }
        if (comp.type === 'button' && comp.action && typeof comp.action.label === 'undefined') {
            comp.action.label = 'Button';
        }
        return comp;
      };
      
      ensureIdsRecursive(componentToAdd); // This mutates componentToAdd and its children by adding IDs

      const updateFn = (parent: AnyFlexComponent): AnyFlexComponent | null => {
        if (asBubbleSection && parent.type === 'bubble') {
            const typedComponentToAdd = componentToAdd as FlexBox | FlexImage; 
            if (asBubbleSection === 'hero') {
                if (typedComponentToAdd.type === 'box' || typedComponentToAdd.type === 'image') {
                    return { ...parent, hero: typedComponentToAdd };
                }
            } else if (componentToAdd.type === 'box') { 
                 const sectionKey = asBubbleSection as 'header' | 'body' | 'footer';
                 return { ...parent, [sectionKey]: componentToAdd as FlexBox };
            }
        } else if (parent.type === 'box') {
          if (componentToAdd.type !== 'bubble' && componentToAdd.type !== 'carousel') {
            const parentDef = COMPONENT_DEFINITIONS.find(def => def.type === parent.type && def.name === 'Box'); 
            if (parentDef?.acceptedChildTypes?.includes(componentToAdd.type as FlexComponent['type'])) {
                 return { ...parent, contents: [...(parent.contents || []), componentToAdd as FlexComponent] };
            }
          }
        } else if (parent.type === 'carousel' && componentToAdd.type === 'bubble') {
            return { ...parent, contents: [...(parent.contents || []), componentToAdd as FlexBubble]};
        }
        return parent; 
      };
      
      if (!currentParentId) { 
        if (componentToAdd.type === 'bubble') {
             return { ...state, currentDesign: componentToAdd as FlexBubble, selectedComponentId: componentToAdd.id };
        } else if (componentToAdd.type === 'carousel') {
             return { ...state, currentDesign: componentToAdd as FlexCarousel, selectedComponentId: componentToAdd.id };
        }
        console.warn("ADD_COMPONENT called with null parentId for a non-root component type. This is unhandled for type:", componentToAdd.type);
        return state;
      }

      const updatedDesign = findAndUpdateRecursive(state.currentDesign!, currentParentId, updateFn);
      
      return { ...state, currentDesign: updatedDesign as FlexContainer | null, selectedComponentId: componentToAdd.id };
    }

    case 'UPDATE_COMPONENT_PROPS': {
      if (!state.currentDesign) return state;
      const { componentId, props } = action.payload; 
      const updatedDesign = findAndUpdateRecursive(state.currentDesign, componentId, (comp) => ({ ...comp, ...props }));
      return { ...state, currentDesign: updatedDesign as FlexContainer | null };
    }

    case 'DELETE_COMPONENT': {
      if (!state.currentDesign || action.payload === state.currentDesign.id) {
        return state; 
      }
      const componentId = action.payload;
      const updatedDesign = findAndUpdateRecursive(state.currentDesign, componentId, () => null); 
      return { 
          ...state, 
          currentDesign: updatedDesign as FlexContainer | null, 
          selectedComponentId: state.selectedComponentId === componentId ? null : state.selectedComponentId 
      };
    }
    
    case 'SAVE_DESIGN': {
        if (!state.currentDesign) {
             console.warn("SAVE_DESIGN action reached with no currentDesign. This should be guarded by the caller.");
             return state;
        }
        const designName = action.payload; 

        let clonedFlexMessage: FlexContainer;
        try {
            clonedFlexMessage = JSON.parse(JSON.stringify(state.currentDesign));
        } catch (e) {
            console.error("Error cloning current design for saving:", e);
            return state;
        }
        
        const currentDesigns = Array.isArray(state.designs) ? state.designs : [];
        const existingDesignIndex = currentDesigns.findIndex(d => d.name.toLowerCase() === designName.toLowerCase());

        let newDesignsArray: Design[];
        const designToSave: Design = {
            id: existingDesignIndex > -1 ? currentDesigns[existingDesignIndex].id : generateId(),
            name: designName,
            flexMessage: clonedFlexMessage, 
            createdAt: existingDesignIndex > -1 ? currentDesigns[existingDesignIndex].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (existingDesignIndex > -1) {
            newDesignsArray = currentDesigns.map((d, index) => index === existingDesignIndex ? designToSave : d);
        } else {
            newDesignsArray = [...currentDesigns, designToSave];
        }
        
        try {
            localStorage.setItem('designs', JSON.stringify(newDesignsArray));
        } catch (e) {
            console.error("Failed to save designs to localStorage:", e);
            return state; 
        }
        return { ...state, designs: newDesignsArray };
    }
    case 'LOAD_DESIGN': {
        const designToLoad = state.designs.find(d => d.id === action.payload);
        if (designToLoad) {
            const deepClonedDesign = JSON.parse(JSON.stringify(designToLoad.flexMessage)) as FlexContainer;
            return { ...state, currentDesign: deepClonedDesign, selectedComponentId: deepClonedDesign.id };
        }
        return state;
    }
     case 'DELETE_SAVED_DESIGN': {
      const newDesigns = state.designs.filter(d => d.id !== action.payload);
      localStorage.setItem('designs', JSON.stringify(newDesigns));
      return { ...state, designs: newDesigns };
    }
    case 'RENAME_SAVED_DESIGN': {
      const { id, newName } = action.payload;
      const newDesigns = state.designs.map(d => d.id === id ? { ...d, name: newName, updatedAt: new Date().toISOString() } : d);
      localStorage.setItem('designs', JSON.stringify(newDesigns));
      return { ...state, designs: newDesigns };
    }
    case 'DUPLICATE_SAVED_DESIGN': {
      const originalDesign = state.designs.find(d => d.id === action.payload);
      if (originalDesign) {
        const duplicatedDesign: Design = {
          ...originalDesign, 
          id: generateId(),
          name: `${originalDesign.name} (Copy)`,
          flexMessage: addIdsToFlexMessage(JSON.parse(JSON.stringify(originalDesign.flexMessage))),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const newDesigns = [...state.designs, duplicatedDesign];
        localStorage.setItem('designs', JSON.stringify(newDesigns));
        return { ...state, designs: newDesigns };
      }
      return state;
    }
    case 'SET_GEMINI_API_KEY':
      if(action.payload) localStorage.setItem('geminiApiKey', action.payload); else localStorage.removeItem('geminiApiKey');
      return { ...state, geminiApiKey: action.payload };
    case 'TOGGLE_MODAL':
      return { ...state, [action.payload.modal]: action.payload.isOpen };
    case 'SET_LOADING_AI':
      return { ...state, isLoadingAi: action.payload };
    case 'NEW_DESIGN':
      const { type, templateName } = action.payload;
      let newFlexContainer: FlexContainer;
      if (type === 'template' && templateName) {
          const template = TEMPLATES.find(t => t.name === templateName);
          if (template) {
              const templateStructure = template.structure(); 
              newFlexContainer = addIdsToFlexMessage({type: 'bubble', ...templateStructure} as LineApiFlexContainer);
          } else {
              newFlexContainer = INITIAL_EMPTY_BUBBLE(); 
          }
      } else if (type === 'carousel') {
          newFlexContainer = INITIAL_EMPTY_CAROUSEL();
      } else { 
          newFlexContainer = INITIAL_EMPTY_BUBBLE();
      }
      return { ...state, currentDesign: newFlexContainer, selectedComponentId: newFlexContainer.id };

    default:
      return state;
  }
};

const appReducerInitializer = (initialAppState: AppState): AppState => {
  const storedDesigns = localStorage.getItem('designs');
  const storedApiKey = localStorage.getItem('geminiApiKey');
  const storedDarkMode = localStorage.getItem('darkMode');

  let loadedDesigns: Design[] = [];
  if (storedDesigns) {
    try {
      const parsedStoredDesigns = JSON.parse(storedDesigns);
      if (Array.isArray(parsedStoredDesigns)) {
        loadedDesigns = parsedStoredDesigns.map((d: any) => {
          if (d && typeof d === 'object' && d.id && d.name && d.flexMessage && d.createdAt && d.updatedAt) {
            try {
              const clonedFlexMessage = JSON.parse(JSON.stringify(d.flexMessage));
              return {
                id: d.id,
                name: d.name,
                flexMessage: clonedFlexMessage, 
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
                thumbnail: d.thumbnail 
              } as Design;
            } catch (flexParseError) {
              console.error("Failed to parse flexMessage for a stored design:", d.id, flexParseError);
              return null; 
            }
          }
          console.warn("Skipping malformed design object from localStorage:", d);
          return null; 
        }).filter(Boolean) as Design[]; 
      } else {
        console.error("Stored designs from localStorage is not an array. Clearing.");
        localStorage.removeItem('designs');
      }
    } catch (e) {
      console.error("Failed to parse stored designs JSON. Clearing.", e);
      localStorage.removeItem('designs');
    }
  }

  let isDark = initialAppState.isDarkMode;
  if (storedDarkMode) {
    try {
      const parsedDarkMode = JSON.parse(storedDarkMode);
      if (typeof parsedDarkMode === 'boolean') {
        isDark = parsedDarkMode;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
         console.warn("Stored darkMode value is not a boolean. Using default.");
      }
    } catch (e) {
      console.error("Failed to parse darkMode from localStorage. Using default.", e);
    }
  } else {
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
  }


  return {
    ...initialAppState,
    designs: loadedDesigns,
    geminiApiKey: storedApiKey || null,
    isDarkMode: isDark,
    currentDesign: loadedDesigns.length > 0 && loadedDesigns[0].flexMessage 
                   ? JSON.parse(JSON.stringify(loadedDesigns.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].flexMessage)) 
                   : INITIAL_EMPTY_BUBBLE(), 
    selectedComponentId: loadedDesigns.length > 0 && loadedDesigns[0].flexMessage
                         ? loadedDesigns.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].flexMessage.id
                         : initialState.currentDesign?.id || null,
  };
};


export const useAppReducer = () => {
  const [state, dispatch] = useReducer(appReducer, initialState, appReducerInitializer);

  const findComponentById = useCallback((componentId: string | null): AnyFlexComponent | undefined => {
    if (!componentId || !state.currentDesign) return undefined;
    
    let found: AnyFlexComponent | undefined;
    const search = (component: AnyFlexComponent) => {
      if (found) return; 
      if (component.id === componentId) {
        found = component;
        return;
      }

      if (component.type === 'box' && component.contents) {
        for (const child of component.contents) {
          search(child);
          if (found) return;
        }
      } else if (component.type === 'bubble') {
        if (component.header) search(component.header);
        if (found) return;
        if (component.hero) search(component.hero);
        if (found) return;
        if (component.body) search(component.body);
        if (found) return;
        if (component.footer) search(component.footer);
        if (found) return;
      } else if (component.type === 'carousel' && component.contents) {
         for (const child of component.contents) {
          search(child);
          if (found) return;
        }
      }
    };
    search(state.currentDesign);
    return found;
  }, [state.currentDesign]);


  return { state, dispatch, findComponentById };
};
