
import React from 'react';
import { 
    FlexContainer, FlexComponent, FlexBox, FlexText, FlexImage, FlexIcon, 
    FlexButton, FlexSeparator, FlexSpacer, FlexBubble, FlexCarousel, 
    FlexAlign, FlexGravity, FlexSpacing, FlexMargin, PreviewableFlexComponent, FlexImageSize, FlexImageAspectRatio, FlexImageAspectMode,
    FlexURIAction // Added import
} from '../types';

// Helper to map Flex properties to Tailwind classes
const getLayoutClasses = (layout: FlexBox['layout']): string => {
  switch (layout) {
    case 'horizontal': return 'flex flex-row';
    case 'baseline': return 'flex flex-row items-baseline';
    default: return 'flex flex-col'; // vertical
  }
};

const getAlignmentClasses = (align?: FlexAlign, gravity?: FlexGravity, layout?: FlexBox['layout']): string => {
  let classes = '';
  if (layout === 'horizontal') { // Main axis is row
    if (gravity === 'top') classes += ' items-start';
    if (gravity === 'bottom') classes += ' items-end';
    if (gravity === 'center') classes += ' items-center';
    // Text align is for cross axis for text itself, not box content
  } else { // Main axis is column
    if (align === 'start') classes += ' items-start';
    if (align === 'end') classes += ' items-end';
    if (align === 'center') classes += ' items-center';
  }
  return classes;
};

const getJustifyContentClass = (justifyContent?: FlexBox['justifyContent']): string => {
    if (!justifyContent) return '';
    const map: Record<FlexBox['justifyContent'], string> = {
        'flex-start': 'justify-start',
        'flex-end': 'justify-end',
        'center': 'justify-center',
        'space-between': 'justify-between',
        'space-around': 'justify-around',
        'space-evenly': 'justify-evenly',
    };
    return map[justifyContent] || '';
};

const getAlignItemsClass = (alignItems?: FlexBox['alignItems']): string => {
    if (!alignItems) return '';
    const map: Record<FlexBox['alignItems'], string> = {
        'flex-start': 'items-start',
        'flex-end': 'items-end',
        'center': 'items-center',
        'stretch': 'items-stretch',
        'baseline': 'items-baseline',
    };
    return map[alignItems] || '';
};


const getSpacingClass = (spacing?: FlexSpacing, layout?: FlexBox['layout']): string => {
  if (!spacing || spacing === 'none') return '';
  const SIZES: Record<FlexSpacing, string> = {
    none: '0px', xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '20px', xxl: '24px'
  };
  const size = SIZES[spacing] || SIZES['md'];
  // Tailwind JIT can handle arbitrary values in square brackets for gap (instead of space-x/y)
  return layout === 'horizontal' ? `gap-x-[${size}]` : `gap-y-[${size}]`;
};

const getMarginClass = (margin?: FlexMargin): string => {
  if (!margin || margin === 'none') return '';
  const SIZES: Record<FlexSpacing, string> = { // Assuming FlexSpacing values for common margins
    none: '0px', xs: 'm-1', sm: 'm-2', md: 'm-3', lg: 'm-4', xl: 'm-5', xxl: 'm-6'
  };
  if (typeof margin === 'string' && SIZES[margin as FlexSpacing]) return SIZES[margin as FlexSpacing];
  if (typeof margin === 'string') return `m-[${margin}]`; // Custom pixel value
  return SIZES['md'];
};

const getPaddingStyles = (component: FlexBox): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    if (component.paddingAll) styles.padding = component.paddingAll;
    if (component.paddingTop) styles.paddingTop = component.paddingTop;
    if (component.paddingBottom) styles.paddingBottom = component.paddingBottom;
    if (component.paddingStart) styles.paddingLeft = component.paddingStart; // Assuming LTR
    if (component.paddingEnd) styles.paddingRight = component.paddingEnd; // Assuming LTR
    return styles;
};

