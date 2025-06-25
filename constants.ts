
import { 
    ComponentDefinition, FlexAction, FlexBox, FlexBubble, FlexButton, FlexCarousel, 
    FlexIcon, FlexImage, FlexSeparator, FlexText, FlexImageSize,
    FlexSpacing, FlexAlign, FlexGravity, FlexImageAspectRatio, FlexImageAspectMode,
    AnySpecificComponentDefinition, FlexComponent, FlexVideo
} from './types';
import { BoxIcon, TextIcon, ImageIcon, ButtonIcon, SeparatorIcon, IconIcon as UIIcon, BubbleIcon, CarouselIcon, VideoIcon } from './components/icons';
// Removed SpacerIcon, HeaderIcon, HeroIcon, BodyIcon, FooterIcon imports as components are removed
import React from 'react';

const defaultBubbleBody = (): FlexBox => ({
  type: 'box',
  id: '', // Will be set by addComponent
  layout: 'vertical',
  contents: [
    {
      type: 'text',
      id: '', // Will be set by addComponent
      text: 'Hello, World!',
      wrap: true,
      weight: 'bold',
      size: 'xl',
    } as FlexText,
    {
      type: 'text',
      id: '', // Will be set by addComponent
      text: 'This is a sample text for the body section.',
      wrap: true,
      size: 'md',
      margin: 'md',
    } as FlexText,
  ],
  paddingAll: 'md',
});

const defaultAction = (): FlexAction => ({ type: 'uri', label: 'Learn More', uri: 'https://example.com' });

