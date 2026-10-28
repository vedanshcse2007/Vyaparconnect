import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  CheckCircle2,
  VolumeX,
  PackagePlus,
  Check,
  Languages,
  User,
  Store,
  Radio,
  Globe2,
  RefreshCw,
  HelpCircle,
  Package,
  TrendingUp,
  BarChart2,
  Layers,
  Zap,
} from 'lucide-react';
import { Product, Shop, VoiceAssistantResult } from '../../types/index.ts';
import {
  sendVoiceQuery,
  extractVoiceToCatalogue,
  confirmVoiceToCatalogue,
  transcribeAudioData,
  translateResponseText,
} from '../../lib/api.ts';

interface VyaparVoiceProps {
  currentShop: Shop;
  products: Product[];
  onRefreshData: () => Promise<void>;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  speakerRole: 'retailer' | 'customer' | 'staff';
  text: string;
  timestamp: string;
  spokenLanguage?: string;
  spokenLanguageName?: string;
  preferredLanguage?: string;
  currentDisplayLang?: string;
  translations?: Record<string, string>;
  adaptiveAnalysis?: VoiceAssistantResult['adaptiveAnalysis'];
  action?: VoiceAssistantResult['action'];
  source?: 'gemini' | 'rule_fallback';
  audioBlobUrl?: string;
}

export const LANGUAGE_OPTIONS = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'en', name: 'English', native: 'English', speechCode: 'en-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', speechCode: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', speechCode: 'gu-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'hinglish', name: 'Hinglish', native: 'Hinglish', speechCode: 'hi-IN' },
];

const RETAILER_SAMPLE_PROMPTS = [
  {
    en: 'How many notebooks are available?',
    hi: 'कितने नोटबुक्स उपलब्ध हैं?',
    mr: 'किती वह्या उपलब्ध आहेत?',
    gu: 'કેટલી નોટબુક ઉપલબ્ધ છે?',
    type: 'query',
  },
  {
    en: 'How many calculators are available?',
    hi: 'कैलकुलेटर कितने उपलब्ध हैं?',
    mr: 'कॅल्क्युलेटर किती शिल्लक आहेत?',
    gu: 'કેલ્ક્યુલેટર કેટલા ઉપલબ્ધ છે?',
    type: 'query',
  },
  {
    en: "What were today's recorded sales?",
    hi: 'आज की कुल बिक्री कितनी हुई?',
    mr: 'आजची एकूण विक्री किती झाली?',
    gu: 'આજનું વેચાણ કેટલું થયું?',
    type: 'query',
  },
  {
    en: 'Which products are running low?',
    hi: 'कौन सा सामान कम बचा है?',
    mr: 'कोणते सामान संपत आले आहे?',
    gu: 'કયો માલ ઓછો બચ્યો છે?',
    type: 'query',
  },
  {
    en: 'Analyze shop dashboard',
    hi: 'दुकान का डैशबोर्ड विश्लेषण बताओ',
    mr: 'दुकानाचा डॅशबोर्ड अहवाल द्या',
    gu: 'દુકાનનો ડેશબોર્ડ રિપોર્ટ આપો',
    type: 'query',
  },
  {
    en: 'Add 15 blue pens at ₹10 each',
    hi: '15 ब्लू पेन 10 रुपये के भाव से जोड़ो',
    mr: '15 निळे पेन 10 रुपयांना जोडा',
    gu: '15 બ્લુ પેન 10 રૂપિયાના ભાવે ઉમેરો',
    type: 'catalogue_entry',
  },
  {
    en: 'Record sale of 5 notebooks',
    hi: '5 नोटबुक की बिक्री दर्ज करो',
    mr: '5 वह्यांची विक्री नोंदवा',
    gu: '5 નોટબુકનું વેચાણ નોંધો',
    type: 'sale',
  },
];