const getFlexSizeClass = (size?: FlexImageSize): string => {
    const sizeMap: Partial<Record<FlexImageSize, string>> = {
        xxs: 'text-[10px] leading-[14px]', xs: 'text-xs leading-tight', sm: 'text-sm leading-normal', md: 'text-base leading-relaxed',
        lg: 'text-lg leading-relaxed', xl: 'text-xl leading-snug', xxl: 'text-2xl leading-snug',
        full: 'w-full', // For images mostly
    };
    if (size && sizeMap[size]) return sizeMap[size]!;
    if (size && (size.endsWith('px') || size.endsWith('%'))) {
      if (['full', 'auto'].includes(size)) return `w-${size}`; // For image width like w-full
      return `text-[${size}]`; // For text
    }
    return sizeMap['md']!; // Default size
};

const getImageSizeStyles = (size?: FlexImageSize, aspectRatio?: FlexImageAspectRatio, aspectMode?: FlexImageAspectMode): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    if (aspectMode === 'fit') {
      styles.objectFit = 'contain';
    } else if (aspectMode === 'cover') {
      styles.objectFit = 'cover';
    } else {
      styles.objectFit = 'cover'; // Default
    }

    if (size) {
        if (size === 'full') { styles.width = '100%'; }
        else if (size.endsWith('%')) { styles.width = size; }
        else if (size.endsWith('px')) { styles.width = size; styles.height = size; } // Assuming square for pixel based icon like sizes if no aspect ratio
        else { // xxs, xs, sm, md, lg, xl, xxl
            const SIZES_IMG: Record<string, string> = { xxs: '20px', xs: '24px', sm: '32px', md: '48px', lg: '64px', xl: '96px', xxl: '128px'};
            styles.width = SIZES_IMG[size] || SIZES_IMG.md;
            styles.height = SIZES_IMG[size] || SIZES_IMG.md;
        }
    }
    if (aspectRatio) {
        styles.aspectRatio = aspectRatio.replace(':', ' / ');
        if(styles.width && !styles.height) styles.height = 'auto'; // Let aspect ratio dictate height if width is set
        if(!styles.width && styles.height) styles.width = 'auto'; // Let aspect ratio dictate width if height is set
    }
    if (!styles.width && !styles.height && !aspectRatio) { // Fallback if nothing specific
        styles.width = '100%'; // Default to full width for hero-like images
        styles.aspectRatio = '1.91 / 1'; // Common fallback aspect ratio
    }

    return styles;
};

const getBorderStyles = (component: FlexBox): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    if (component.borderColor) styles.borderColor = component.borderColor;
    if (component.borderWidth && component.borderWidth !== 'none') {
        styles.borderWidth = component.borderWidth === 'light' ? '1px' :
                              component.borderWidth === 'normal' ? '2px' :
                              component.borderWidth === 'medium' ? '3px' :
                              component.borderWidth === 'semi-bold' ? '4px' :
                              component.borderWidth === 'bold' ? '5px' : component.borderWidth;
        styles.borderStyle = 'solid';
    }
    if (component.cornerRadius && component.cornerRadius !== 'none') {
         const SIZES: Record<string, string> = { xs: '2px', sm: '4px', md: '6px', lg: '8px', xl: '12px', xxl: '16px' };
         styles.borderRadius = SIZES[component.cornerRadius] || component.cornerRadius;
    }
    return styles;
};

const getBackgroundStyles = (component: FlexBox): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    if (component.backgroundColor) styles.backgroundColor = component.backgroundColor;
    if (component.background?.type === 'linearGradient') {
        const bg = component.background;
        styles.background = `linear-gradient(${bg.angle}, ${bg.startColor}${bg.centerColor ? `, ${bg.centerColor} ${bg.centerPosition || '50%'}` : ''}, ${bg.endColor})`;
    }
    return styles;
};


