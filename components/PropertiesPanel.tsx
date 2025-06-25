
import React from 'react';
import { 
    AnyFlexComponent, FlexAction, FlexBox, FlexButton, FlexComponentBase, FlexImage, FlexText, 
    FlexBubble, FlexCarousel, FlexActionBase, FlexURIAction, FlexPostbackAction, FlexMessageAction,
    FlexDatetimePickerAction, FlexVideo // Added FlexVideo
} from '../types';
import { Action } from '../hooks/useAppReducer'; // Corrected import
import { 
    PROPERTY_LABEL_MAP, FLEX_SIZES, FLEX_SPACING_MARGIN_VALUES, FLEX_LAYOUT_OPTIONS, 
    FLEX_ALIGN_OPTIONS, FLEX_GRAVITY_OPTIONS, FLEX_IMAGE_ASPECT_RATIOS, FLEX_IMAGE_ASPECT_MODES,
    FLEX_BUTTON_STYLES, FLEX_ACTION_TYPES, FLEX_BUBBLE_SIZES
} from '../constants';

interface PropertiesPanelProps {
  component: AnyFlexComponent;
  dispatch: React.Dispatch<Action>;
}

const SectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2 border-b border-gray-200 dark:border-slate-700 pb-1">{children}</h3>
);

const PropertyInput: React.FC<{ label: string; value: any; onChange: (value: any) => void; type?: string; options?: Array<{value:string; label:string}>; componentType?: string; propertyKey: string }> = 
    ({ label, value, onChange, type = 'text', options, componentType, propertyKey }) => {
    
    const displayLabel = PROPERTY_LABEL_MAP[propertyKey] || label;

    if (options) {
        return (
            <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{displayLabel}</label>
                <select
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm dark:bg-slate-700 dark:text-gray-200"
                >
                    <option value="">Default / Not set</option>
                    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
        );
    }
    if (type === 'checkbox') {
         return (
            <div className="mb-3 flex items-center">
                <input
                    type="checkbox"
                    id={`${componentType}-${propertyKey}`}
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:focus:ring-offset-slate-800"
                />
                <label htmlFor={`${componentType}-${propertyKey}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">{displayLabel}</label>
            </div>
        );
    }
     if (type === 'color') {
        return (
            <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{displayLabel}</label>
                <div className="flex items-center">
                    <input
                        type="color"
                        value={value || '#000000'}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-8 h-8 p-0 border-none rounded-md overflow-hidden cursor-pointer"
                    />
                    <input 
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#RRGGBB"
                        className="ml-2 w-full px-2 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm dark:bg-slate-700 dark:text-gray-200"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{displayLabel}</label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm dark:bg-slate-700 dark:text-gray-200"
            />
        </div>
    );
};

const ActionPropertiesEditor: React.FC<{ action: FlexAction; onActionChange: (newAction: FlexAction) => void; componentId: string }> = 
    ({ action, onActionChange, componentId }) => {
    
    const handleActionTypeChange = (newType: FlexAction['type']) => {
        let newActionBase: Partial<FlexActionBase> = { type: newType, label: action.label };
        let specificProps: any = {};

        switch(newType) {
            case 'uri': 
                specificProps = { uri: '' };
                break;
            case 'postback': 
                specificProps = { data: '', displayText: '' };
                break;
            case 'message': 
                specificProps = { text: '' };
                break;
            case 'datetimepicker':
                specificProps = { data: '', mode: 'datetime' };
                break;
            // Add other cases for CameraAction, CameraRollAction, LocationAction, RichMenuSwitchAction if needed
            case 'camera':
            case 'cameraRoll':
            case 'location':
                 // These actions only have type and optional label
                break;
            case 'richmenuswitch':
                specificProps = { richMenuAliasId: '', data: ''};
                break;
            default: 
                 // Fallback to URI for safety, or could throw error
                newActionBase.type = 'uri';
                specificProps = { uri: '' };
        }
        onActionChange({ ...newActionBase, ...specificProps } as FlexAction);
    };

    return (
        <div className="p-2 border border-gray-200 dark:border-slate-700 rounded-md mt-1">
            <PropertyInput
                label="Action Type"
                propertyKey="actionType" 
                value={action.type}
                onChange={handleActionTypeChange}
                options={FLEX_ACTION_TYPES.map(t => ({ value: t, label: t }))}
                componentType={componentId} 
            />
            <PropertyInput 
                label="Label (Optional)" 
                propertyKey="label" 
                value={action.label} 
                onChange={(val) => onActionChange({ ...action, label: val })} 
                componentType={componentId} 
            />
            
            {action.type === 'uri' && (
                <PropertyInput 
                    label="URI" 
                    propertyKey="uri" 
                    value={(action as FlexURIAction).uri} 
                    onChange={(val) => onActionChange({ ...action, uri: val })} 
                    componentType={componentId} 
                />
            )}
            {action.type === 'postback' && (
                <>
                    <PropertyInput 
                        label="Data" 
                        propertyKey="data" 
                        value={(action as FlexPostbackAction).data} 
                        onChange={(val) => onActionChange({ ...action, data: val })} 
                        componentType={componentId} 
                    />
                    <PropertyInput 
                        label="Display Text (Optional)" 
                        propertyKey="displayText" 
                        value={(action as FlexPostbackAction).displayText} 
                        onChange={(val) => onActionChange({ ...action, displayText: val })} 
                        componentType={componentId} 
                    />
                </>
            )}
            {action.type === 'message' && (
                <PropertyInput 
                    label="Text" 
                    propertyKey="text" 
                    value={(action as FlexMessageAction).text} 
                    onChange={(val) => onActionChange({ ...action, text: val })} 
                    componentType={componentId} 
                />
            )}
            {action.type === 'datetimepicker' && (
                 <>
                    <PropertyInput 
                        label="Data" 
                        propertyKey="data" 
                        value={(action as FlexDatetimePickerAction).data} 
                        onChange={(val) => onActionChange({ ...action, data: val })} 
                        componentType={componentId} 
                    />
                    <PropertyInput 
                        label="Mode" 
                        propertyKey="mode" 
                        value={(action as FlexDatetimePickerAction).mode} 
                        onChange={(val) => onActionChange({ ...action, mode: val as FlexDatetimePickerAction['mode']})}
                        options={[{value:'date', label:'Date'}, {value:'time', label:'Time'}, {value:'datetime', label:'Date & Time'}]}
                        componentType={componentId} 
                    />
                    {/* Add initial, max, min if needed */}
                 </>
            )}
            {/* Add more action type specific fields here */}
        </div>
    );
};


const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ component, dispatch }) => {
  const updateProperty = (key: string, value: any) => {
    dispatch({ type: 'UPDATE_COMPONENT_PROPS', payload: { componentId: component.id, props: { [key]: value } } });
  };
  
  const handleActionChange = (newAction?: FlexAction) => { 
    dispatch({ type: 'UPDATE_COMPONENT_PROPS', payload: { componentId: component.id, props: { action: newAction } } });
  };

  const renderCommonProperties = (comp: AnyFlexComponent) => {
    // Some components like Bubble/Carousel don't have flex/margin at their root in the same way simple components do.
    // Check if property exists before rendering input for it.
    const hasFlex = 'flex' in comp;
    const hasMargin = 'margin' in comp;

    return (
    <>
      {hasFlex && <PropertyInput label="Flex Grow" propertyKey="flex" value={(comp as any).flex} onChange={(val) => updateProperty('flex', val)} type="number" componentType={comp.type} />}
      {hasMargin && <PropertyInput 
        label="Margin" 
        propertyKey="margin"
        value={(comp as any).margin} 
        onChange={(val) => updateProperty('margin', val)} 
        options={
            (FLEX_SPACING_MARGIN_VALUES.map(s => ({value: s, label:s})) as Array<{value: string, label: string}>)
            .concat([
                {value: '1px', label:'1px (custom)'}, 
                {value: '5px', label:'5px (custom)'}, 
                {value: '10px', label:'10px (custom)'}
            ])
        }
        componentType={comp.type} 
      />}
      {/* TODO: Add position, offsetTop, etc. for components that support it */}
    </>
  )};

  const renderActionProperty = (comp: FlexText | FlexImage | FlexButton | FlexBox | FlexBubble | FlexVideo) => {
     if (!('action' in comp)) return null; 
     const currentAction = comp.action as FlexAction | undefined; 

     return (
        <>
            <SectionTitle>Action</SectionTitle>
            {currentAction ? (
                 <ActionPropertiesEditor action={currentAction} onActionChange={handleActionChange} componentId={comp.id} />
            ) : (
                <button 
                    onClick={() => handleActionChange({ type: 'uri', label: 'Action', uri: 'https://example.com' } as FlexURIAction)}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                    + Add Action
                </button>
            )}
            {currentAction && <button onClick={() => handleActionChange(undefined)} className="text-xs text-red-500 hover:underline mt-1">Remove Action</button>}
        </>
     )
  };

  return (
    <div className="text-sm text-gray-800 dark:text-gray-100 animate-fadeIn">
      <h2 className="text-lg font-semibold mb-3 border-b border-gray-300 dark:border-slate-600 pb-2">
        Properties: <span className="text-primary-600 dark:text-primary-400 capitalize">{component.type}</span>
        <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">(ID: {component.id})</span>
      </h2>
      
      {component.type === 'text' && (
        <>
          <PropertyInput label="Text Content" propertyKey="text" value={(component as FlexText).text} onChange={(val) => updateProperty('text', val)} componentType="text" />
          <PropertyInput label="Size" propertyKey="size" value={(component as FlexText).size} onChange={(val) => updateProperty('size', val)} options={FLEX_SIZES.map(s => ({value: s, label:s}))} componentType="text" />
          <PropertyInput label="Weight" propertyKey="weight" value={(component as FlexText).weight} onChange={(val) => updateProperty('weight', val)} options={[{value: 'regular', label: 'Regular'}, {value: 'bold', label: 'Bold'}]} componentType="text" />
          <PropertyInput label="Color" propertyKey="color" value={(component as FlexText).color} onChange={(val) => updateProperty('color', val)} type="color" componentType="text" />
          <PropertyInput label="Align" propertyKey="align" value={(component as FlexText).align} onChange={(val) => updateProperty('align', val)} options={FLEX_ALIGN_OPTIONS.map(o => ({value: o, label: o}))} componentType="text" />
          <PropertyInput label="Wrap Text" propertyKey="wrap" value={(component as FlexText).wrap} onChange={(val) => updateProperty('wrap', val)} type="checkbox" componentType="text" />
          <PropertyInput label="Max Lines" propertyKey="maxLines" value={(component as FlexText).maxLines} onChange={(val) => updateProperty('maxLines', val)} type="number" componentType="text" />
          {renderCommonProperties(component)}
          {renderActionProperty(component as FlexText)}
          {/* TODO: Add editor for FlexText.contents (FlexSpan[]) if needed */}
        </>
      )}

      {component.type === 'box' && (
        <>
          <PropertyInput label="Layout" propertyKey="layout" value={(component as FlexBox).layout} onChange={(val) => updateProperty('layout', val)} options={FLEX_LAYOUT_OPTIONS.map(o => ({value: o, label: o}))} componentType="box" />
          <PropertyInput label="Spacing" propertyKey="spacing" value={(component as FlexBox).spacing} onChange={(val) => updateProperty('spacing', val)} options={FLEX_SPACING_MARGIN_VALUES.map(s => ({value: s, label: s}))} componentType="box" />
          <PropertyInput label="Background Color" propertyKey="backgroundColor" value={(component as FlexBox).backgroundColor} onChange={(val) => updateProperty('backgroundColor', val)} type="color" componentType="box" />
          <PropertyInput label="Border Color" propertyKey="borderColor" value={(component as FlexBox).borderColor} onChange={(val) => updateProperty('borderColor', val)} type="color" componentType="box" />
          <PropertyInput label="Border Width" propertyKey="borderWidth" value={(component as FlexBox).borderWidth} onChange={(val) => updateProperty('borderWidth', val)} componentType="box" />
          <PropertyInput label="Corner Radius" propertyKey="cornerRadius" value={(component as FlexBox).cornerRadius} onChange={(val) => updateProperty('cornerRadius', val)} componentType="box" />
          <PropertyInput label="Padding (All)" propertyKey="paddingAll" value={(component as FlexBox).paddingAll} onChange={(val) => updateProperty('paddingAll', val)} componentType="box" />
          {/* Add justifyContent, alignItems etc. */}
          {renderCommonProperties(component)}
          {renderActionProperty(component as FlexBox)}
        </>
      )}

      {component.type === 'image' && (
        <>
            <PropertyInput label="Image URL" propertyKey="url" value={(component as FlexImage).url} onChange={(val) => updateProperty('url', val)} componentType="image" />
            <PropertyInput label="Size" propertyKey="size" value={(component as FlexImage).size} onChange={(val) => updateProperty('size', val)} options={FLEX_SIZES.map(s => ({value:s, label:s}))} componentType="image" />
            <PropertyInput label="Aspect Ratio" propertyKey="aspectRatio" value={(component as FlexImage).aspectRatio} onChange={(val) => updateProperty('aspectRatio', val)} options={FLEX_IMAGE_ASPECT_RATIOS.map(s => ({value:s, label:s}))} componentType="image" />
            <PropertyInput label="Aspect Mode" propertyKey="aspectMode" value={(component as FlexImage).aspectMode} onChange={(val) => updateProperty('aspectMode', val)} options={FLEX_IMAGE_ASPECT_MODES.map(s => ({value:s, label:s}))} componentType="image" />
            <PropertyInput label="Background Color" propertyKey="backgroundColor" value={(component as FlexImage).backgroundColor} onChange={(val) => updateProperty('backgroundColor', val)} type="color" componentType="image" />
            {renderCommonProperties(component)}
            {renderActionProperty(component as FlexImage)}
        </>
      )}
      {component.type === 'button' && (
        <>
            <PropertyInput label="Style" propertyKey="style" value={(component as FlexButton).style} onChange={(val) => updateProperty('style', val)} options={FLEX_BUTTON_STYLES.map(s => ({value:s, label:s}))} componentType="button" />
            <PropertyInput label="Color" propertyKey="color" value={(component as FlexButton).color} onChange={(val) => updateProperty('color', val)} type="color" componentType="button" />
            <PropertyInput label="Height" propertyKey="height" value={(component as FlexButton).height} onChange={(val) => updateProperty('height', val)} options={[{value: 'sm', label: 'Small'}, {value: 'md', label: 'Medium'}]} componentType="button" />
            {renderCommonProperties(component)}
            {renderActionProperty(component as FlexButton)}
        </>
      )}
       {component.type === 'bubble' && (
        <>
            <PropertyInput label="Bubble Size" propertyKey="size" value={(component as FlexBubble).size} onChange={(val) => updateProperty('size', val)} options={FLEX_BUBBLE_SIZES.map(s => ({value:s, label:s}))} componentType="bubble" />
            {/* TODO: Bubble Styles (header, hero, body, footer background colors etc) */}
            {renderCommonProperties(component)}
            {renderActionProperty(component as FlexBubble)}
        </>
      )}
      {component.type === 'carousel' && (
        <>
           <p className="text-xs text-gray-500 dark:text-gray-400">Manage Carousel contents (Bubbles) on the canvas.</p>
           {renderCommonProperties(component)}
        </>
      )}
      {component.type === 'video' && (
        <>
            <PropertyInput label="Video URL" propertyKey="url" value={(component as FlexVideo).url} onChange={(val) => updateProperty('url', val)} componentType="video" />
            <PropertyInput label="Preview Image URL" propertyKey="previewUrl" value={(component as FlexVideo).previewUrl} onChange={(val) => updateProperty('previewUrl', val)} componentType="video" />
            <PropertyInput label="Aspect Ratio" propertyKey="aspectRatio" value={(component as FlexVideo).aspectRatio} onChange={(val) => updateProperty('aspectRatio', val)} options={FLEX_IMAGE_ASPECT_RATIOS.map(s => ({value:s, label:s}))} componentType="video" />
            {/* TODO: altContent (Box) editor - this is complex as it involves adding/editing a nested Box component */}
            {renderCommonProperties(component)}
            {renderActionProperty(component as FlexVideo)}
        </>
      )}
      {component.type === 'separator' && (
        <>
            <PropertyInput label="Color" propertyKey="color" value={(component as any).color} onChange={(val) => updateProperty('color', val)} type="color" componentType="separator" />
            {renderCommonProperties(component)}
        </>
      )}
      {component.type === 'icon' && (
         <>
            <PropertyInput label="Icon URL" propertyKey="url" value={(component as any).url} onChange={(val) => updateProperty('url', val)} componentType="icon" />
            <PropertyInput label="Size" propertyKey="size" value={(component as any).size} onChange={(val) => updateProperty('size', val)} options={FLEX_SIZES.map(s => ({value: s, label:s}))} componentType="icon" />
            <PropertyInput label="Aspect Ratio" propertyKey="aspectRatio" value={(component as any).aspectRatio} onChange={(val) => updateProperty('aspectRatio', val)} options={FLEX_IMAGE_ASPECT_RATIOS.map(s => ({value:s, label:s}))} componentType="icon" />
            {renderCommonProperties(component)}
            {/* Icons don't typically have actions in LINE Flex, but action prop could be added to FlexIcon type if desired/supported */}
        </>
      )}
      {/* Spacer component is removed, so its properties editor is not needed */}
    </div>
  );
};

export default PropertiesPanel;