
import { FlexComponent, FlexContainer, FlexBox, FlexBubble, FlexCarousel, LineApiFlexContainer, LineApiFlexComponent, FlexImage, FlexVideo, FlexText } from '../types';
import { generateId } from './generateId';

// Recursive function to strip 'id' from components and sanitize specific fields like hero.alt
export function stripIds<T extends FlexComponent | FlexContainer>(component: T): LineApiFlexComponent<T> {
  // Destructure to get type and the rest of the properties, excluding 'id'.
  // 'id' is destructured out and not included in 'restFromComponent'.
  const { id, type, ...restFromComponent } = component as any; // eslint-disable-line @typescript-eslint/no-unused-vars

  // Base for the stripped component, includes type and all other properties except 'id'.
  // This is effectively Omit<T, 'id'>.
  let baseStrippedComponent = { type, ...restFromComponent } as any;

  if (type === 'box' && baseStrippedComponent.contents) {
    const boxContents = baseStrippedComponent.contents as FlexComponent[];
    return {
      ...baseStrippedComponent,
      contents: boxContents.map(child => stripIds(child)),
    } as LineApiFlexComponent<T>;
  }

  if (type === 'video' && baseStrippedComponent.altContent) {
    const videoComp = component as FlexVideo; // Original component
    const strippedAltContent = stripIds(videoComp.altContent as FlexBox); // altContent must be a Box
    return {
      ...baseStrippedComponent,
      altContent: strippedAltContent,
    } as LineApiFlexComponent<T>;
  }


  if (type === 'bubble') {
    const originalBubble = component as FlexBubble; // For reading original sections
    
    // Create the base for LineApiFlexComponent<FlexBubble>
    // Start with all properties from originalBubble except 'id', 'type', and the sections we'll process manually.
    const { id: bubbleId, type: bubbleType, header, hero, body, footer, ...bubbleRest } = originalBubble as any;

    const strippedBubble: LineApiFlexComponent<FlexBubble> = {
      type: 'bubble', // Set type explicitly
      ...bubbleRest, // Spread other properties like size, direction, styles, action
    };

    if (originalBubble.header) {
      strippedBubble.header = stripIds(originalBubble.header);
    }
    if (originalBubble.hero) {
      // Create a shallow copy of the original hero object for 'alt' sanitization
      let heroToProcessRecursively = { ...(originalBubble.hero as any) };
      if ('alt' in heroToProcessRecursively) {
        delete heroToProcessRecursively.alt;
      }
      strippedBubble.hero = stripIds(heroToProcessRecursively as FlexBox | FlexImage);
    }
    if (originalBubble.body) {
      strippedBubble.body = stripIds(originalBubble.body);
    }
    if (originalBubble.footer) {
      strippedBubble.footer = stripIds(originalBubble.footer);
    }
    return strippedBubble as LineApiFlexComponent<T>;
  }

  if (type === 'carousel' && baseStrippedComponent.contents) {
    const carouselContents = baseStrippedComponent.contents as FlexBubble[];
    return {
      ...baseStrippedComponent,
      contents: carouselContents.map(b => stripIds(b)),
    } as LineApiFlexComponent<T>;
  }

  // For non-container components or components whose children don't need ID stripping (e.g., text spans)
  // baseStrippedComponent is already Omit<T, 'id'>
  return baseStrippedComponent as LineApiFlexComponent<T>;
}


export function addIdsToFlexMessage(flexMessage: LineApiFlexContainer): FlexContainer {
    const messageWithIds = JSON.parse(JSON.stringify(flexMessage)) as FlexContainer; // Deep clone

    function recursivelyAddIds(component: any) {
        if (!component) return;
        component.id = generateId();
        if (component.type === 'box' && component.contents) {
            component.contents.forEach(recursivelyAddIds);
        } else if (component.type === 'bubble') {
            recursivelyAddIds(component.header);
            recursivelyAddIds(component.hero);
            recursivelyAddIds(component.body);
            recursivelyAddIds(component.footer);
        } else if (component.type === 'carousel' && component.contents) {
            component.contents.forEach(recursivelyAddIds);
        } else if (component.type === 'video' && component.altContent) {
            recursivelyAddIds(component.altContent);
        }
        // Handle other component types that might have nested structures if necessary
        if (component.type === 'button' && component.action && typeof component.action.label === 'undefined') {
            component.action.label = 'Button'; // Default label if missing, useful after AI gen
        }
        if (component.type === 'text' && typeof component.text !== 'string') {
            component.text = ''; // Default text content to empty string if missing or not a string
        }
        // Ensure span elements within text components also get unique IDs if they were ever to be selectable/modifiable individually
        // For now, spans don't have IDs in the type definition, so this is not needed.
        // if (component.type === 'text' && component.contents) { // component.contents is FlexSpan[]
        //    component.contents.forEach((span: FlexSpan) => { /* if spans had IDs: span.id = generateId(); */ });
        // }
    }

    recursivelyAddIds(messageWithIds);
    return messageWithIds;
}