const ComponentPreview: React.FC<{ component: PreviewableFlexComponent }> = ({ component }) => {
  let content;
  const commonStyles: React.CSSProperties = {};

  // Check for positionable properties only if they exist on the component type
  if ('position' in component && component.position === 'absolute') {
      commonStyles.position = 'absolute';
      if('offsetTop' in component && component.offsetTop) commonStyles.top = component.offsetTop;
      if('offsetBottom' in component && component.offsetBottom) commonStyles.bottom = component.offsetBottom;
      if('offsetStart' in component && component.offsetStart) commonStyles.left = component.offsetStart; // Assuming LTR
      if('offsetEnd' in component && component.offsetEnd) commonStyles.right = component.offsetEnd; // Assuming LTR
  }
  if ('flex' in component && component.flex !== undefined) commonStyles.flexGrow = component.flex;
  if ('margin' in component && component.margin) {
      const marginVal = component.margin;
      const SIZES: Record<FlexSpacing, string> = { none: '0px', xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '20px', xxl: '24px' };
      commonStyles.margin = SIZES[marginVal as FlexSpacing] || (typeof marginVal === 'string' ? marginVal : undefined);
  }


  switch (component.type) {
    case 'box':
      const box = component as FlexBox;
      const boxStyles = {
          ...commonStyles,
          ...getPaddingStyles(box),
          ...getBorderStyles(box),
          ...getBackgroundStyles(box),
      };
      if (box.width) boxStyles.width = box.width;
      if (box.height) boxStyles.height = box.height;

      content = (
        <div 
            className={`${getLayoutClasses(box.layout)} ${getAlignmentClasses(undefined, undefined, box.layout)} ${getJustifyContentClass(box.justifyContent)} ${getAlignItemsClass(box.alignItems)} ${getSpacingClass(box.spacing, box.layout)} w-full`}
            style={boxStyles}
            onClick={box.action && box.action.type === 'uri' ? () => window.open((box.action as FlexURIAction).uri, '_blank') : undefined}
        >
          {box.contents.map(child => <ComponentPreview key={child.id} component={child} />)}
        </div>
      );
      break;
    case 'text':
      const text = component as FlexText;
      const textStyles: React.CSSProperties = {...commonStyles};
      if (text.color) textStyles.color = text.color;
      if (text.weight === 'bold') textStyles.fontWeight = 'bold';
      if (text.style === 'italic') textStyles.fontStyle = 'italic';
      if (text.decoration === 'underline') textStyles.textDecoration = 'underline';
      if (text.decoration === 'line-through') textStyles.textDecoration = 'line-through';
      if (text.lineSpacing) textStyles.lineHeight = text.lineSpacing;
      if (text.maxLines && text.maxLines > 0) {
        textStyles.display = '-webkit-box';
        textStyles.WebkitBoxOrient = 'vertical';
        textStyles.WebkitLineClamp = text.maxLines;
        textStyles.overflow = 'hidden';
        textStyles.textOverflow = 'ellipsis';
      }
      
      let textAlignClass = '';
      if (text.align === 'start') textAlignClass = 'text-left';
      if (text.align === 'center') textAlignClass = 'text-center';
      if (text.align === 'end') textAlignClass = 'text-right';
      
      const textBaseClasses = getFlexSizeClass(text.size);

      content = (
        <p 
          className={`${textBaseClasses} ${textAlignClass} ${text.wrap ? 'whitespace-normal break-words' : 'whitespace-nowrap truncate'}`} 
          style={textStyles}
          onClick={text.action && text.action.type === 'uri' ? () => window.open((text.action as FlexURIAction).uri, '_blank') : undefined}
        >
          {text.contents && text.contents.length > 0 ? text.contents.map((span, idx) => {
            const spanStyles: React.CSSProperties = {};
            if (span.color) spanStyles.color = span.color;
            if (span.weight === 'bold') spanStyles.fontWeight = 'bold';
            if (span.style === 'italic') spanStyles.fontStyle = 'italic';
            if (span.decoration === 'underline') spanStyles.textDecoration = 'underline';
            if (span.decoration === 'line-through') spanStyles.textDecoration = 'line-through';
            const spanSizeClass = getFlexSizeClass(span.size); 

            return <span key={idx} className={spanSizeClass} style={spanStyles}>{span.text}</span>;
          }) : text.text}
        </p>
      );
      break;
    case 'image':
      const image = component as FlexImage;
      const imageStyles = { ...commonStyles, ...getImageSizeStyles(image.size, image.aspectRatio, image.aspectMode) };
      if (image.backgroundColor) imageStyles.backgroundColor = image.backgroundColor;

      content = (
        <img 
            src={image.url} 
            alt="Flex message image" 
            style={imageStyles}
            className="block" // images are inline by default
            onClick={image.action && image.action.type === 'uri' ? () => window.open((image.action as FlexURIAction).uri, '_blank') : undefined}
        />);
      break;
    case 'icon':
      const iconComp = component as FlexIcon; // Renamed to avoid conflict with 'icon' variable name
      const iconBaseStyles = getImageSizeStyles(iconComp.size, iconComp.aspectRatio, undefined); // aspectMode not on FlexIcon type
      const iconStyles = { 
        ...commonStyles, 
        ...iconBaseStyles,
        objectFit: 'contain' as React.CSSProperties['objectFit'] // Icons should typically contain
      };
      content = <img src={iconComp.url} alt="Flex message icon" style={iconStyles} className="block" />;
      break;
    case 'button':
      const button = component as FlexButton;
      let buttonClasses = 'px-4 rounded font-medium transition-colors duration-150 w-full text-center '; // text-center for button label
      buttonClasses += button.height === 'sm' ? 'py-2 text-sm' : 'py-2.5 text-base';
      
      const buttonAction = button.action;
      const buttonStyles: React.CSSProperties = {...commonStyles};

      if (button.style === 'primary') {
        buttonStyles.backgroundColor = button.color || '#06C755'; // Default LINE Green
        buttonStyles.color = 'white'; 
      } else if (button.style === 'secondary') {
        buttonStyles.borderColor = button.color || '#06C755';
        buttonStyles.color = button.color || '#06C755';
        buttonStyles.borderWidth = '1px'; 
        buttonStyles.borderStyle = 'solid';
      } else { // link
         buttonStyles.color = button.color || '#007AFF'; // Default link blue
      }

      content = (
        <button 
            className={buttonClasses} 
            style={buttonStyles}
            onClick={() => buttonAction && (buttonAction.type === 'uri') && window.open((buttonAction as FlexURIAction).uri, '_blank')}
        >
          {buttonAction.label || "Button"}
        </button>
      );
      break;
    case 'separator':
      const separator = component as FlexSeparator;
      const separatorStyles: React.CSSProperties = {...commonStyles}; // commonStyles might contain margin
      separatorStyles.height = '1px';
      separatorStyles.backgroundColor = separator.color || '#E0E0E0';
      separatorStyles.width = '100%';
      content = <div style={separatorStyles}></div>;
      break;
    case 'spacer':
      const spacer = component as FlexSpacer;
      const SIZES_SPACER: Record<FlexSpacing, string> = {
        none: '0px', xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '20px', xxl: '24px'
      };
      const spacerSize = SIZES_SPACER[spacer.size || 'md'];
      // commonStyles might contain margin. Spacer itself is about creating space, so height/width is key.
      content = <div style={{ ...commonStyles, height: spacerSize, width: spacerSize, flexShrink: 0 }}></div>;
      break;
    case 'bubble':
        const bubble = component as FlexBubble;
        const bubbleStyles: React.CSSProperties = {...commonStyles};
        // Bubble specific styles (like overall background from styles prop) could be applied here if needed.
        // For simplicity, background from styles.header etc. are applied to respective divs.
        
        let bubbleWidthClass = 'w-full max-w-[300px]'; // Default mega size approx
        if (bubble.size === 'nano') bubbleWidthClass = 'w-full max-w-[120px]';
        else if (bubble.size === 'micro') bubbleWidthClass = 'w-full max-w-[160px]';
        else if (bubble.size === 'kilo') bubbleWidthClass = 'w-full max-w-[240px]';
        else if (bubble.size === 'giga') bubbleWidthClass = 'w-full max-w-[340px]';

        content = (
            <div 
              className={`bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden ${bubbleWidthClass} flex-shrink-0`} 
              style={bubbleStyles}
              onClick={bubble.action && bubble.action.type === 'uri' ? () => window.open((bubble.action as FlexURIAction).uri, '_blank') : undefined}
            >
                {bubble.header && <div style={{backgroundColor: bubble.styles?.header?.backgroundColor}}><ComponentPreview component={bubble.header} /></div>}
                {bubble.hero && <div style={{backgroundColor: bubble.styles?.hero?.backgroundColor}}><ComponentPreview component={bubble.hero} /></div>}
                {bubble.body && <div style={{backgroundColor: bubble.styles?.body?.backgroundColor}}><ComponentPreview component={bubble.body} /></div>}
                {bubble.footer && <div style={{backgroundColor: bubble.styles?.footer?.backgroundColor}}><ComponentPreview component={bubble.footer} /></div>}
            </div>
        );
        break;
     case 'carousel':
        const carousel = component as FlexCarousel;
        content = (
            <div className="flex flex-row overflow-x-auto space-x-2 p-2 w-full snap-x snap-mandatory">
                {carousel.contents.map(b => (
                    <div key={b.id} className="snap-center flex-shrink-0">
                        <ComponentPreview component={b} />
                    </div>
                ))}
            </div>
        );
        break;
    default:
      // This should ideally not happen with PreviewableFlexComponent
      const unknownComponent = component as any;
      content = <div className="text-red-500">Unsupported component type: {unknownComponent.type}</div>;
  }
  
  let wrapperClasses = '';
  if ('margin' in component && component.margin && typeof component.margin === 'string' && ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(component.margin)) {
    wrapperClasses += ` ${getMarginClass(component.margin as FlexSpacing)}`;
  }
  // If commonStyles contains margin (from custom string value), it will be applied via style prop.
  // Otherwise, Tailwind margin class is used.

  return <div className={wrapperClasses} style={Object.keys(commonStyles).length > 0 && !commonStyles.margin ? commonStyles : (commonStyles.margin && wrapperClasses.includes("m-") ? {...commonStyles, margin:undefined} : commonStyles) }>{content}</div>;
};


interface PreviewPanelProps {
  flexMessage: FlexContainer;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ flexMessage }) => {
  return (
    <div className="h-full bg-line-lightGray dark:bg-line-charcoal p-2 md:p-4 flex flex-col items-center justify-start overflow-y-auto">
      <div className="w-[320px] bg-gray-800 rounded-[24px] p-2 shadow-2xl flex-shrink-0"> {/* iPhone like frame */}
        <div className="bg-black h-[20px] w-[120px] mx-auto rounded-b-lg mb-2 relative"> {/* Notch */}
          <div className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-gray-700 h-1.5 w-1.5 rounded-full"></div> {/* Camera */}
          <div className="absolute top-1/2 left-7 transform -translate-y-1/2 bg-gray-700 h-1 w-8 rounded-sm"></div> {/* Speaker */}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[16px] overflow-hidden min-h-[500px] flex"> {/* Screen */}
          {/* Main content area for Flex Message */}
          <div className="w-full">
            <ComponentPreview component={flexMessage} />
          </div>
        </div>
      </div>
       <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
        LINE Preview (Simulated)
      </div>
    </div>
  );
};

export default PreviewPanel;
