
import React from 'react';
import { 
    FlexContainer, FlexComponent, FlexBox, FlexText, FlexImage, FlexIcon, 
    FlexButton, FlexSeparator, FlexBubble, FlexCarousel, 
    FlexAlign, FlexGravity, FlexSpacing, FlexMargin, PreviewableFlexComponent, FlexImageSize, FlexImageAspectRatio, FlexImageAspectMode,
    FlexURIAction, FlexVideo
} from '../types';
import { Action } from '../hooks/useAppReducer';

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
  } else { // Main axis is column
    if (align === 'start') classes += ' items-start';
    if (align === 'end') classes += ' items-end';
    if (align === 'center') classes += ' items-center';
  }
  return classes;
};

const getJustifyContentClass = (justifyContent?: FlexBox['justifyContent']): string => {
    if (!justifyContent) return '';
    const map: Record<NonNullable<FlexBox['justifyContent']>, string> = {
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
    const map: Record<NonNullable<FlexBox['alignItems']>, string> = {
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
  return layout === 'horizontal' ? `gap-x-[${size}]` : `gap-y-[${size}]`;
};

const getMarginClass = (margin?: FlexMargin): string => {
  if (!margin || margin === 'none') return '';
  const SIZES: Record<FlexSpacing, string> = { 
    none: '0px', xs: 'm-1', sm: 'm-2', md: 'm-3', lg: 'm-4', xl: 'm-5', xxl: 'm-6'
  };
  if (typeof margin === 'string' && SIZES[margin as FlexSpacing]) return SIZES[margin as FlexSpacing];
  if (typeof margin === 'string') return `m-[${margin}]`; 
  return SIZES['md'];
};

const getPaddingStyles = (component: FlexBox): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    if (component.paddingAll) styles.padding = component.paddingAll;
    if (component.paddingTop) styles.paddingTop = component.paddingTop;
    if (component.paddingBottom) styles.paddingBottom = component.paddingBottom;
    if (component.paddingStart) styles.paddingLeft = component.paddingStart; 
    if (component.paddingEnd) styles.paddingRight = component.paddingEnd; 
    return styles;
};

const getFlexSizeClass = (size?: FlexImageSize): string => {
    const sizeMap: Partial<Record<FlexImageSize, string>> = {
        xxs: 'text-[10px] leading-[14px]', xs: 'text-xs leading-tight', sm: 'text-sm leading-normal', md: 'text-base leading-normal', // Changed from leading-relaxed
        lg: 'text-lg leading-normal', // Changed from leading-relaxed
        xl: 'text-xl leading-snug', xxl: 'text-2xl leading-snug',
        full: 'w-full', 
    };
    if (size && sizeMap[size]) return sizeMap[size]!;
    if (size && (size.endsWith('px') || size.endsWith('%'))) {
      if (['full', 'auto'].includes(size)) return `w-${size}`; 
      return `text-[${size}]`; 
    }
    return sizeMap['md']!; 
};

const getImageSizeStyles = (size?: FlexImageSize, aspectRatio?: FlexImageAspectRatio, aspectMode?: FlexImageAspectMode): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    if (aspectMode === 'fit') {
      styles.objectFit = 'contain';
    } else if (aspectMode === 'cover') {
      styles.objectFit = 'cover';
    } else {
      styles.objectFit = 'cover'; 
    }

    if (size) {
        if (size === 'full') { styles.width = '100%'; }
        else if (size.endsWith('%')) { styles.width = size; }
        else if (size.endsWith('px')) { styles.width = size; styles.height = size; } 
        else { 
            const SIZES_IMG: Record<string, string> = { xxs: '20px', xs: '24px', sm: '32px', md: '48px', lg: '64px', xl: '96px', xxl: '128px'};
            styles.width = SIZES_IMG[size] || SIZES_IMG.md;
            styles.height = SIZES_IMG[size] || SIZES_IMG.md;
        }
    }
    if (aspectRatio) {
        styles.aspectRatio = aspectRatio.replace(':', ' / ');
        if(styles.width && !styles.height) styles.height = 'auto'; 
        if(!styles.width && styles.height) styles.width = 'auto'; 
    }
    if (!styles.width && !styles.height && !aspectRatio) { 
        styles.width = '100%'; 
        styles.aspectRatio = '1.91 / 1'; 
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

interface ComponentPreviewProps {
  component: PreviewableFlexComponent;
  dispatch: React.Dispatch<Action>;
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({ component, dispatch }) => {
  let content;
  const commonStyles: React.CSSProperties = {};
  let clickableClass = 'cursor-pointer hover:outline hover:outline-1 hover:outline-offset-1 hover:outline-blue-300 dark:hover:outline-blue-400 transition-all duration-100';

  const handleSelectComponent = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch({ type: 'SELECT_COMPONENT', payload: id });
  };
  
  if ('position' in component && component.position === 'absolute') {
      commonStyles.position = 'absolute';
      if('offsetTop' in component && component.offsetTop) commonStyles.top = component.offsetTop;
      if('offsetBottom' in component && component.offsetBottom) commonStyles.bottom = component.offsetBottom;
      if('offsetStart' in component && component.offsetStart) commonStyles.left = component.offsetStart; 
      if('offsetEnd' in component && component.offsetEnd) commonStyles.right = component.offsetEnd; 
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
            className={`${getLayoutClasses(box.layout)} ${getAlignmentClasses(undefined, undefined, box.layout)} ${getJustifyContentClass(box.justifyContent)} ${getAlignItemsClass(box.alignItems)} ${getSpacingClass(box.spacing, box.layout)} w-full ${clickableClass}`}
            style={boxStyles}
            onClick={(e) => handleSelectComponent(e, box.id)}
            role="group" 
            aria-label={`Box container: ${box.layout} layout`}
        >
          {box.contents.map(child => <ComponentPreview key={child.id} component={child} dispatch={dispatch} />)}
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
      const ariaLabelText = (typeof text.text === 'string' && text.text) ? text.text.substring(0,30) : "Empty Text";

      content = (
        <p 
          className={`${textBaseClasses} ${textAlignClass} ${text.wrap ? 'whitespace-normal break-words' : 'whitespace-nowrap truncate'} ${clickableClass}`} 
          style={textStyles}
          onClick={(e) => handleSelectComponent(e, text.id)}
          aria-label={`Text: ${ariaLabelText}`}
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
          }) : (text.text || '')}
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
            className={`block ${clickableClass}`}
            onClick={(e) => handleSelectComponent(e, image.id)}
            aria-label="Image component"
        />);
      break;
    case 'icon':
      const iconComp = component as FlexIcon; 
      const iconBaseStyles = getImageSizeStyles(iconComp.size, iconComp.aspectRatio, undefined); 
      const iconStyles = { 
        ...commonStyles, 
        ...iconBaseStyles,
        objectFit: 'contain' as React.CSSProperties['objectFit'] 
      };
      content = <img src={iconComp.url} alt="Flex message icon" style={iconStyles} className={`block ${clickableClass}`} onClick={(e) => handleSelectComponent(e, iconComp.id)} aria-label="Icon component" />;
      break;
    case 'button':
      const button = component as FlexButton;
      let buttonClasses = `px-4 rounded font-medium transition-colors duration-150 w-full text-center ${clickableClass}`; 
      buttonClasses += button.height === 'sm' ? 'py-2 text-sm' : 'py-2.5 text-base';
      
      const buttonStyles: React.CSSProperties = {...commonStyles};

      if (button.style === 'primary') {
        buttonStyles.backgroundColor = button.color || '#06C755'; 
        buttonStyles.color = 'white'; 
      } else if (button.style === 'secondary') {
        buttonStyles.borderColor = button.color || '#06C755';
        buttonStyles.color = button.color || '#06C755';
        buttonStyles.borderWidth = '1px'; 
        buttonStyles.borderStyle = 'solid';
      } else { 
         buttonStyles.color = button.color || '#007AFF'; 
      }

      content = (
        <button 
            className={buttonClasses} 
            style={buttonStyles}
            onClick={(e) => handleSelectComponent(e, button.id)}
            aria-label={`Button: ${button.action.label || "No label"}`}
        >
          {button.action.label || "Button"}
        </button>
      );
      break;
    case 'separator':
      const separator = component as FlexSeparator;
      const separatorStyles: React.CSSProperties = {...commonStyles}; 
      separatorStyles.height = '1px';
      separatorStyles.backgroundColor = separator.color || '#E0E0E0';
      separatorStyles.width = '100%';
      content = <div style={separatorStyles} onClick={(e) => handleSelectComponent(e, separator.id)} className={clickableClass} role="separator" aria-label="Separator"></div>;
      break;
    case 'video':
      const video = component as FlexVideo;
      const videoStyles = { ...commonStyles, ...getImageSizeStyles('full', video.aspectRatio, 'cover') };
      content = (
        <div style={{position: 'relative', ...videoStyles}} className={clickableClass} onClick={(e) => handleSelectComponent(e, video.id)} aria-label="Video component">
            <img 
                src={video.previewUrl} 
                alt="Video preview" 
                style={{width: '100%', height: '100%', objectFit: 'cover'}} 
            />
            <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '10px'}} aria-hidden="true">
                <i className="fas fa-play text-2xl"></i>
            </div>
        </div>
      );
      break;
    case 'bubble':
        const bubble = component as FlexBubble;
        const bubbleStyles: React.CSSProperties = {...commonStyles};
        
        let bubbleWidthClass = 'w-full max-w-[300px]'; // Default Mega
        if (bubble.size === 'nano') bubbleWidthClass = 'max-w-[150px]'; // Adjusted for potentially smaller phone view
        else if (bubble.size === 'micro') bubbleWidthClass = 'max-w-[180px]';
        else if (bubble.size === 'kilo') bubbleWidthClass = 'max-w-[260px]';
        else if (bubble.size === 'giga') bubbleWidthClass = 'max-w-[320px]'; // Max width of LINE bubble

        // Bubbles should take full width of their container in the preview if possible, up to their max LINE spec.
        // The iphone sim provides the constraint.
        bubbleWidthClass = `w-full ${bubbleWidthClass}`;


        content = (
            <div 
              className={`bg-white dark:bg-line-lightGray shadow-lg rounded-lg overflow-hidden ${bubbleWidthClass} flex-shrink-0 ${clickableClass}`} 
              style={bubbleStyles}
              onClick={(e) => handleSelectComponent(e, bubble.id)}
              role="article"
              aria-label={`Bubble container: ${bubble.size || 'mega'} size`}
            >
                {bubble.header && <div style={{backgroundColor: bubble.styles?.header?.backgroundColor}}><ComponentPreview component={bubble.header} dispatch={dispatch} /></div>}
                {bubble.hero && <div style={{backgroundColor: bubble.styles?.hero?.backgroundColor}}><ComponentPreview component={bubble.hero} dispatch={dispatch} /></div>}
                {bubble.body && <div style={{backgroundColor: bubble.styles?.body?.backgroundColor}}><ComponentPreview component={bubble.body} dispatch={dispatch} /></div>}
                {bubble.footer && <div style={{backgroundColor: bubble.styles?.footer?.backgroundColor}}><ComponentPreview component={bubble.footer} dispatch={dispatch} /></div>}
            </div>
        );
        break;
     case 'carousel':
        const carousel = component as FlexCarousel;
        clickableClass = ''; 
        content = (
            <div className={`flex flex-row overflow-x-auto space-x-2 p-1 w-full snap-x snap-mandatory ${clickableClass}`} 
                 onClick={(e) => handleSelectComponent(e, carousel.id)} 
                 role="region" 
                 aria-label="Carousel of bubbles"
            >
                {carousel.contents.map(b => (
                    <div key={b.id} className="snap-center flex-shrink-0">
                        <ComponentPreview component={b} dispatch={dispatch} />
                    </div>
                ))}
            </div>
        );
        break;
    default:
      const unknownComponent = component as any;
      content = <div className="text-red-500">Unsupported component type: {unknownComponent.type}</div>;
      clickableClass = ''; 
  }
  
  let wrapperClasses = '';
  if ('margin' in component && component.margin && typeof component.margin === 'string' && ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(component.margin)) {
    wrapperClasses += ` ${getMarginClass(component.margin as FlexSpacing)}`;
  }
  
  const finalStyles = Object.keys(commonStyles).length > 0 && !commonStyles.margin 
                      ? commonStyles 
                      : (commonStyles.margin && wrapperClasses.includes("m-") ? {...commonStyles, margin:undefined} : commonStyles);
  
  const isRootContainer = component.id === 'root-bubble' || component.id === 'root-carousel';
  const applyClickable = clickableClass && !isRootContainer && component.type !== 'carousel';


  return <div className={`${wrapperClasses} ${applyClickable ? clickableClass : ''}`} style={finalStyles}>{content}</div>;
};


