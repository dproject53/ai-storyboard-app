import React, { useState, useEffect } from 'react';

const SettingsModal = ({ isOpen, onClose }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash');
  const [availableModels, setAvailableModels] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGeminiKey(localStorage.getItem('geminiApiKey') || '');
      setGeminiModel(localStorage.getItem('geminiModel') || 'gemini-1.5-flash');
      const savedModels = localStorage.getItem('availableGeminiModels');
      if (savedModels) {
        setAvailableModels(JSON.parse(savedModels));
      }
    }
  }, [isOpen]);

  const handleCheckModels = async () => {
    if (!geminiKey) return alert("Masukkan API Key terlebih dahulu.");
    setIsChecking(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
      if (!response.ok) throw new Error("API Key tidak valid (Error " + response.status + ").");
      const data = await response.json();
      
      const validModels = data.models
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name.replace('models/', ''));
        
      if (validModels.length === 0) throw new Error("Tidak ada model AI yang aktif untuk API Key ini.");
      
      setAvailableModels(validModels);
      localStorage.setItem('availableGeminiModels', JSON.stringify(validModels));
      
      // Auto-select the first model if current is not in the list
      if (!validModels.includes(geminiModel)) {
        setGeminiModel(validModels[0]);
      }
      alert(`Berhasil menemukan ${validModels.length} model aktif! Silakan pilih salah satu dari daftar.`);
    } catch (e) {
      alert("Error: " + e.message);
      setAvailableModels([]);
    }
    setIsChecking(false);
  };

  const handleSave = () => {
    localStorage.setItem('geminiApiKey', geminiKey.trim());
    localStorage.setItem('geminiModel', geminiModel);
    alert('Pengaturan API Key dan Model berhasil disimpan!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#1f212a] p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">⚙️ Pengaturan API Key</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-gray-400 mb-4">
            Masukkan API Key dari Google Gemini. Key ini dibutuhkan agar AI dapat menulis naskah. Key hanya disimpan di browser Anda (aman).
          </p>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              GEMINI API KEY (Untuk Naskah)
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full bg-[#16171d] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#22d3ee] transition-colors"
              placeholder="AIzaSy..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Belum punya? Dapatkan gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[#22d3ee] hover:underline">Google AI Studio</a>.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              HUGGING FACE TOKEN (Untuk Gambar)
            </label>
            <input
              type="password"
              value={hfKey}
              onChange={(e) => setHfKey(e.target.value)}
              className="w-full bg-[#16171d] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#22d3ee] transition-colors"
              placeholder="hf_..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Dibutuhkan karena server gambar gratis diblokir oleh provider internet Anda. Dapatkan di <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="text-[#22d3ee] hover:underline">Hugging Face</a>.
            </p>
          </div>

          <div className="bg-[#16171d] p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-300">
                PILIH MODEL AI
              </label>
              <button 
                onClick={handleCheckModels}
                disabled={isChecking}
                className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded font-bold transition-colors disabled:opacity-50"
              >
                {isChecking ? "MEMERIKSA..." : "CEK MODEL TERSEDIA"}
              </button>
            </div>
            
            <select
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className="w-full bg-[#1f212a] border border-[#22d3ee] rounded-lg p-3 text-white focus:outline-none appearance-none font-medium"
            >
              {availableModels.length === 0 ? (
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Standar)</option>
              ) : (
                availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))
              )}
            </select>
            
            {availableModels.length === 0 && (
              <p className="text-xs text-gray-400 mt-3">
                Jika terjadi error 404, klik tombol "Cek Model Tersedia" untuk melihat daftar model yang aktif di API Key Anda, lalu pilih salah satu.
              </p>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors font-bold"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#8b5cf6] text-white font-bold rounded-lg hover:bg-[#7c3aed] transition-colors shadow-lg"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
