import { useState, useEffect } from 'react';
import StoryboardPanel from './components/StoryboardPanel';
import SettingsModal from './components/SettingsModal';
import Dashboard from './components/Dashboard';
import TeamCollaboration from './components/TeamCollaboration';
import { generateStoryboardBreakdown, generateImageFromPrompt } from './services/ai';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'editor', 'team'
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [projectName, setProjectName] = useState("Proyek Tanpa Nama");
  
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [panels, setPanels] = useState([]);
  const [visualStyle, setVisualStyle] = useState("Cinematic");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPanels([]); 

    try {
      const breakdown = await generateStoryboardBreakdown(script, visualStyle);
      const initialPanels = breakdown.map(b => ({ ...b, isLoadingImage: true, imageUrl: null }));
      setPanels(initialPanels);

      const updatedPanels = [...initialPanels];
      
      for (let i = 0; i < updatedPanels.length; i++) {
        try {
          const url = await generateImageFromPrompt(updatedPanels[i].imagePrompt);
          updatedPanels[i].imageUrl = url;
          updatedPanels[i].isLoadingImage = false;
          setPanels([...updatedPanels]);
        } catch (imgError) {
          console.error(imgError);
          updatedPanels[i].isLoadingImage = false;
          updatedPanels[i].desc += " [⚠ Gambar gagal di-generate]";
          setPanels([...updatedPanels]);
        }
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProject = () => {
    const savedProjects = JSON.parse(localStorage.getItem('storyboardProjects') || '[]');
    const newProject = {
      id: currentProjectId || Date.now().toString(),
      name: projectName,
      script,
      visualStyle,
      panels,
      updatedAt: new Date().toISOString()
    };

    if (currentProjectId) {
      const index = savedProjects.findIndex(p => p.id === currentProjectId);
      if (index !== -1) savedProjects[index] = newProject;
      else savedProjects.push(newProject);
    } else {
      savedProjects.push(newProject);
      setCurrentProjectId(newProject.id);
    }

    localStorage.setItem('storyboardProjects', JSON.stringify(savedProjects));
    alert('✅ Proyek berhasil disimpan!');
  };

  const openProject = (project) => {
    if (project) {
      setCurrentProjectId(project.id);
      setProjectName(project.name);
      setScript(project.script || "");
      setVisualStyle(project.visualStyle || "Cinematic");
      setPanels(project.panels || []);
    } else {
      // New Project
      setCurrentProjectId(null);
      setProjectName("Proyek Baru");
      setScript("");
      setPanels([]);
    }
    setCurrentView('editor');
  };

  const handleExportPDF = () => {
    if (panels.length === 0) return alert("Belum ada storyboard untuk di-export.");
    window.print();
  };

  const handleExportPrompt = () => {
    if (panels.length === 0) return alert("Belum ada storyboard.");
    const allPrompts = panels.map((p, i) => `Scene ${i+1}:\nImage Prompt: ${p.imagePrompt}\n`).join("\n");
    navigator.clipboard.writeText(allPrompts).then(() => {
      alert("✅ Prompt AI Video berhasil disalin ke Clipboard!");
    });
  };

  const handleSidebarClick = (menu) => {
    if (menu === 'new') {
      openProject(null);
    } else if (menu === 'dashboard') {
      setCurrentView('dashboard');
    } else if (menu === 'team') {
      setCurrentView('team');
    }
  };

  const handleRegeneratePanel = async (indexToUpdate) => {
    const updatedPanels = [...panels];
    const targetPanel = updatedPanels[indexToUpdate];
    targetPanel.isLoadingImage = true;
    targetPanel.imageUrl = null;
    setPanels([...updatedPanels]);

    try {
      const url = await generateImageFromPrompt(targetPanel.imagePrompt);
      targetPanel.imageUrl = url;
    } catch (e) {
      targetPanel.desc += " [⚠ Gagal regenerate]";
    }
    
    targetPanel.isLoadingImage = false;
    setPanels([...updatedPanels]);
  };

  const handleEditPanelDesc = (indexToUpdate) => {
    const newDesc = prompt("Edit Action / Dialogue untuk adegan ini:", panels[indexToUpdate].desc);
    if (newDesc !== null) {
      const updatedPanels = [...panels];
      updatedPanels[indexToUpdate].desc = newDesc;
      setPanels(updatedPanels);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-dark)' }}>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Sidebar */}
      <div className="print-hide" style={{ width: '250px', backgroundColor: 'var(--bg-panel)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-teal)', borderBottom: '1px solid var(--border-color)' }}>
          🎬 AI Storyboard
        </div>
        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div onClick={() => handleSidebarClick('dashboard')} style={{ padding: '10px', backgroundColor: currentView === 'dashboard' ? 'var(--bg-input)' : 'transparent', borderRadius: '6px', cursor: 'pointer', color: currentView === 'dashboard' ? 'white' : 'var(--text-muted)' }}>📁 Dashboard</div>
          <div onClick={() => handleSidebarClick('new')} style={{ padding: '10px', backgroundColor: 'var(--accent-teal)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>➕ Buat Project Baru</div>
          <div onClick={() => handleSidebarClick('team')} style={{ padding: '10px', backgroundColor: currentView === 'team' ? 'var(--bg-input)' : 'transparent', color: currentView === 'team' ? 'white' : 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}>👥 Team Collaboration</div>
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
          <div onClick={() => setIsSettingsOpen(true)} style={{ padding: '10px', color: 'var(--text-muted)', cursor: 'pointer' }}>⚙️ Settings</div>
        </div>
      </div>

      {/* Main Content Area */}
      {currentView === 'dashboard' && <Dashboard onOpenProject={openProject} />}
      {currentView === 'team' && <TeamCollaboration />}
      
      {currentView === 'editor' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
          {/* Left: Script Panel */}
          <div className="print-hide" style={{ width: '35%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <input 
                type="text" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={{ backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', outline: 'none', width: '100%' }}
              />
            </div>
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <textarea 
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Ketik atau paste naskah cerita Anda di sini..."
                style={{ flex: 1, width: '100%', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', fontSize: '1rem', resize: 'none', outline: 'none' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Visual Style:</label>
                <select value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)} style={{ padding: '10px', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', outline: 'none' }}>
                  <option>Sketsa Hitam Putih</option>
                  <option>Comic Style</option>
                  <option>Cinematic</option>
                  <option>Anime Storyboard</option>
                </select>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || script.length === 0}
                style={{ padding: '15px', backgroundColor: isGenerating || script.length === 0 ? 'var(--bg-input)' : 'var(--accent-teal)', color: isGenerating || script.length === 0 ? 'var(--text-muted)' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: isGenerating || script.length === 0 ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}
              >
                {isGenerating ? "Menganalisis & Menggambar..." : "✨ AI Generate Storyboard"}
              </button>
            </div>
          </div>

          {/* Right: Storyboard Grid Editor */}
          <div style={{ flex: 1, backgroundColor: 'var(--bg-panel)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div className="print-hide" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'var(--bg-panel)', zIndex: 10 }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Editor Storyboard</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSaveProject} style={{ padding: '8px 15px', backgroundColor: 'var(--accent-teal)', color: '#16171d', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  💾 Save Project
                </button>
                <button onClick={handleExportPDF} style={{ padding: '8px 15px', backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>
                  📄 Export PDF
                </button>
                <button onClick={handleExportPrompt} style={{ padding: '8px 15px', backgroundColor: 'var(--bg-input)', color: 'var(--accent-teal)', border: '1px solid var(--accent-teal)', borderRadius: '6px', cursor: 'pointer' }}>
                  🎬 Export Prompt AI Video
                </button>
              </div>
            </div>
            
            <div className="print-grid" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {panels.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                  Belum ada storyboard. Masukkan naskah dan klik Generate.
                </div>
              ) : (
                panels.map((panel, index) => (
                  <StoryboardPanel key={panel.id} index={index + 1} data={panel} onRegenerate={() => handleRegeneratePanel(index)} onEdit={() => handleEditPanelDesc(index)} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