interface PreviewPanelProps {
  flexMessage: FlexContainer;
  dispatch: React.Dispatch<Action>; 
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ flexMessage, dispatch }) => {
  const phoneFrameBg = 'bg-slate-800 dark:bg-black'; // Frame color
  const lineHeaderBg = 'bg-[#3A4B5F] dark:bg-[#2c3a4a]'; // Dark slate blue from image
  const lineChatAreaBg = 'bg-line-preview-bg dark:bg-slate-700'; // Muted blue-gray for chat background

  return (
    <div className="h-full bg-gray-200 dark:bg-slate-800 p-2 md:p-4 flex flex-col items-center justify-center overflow-hidden">
      {/* iPhone X Frame */}
      <div className={`w-[320px] h-[680px] ${phoneFrameBg} rounded-[44px] p-3 shadow-2xl relative flex flex-col`}>
        {/* Notch Removed */}
        
        {/* Status bar area (empty for simplicity, part of phone frame color) */}
        <div className="h-[30px] flex-shrink-0 relative z-10 pt-1"> {/* Added pt-1 to push content slightly down from the top edge */}
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white text-xs font-semibold">19:40</div>
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white text-xs flex items-center space-x-1">
            <i className="fas fa-signal text-[10px]"></i>
            <i className="fas fa-wifi text-[10px]"></i>
            <i className="fas fa-battery-three-quarters text-sm"></i>
          </div>
        </div>

        {/* LINE App Header */}
        <div className={`${lineHeaderBg} h-[48px] flex-shrink-0 flex items-center justify-between px-3 text-white rounded-t-lg relative z-10`}>
          <i className="fas fa-chevron-left text-lg"></i>
          <div className="flex items-center space-x-1.5">
            <i className="fas fa-shield-alt text-green-400 text-sm"></i>
            <span className="text-sm font-medium">flex message</span>
          </div>
          <div className="flex items-center space-x-3">
            <i className="fas fa-home text-lg"></i>
            <i className="fas fa-chevron-down text-lg"></i>
          </div>
        </div>

        {/* LINE Chat Content Area */}
        <div className={`${lineChatAreaBg} flex-grow overflow-y-auto rounded-b-lg p-2 hide-scrollbar-chat-area`}>
          {/* ComponentPreview is now rendered within this scrollable chat area */}
          {flexMessage ? (
            <div className="w-full"> {/* Container for ComponentPreview to manage width correctly */}
                <ComponentPreview component={flexMessage} dispatch={dispatch} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/70">
              <p>Loading Flex Message...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