export const COMPONENT_DEFINITIONS: AnySpecificComponentDefinition[] = [
  // Containers
  {
    name: 'Bubble',
    type: 'bubble',
    icon: React.createElement(BubbleIcon),
    isContainer: true,
    defaultPropertiesFactory: () => ({
      size: 'mega',
      body: defaultBubbleBody(),
    } as Omit<FlexBubble, 'id' | 'type'>),
  } as ComponentDefinition<FlexBubble>,
  {
    name: 'Carousel',
    type: 'carousel',
    icon: React.createElement(CarouselIcon),
    isContainer: true,
    defaultPropertiesFactory: () => ({
      contents: [
        { type: 'bubble', id: '', body: defaultBubbleBody() } as FlexBubble,
        { type: 'bubble', id: '', body: defaultBubbleBody() } as FlexBubble,
      ],
    } as Omit<FlexCarousel, 'id' | 'type'>),
  } as ComponentDefinition<FlexCarousel>,
  
  // Components
  {
    name: 'Box',
    type: 'box',
    icon: React.createElement(BoxIcon),
    isContainer: true,
    acceptedChildTypes: ['box', 'text', 'image', 'button', 'separator', 'icon', 'video'], // Added 'video'
    defaultPropertiesFactory: () => ({
      layout: 'vertical',
      contents: [],
      spacing: 'md',
      paddingAll: 'sm',
      backgroundColor: '#FFFFFF',
      cornerRadius: 'md',
    } as Omit<FlexBox, 'id' | 'type'>),
  } as ComponentDefinition<FlexBox>,
  {
    name: 'Text',
    type: 'text',
    icon: React.createElement(TextIcon),
    defaultPropertiesFactory: () => ({
      text: 'New Text',
      wrap: true,
      size: 'md' as FlexImageSize,
      color: '#333333',
    } as Omit<FlexText, 'id' | 'type'>),
  } as ComponentDefinition<FlexText>,
  {
    name: 'Image',
    type: 'image',
    icon: React.createElement(ImageIcon),
    defaultPropertiesFactory: () => ({
      url: 'https://picsum.photos/800/600?random=1', // Add random query to vary image
      size: 'full' as FlexImageSize,
      aspectRatio: '16:9',
      aspectMode: 'cover',
    } as Omit<FlexImage, 'id' | 'type'>),
  } as ComponentDefinition<FlexImage>,
  {
    name: 'Video',
    type: 'video',
    icon: React.createElement(VideoIcon),
    defaultPropertiesFactory: () => ({
      url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', // Example video URL
      previewUrl: 'https://picsum.photos/seed/video_preview/800/600?random=2', // Add random query
      aspectRatio: '16:9',
      action: { type: 'uri', label: 'Play Video', uri: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4' }
    } as Omit<FlexVideo, 'id' | 'type'>),
  } as ComponentDefinition<FlexVideo>,
  {
    name: 'Button',
    type: 'button',
    icon: React.createElement(ButtonIcon),
    defaultPropertiesFactory: () => ({
      action: defaultAction(),
      style: 'primary',
      color: '#06C755', // LINE Green
      height: 'md',
    } as Omit<FlexButton, 'id' | 'type'>),
  } as ComponentDefinition<FlexButton>,
  {
    name: 'Separator',
    type: 'separator',
    icon: React.createElement(SeparatorIcon),
    defaultPropertiesFactory: () => ({
      margin: 'md',
      color: '#EEEEEE',
    } as Omit<FlexSeparator, 'id' | 'type'>),
  } as ComponentDefinition<FlexSeparator>,
  {
    name: 'Icon',
    type: 'icon',
    icon: React.createElement(UIIcon),
    defaultPropertiesFactory: () => ({
      url: 'https://developers-resource.landpress.line.me/fx/img/review_gold_star_28.png', 
      size: 'md' as FlexImageSize,
      aspectRatio: '1:1',
    } as Omit<FlexIcon, 'id' | 'type'>),
  } as ComponentDefinition<FlexIcon>,
  // Spacer component definition removed
  // Pre-built sections (Header Block, Hero Block, Body Block, Footer Block) removed
];

export const TEMPLATES: Array<{ name: string; description: string; structure: () => Omit<FlexBubble, 'id' | 'type'> }> = [
    {
        name: "E-commerce Product Card",
        description: "Display product details with image, name, price, and actions.",
        structure: () => ({
            hero: { type: 'image', url: 'https://picsum.photos/seed/product/600/400', size: 'full', aspectRatio: '20:13', aspectMode: 'cover' } as Omit<FlexImage, 'id'|'type'>,
            body: {
                type: 'box', layout: 'vertical', spacing: 'md',
                contents: [
                    { type: 'text', text: 'Product Name', weight: 'bold', size: 'xl' },
                    { type: 'box', layout: 'baseline', margin: 'md', spacing: 'sm', contents: [
                        { type: 'icon', url: 'https://developers-resource.landpress.line.me/fx/img/review_gold_star_28.png', size: 'sm'}, 
                        { type: 'icon', url: 'https://developers-resource.landpress.line.me/fx/img/review_gold_star_28.png', size: 'sm'}, 
                        { type: 'icon', url: 'https://developers-resource.landpress.line.me/fx/img/review_gold_star_28.png', size: 'sm'}, 
                        { type: 'icon', url: 'https://developers-resource.landpress.line.me/fx/img/review_gold_star_28.png', size: 'sm'}, 
                        { type: 'icon', url: 'https://developers-resource.landpress.line.me/fx/img/review_gray_star_28.png', size: 'sm'}, // Example for gray star
                        { type: 'text', text: '4.0', size: 'sm', color: '#999999', margin: 'md', flex: 0 }
                    ] as any}, // Cast inner contents array to any
                    { type: 'box', layout: 'vertical', margin: 'lg', spacing: 'sm', contents: [
                        { type: 'box', layout: 'baseline', spacing: 'sm', contents: [
                            { type: 'text', text: '$19.99', weight: 'bold', size: 'xl', flex: 0 },
                            { type: 'text', text: '$29.99', decoration: 'line-through', size: 'sm', color: '#aaaaaa', flex: 0 }
                        ] as any}, // Cast inner contents array to any
                        { type: 'text', text: 'Limited time offer!', color: '#ff0000', size: 'xs' },
                    ] as any}, // Cast inner contents array to any
                ] as any, // Cast outer contents array to any
            } as Omit<FlexBox, 'id'|'type'>,
            footer: {
                type: 'box', layout: 'vertical', spacing: 'sm', flex: 0,
                contents: [
                    { type: 'button', style: 'primary', height: 'sm', action: { type: 'postback', label: 'Add to Cart', data: 'action=add_cart&item_id=123' } },
                    { type: 'button', style: 'link', height: 'sm', action: { type: 'uri', label: 'View Details', uri: 'https://example.com/product/123' } },
                ] as any, // Cast contents array to any
            } as Omit<FlexBox, 'id'|'type'>,
        } as Omit<FlexBubble, 'id' | 'type'>)
    },
    // Add more templates...
];

export const INITIAL_EMPTY_BUBBLE: () => FlexBubble = () => ({
  id: 'root-bubble',
  type: 'bubble',
  size: 'mega',
  body: {
    id: 'root-body-box',
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        id: 'initial-text',
        type: 'text',
        text: 'Drag components here or use AI Assistant!',
        align: 'center',
        gravity: 'center',
        wrap: true,
        margin: 'xxl',
        color: '#aaaaaa'
      } as FlexText
    ],
    paddingAll: 'md',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px', // Give some initial height to the drop zone
    backgroundColor: '#F7F7F7'
  }
});

