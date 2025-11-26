'use client';

import { useState } from 'react';
import TextToSpeech from '@/components/TextToSpeech';
import VideoComposer from '@/components/VideoComposer';
import { Video, Mic, Sparkles } from 'lucide-react';

export default function Home() {
  const [activeModule, setActiveModule] = useState<'tts' | 'video'>('tts');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-primary-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              Studio Audiovisual Pro
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Plataforma completa para criação de conteúdo audiovisual profissional
          </p>
        </div>

        {/* Module Selector */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveModule('tts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeModule === 'tts'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Mic className="w-5 h-5" />
            Texto para Áudio
          </button>
          <button
            onClick={() => setActiveModule('video')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeModule === 'video'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Video className="w-5 h-5" />
            Editor de Vídeo
          </button>
        </div>

        {/* Content */}
        <div className="animate-fadeIn">
          {activeModule === 'tts' ? (
            <TextToSpeech onAudioGenerated={setAudioBlob} />
          ) : (
            <VideoComposer audioBlob={audioBlob} />
          )}
        </div>
      </div>
    </main>
  );
}