const CUSTOMER_SAMPLE_PROMPTS = [
  {
    en: 'Do you have scientific calculator available?',
    hi: 'क्या साइंटिफिक कैलकुलेटर उपलब्ध है?',
    mr: 'सायंटिफिक कॅल्क्युलेटर मिळेल का?',
    gu: 'શું સાયન્ટિફિક કેલ્ક્યુલેટર ઉપલબ્ધ છે?',
    type: 'query',
  },
  {
    en: 'What is the price of Classmate notebooks?',
    hi: 'क्लासमेट नोटबुक का क्या रेट है?',
    mr: 'क्लासमेट वहीचा दर काय आहे?',
    gu: 'ક્લાસમેટ નોટબુકનો ભાવ શું છે?',
    type: 'query',
  },
  {
    en: 'Are ball pens in stock right now?',
    hi: 'क्या बॉल पेन अभी स्टॉक में हैं?',
    mr: 'बॉल पेन सध्या शिल्लक आहेत का?',
    gu: 'બોલ પેન અત્યારે સ્ટોકમાં છે?',
    type: 'query',
  },
  {
    en: 'Is toor dal available and what is the rate?',
    hi: 'तूर दाल उपलब्ध है और क्या भाव है?',
    mr: 'तूर डाळ उपलब्ध आहे का आणि काय दर आहे?',
    gu: 'તુવેર દાળ ઉપલબ્ધ છે અને શું ભાવ છે?',
    type: 'query',
  },
];