export const INITIAL_EMPTY_CAROUSEL: () => FlexCarousel = () => ({
  id: 'root-carousel',
  type: 'carousel',
  contents: [
    INITIAL_EMPTY_BUBBLE(), // First bubble
    { // Second bubble as an example
      ...INITIAL_EMPTY_BUBBLE(),
      id: 'root-bubble-2', // Ensure unique ID
      body: {
        ...(INITIAL_EMPTY_BUBBLE().body as FlexBox),
        id: 'initial-body-2',
        contents: [{
          ...(INITIAL_EMPTY_BUBBLE().body as FlexBox).contents[0] as FlexText,
          id: 'initial-text-2',
          text: 'Second bubble. Customize me!'
        }]
      }
    }
  ]
});

export const PROPERTY_LABEL_MAP: Record<string, string> = {
  text: "Text Content",
  url: "URL",
  previewUrl: "Preview URL", // For Video
  altContent: "Alternative Content (Box)", // For Video
  uri: "URI / Link",
  data: "Postback Data",
  size: "Size",
  weight: "Font Weight",
  color: "Color",
  backgroundColor: "Background Color",
  borderColor: "Border Color",
  borderWidth: "Border Width",
  cornerRadius: "Corner Radius",
  layout: "Layout (Direction)",
  spacing: "Spacing Between Items",
  margin: "Margin (Outer space)",
  paddingAll: "Padding (All sides)",
  // ... add more as needed for better display in PropertiesPanel
};

export const FLEX_SIZES: FlexImageSize[] = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'full', '6px', '10px', '12px', '16px', '20px', '24px', '32px', '40px', '48px', '50%', '100%'];
export const FLEX_SPACING_MARGIN_VALUES: FlexSpacing[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
export const FLEX_LAYOUT_OPTIONS: FlexBox['layout'][] = ['vertical', 'horizontal', 'baseline'];
export const FLEX_ALIGN_OPTIONS: FlexAlign[] = ['start', 'center', 'end'];
export const FLEX_GRAVITY_OPTIONS: FlexGravity[] = ['top', 'center', 'bottom'];
export const FLEX_IMAGE_ASPECT_RATIOS: FlexImageAspectRatio[] = ['1:1', '1.91:1', '4:3', '16:9', '2:1', '3:1', '3:4', '9:16', '1:2', '1:3', '2.5:1'];
export const FLEX_IMAGE_ASPECT_MODES: FlexImageAspectMode[] = ['cover', 'fit'];
export const FLEX_BUTTON_STYLES: FlexButton['style'][] = ['primary', 'secondary', 'link'];
export const FLEX_ACTION_TYPES: FlexAction['type'][] = ['uri', 'postback', 'message', 'datetimepicker', 'camera', 'cameraRoll', 'location', 'richmenuswitch'];
export const FLEX_BUBBLE_SIZES: FlexBubble['size'][] = ['nano', 'micro', 'kilo', 'mega', 'giga'];
