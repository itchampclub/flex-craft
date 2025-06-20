
import React, { useState } from 'react';
import Modal from './Modal';
import { AppState, Action, AiMode, FlexContainer } from '../../hooks/useAppReducer';
import { callGeminiApi } from '../../services/geminiService';
import { stripIds, addIdsToFlexMessage } from '../../utils/flexTransform'; // To send clean JSON and add IDs back

interface AiAssistantModalProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const THAI_STYLE_PROMPTS: string[] = [
  "สร้างโปรโมชั่นร้านกาแฟ 'ชาวคราฟท์คอฟฟี่' เมนู 'ลาเต้อาร์ตชาววัง' ลดเหลือ 99 บาท จาก 120 บาท มีรูปแก้วกาแฟลายไทยสวยๆ และปุ่ม 'สั่งเลย' กับ 'ดูเมนูอื่น'",
  "ออกแบบบัตรสมาชิกสำหรับร้าน 'สบายดีสปา' โทนสีเขียวทอง มีโลโก้ดอกบัว แสดงชื่อลูกค้าและระดับสมาชิก พร้อมปุ่ม 'ดูสิทธิพิเศษ'",
  "สร้างการ์ดเชิญร่วมงานบุญทอดกฐินวัดอรุณฯ ระบุวันเวลา สถานที่ มีภาพเจดีย์วัดอรุณฯ และปุ่ม 'ดูแผนที่'",
  "โปรโมชั่นร้านอาหารอีสาน 'แซ่บนัวครัวบ้านทุ่ง' ลด 20% ทุกเมนูส้มตำ มีรูปส้มตำน่าทาน และปุ่ม 'จองโต๊ะ'",
  "ออกแบบ Flex Message สำหรับแนะนำสินค้า OTOP ใหม่ 'ผ้าไหมลายมัดหมี่สุรินทร์' มีรูปผ้าไหมสวยๆ รายละเอียดสินค้า และปุ่ม 'สั่งซื้อออนไลน์'",
  "สร้างการ์ดอวยพรวันสงกรานต์แบบไทยๆ มีรูปขันน้ำ พวงมาลัย ข้อความ 'สุขสันต์วันสงกรานต์' และปุ่ม 'ส่งคำอวยพร'",
  "ออกแบบ Flex Message สำหรับโรงแรม 'เรือนไทยริมน้ำ' แสดงห้องพักแบบต่างๆ เช่น 'ห้องชมจันทร์' 'ห้องริมคลอง' พร้อมราคาและปุ่ม 'ติดต่อสอบถาม'",
  "โปรโมชั่นคลินิกเสริมความงาม 'สวยสั่งได้คลินิก' ทรีทเม้นท์หน้าใสลด 50% มีรูปนางแบบหน้าใส และปุ่ม 'นัดคิวปรึกษา'",
  "สร้าง Flex Message แจ้งเตือนลูกค้าสำหรับคลาสเรียนทำอาหารไทย 'ครัวคุณย่า' แสดงชื่อคลาส วันเวลา และปุ่ม 'ยืนยันการเข้าร่วม'",
  "ออกแบบการ์ดแนะนำตัวสำหรับ 'หมอดูแม่นๆ ณ ตลาดน้ำ' แสดงรูปหมอดู บริการที่ดู (ไพ่ยิปซี, ลายมือ) และเบอร์โทรติดต่อ",
  "สร้าง Flex Message โปรโมชั่นร้านผลไม้ 'สวนคุณตา' มะม่วงน้ำดอกไม้เกรดพรีเมียม กิโลละ 80 บาท มีรูปมะม่วงสวยๆ และปุ่ม 'สั่งเดลิเวอรี่'",
  "ออกแบบบัตรสะสมแต้มสำหรับร้านชานมไข่มุก 'มุกมิกซ์คาเฟ่' ทุก 10 แก้ว แถม 1 แก้ว มีช่องใส่สแตมป์ และ QR Code สำหรับสะสมแต้ม",
  "สร้าง Flex Message แนะนำสถานที่ท่องเที่ยวเชิงวัฒนธรรม 'หมู่บ้านไทยโบราณ' แสดงกิจกรรม เช่น การแสดงรำไทย, เวิร์คช็อปงานฝีมือ และปุ่ม 'ซื้อบัตรเข้าชม'",
  "โปรโมชั่นร้านตัดผมชาย 'แมนๆบาร์เบอร์' ทรงผมวินเทจลดราคาพิเศษ มีรูปทรงผมเท่ๆ และปุ่ม 'จองคิวช่าง'",
  "ออกแบบ Flex Message สำหรับโครงการคอนโด 'สุขสบายเรสซิเดนซ์' ใกล้รถไฟฟ้า แสดงแบบห้อง ราคาเริ่มต้น และปุ่ม 'ลงทะเบียนรับส่วนลด'"
];