export const VyaparVoice: React.FC<VyaparVoiceProps> = ({
  currentShop,
  products,
  onRefreshData,
  selectedLanguage,
  onLanguageChange,
}) => {
  // Speaker selection: "who is telling"
  const [speakerRole, setSpeakerRole] = useState<'retailer' | 'customer'>('retailer');

  // Preferred response language
  const [preferredLang, setPreferredLang] = useState<string>(selectedLanguage || 'hi');

  // Live Speech Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [liveInterimTranscript, setLiveInterimTranscript] = useState<string>('');
  const [liveDetectedLang, setLiveDetectedLang] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Audio recording via MediaRecorder for Gemini 3.5 Transcribe
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Messages thread
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      speakerRole: 'retailer',
      text:
        preferredLang === 'hi'
          ? `नमस्ते! मैं आपका व्यापार सहायक (VyaparVoice) हूँ। अब मैं लाइव पहचान सकता हूँ कि कौन बोल रहा है (दुकानदार या ग्राहक), किस भाषा में बोल रहे हैं, और आपके चुने हुए पसंदीदा भाषा में तुरंत उत्तर दे सकता हूँ!`
          : preferredLang === 'mr'
          ? `नमस्कार! मी आपला व्यापार सहाय्यक (VyaparVoice) आहे. आपण कोणत्या भाषेत बोलत आहात आणि कोण बोलत आहे हे ओळखून मी आपल्या पसंतीच्या भाषेत उत्तर देतो!`
          : preferredLang === 'gu'
          ? `નમસ્તે! હું આપનો વ્યાપાર સહાયક (VyaparVoice) છું. તમે જે ભાષામાં બોલશો તે સમજીને હું તમારી પસંદગીની ભાષામાં ઉત્તર આપીશ!`
          : `Hello! I am your VyaparVoice assistant for ${currentShop.name}. I detect who is speaking (Shopkeeper vs Customer), what language is spoken, and deliver answers in your preferred language!`,
      timestamp: new Date().toLocaleTimeString(),
      preferredLanguage: preferredLang,
      currentDisplayLang: preferredLang,
      source: 'rule_fallback',
    },
  ]);

  const [speechSynthesisActive, setSpeechSynthesisActive] = useState<boolean>(true);
  const [activeProposal, setActiveProposal] = useState<any | null>(null);
  const [proposalLoading, setProposalLoading] = useState<boolean>(false);
  const [translatingMsgId, setTranslatingMsgId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Quick detect spoken language on client side for live visual badge
  const clientDetectLanguage = (text: string): { code: string; name: string } => {
    if (!text) return { code: 'en', name: 'English' };
    if (/[\u0A80-\u0AFF]/.test(text)) return { code: 'gu', name: 'Gujarati (ગુજરાતી)' };
    if (/[\u0980-\u09FF]/.test(text)) return { code: 'bn', name: 'Bengali (বাংলা)' };
    if (/[\u0B80-\u0BFF]/.test(text)) return { code: 'ta', name: 'Tamil (தமிழ்)' };
    if (/[\u0C00-\u0C7F]/.test(text)) return { code: 'te', name: 'Telugu (తెలుగు)' };
    if (/[\u0C80-\u0CFF]/.test(text)) return { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' };
    if (/[\u0900-\u097F]/.test(text)) {
      if (['आहे', 'किती', 'झाले', 'द्या', 'पाहिजे', 'संपत', 'वह्या', 'नोंदवा'].some((w) => text.includes(w))) {
        return { code: 'mr', name: 'Marathi (मराठी)' };
      }
      return { code: 'hi', name: 'Hindi (हिन्दी)' };
    }
    const low = text.toLowerCase();
    if (/\b(kiti|ahe|sampat|vahi|vahya|dya|pahije)\b/i.test(low)) return { code: 'mr', name: 'Marathi (मराठी)' };
    if (/\b(ketla|chhe|che|aapo|bhav|shu|joyiye)\b/i.test(low)) return { code: 'gu', name: 'Gujarati (ગુજરાતી)' };
    if (/\b(kitne|kitni|koun|samaan|bachi|bache|bech|diya|aaj|bikri|jodo|karo|chahiye|hai|batao)\b/i.test(low)) {
      return { code: 'hi', name: 'Hindi (हिन्दी)' };
    }
    return { code: 'en', name: 'English' };
  };

  // Sync prop changes
  useEffect(() => {
    if (selectedLanguage && selectedLanguage !== preferredLang) {
      setPreferredLang(selectedLanguage);
    }
  }, [selectedLanguage]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      // Indian multilingual recognition defaults
      let langCode = 'hi-IN';
      if (preferredLang === 'en') langCode = 'en-IN';
      else if (preferredLang === 'mr') langCode = 'mr-IN';
      else if (preferredLang === 'gu') langCode = 'gu-IN';
      else if (preferredLang === 'ta') langCode = 'ta-IN';
      else if (preferredLang === 'bn') langCode = 'bn-IN';
      recognition.lang = langCode;

      recognition.onstart = () => {
        setIsListening(true);
        setLiveInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript;
          } else {
            interimStr += item[0].transcript;
          }
        }

        const currentSpeech = (finalStr || interimStr).trim();
        setLiveInterimTranscript(currentSpeech);

        if (currentSpeech) {
          const detected = clientDetectLanguage(currentSpeech);
          setLiveDetectedLang(detected.name);
        }

        if (finalStr && finalStr.trim()) {
          setInputText(finalStr.trim());
          handleSendQuery(finalStr.trim());
          setLiveInterimTranscript('');
          setLiveDetectedLang('');
          try {
            recognition.stop();
          } catch (_) {}
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [preferredLang]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, activeProposal, liveInterimTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query in the box.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    } else {
      try {
        let langCode = 'hi-IN';
        if (preferredLang === 'en') langCode = 'en-IN';
        else if (preferredLang === 'mr') langCode = 'mr-IN';
        else if (preferredLang === 'gu') langCode = 'gu-IN';
        else if (preferredLang === 'ta') langCode = 'ta-IN';
        recognitionRef.current.lang = langCode;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  // Record raw audio using MediaRecorder for Gemini 3.5 Transcribe
  const handleToggleAudioRecording = async () => {
    if (isRecordingAudio) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingAudio(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const recorder = new MediaRecorder(stream, { mimeType });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const audioUrl = URL.createObjectURL(audioBlob);

          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64data = (reader.result as string)?.split(',')[1];
            if (base64data) {
              setLoading(true);
              try {
                const transcribed = await transcribeAudioData(base64data, mimeType, speakerRole);
                if (transcribed.transcript) {
                  setInputText(transcribed.transcript);
                  handleSendQuery(transcribed.transcript, transcribed.detectedLanguageCode, audioUrl);
                }
              } catch (err) {
                console.warn('Transcribe audio error, using typed input:', err);
              } finally {
                setLoading(false);
              }
            }
          };
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecordingAudio(true);
      } catch (err) {
        console.warn('MediaRecorder error or mic denied:', err);
        alert('Microphone access denied or not available. Use the text input or speech recognition.');
      }
    }
  };

  // Text to speech playback in specific language
  const speakText = (text: string, targetLanguage?: string) => {
    if (!speechSynthesisActive || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const lang = targetLanguage || preferredLang;

      const langObj = LANGUAGE_OPTIONS.find((l) => l.code === lang);
      utterance.lang = langObj?.speechCode || 'hi-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  };

  // Send query to backend with speaker role, detected language, and preferred language
  const handleSendQuery = async (queryText?: string, explicitSpokenLang?: string, audioUrl?: string) => {
    const text = (queryText || inputText).trim();
    if (!text || loading) return;

    // Detect spoken language
    const detectedInfo = clientDetectLanguage(text);
    const spokenLangCode = explicitSpokenLang || detectedInfo.code;
    const spokenLangName = detectedInfo.name;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      speakerRole,
      text,
      timestamp: new Date().toLocaleTimeString(),
      spokenLanguage: spokenLangCode,
      spokenLanguageName: spokenLangName,
      audioBlobUrl: audioUrl,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    // If Shopkeeper and asking for Voice-to-Catalogue Entry
    const isCatalogueEntry =
      speakerRole === 'retailer' &&
      (text.toLowerCase().includes('add') ||
        text.toLowerCase().includes('जोड़ो') ||
        text.toLowerCase().includes('जोडा') ||
        text.toLowerCase().includes('ઉમેરો')) &&
      (text.toLowerCase().includes('at') ||
        text.toLowerCase().includes('each') ||
        text.toLowerCase().includes('₹') ||
        text.toLowerCase().includes('रुपये') ||
        text.toLowerCase().includes('ભાવ'));

    if (isCatalogueEntry) {
      try {
        const proposal = await extractVoiceToCatalogue(text, currentShop.id);
        setActiveProposal(proposal);
        setLoading(false);
        const promptMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          speakerRole: 'retailer',
          text: proposal.confirmationPrompt,
          timestamp: new Date().toLocaleTimeString(),
          preferredLanguage: preferredLang,
          currentDisplayLang: preferredLang,
          source: 'rule_fallback',
        };
        setMessages((prev) => [...prev, promptMsg]);
        speakText(proposal.confirmationPrompt, preferredLang);
        return;
      } catch (err) {
        console.warn('Voice catalogue extraction fallback:', err);
      }
    }

    try {
      const result = await sendVoiceQuery(
        text,
        currentShop.id,
        preferredLang,
        speakerRole,
        spokenLangCode
      );

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        speakerRole,
        text: result.replyText,
        timestamp: new Date().toLocaleTimeString(),
        preferredLanguage: result.preferredLanguage || preferredLang,
        currentDisplayLang: result.preferredLanguage || preferredLang,
        translations: result.translations,
        action: result.action,
        source: result.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If an action was executed, refresh live database across the app!
      if (result.action?.executed) {
        await onRefreshData();
      }

      speakText(result.speechText, result.preferredLanguage || preferredLang);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          speakerRole,
          text: `Could not process query: ${err.message}. Please try again.`,
          timestamp: new Date().toLocaleTimeString(),
          preferredLanguage: preferredLang,
          currentDisplayLang: preferredLang,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Change answer language on an existing assistant message
  const handleChangeAnswerLanguage = async (msgId: string, newTargetLang: string) => {
    const targetMsg = messages.find((m) => m.id === msgId);
    if (!targetMsg) return;

    // Check if translation is already cached in message.translations
    if (targetMsg.translations && targetMsg.translations[newTargetLang]) {
      const newText = targetMsg.translations[newTargetLang];
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, text: newText, currentDisplayLang: newTargetLang }
            : m
        )
      );
      speakText(newText, newTargetLang);
      return;
    }

    // Otherwise translate dynamically via backend
    setTranslatingMsgId(msgId);
    try {
      const translated = await translateResponseText(targetMsg.text, newTargetLang);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                text: translated.translatedText,
                currentDisplayLang: newTargetLang,
                translations: {
                  ...(m.translations || {}),
                  [newTargetLang]: translated.translatedText,
                },
              }
            : m
        )
      );
      speakText(translated.speechText, newTargetLang);
    } catch (err) {
      console.warn('Translation failed:', err);
    } finally {
      setTranslatingMsgId(null);
    }
  };

  // Confirm Voice-to-Catalogue update
  const handleConfirmProposal = async (confirmedAsNew: boolean) => {
    if (!activeProposal) return;
    setProposalLoading(true);

    try {
      const res = await confirmVoiceToCatalogue(currentShop.id, activeProposal, confirmedAsNew);
      await onRefreshData();

      const confMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        speakerRole: 'retailer',
        text: `Confirmed! ${res.message} Public customer catalogue now reflects this live update.`,
        timestamp: new Date().toLocaleTimeString(),
        preferredLanguage: preferredLang,
        currentDisplayLang: preferredLang,
        action: {
          type: 'stock_update',
          productName: res.product.name,
          executed: true,
        },
      };

      setMessages((prev) => [...prev, confMsg]);
      speakText(`Confirmed. ${res.product.name} updated in central database.`, preferredLang);
      setActiveProposal(null);
    } catch (err: any) {
      alert(`Error committing to database: ${err.message}`);
    } finally {
      setProposalLoading(false);
    }
  };

  const currentSamplePrompts =
    speakerRole === 'retailer' ? RETAILER_SAMPLE_PROMPTS : CUSTOMER_SAMPLE_PROMPTS;

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header card with Speaker & Preferred Language controls */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                VyapariVoice Assistant
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Live Multilingual
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live speech transcription with auto language detection, speaker attribution, and instant reply in your preferred language.
            </p>
          </div>

          {/* Voice Output Audio Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setSpeechSynthesisActive(!speechSynthesisActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                speechSynthesisActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
              title={speechSynthesisActive ? 'Speech synthesis active' : 'Speech synthesis muted'}
            >
              {speechSynthesisActive ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Speech On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span>Speech Muted</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dual Control Bar: WHO IS TELLING & PREFERRED ANSWER LANGUAGE */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Who is Telling (Speaker Role) */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Who is speaking? (Speaker Attribution)
              </span>
              <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {speakerRole === 'retailer' ? 'Shop Owner' : 'Buyer'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSpeakerRole('retailer')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  speakerRole === 'retailer'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Shop Owner (Vyapari)</span>
              </button>

              <button
                type="button"
                onClick={() => setSpeakerRole('customer')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  speakerRole === 'customer'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer / Buyer</span>
              </button>
            </div>
          </div>

          {/* Preferred Answer Language */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-indigo-600" />
                Preferred Answer Language (उत्तर भाषा)
              </span>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Delivers replies in this language
              </span>
            </div>

            <select
              value={preferredLang}
              onChange={(e) => {
                const newLang = e.target.value;
                setPreferredLang(newLang);
                onLanguageChange(newLang);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer shadow-2xs"
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} — {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Conversation Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[560px]">
        {/* Messages Feed */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isRetailer = msg.speakerRole === 'retailer';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                {/* Speaker Identity & Language Tag above bubble */}
                <div className="flex items-center gap-1.5 px-2 text-[11px] font-semibold">
                  {isUser ? (
                    <>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                          isRetailer
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {isRetailer ? <Store className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                        <span>{isRetailer ? 'Shop Owner (Vyapari)' : 'Customer / Buyer'}</span>
                      </span>

                      {msg.spokenLanguageName && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          <Radio className="w-2.5 h-2.5 text-rose-500" />
                          <span>Spoken in: {msg.spokenLanguageName}</span>
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1 text-slate-600 font-bold">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>VyapariVoice</span>
                      </span>
                      {msg.currentDisplayLang && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Globe2 className="w-2.5 h-2.5" />
                          <span>
                            Answer in:{' '}
                            {LANGUAGE_OPTIONS.find((l) => l.code === msg.currentDisplayLang)?.native ||
                              msg.currentDisplayLang}
                          </span>
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[88%] sm:max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all ${
                    isUser
                      ? isRetailer
                        ? 'bg-emerald-900 text-white rounded-br-xs shadow-xs'
                        : 'bg-indigo-900 text-white rounded-br-xs shadow-xs'
                      : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Audio player if recorded */}
                  {msg.audioBlobUrl && (
                    <div className="mt-2.5 pt-2 border-t border-white/20">
                      <audio controls src={msg.audioBlobUrl} className="h-7 w-full max-w-xs" />
                    </div>
                  )}

                  {/* If action was performed */}
                  {msg.action && msg.action.executed && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50/80 p-2 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Central Database Synced:{' '}
                        {msg.action.type === 'stock_update' ? 'Stock Updated' : 'Sale Recorded'}
                      </span>
                    </div>
                  )}

                  {/* Language Switcher Bar on Assistant Response */}
                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-col gap-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-400 font-medium">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          <Languages className="w-3 h-3 text-indigo-500" />
                          Change answer to preferred language:
                        </span>
                        <button
                          type="button"
                          onClick={() => speakText(msg.text, msg.currentDisplayLang)}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold text-[11px]"
                          title="Listen to this answer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {LANGUAGE_OPTIONS.slice(0, 6).map((lang) => {
                          const isActive = (msg.currentDisplayLang || preferredLang) === lang.code;
                          const isTranslating = translatingMsgId === msg.id;

                          return (
                            <button
                              key={lang.code}
                              type="button"
                              disabled={isTranslating}
                              onClick={() => handleChangeAnswerLanguage(msg.id, lang.code)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                                isActive
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {lang.native}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Timestamp & Source */}
                <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.source && (
                    <span>· Powered by {msg.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Retail Core'}</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Live speech transcription ticker during speaking */}
          {liveInterimTranscript && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300/80 text-xs text-amber-950 space-y-1 animate-pulse">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Radio className="w-3.5 h-3.5 text-rose-600 animate-ping" />
                  <span>Live Speech Transcription (Listening)</span>
                </span>
                {liveDetectedLang && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-200 text-amber-900">
                    Detected: {liveDetectedLang}
                  </span>
                )}
              </div>
              <p className="font-medium text-slate-800 italic">"{liveInterimTranscript}"</p>
            </div>
          )}

          {/* Voice-to-Catalogue Proposed Changes Card */}
          {activeProposal && (
            <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-500/40 text-xs text-slate-900 space-y-3 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <span className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <PackagePlus className="w-4 h-4 text-emerald-700" />
                  <span>Voice-to-Catalogue Proposed Changes</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-200 text-emerald-900">
                  Confirmation Required
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
                <div className="p-2 bg-white rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block">Product</span>
                  <span className="font-bold text-slate-900">{activeProposal.proposedProduct.name}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block">Quantity</span>
                  <span className="font-bold text-slate-900">
                    {activeProposal.proposedProduct.quantity} {activeProposal.proposedProduct.unit}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block">Listed Price</span>
                  <span className="font-bold text-slate-900">₹{activeProposal.proposedProduct.unitPrice}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block">Match Status</span>
                  <span className={`font-bold ${activeProposal.isExisting ? 'text-indigo-700' : 'text-amber-700'}`}>
                    {activeProposal.isExisting ? 'Linked Item' : 'New Item'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200">
                {activeProposal.isExisting
                  ? `Matched existing product: "${activeProposal.matchedProductName}". Adding will increment current inventory.`
                  : `Unknown product: "${activeProposal.proposedProduct.name}". Would you like to create this as a brand new catalogue listing?`}
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveProposal(null)}
                  disabled={proposalLoading}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>

                {activeProposal.isExisting ? (
                  <button
                    type="button"
                    onClick={() => handleConfirmProposal(false)}
                    disabled={proposalLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{proposalLoading ? 'Updating...' : 'Confirm Stock Addition'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConfirmProposal(true)}
                    disabled={proposalLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{proposalLoading ? 'Adding...' : 'Confirm New Catalogue Item'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 text-slate-500 rounded-xl text-xs w-max animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>
                VyapariVoice is analyzing live query and translating into{' '}
                {LANGUAGE_OPTIONS.find((l) => l.code === preferredLang)?.name || 'preferred language'}...
              </span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggested Queries */}
        <div className="px-6 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 shrink-0 font-medium">
            {speakerRole === 'retailer' ? 'Retailer Prompts:' : 'Customer Prompts:'}
          </span>
          {currentSamplePrompts.map((prompt, i) => {
            const label =
              preferredLang === 'hi' || preferredLang === 'hinglish'
                ? prompt.hi
                : preferredLang === 'mr'
                ? prompt.mr
                : preferredLang === 'gu'
                ? prompt.gu
                : prompt.en;
            return (
              <button
                key={i}
                onClick={() => {
                  setInputText(label);
                  handleSendQuery(label);
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs shrink-0 transition-colors shadow-2xs ${
                  prompt.type === 'catalogue_entry'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold hover:bg-emerald-200'
                    : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Input & Voice Trigger Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            {/* Live Web Speech Recognition Mic */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
              title={isListening ? 'Listening live... Click to stop' : 'Click for Live Microphone Transcription'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Gemini Audio Recorder Button */}
            <button
              type="button"
              onClick={handleToggleAudioRecording}
              className={`p-3 rounded-2xl border transition-all shadow-2xs flex items-center justify-center shrink-0 ${
                isRecordingAudio
                  ? 'bg-amber-600 text-white border-amber-600 animate-bounce'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={
                isRecordingAudio
                  ? 'Recording audio... Click to send to Gemini 3.5 Transcribe'
                  : 'Record Audio (Gemini 3.5 Transcribe)'
              }
            >
              <Radio className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening live... Speak in Hindi, Marathi, Gujarati, English, or Tamil...'
                  : isRecordingAudio
                  ? 'Recording voice audio for Gemini 3.5 Transcribe...'
                  : speakerRole === 'retailer'
                  ? 'Shopkeeper: "15 पेन 10 रुपये के भाव से जोड़ो" / "How many notebooks are available?"'
                  : 'Customer: "Is scientific calculator available in this shop?"'
              }
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-colors disabled:opacity-40 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Active Status Ribbon */}
          {(isListening || isRecordingAudio) && (
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-rose-600 font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>
                {isRecordingAudio
                  ? 'Recording audio file for Gemini 3.5 Transcribe. Click the red button to finish.'
                  : `Microphone listening live in ${
                      LANGUAGE_OPTIONS.find((l) => l.code === preferredLang)?.name || 'Multilingual'
                    }. Speak naturally...`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
