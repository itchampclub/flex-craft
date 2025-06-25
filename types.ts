
import React from 'react';

// Basic Types
export type FlexAlign = 'start' | 'end' | 'center';
export type FlexGravity = 'top' | 'bottom' | 'center';
export type FlexSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type FlexMargin = FlexSpacing | string; // string for custom px values
export type FlexImageSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full' | string; // string for custom px/percentage
export type FlexImageAspectMode = 'cover' | 'fit';
export type FlexImageAspectRatio = '1:1' | '1.91:1' | '4:3' | '16:9' | '2:1' | '3:1' | '3:4' | '9:16' | '1:2' | '1:3' | string; // string for custom ratio

// Actions
export interface FlexActionBase {
  type: string;
  label?: string;
}
export interface FlexURIAction extends FlexActionBase {
  type: 'uri';
  uri: string;
  altUri?: {
    desktop: string;
  };
}
export interface FlexPostbackAction extends FlexActionBase {
  type: 'postback';
  data: string;
  displayText?: string;
  text?: string;
}
export interface FlexMessageAction extends FlexActionBase {
  type: 'message';
  text: string;
}
export interface FlexDatetimePickerAction extends FlexActionBase {
  type: 'datetimepicker';
  data: string;
  mode: 'date' | 'time' | 'datetime';
  initial?: string;
  max?: string;
  min?: string;
}
export interface FlexCameraAction extends FlexActionBase {
  type: 'camera';
}
export interface FlexCameraRollAction extends FlexActionBase {
  type: 'cameraRoll';
}
export interface FlexLocationAction extends FlexActionBase {
  type: 'location';
}
export interface FlexRichMenuSwitchAction extends FlexActionBase {
  type: 'richmenuswitch';
  richMenuAliasId: string;
  data: string;
}

export type FlexAction = 
  | FlexURIAction 
  | FlexPostbackAction 
  | FlexMessageAction
  | FlexDatetimePickerAction
  | FlexCameraAction
  | FlexCameraRollAction
  | FlexLocationAction
  | FlexRichMenuSwitchAction;

// Components
export interface FlexComponentBase {
  type: string;
  id: string; // Editor-specific unique ID
}

