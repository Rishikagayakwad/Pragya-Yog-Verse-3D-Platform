import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Check, AlertCircle, X } from 'lucide-react';

interface CustomModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadModelUrl: (url: string) => void;
  onLoadModelFile: (file: File) => void;
  onResetToDefault: () => void;
  currentModelSource: string | null;
}

export const CustomModelModal: React.FC<CustomModelModalProps> = ({
  isOpen,
  onClose,
  onLoadModelUrl,
  onLoadModelFile,
  onResetToDefault,
  currentModelSource,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        setSelectedFile(file);
        setStatusMessage({ text: `Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`, type: 'info' });
      } else {
        setStatusMessage({ text: 'Please choose a .glb or .gltf 3D file format', type: 'error' });
      }
    }
  };

  const handleApplyFile = () => {
    if (selectedFile) {
      onLoadModelFile(selectedFile);
      setStatusMessage({ text: `Successfully loaded ${selectedFile.name}!`, type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleApplyUrl = () => {
    if (!inputUrl.trim()) return;
    onLoadModelUrl(inputUrl.trim());
    setStatusMessage({ text: 'Loading 3D model from URL...', type: 'info' });
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#F5EFE5] dark:bg-[#071912] border border-[#00381F]/20 dark:border-[#D9AE29]/30 shadow-2xl p-6 text-[#272727] dark:text-[#F5EFE5]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-[#00381F] text-[#D9AE29] dark:bg-[#D9AE29] dark:text-[#00381F]">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">Custom 3D Human Model</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Load your downloaded Sketchfab (GLB/GLTF) or Mixamo 3D character
            </p>
          </div>
        </div>

        {/* Current status */}
        {currentModelSource && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
            <span>Active Model: <strong>{currentModelSource}</strong></span>
            <button
              onClick={() => {
                onResetToDefault();
                setStatusMessage({ text: 'Reset to procedural anatomical human model', type: 'info' });
              }}
              className="px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/40 font-semibold"
            >
              Reset Default
            </button>
          </div>
        )}

        {/* Option A: Direct File Upload */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-[#00381F]/30 dark:border-[#D9AE29]/40 rounded-2xl p-5 text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <input
              type="file"
              id="model-file-input"
              accept=".glb,.gltf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="model-file-input" className="cursor-pointer block">
              <Upload className="w-8 h-8 mx-auto mb-2 text-[#944426] dark:text-[#D9AE29]" />
              <span className="text-sm font-semibold block text-[#00381F] dark:text-[#F5EFE5]">
                {selectedFile ? selectedFile.name : 'Click to Upload .GLB or .GLTF'}
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-1">
                Extracted from your Sketchfab zip file (e.g. scene.gltf or model.glb)
              </span>
            </label>
          </div>

          {selectedFile && (
            <button
              onClick={handleApplyFile}
              className="w-full py-2.5 rounded-xl bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
            >
              <Check className="w-4 h-4" /> Load Uploaded 3D File
            </button>
          )}

          {/* Divider */}
          <div className="flex items-center gap-2 text-[10px] text-stone-400 uppercase font-mono my-2">
            <div className="flex-1 h-px bg-stone-300 dark:bg-stone-700" />
            <span>OR LOAD VIA PUBLIC URL</span>
            <div className="flex-1 h-px bg-stone-300 dark:bg-stone-700" />
          </div>

          {/* Option B: Direct URL Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="url"
                placeholder="https://example.com/models/yoga_pose.glb"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-black/15 dark:border-white/15 text-xs focus:outline-none focus:border-[#944426] dark:focus:border-[#D9AE29]"
              />
            </div>
            <button
              onClick={handleApplyUrl}
              disabled={!inputUrl.trim()}
              className="px-4 py-2 rounded-xl bg-[#944426] text-white text-xs font-semibold hover:bg-[#722a10] disabled:opacity-40 transition-all"
            >
              Load URL
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'error'
              ? 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20'
              : statusMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
              : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Helpful instructions */}
        <div className="mt-5 pt-4 border-t border-black/10 dark:border-white/10 text-[11px] text-stone-600 dark:text-stone-400 space-y-1.5">
          <p className="font-semibold text-stone-800 dark:text-stone-200">How to get the 3D file from your Sketchfab link:</p>
          <ol className="list-decimal list-inside space-y-1 text-[10px]">
            <li>Open <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">https://skfb.ly/VKzU</code> on Sketchfab</li>
            <li>Click <strong>Download 3D Model</strong></li>
            <li>Choose <strong>Autoconverted format (glTF / GLB)</strong></li>
            <li>Upload the downloaded <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">.glb</code> file above!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
