
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
  // E-commerce & Retail
  "ออกแบบ Flex Message โปรโมชั่น 'Flash Sale' สำหรับร้านเสื้อผ้าแฟชั่นวัยรุ่นชื่อ 'StyleMeUp' สินค้าเป็นเสื้อยืดลายกราฟิก ลดราคา 50% เหลือ 299 บาท (ปกติ 598 บาท) เน้นรูปสินค้าที่นางแบบ/นายแบบใส่จริงดูเท่ๆ ใช้โทนสีส้ม-ดำตัดกันให้ดูโดดเด่น ปุ่ม CTA 'ช้อปเลย!' และ 'ดูคอลเลคชั่น'",
  "สร้างการ์ดแนะนำสินค้าใหม่ 'เครื่องหอมอโรม่าคอลเลคชั่น 'ใจสงบ'' จากร้าน 'หอมละมุน' เน้นภาพผลิตภัณฑ์สวยงามในบรรจุภัณฑ์มินิมอล พื้นหลังเป็นธรรมชาติสบายตา ระบุกลิ่น (เช่น ลาเวนเดอร์, ไม้จันทร์) และคุณสมบัติสั้นๆ ปุ่ม 'รายละเอียด' และ 'สั่งซื้อ'",
  "ออกแบบ Flex Message สำหรับร้าน 'ของขวัญแฮนด์เมดบายใจ' แสดงสินค้าแนะนำ 3 ชิ้น (Carousel) เช่น สมุดโน้ตปกผ้าไทย, พวงกุญแจเซรามิก, สบู่สมุนไพร แต่ละชิ้นมีภาพ ราคา และปุ่ม 'เพิ่มลงตะกร้า' ขนาดเล็ก",

  // Food & Beverage
  "สร้าง Flex Message โปรโมชั่นร้านอาหารญี่ปุ่น 'รสโออิชิ' สำหรับเมนู 'ชุดซูชิพรีเมียม' ราคาพิเศษ 799 บาท (จาก 999 บาท) โชว์ภาพชุดซูชิที่จัดเรียงสวยงามน่าทาน ใช้สีแดง-ดำ-ทองให้ดูหรูหรา ปุ่ม 'จองโต๊ะ' และ 'ดูเมนูทั้งหมด'",
  "ออกแบบการ์ดยืนยันการจองร้านอาหาร 'ครัวคุณยาย อาหารไทยต้นตำรับ' แสดงชื่อผู้จอง วันที่ เวลา จำนวนคน และแผนที่ร้าน (ใช้ Hero Image เป็นรูปแผนที่แบบเรียบง่าย) ปุ่ม 'เลื่อนการจอง' และ 'ยกเลิก'",
  "สร้าง Flex Message แนะนำเมนูพิเศษประจำเดือนของร้านคาเฟ่ 'หวานใจเบเกอรี่' ชื่อเมนู 'เค้กมะพร้าวอ่อนครีมสด' ราคา 120 บาท เน้นภาพเค้กที่ดูนุ่มฟู มีเลเยอร์สวยงาม ใช้โทนสีพาสเทล ปุ่ม 'สั่งกลับบ้าน' (Postback) และ 'ทานที่ร้าน' (Message)",

  // Services & Health
  "ออกแบบ Flex Message สำหรับโปรแกรมตรวจสุขภาพประจำปีของ 'โรงพยาบาลห่วงใยคุณ' ราคาเริ่มต้น 2,500 บาท แสดงรายการตรวจหลักๆ (เช่น ตรวจเลือด, X-ray) ด้วยไอคอนเรียบง่าย พร้อมปุ่ม 'แพ็กเกจทั้งหมด' และ 'นัดหมายแพทย์'",
  "สร้างการ์ดโปรโมชั่นสำหรับร้านสปา 'เรือนสบายไทยสปา' แพ็กเกจนวดอโรม่า 90 นาที ลด 20% เหลือ 1,200 บาท เน้นภาพบรรยากาศสปาที่ผ่อนคลาย ใช้สีเอิร์ธโทน ปุ่ม 'จองคิว' และ 'ดูบริการอื่น'",
  
  // Events & Information
  "ออกแบบการ์ดเชิญเข้าร่วมงานสัมมนาออนไลน์หัวข้อ 'การตลาดดิจิทัลยุค AI' ระบุชื่อวิทยากร วันเวลา และแพลตฟอร์ม (Zoom/Google Meet) มี Hero Image เป็นแบนเนอร์งานดีไซน์โมเดิร์น ปุ่ม 'ลงทะเบียนฟรี' และ 'รายละเอียดงาน'",
  "สร้าง Flex Message อวยพรเทศกาลสงกรานต์จากบริษัท 'พัฒนาไม่หยุด จำกัด' ดีไซน์สวยงามแบบไทยร่วมสมัย มีลายน้ำดอกไม้ และข้อความอวยพรสั้นๆ ปุ่ม 'เยี่ยมชมเว็บไซต์บริษัท'",

  // Membership & Loyalty
  "ออกแบบบัตรสมาชิกดิจิทัลสำหรับร้าน 'คอฟฟี่เลิฟเวอร์คลับ' แสดงชื่อสมาชิก ระดับ (Gold/Silver) และ QR Code สำหรับสะสมแต้ม/รับส่วนลด ใช้ดีไซน์เรียบหรูโทนสีน้ำตาล-ทอง ปุ่ม 'สิทธิพิเศษสมาชิก'",

  // Travel & Local
  "สร้าง Flex Message แนะนำที่พัก 'โฮมสเตย์บ้านสวนอิงดอย' จ.เชียงใหม่ แสดงภาพบรรยากาศที่พักแบบใกล้ชิดธรรมชาติ ราคาต่อคืน และกิจกรรมที่น่าสนใจ (เช่น เก็บผลไม้, เดินป่า) ปุ่ม 'ติดต่อที่พัก' และ 'ดูรูปเพิ่มเติม'",
  "ออกแบบ Flex Message โปรโมทงานเทศกาลผลไม้ประจำปีของจังหวัดระยอง แสดงไฮไลท์ของงาน (เช่น บุฟเฟต์ทุเรียน, ประกวดผลไม้) วันที่จัดงาน และแผนที่การเดินทาง ปุ่ม 'ข้อมูลงาน' และ 'ซื้อบัตรเข้าชม (ถ้ามี)'"
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
        const designToStrip = state.currentDesign as FlexContainer; // Assuming currentDesign is FlexContainer
        currentDesignJson = JSON.stringify(stripIds(designToStrip));
      } else if (mode === AiMode.Improve && !state.currentDesign) {
        setError("Cannot improve: No current design is loaded on the canvas.");
        dispatch({ type: 'SET_LOADING_AI', payload: false });
        return;
      }


      const generatedFlexContainer = await callGeminiApi(state.geminiApiKey, prompt, mode, currentDesignJson);
      
      // Ensure the AI response is a valid FlexContainer structure before adding IDs
      if (typeof generatedFlexContainer !== 'object' || generatedFlexContainer === null || 
         (generatedFlexContainer.type !== 'bubble' && generatedFlexContainer.type !== 'carousel')) {
           throw new Error("AI response was not a valid Flex Bubble or Carousel structure. Please try a more specific prompt or check the AI's output format.");
      }

      const designWithIds = addIdsToFlexMessage(generatedFlexContainer);

      dispatch({ type: 'SET_CURRENT_DESIGN', payload: designWithIds });
      dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isAiAssistantModalOpen', isOpen: false } });
      setPrompt(''); 
    } catch (err: any) {
      setError(err.message || "An unknown error occurred while interacting with the AI.");
    } finally {
      dispatch({ type: 'SET_LOADING_AI', payload: false });
    }
  };

  const closeModal = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'isAiAssistantModalOpen', isOpen: false } });
    setError(null);
    // setPrompt(''); // Optionally clear prompt on close
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
          {(Object.values(AiMode) as AiMode[]).map((mOption) => ( // Should render 2 buttons based on AiMode enum
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
              {mode === AiMode.Generate ? "อธิบาย Flex Message ที่คุณต้องการสร้าง:" : "อธิบายการปรับปรุงที่คุณต้องการสำหรับดีไซน์ปัจจุบัน:"}
            </label>
            <button
                onClick={handleSuggestPrompt}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-500 transition-colors"
                title="สุ่มตัวอย่าง Prompt"
                disabled={!state.geminiApiKey || state.isLoadingAi}
            >
                <i className="fas fa-random mr-1"></i> สุ่ม Prompt
            </button>
          </div>
          <textarea
            id="aiPrompt"
            rows={mode === AiMode.Generate ? 7 : 5} // Increased rows for more detailed prompts
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
                mode === AiMode.Generate 
                ? "เช่น 'สร้างการ์ดโปรโมชั่นร้านสปา ชื่อ 'สุขใจสปา' บริการนวดไทยแผนโบราณ ลด 20% สำหรับลูกค้าใหม่ ใช้โทนสีเขียว-ทองดูผ่อนคลาย มีรูปคนกำลังนวด และปุ่ม 'จองเลย' กับ 'ดูรายละเอียดเพิ่มเติม'" 
                : "เช่น 'ทำให้ดีไซน์นี้ดูสดใสขึ้น ลองใช้สีฟ้าพาสเทลและเพิ่มเงาให้องค์ประกอบต่างๆ' หรือ 'เปลี่ยนฟอนต์เป็นแบบทางการมากขึ้น และเพิ่มข้อความเกี่ยวกับเงื่อนไขการบริการ'"
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-gray-200"
            disabled={!state.geminiApiKey || state.isLoadingAi}
          />
        </div>

        {mode === AiMode.Improve && !state.currentDesign && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400"><i className="fas fa-info-circle mr-1"></i>ไม่มีดีไซน์ปัจจุบันให้ปรับปรุง ลอง "สร้างจาก Prompt" หรือโหลดดีไซน์ที่บันทึกไว้</p>
        )}

        {error && (
          <p className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2.5 rounded-md text-xs"><i className="fas fa-exclamation-circle mr-1.5"></i>{error}</p>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={!state.geminiApiKey || state.isLoadingAi || (mode === AiMode.Improve && !state.currentDesign) || !prompt.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]" // Increased min-width
          >
            {state.isLoadingAi ? (
              <i className="fas fa-spinner fa-spin text-lg"></i>
            ) : (
              <><i className="fas fa-wand-magic-sparkles mr-2"></i>สร้างเลย</>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            AI จะสร้าง LINE Flex Message JSON ตามคำสั่งของคุณ ตรวจสอบให้แน่ใจว่า Prompt ของคุณชัดเจนเพื่อให้ได้ผลลัพธ์ที่ดีที่สุด
            เนื้อหาที่สร้างขึ้นจะมาแทนที่ดีไซน์ปัจจุบันบน Canvas ของคุณ
        </p>
      </div>
    </Modal>
  );
};

export default AiAssistantModal;
