
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, X, Headphones } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeBase64Audio, decodeAudioData, encodePCM } from '../services/geminiService';

const Concierge: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const startSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: 'You are RHRAH, a luxury fashion concierge for a high-end abaya store. You are elegant, helpful, and sophisticated. Keep your responses concise and chic.'
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const base64 = encodePCM(input);
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg: any) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outAudioContextRef.current) {
              setIsSpeaking(true);
              const ctx = outAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decodeBase64Audio(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => { console.error(e); stopSession(); }
        }
      });
      sessionRef.current = sessionPromise;
    } catch (e) {
      console.error(e);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    sessionRef.current?.then((s: any) => s.close());
    audioContextRef.current?.close();
    outAudioContextRef.current?.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {!isActive ? (
        <button
          onClick={startSession}
          disabled={isConnecting}
          className={`group flex items-center space-x-3 bg-stone-900 text-white p-4 rounded-full shadow-2xl transition-all hover:pr-8 hover:scale-105 ${isConnecting ? 'opacity-70' : 'pulse-gold'}`}
        >
          <div className="bg-[#C5A059] p-2 rounded-full">
            <Headphones className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold tracking-widest overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">
            {isConnecting ? 'CONNECTING...' : 'LUXURY CONCIERGE'}
          </span>
        </button>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-2xl border border-stone-100 flex flex-col items-center w-64 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between w-full mb-6">
            <span className="text-[10px] font-bold tracking-[0.3em] gold-text">LIVE SESSION</span>
            <button onClick={stopSession} className="text-stone-300 hover:text-stone-900"><X className="w-4 h-4" /></button>
          </div>
          <div className="relative mb-6">
             <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${isSpeaking ? 'bg-[#C5A059] scale-110' : 'bg-stone-100'}`}>
                <div className={`flex space-x-1 items-center ${isSpeaking ? 'animate-pulse' : ''}`}>
                  {[1,2,3].map(i => <div key={i} className={`w-1 bg-white rounded-full ${isSpeaking ? 'h-8' : 'h-1'}`} />)}
                </div>
             </div>
             {isSpeaking && <div className="absolute inset-0 rounded-full gold-bg opacity-20 animate-ping" />}
          </div>
          <p className="text-xs font-bold tracking-widest text-stone-900 mb-1">RHRAH IS LISTENING</p>
          <p className="text-[10px] text-stone-400 text-center">Ask about our new collection or get styling tips via voice.</p>
        </div>
      )}
    </div>
  );
};

export default Concierge;
