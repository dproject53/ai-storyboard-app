import React, { useState, useEffect } from 'react';

const SettingsModal = ({ isOpen, onClose }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [hfKey, setHfKey] = useState('');

  useEffect(() => {
    // Load existing keys when modal opens
    if (isOpen) {
      setGeminiKey(localStorage.getItem('geminiApiKey') || '');
      setHfKey(localStorage.getItem('hfApiKey') || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('geminiApiKey', geminiKey.trim());
    localStorage.setItem('hfApiKey', hfKey.trim());
    alert('Kunci API berhasil disimpan secara lokal di browser Anda!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#1f212a] p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">⚙️ API Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Google Gemini API Key (Untuk pecah naskah)
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full bg-[#16171d] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#22d3ee] transition-colors"
              placeholder="AIzaSy..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hugging Face API Token (Untuk gambar)
            </label>
            <input
              type="password"
              value={hfKey}
              onChange={(e) => setHfKey(e.target.value)}
              className="w-full bg-[#16171d] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#22d3ee] transition-colors"
              placeholder="hf_..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#22d3ee] text-[#16171d] font-bold rounded-lg hover:bg-[#1bb8d1] transition-colors"
            >
              Simpan API Key
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            Catatan: Kunci API Anda disimpan secara aman di dalam browser (Local Storage) dan tidak dikirim ke server pihak ketiga mana pun selain Google dan Hugging Face.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
