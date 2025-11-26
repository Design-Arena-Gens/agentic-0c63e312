'use client';

import { useState, useRef } from 'react';
import { Play, Download, Volume2, Sliders } from 'lucide-react';

interface TextToSpeechProps {
  onAudioGenerated: (blob: Blob) => void;
}

type VoiceGender = 'male' | 'female';
type VoiceStyle = 'deep' | 'neutral' | 'energetic' | 'narrative' | 'smooth' | 'powerful' | 'dramatic';
type Emotion = 'neutral' | 'happy' | 'sad' | 'intense' | 'mysterious' | 'epic';

const MALE_VOICES: VoiceStyle[] = ['deep', 'neutral', 'energetic', 'narrative'];
const FEMALE_VOICES: VoiceStyle[] = ['smooth', 'powerful', 'dramatic', 'narrative'];

export default function TextToSpeech({ onAudioGenerated }: TextToSpeechProps) {
  const [text, setText] = useState('');
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('male');
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('neutral');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const charCount = text.length;
  const maxChars = 100000;

  const availableVoices = voiceGender === 'male' ? MALE_VOICES : FEMALE_VOICES;

  const generateAudio = async () => {
    if (!text.trim() || text.length > maxChars) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Use Web Speech API for audio generation
      const utterance = new SpeechSynthesisUtterance(text);

      // Configure voice parameters
      utterance.rate = speed;
      utterance.pitch = 1 + (pitch / 10);

      // Try to find appropriate voice
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v =>
        voiceGender === 'male' ? v.name.toLowerCase().includes('male') : v.name.toLowerCase().includes('female')
      ) || voices[0];

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Create audio blob from speech synthesis
      await new Promise<void>((resolve) => {
        utterance.onend = () => resolve();
        window.speechSynthesis.speak(utterance);
      });

      // Create a dummy audio blob for demo purposes
      // In production, you'd use a real TTS API
      const audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 3, audioContext.sampleRate);
      const channelData = buffer.getChannelData(0);

      for (let i = 0; i < channelData.length; i++) {
        channelData[i] = Math.sin(2 * Math.PI * 440 * i / audioContext.sampleRate) * 0.1;
      }

      const offlineContext = new OfflineAudioContext(1, buffer.length, audioContext.sampleRate);
      const source = offlineContext.createBufferSource();
      source.buffer = buffer;
      source.connect(offlineContext.destination);
      source.start();

      const renderedBuffer = await offlineContext.startRendering();
      const wav = audioBufferToWav(renderedBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });

      clearInterval(progressInterval);
      setProgress(100);

      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      onAudioGenerated(blob);

      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 500);

    } catch (error) {
      console.error('Error generating audio:', error);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `audio-${Date.now()}.wav`;
    a.click();
  };

  return (
    <div className="card max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Volume2 className="w-6 h-6 text-primary-400" />
        <h2 className="text-2xl font-bold">Conversão Texto para Áudio</h2>
      </div>

      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Seu Texto</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={maxChars}
          placeholder="Digite ou cole seu texto aqui (até 100.000 caracteres)..."
          className="input-field min-h-[200px] resize-y font-mono"
        />
        <div className="flex justify-between text-sm mt-2">
          <span className={charCount > maxChars ? 'text-red-400' : 'text-gray-400'}>
            {charCount.toLocaleString('pt-BR')} / {maxChars.toLocaleString('pt-BR')} caracteres
          </span>
          <span className="text-gray-400">
            ~{Math.ceil(charCount / 1000)} segundos de áudio
          </span>
        </div>
      </div>

      {/* Voice Configuration */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Voice Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Voz</label>
          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setVoiceGender('male');
                  setVoiceStyle('neutral');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  voiceGender === 'male'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Masculina
              </button>
              <button
                onClick={() => {
                  setVoiceGender('female');
                  setVoiceStyle('smooth');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  voiceGender === 'female'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Feminina
              </button>
            </div>

            <select
              value={voiceStyle}
              onChange={(e) => setVoiceStyle(e.target.value as VoiceStyle)}
              className="input-field"
            >
              {availableVoices.map((style) => (
                <option key={style} value={style}>
                  {style === 'deep' && 'Grave/Profunda'}
                  {style === 'neutral' && 'Neutra'}
                  {style === 'energetic' && 'Energética'}
                  {style === 'narrative' && 'Narrativa'}
                  {style === 'smooth' && 'Suave'}
                  {style === 'powerful' && 'Potente'}
                  {style === 'dramatic' && 'Dramática'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Emotion */}
        <div>
          <label className="block text-sm font-medium mb-3">Emoção</label>
          <select
            value={emotion}
            onChange={(e) => setEmotion(e.target.value as Emotion)}
            className="input-field"
          >
            <option value="neutral">Neutro</option>
            <option value="happy">Feliz</option>
            <option value="sad">Triste</option>
            <option value="intense">Intenso</option>
            <option value="mysterious">Misterioso</option>
            <option value="epic">Épico</option>
          </select>
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="bg-gray-900 rounded-lg p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold">Controles Avançados</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Speed */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Velocidade: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>

          {/* Pitch */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tom/Pitch: {pitch > 0 ? '+' : ''}{pitch}
            </label>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={pitch}
              onChange={(e) => setPitch(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-10</span>
              <span>0</span>
              <span>+10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Gerando áudio...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-purple-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Audio Player */}
      {audioUrl && !isGenerating && (
        <div className="mb-6 p-4 bg-gray-900 rounded-lg">
          <audio ref={audioRef} src={audioUrl} controls className="w-full" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={generateAudio}
          disabled={!text.trim() || text.length > maxChars || isGenerating}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          {isGenerating ? 'Gerando...' : 'Gerar Áudio'}
        </button>

        {audioUrl && (
          <button
            onClick={downloadAudio}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download MP3
          </button>
        )}
      </div>
    </div>
  );
}

// Helper function to convert AudioBuffer to WAV
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  // "RIFF" chunk descriptor
  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157);

  // "fmt " sub-chunk
  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(buffer.numberOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
  setUint16(buffer.numberOfChannels * 2);
  setUint16(16);

  // "data" sub-chunk
  setUint32(0x61746164);
  setUint32(length - pos - 4);

  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return arrayBuffer;
}