export interface FlexBox extends FlexComponentBase {
  type: 'box';
  layout: 'vertical' | 'horizontal' | 'baseline';
  contents: FlexComponent[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string; // e.g. 'none', 'light', 'normal', 'medium', 'semi-bold', 'bold', '1px', '2px'
  cornerRadius?: string; // e.g. 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', '10px'
  spacing?: FlexSpacing;
  margin?: FlexMargin;
  paddingAll?: string; // e.g. 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', '10px'
  paddingTop?: string;
  paddingBottom?: string;
  paddingStart?: string;
  paddingEnd?: string;
  width?: string; // e.g. '100px', '50%'
  height?: string; // e.g. '100px', '50%'
  flex?: number; // For flex item grow ratio
  position?: 'relative' | 'absolute';
  offsetTop?: string;
  offsetBottom?: string;
  offsetStart?: string;
  offsetEnd?: string;
  action?: FlexAction;
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  background?: FlexBackground;
}

export interface FlexText extends FlexComponentBase {
  type: 'text';
  text: string;
  flex?: number;
  margin?: FlexMargin;
  size?: FlexImageSize; // Reusing FlexImageSize for text size for convenience
  align?: FlexAlign;
  gravity?: FlexGravity;
  wrap?: boolean;
  maxLines?: number;
  weight?: 'regular' | 'bold';
  color?: string;
  action?: FlexAction;
  style?: 'normal' | 'italic';
  decoration?: 'none' | 'underline' | 'line-through';
  lineSpacing?: string; // e.g. '10px', '1.5'
  position?: 'relative' | 'absolute';
  offsetTop?: string;
  offsetBottom?: string;
  offsetStart?: string;
  offsetEnd?: string;
  contents?: FlexSpan[]; // For rich text
}

export interface FlexSpan {
    type: 'span';
    text: string;
    color?: string;
    size?: FlexImageSize;
    weight?: 'regular' | 'bold';
    style?: 'normal' | 'italic';
    decoration?: 'none' | 'underline' | 'line-through';
}

export interface FlexImage extends FlexComponentBase {
  type: 'image';
  url: string;
  flex?: number;
  margin?: FlexMargin;
  align?: FlexAlign; // Horizontal alignment within parent
  gravity?: FlexGravity; // Vertical alignment within parent
  size?: FlexImageSize;
  aspectRatio?: FlexImageAspectRatio;
  aspectMode?: FlexImageAspectMode;
  backgroundColor?: string;
  action?: FlexAction;
  position?: 'relative' | 'absolute';
  offsetTop?: string;
  offsetBottom?: string;
  offsetStart?: string;
  offsetEnd?: string;
  animated?: boolean;
}

export interface FlexIcon extends FlexComponentBase {
  type: 'icon';
  url: string;
  margin?: FlexMargin;
  size?: FlexImageSize; // e.g. 'xs', 'sm', '20px'
  aspectRatio?: FlexImageAspectRatio; // e.g. '1:1'
  position?: 'relative' | 'absolute';
  offsetTop?: string;
  offsetBottom?: string;
  offsetStart?: string;
  offsetEnd?: string;
}

export interface FlexButton extends FlexComponentBase {
  type: 'button';
  action: FlexAction;
  flex?: number;
  margin?: FlexMargin;
  height?: 'sm' | 'md';
  style?: 'link' | 'primary' | 'secondary';
  color?: string; // Action color
  gravity?: FlexGravity;
  adjustMode?: 'shrink-to-fit'; // For buttons in a box with horizontal layout
  position?: 'relative' | 'absolute';
  offsetTop?: string;
  offsetBottom?: string;
  offsetStart?: string;
  offsetEnd?: string;
}

export interface FlexSeparator extends FlexComponentBase {
  type: 'separator';
  margin?: FlexMargin;
  color?: string;
}

// FlexSpacer type definition removed

export interface FlexVideo extends FlexComponentBase {
  type: 'video';
  url: string; 
  previewUrl: string; 
  altContent?: FlexBox; // According to LINE spec, this must be a Box.
  aspectRatio?: FlexImageAspectRatio;
  action?: FlexAction;
  // Common properties like margin, position, etc. can be added if supported by LINE for video
  margin?: FlexMargin;
  position?: 'relative' | 'absolute';
  offsetTop?: string;
  offsetBottom?: string;
  offsetStart?: string;
  offsetEnd?: string;
}


export type FlexComponent = FlexBox | FlexText | FlexImage | FlexIcon | FlexButton | FlexSeparator | FlexVideo;

// Background definition for Box
export interface FlexBackground {
    type: 'linearGradient';
    angle: string; // e.g. '0deg', '90deg'
    startColor: string; // Hex color
    endColor: string; // Hex color
    centerColor?: string; // Hex color
    centerPosition?: string; // e.g. '0%', '50%'
}

// Styles for Bubble sections
export interface FlexBlockStyle {
  backgroundColor?: string;
  separator?: boolean;
  separatorColor?: string;
}

export interface FlexBubbleStyles {
  header?: FlexBlockStyle;
  hero?: FlexBlockStyle;
  body?: FlexBlockStyle;
  footer?: FlexBlockStyle;
}

// Container Components
export interface FlexBubble extends FlexComponentBase {
  type: 'bubble';
  size?: 'nano' | 'micro' | 'kilo' | 'mega' | 'giga';
  direction?: 'ltr' | 'rtl';
  header?: FlexBox;
  hero?: FlexBox | FlexImage; // Per LINE spec, hero can be an image or a box
  body?: FlexBox;
  footer?: FlexBox;
  styles?: FlexBubbleStyles;
  action?: FlexAction; // Action for the entire bubble
}

export interface FlexCarousel extends FlexComponentBase {
  type: 'carousel';
  contents: FlexBubble[];
}

export type FlexContainer = FlexBubble | FlexCarousel;

// Top-level Flex Message for LINE API
export interface LineFlexMessage {
  type: 'flex';
  altText: string;
  contents: FlexContainer; // This will be LineApiFlexContainer
}

// App specific types
export interface Design {
  id: string; // unique id for the design
  name: string;
  flexMessage: FlexContainer; // Stored with editor IDs
  thumbnail?: string; // base64 data URL
  createdAt: string;
  updatedAt: string;
}

export enum AiMode {
  Generate = 'Generate from Scratch',
  Improve = 'Improve Current Design',
}

// Union of all possible component types in the editor
export type AnyFlexComponent = FlexComponent | FlexContainer;

// Literal type for component types
export type ComponentType = AnyFlexComponent['type'];

// For Component Library
export interface ComponentDefinition<T extends AnyFlexComponent = AnyFlexComponent> {
  name: string;
  type: T['type'];
  icon: React.ReactNode; // The JSX for the icon
  defaultPropertiesFactory: () => Omit<T, 'id' | 'type'>;
  isContainer?: boolean; // e.g., Box, Bubble, Carousel
  isBlockElement?: boolean; // for sections like header, body, footer which are usually Boxes or Images
  acceptedChildTypes?: ComponentType[]; // For containers like Box
}

export type AnySpecificComponentDefinition =
  | ComponentDefinition<FlexBox>
  | ComponentDefinition<FlexText>
  | ComponentDefinition<FlexImage>
  | ComponentDefinition<FlexIcon>
  | ComponentDefinition<FlexButton>
  | ComponentDefinition<FlexSeparator>
  // ComponentDefinition<FlexSpacer> removed
  | ComponentDefinition<FlexVideo>
  | ComponentDefinition<FlexBubble>
  | ComponentDefinition<FlexCarousel>;


// For state management
export interface AppState {
  currentDesign: FlexContainer | null;
  selectedComponentId: string | null;
  designs: Design[];
  geminiApiKey: string | null; // User-provided key
  lineChannelAccessToken: string | null; // Functionally removed, kept for potential future use or type stability
  isMyDesignsModalOpen: boolean;
  isAiSettingsModalOpen: boolean;
  isAiAssistantModalOpen: boolean;
  isTestSendModalOpen: boolean; // Functionally removed, kept for potential future use or type stability
  isJsonViewModalOpen: boolean;
  isDarkMode: boolean;
  isLoadingAi: boolean; // For Gemini API calls
}

// Utility type to represent Flex components as they would be sent to LINE API (without editor 'id')
// This recursively strips 'id' and ensures 'contents' of Box, Bubble, Carousel are also transformed.

// Base transformation: Omit 'id'
type BaseLineApiComponent<T extends FlexComponentBase> = Omit<T, 'id'>;

// Specific transformations for components with nested Flex structures
type LineApiFlexBoxContents = BaseLineApiComponent<FlexBox> & { contents?: LineApiFlexComponent<FlexComponent>[] };
type LineApiFlexImageItself = BaseLineApiComponent<FlexImage>; 
type LineApiFlexVideoItself = Omit<BaseLineApiComponent<FlexVideo>, 'altContent'> & { altContent?: LineApiFlexBoxContents };


type LineApiFlexBubbleStructure = Omit<BaseLineApiComponent<FlexBubble>, 'header' | 'hero' | 'body' | 'footer'> & {
  header?: LineApiFlexBoxContents;
  hero?: LineApiFlexBoxContents | LineApiFlexImageItself; // hero can be image or box
  body?: LineApiFlexBoxContents;
  footer?: LineApiFlexBoxContents;
};

type LineApiFlexCarouselStructure = Omit<BaseLineApiComponent<FlexCarousel>, 'contents'> & {
  contents: LineApiFlexBubbleStructure[];
};

// Main discriminated union for LineApiFlexComponent
export type LineApiFlexComponent<T extends FlexComponentBase> =
  T extends FlexBox ? LineApiFlexBoxContents :
  T extends FlexBubble ? LineApiFlexBubbleStructure :
  T extends FlexCarousel ? LineApiFlexCarouselStructure :
  T extends FlexImage ? LineApiFlexImageItself :
  T extends FlexVideo ? LineApiFlexVideoItself :
  BaseLineApiComponent<T>; // For simple components (Text, Icon, Button, Separator)

// Ensure LineApiFlexContainer uses the correct transformed types
export type LineApiFlexContainer = LineApiFlexBubbleStructure | LineApiFlexCarouselStructure;


// For PreviewPanel, includes containers as they are also components
export type PreviewableFlexComponent = FlexComponent | FlexBubble | FlexCarousel;
    