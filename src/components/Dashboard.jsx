import React, { useState, useEffect } from 'react';

const Dashboard = ({ onOpenProject }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('storyboardProjects') || '[]');
    setProjects(saved);
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation(); // Prevent opening the project when clicking delete
    if (window.confirm("Apakah Anda yakin ingin menghapus proyek ini?")) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem('storyboardProjects', JSON.stringify(updated));
    }
  };

  return (
    <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: 'white' }}>📂 Dashboard Proyek</h1>
        <button 
          onClick={() => onOpenProject(null)} 
          style={{ padding: '10px 20px', backgroundColor: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ➕ Buat Project Baru
        </button>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px', backgroundColor: 'var(--bg-panel)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
          <h2 style={{ color: 'var(--text-main)' }}>Belum Ada Proyek</h2>
          <p style={{ color: 'var(--text-muted)' }}>Klik tombol "Buat Project Baru" untuk memulai storyboard pertama Anda.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {projects.map((project) => (
            <div 
              key={project.id}
              onClick={() => onOpenProject(project)}
              style={{
                backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'transform 0.2s, borderColor 0.2s', position: 'relative'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-teal)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>{project.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Terakhir diubah: {new Date(project.updatedAt).toLocaleDateString()}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'var(--bg-dark)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {project.panels ? project.panels.length : 0} Panel
                </span>
                <button 
                  onClick={(e) => handleDelete(project.id, e)}
                  style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '5px' }}
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
