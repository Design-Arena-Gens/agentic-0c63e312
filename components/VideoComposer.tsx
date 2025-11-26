'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Play, Download, Image as ImageIcon, Film, Scissors, Layers, Sparkles } from 'lucide-react';

interface VideoComposerProps {
  audioBlob: Blob | null;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  file: File;
  url: string;
  duration?: number;
  thumbnail?: string;
}

interface TimelineItem extends MediaItem {
  startTime: number;
  endTime: number;
  transition?: 'none' | 'fade' | 'slide' | 'dissolve';
}

type EditorMode = 'simple' | 'advanced';

export default function VideoComposer({ audioBlob }: VideoComposerProps) {
  const [mode, setMode] = useState<EditorMode>('simple');
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [selectedTransition, setSelectedTransition] = useState<'none' | 'fade' | 'slide' | 'dissolve'>('fade');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate audio duration
  useEffect(() => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });
    }
  }, [audioBlob]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) return;

      const url = URL.createObjectURL(file);
      const mediaItem: MediaItem = {
        id: `${Date.now()}-${Math.random()}`,
        type: isImage ? 'image' : 'video',
        file,
        url,
      };

      if (isVideo) {
        const video = document.createElement('video');
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          mediaItem.duration = video.duration;
          setMediaLibrary((prev) => [...prev, mediaItem]);
        });
      } else {
        setMediaLibrary((prev) => [...prev, mediaItem]);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyImageToEntireAudio = () => {
    if (mediaLibrary.length === 0 || !audioDuration) return;

    const firstImage = mediaLibrary.find(item => item.type === 'image');
    if (!firstImage) return;

    const timelineItem: TimelineItem = {
      ...firstImage,
      startTime: 0,
      endTime: audioDuration,
      transition: selectedTransition,
    };

    setTimeline([timelineItem]);
  };

  const addToTimeline = (mediaItem: MediaItem) => {
    const lastItem = timeline[timeline.length - 1];
    const startTime = lastItem ? lastItem.endTime : 0;
    const defaultDuration = mediaItem.type === 'video' ? (mediaItem.duration || 5) : 5;
    const endTime = Math.min(startTime + defaultDuration, audioDuration || startTime + defaultDuration);

    const timelineItem: TimelineItem = {
      ...mediaItem,
      startTime,
      endTime,
      transition: selectedTransition,
    };

    setTimeline((prev) => [...prev, timelineItem]);
  };

  const removeFromTimeline = (id: string) => {
    setTimeline((prev) => prev.filter(item => item.id !== id));
  };

  const updateTimelineItem = (id: string, updates: Partial<TimelineItem>) => {
    setTimeline((prev) =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const renderVideo = async () => {
    if (timeline.length === 0 || !audioBlob) {
      alert('Adicione mídia à timeline e certifique-se de ter áudio gerado!');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate video rendering progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // In a real implementation, you would use libraries like ffmpeg.wasm
      // to compose the video with the audio and images/videos

      alert('Renderização concluída! Em produção, isso geraria um arquivo MP4 real.');

    } catch (error) {
      console.error('Error rendering video:', error);
      alert('Erro ao renderizar vídeo');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const totalDuration = timeline.length > 0
    ? Math.max(...timeline.map(item => item.endTime))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Film className="w-6 h-6 text-primary-400" />
            <h2 className="text-2xl font-bold">Editor de Vídeo</h2>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('simple')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mode === 'simple'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Modo Simples
            </button>
            <button
              onClick={() => setMode('advanced')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mode === 'advanced'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Modo Avançado
            </button>
          </div>
        </div>

        {/* Audio Info */}
        {audioBlob && audioDuration > 0 && (
          <div className="bg-gray-900 rounded-lg p-4 mb-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm">
              Áudio carregado: <strong>{audioDuration.toFixed(2)}s</strong>
            </span>
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Imagens/Vídeos
          </button>
        </div>

        {/* Simple Mode - Quick Action */}
        {mode === 'simple' && (
          <div className="bg-gradient-to-r from-primary-900/30 to-purple-900/30 rounded-lg p-5 border border-primary-700/50">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary-400" />
              <h3 className="font-semibold">Aplicação Rápida</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Aplica a primeira imagem da biblioteca ao longo de todo o áudio
            </p>
            <button
              onClick={applyImageToEntireAudio}
              disabled={mediaLibrary.length === 0 || !audioDuration}
              className="btn-secondary w-full"
            >
              Aplicar Imagem ao Longo do Áudio
            </button>
          </div>
        )}
      </div>

      {/* Media Library */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold">Biblioteca de Mídia</h3>
          <span className="text-sm text-gray-400">({mediaLibrary.length} itens)</span>
        </div>

        {mediaLibrary.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma mídia carregada</p>
            <p className="text-sm">Faça upload de imagens ou vídeos para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaLibrary.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-primary-500 transition-all cursor-pointer"
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt="Media"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                  />
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  {mode === 'advanced' && (
                    <button
                      onClick={() => addToTimeline(item)}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Adicionar
                    </button>
                  )}
                </div>

                <div className="absolute top-1 right-1 bg-black/70 px-2 py-1 rounded text-xs">
                  {item.type === 'video' ? (
                    <span>🎬 {item.duration?.toFixed(1)}s</span>
                  ) : (
                    <span>🖼️</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary-400" />
            <h3 className="font-semibold">Timeline</h3>
            <span className="text-sm text-gray-400">
              ({totalDuration.toFixed(2)}s / {audioDuration.toFixed(2)}s)
            </span>
          </div>

          {mode === 'advanced' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Transição:</label>
              <select
                value={selectedTransition}
                onChange={(e) => setSelectedTransition(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
              >
                <option value="none">Nenhuma</option>
                <option value="fade">Fade</option>
                <option value="slide">Deslizar</option>
                <option value="dissolve">Dissolver</option>
              </select>
            </div>
          )}
        </div>

        {timeline.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
            <Film className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Timeline vazia</p>
            <p className="text-sm">
              {mode === 'simple'
                ? 'Use o botão "Aplicar Imagem" acima'
                : 'Adicione mídia da biblioteca para começar'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Timeline Bar */}
            <div className="relative h-16 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
              {audioDuration > 0 && timeline.map((item) => (
                <div
                  key={item.id}
                  className="absolute top-0 bottom-0 bg-gradient-to-r from-primary-600 to-primary-500 border-l-2 border-r-2 border-white flex items-center justify-center text-xs font-medium hover:from-primary-500 hover:to-primary-400 transition-all cursor-pointer group"
                  style={{
                    left: `${(item.startTime / audioDuration) * 100}%`,
                    width: `${((item.endTime - item.startTime) / audioDuration) * 100}%`,
                  }}
                  onClick={() => removeFromTimeline(item.id)}
                >
                  <span className="truncate px-2">
                    {item.type === 'image' ? '🖼️' : '🎬'} {item.file.name}
                  </span>
                  <span className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-70 flex items-center justify-center transition-all">
                    Remover
                  </span>
                </div>
              ))}
            </div>

            {/* Timeline Items List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {timeline.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-gray-900 rounded-lg p-3 flex items-center gap-3 border border-gray-700"
                >
                  <span className="text-primary-400 font-bold text-sm w-6">
                    #{index + 1}
                  </span>

                  <div className="w-12 h-12 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                    {item.type === 'image' ? (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <video src={item.url} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.startTime.toFixed(2)}s - {item.endTime.toFixed(2)}s
                      {item.transition !== 'none' && ` • Transição: ${item.transition}`}
                    </p>
                  </div>

                  {mode === 'advanced' && (
                    <button
                      onClick={() => removeFromTimeline(item.id)}
                      className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded hover:bg-red-900/30 transition-all"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Render Section */}
      <div className="card">
        {isProcessing && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Renderizando vídeo...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={renderVideo}
            disabled={timeline.length === 0 || !audioBlob || isProcessing}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            {isProcessing ? 'Renderizando...' : 'Renderizar Vídeo'}
          </button>

          <button
            disabled={isProcessing}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Exportar MP4
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Vídeo será exportado em Full HD (1920x1080) com áudio em alta qualidade
        </p>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
