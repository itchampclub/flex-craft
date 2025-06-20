
import { FlexComponent, FlexContainer, FlexBox, FlexBubble, FlexCarousel, LineApiFlexContainer, LineApiFlexComponent, FlexImage } from '../types';
import { generateId } from './generateId';

// Recursive function to strip 'id' from components
export function stripIds<T extends FlexComponent | FlexContainer>(component: T): LineApiFlexComponent<T> {
  const { id, ...rest } = component as any; // eslint-disable-line @typescript-eslint/no-unused-vars

  if (rest.type === 'box' && (rest as FlexBox).contents) {
    (rest as FlexBox).contents = (rest as FlexBox).contents.map(child => stripIds(child as FlexComponent)) as any;
  } else if (rest.type === 'bubble') {
    const bubble = rest as FlexBubble;
    if (bubble.header) bubble.header = stripIds(bubble.header) as FlexBox;
    if (bubble.hero) {
        // Hero can be FlexBox or FlexImage, handle accordingly
        bubble.hero = stripIds(bubble.hero as FlexBox | FlexImage) as (FlexBox | FlexImage);
    }
    if (bubble.body) bubble.body = stripIds(bubble.body) as FlexBox;
    if (bubble.footer) bubble.footer = stripIds(bubble.footer) as FlexBox;
  } else if (rest.type === 'carousel' && (rest as FlexCarousel).contents) {
    (rest as FlexCarousel).contents = (rest as FlexCarousel).contents.map(b => stripIds(b)) as any;
  }
  
  return rest as LineApiFlexComponent<T>;
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
        }
        // Handle other component types that might have nested structures if necessary
    }

    recursivelyAddIds(messageWithIds);
    return messageWithIds;
}
