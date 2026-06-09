import React, { useState, useEffect } from 'react';

const TeamCollaboration = () => {
  const [team, setTeam] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Editor');

  useEffect(() => {
    // Load existing team from LocalStorage or set defaults
    const saved = localStorage.getItem('storyboardTeam');
    if (saved) {
      setTeam(JSON.parse(saved));
    } else {
      const defaultTeam = [
        { id: 1, email: 'anda@studio.com', role: 'Owner', status: 'Active' }
      ];
      setTeam(defaultTeam);
      localStorage.setItem('storyboardTeam', JSON.stringify(defaultTeam));
    }
  }, []);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!email) return;

    const newMember = {
      id: Date.now(),
      email,
      role,
      status: 'Pending'
    };

    const updatedTeam = [...team, newMember];
    setTeam(updatedTeam);
    localStorage.setItem('storyboardTeam', JSON.stringify(updatedTeam));
    
    setEmail('');
    alert(`Undangan berhasil dibuat untuk ${email}. (Catatan: Ini adalah fitur simulasi lokal, email tidak benar-benar dikirim).`);
  };

  const handleRemove = (id) => {
    if (window.confirm("Keluarkan anggota ini dari tim?")) {
      const updated = team.filter(m => m.id !== id);
      setTeam(updated);
      localStorage.setItem('storyboardTeam', JSON.stringify(updated));
    }
  };

  return (
    <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
      <h1 style={{ margin: '0 0 30px 0', fontSize: '2rem', color: 'white' }}>👥 Team Collaboration</h1>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Invite Form */}
        <div style={{ flex: '1 1 300px', backgroundColor: 'var(--bg-panel)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: 'white' }}>Undang Anggota Baru</h2>
          <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Alamat Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rekan@studio.com"
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'white', outline: 'none' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Peran (Role)</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'white', outline: 'none' }}
              >
                <option value="Editor">Editor (Bisa membuat & mengedit)</option>
                <option value="Viewer">Viewer (Hanya bisa melihat)</option>
              </select>
            </div>
            <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: 'var(--accent-teal)', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Kirim Undangan
            </button>
          </form>
        </div>

        {/* Team List */}
        <div style={{ flex: '2 1 400px', backgroundColor: 'var(--bg-panel)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: 'white' }}>Anggota Tim Saat Ini</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {team.map((member) => (
              <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}>{member.email}</div>
                  <div style={{ fontSize: '0.8rem', color: member.status === 'Active' ? '#4ade80' : 'var(--text-muted)' }}>
                    Status: {member.status}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ backgroundColor: 'var(--bg-input)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {member.role}
                  </span>
                  {member.role !== 'Owner' && (
                    <button onClick={() => handleRemove(member.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '1rem' }}>
                      &times;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamCollaboration;