const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ state, dispatch }) => {
  const [mode, setMode] = useState<AiMode>(AiMode.Generate);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSuggestPrompt = () => {
    const randomIndex = Math.floor(Math.random() * THAI_STYLE_PROMPTS.length);
    setPrompt(THAI_STYLE_PROMPTS[randomIndex]);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    if (!state.geminiApiKey) {
      setError("Gemini API Key is not set. Please configure it in Settings.");
      dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isAiAssistantModalOpen', isOpen: false } });
      dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isAiSettingsModalOpen', isOpen: true } });
      return;
    }

    setError(null);
    dispatch({ type: 'SET_LOADING_AI', payload: true });

    try {
      let currentDesignJson: string | undefined = undefined;
      if (mode === AiMode.Improve && state.currentDesign) {
        const designToStrip = state.currentDesign as FlexContainer;
        currentDesignJson = JSON.stringify(stripIds(designToStrip));
      }

      const generatedFlexContainer = await callGeminiApi(state.geminiApiKey, prompt, mode, currentDesignJson);
      const designWithIds = addIdsToFlexMessage(generatedFlexContainer);

      dispatch({ type: 'SET_CURRENT_DESIGN', payload: designWithIds });
      dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isAiAssistantModalOpen', isOpen: false } });
      setPrompt(''); 
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      dispatch({ type: 'SET_LOADING_AI', payload: false });
    }
  };

  const closeModal = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isAiAssistantModalOpen', isOpen: false } });
    setError(null);
  };

  return (
    <Modal
      isOpen={state.isAiAssistantModalOpen}
      onClose={closeModal}
      title="AI Assistant (Powered by Gemini)"
      size="lg"
    >
      <div className="space-y-4 text-sm">
        {!state.geminiApiKey && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-800/30 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-md">
            <p className="text-yellow-700 dark:text-yellow-300">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              Gemini API Key not found. Please <button onClick={() => { closeModal(); dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isAiSettingsModalOpen', isOpen: true } }); }} className="font-semibold underline hover:text-yellow-600 dark:hover:text-yellow-200">set your API Key</button> in Settings to use the AI Assistant.
            </p>
          </div>
        )}
        <div className="flex space-x-2 border-b border-gray-200 dark:border-slate-700 pb-3 mb-3">
          {(Object.values(AiMode) as AiMode[]).map((mOption) => (
            <button
              key={mOption}
              onClick={() => setMode(mOption)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${mode === mOption ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
            >
              {mOption}
            </button>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="aiPrompt" className="block font-medium text-gray-700 dark:text-gray-300">
              {mode === AiMode.Generate ? "Describe the Flex Message you want to create:" : "Describe the improvements you want for the current design:"}
            </label>
            <button
                onClick={handleSuggestPrompt}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500 transition-colors"
                title="Get a random prompt suggestion"
                disabled={!state.geminiApiKey || state.isLoadingAi}
            >
                <i className="fas fa-random mr-1"></i> Suggest a Prompt
            </button>
          </div>
          <textarea
            id="aiPrompt"
            rows={mode === AiMode.Generate ? 6 : 4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
                mode === AiMode.Generate 
                ? "e.g., 'Create a coffee shop promotion for a Latte Art Special, 99 baht (was 120), with a nice coffee image and two buttons: Order Now, View Menu'" 
                : "e.g., 'Make this design more premium using black and gold. Change font to something elegant.' or 'Add a footer with Facebook and website links.'"
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-gray-200"
            disabled={!state.geminiApiKey || state.isLoadingAi}
          />
        </div>

        {mode === AiMode.Improve && !state.currentDesign && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">There is no current design to improve. Try "Generate from Scratch" or load a design.</p>
        )}

        {error && (
          <p className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded-md text-xs"><i className="fas fa-exclamation-circle mr-1"></i>{error}</p>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={!state.geminiApiKey || state.isLoadingAi || (mode === AiMode.Improve && !state.currentDesign) || !prompt.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
          >
            {state.isLoadingAi ? (
              <i className="fas fa-spinner fa-spin text-lg"></i>
            ) : (
              <><i className="fas fa-wand-magic-sparkles mr-2"></i>Generate</>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            The AI will generate a LINE Flex Message JSON. Ensure your prompt is clear for best results.
            The generated content will replace your current design canvas.
        </p>
      </div>
    </Modal>
  );
};

export default AiAssistantModal;
