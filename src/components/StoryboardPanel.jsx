import React from 'react';

const StoryboardPanel = ({ index, data, onRegenerate, onEdit }) => {
  return (
    <div style={{ 
      backgroundColor: 'var(--bg-dark)', 
      border: '1px solid var(--border-color)', 
      borderRadius: '8px', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Image Area */}
      <div style={{ 
        width: '100%', 
        height: '220px', // FIX: Paksa tinggi tetap agar gambar tidak collapse!
        backgroundColor: 'var(--bg-input)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        backgroundImage: data.imageUrl ? `url(${data.imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {!data.imageUrl && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {data.isLoadingImage ? "🎨 Menggambar AI..." : `[ Image: ${data.shotType} ]`}
          </span>
        )}
        <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
          Scene {index}
        </div>
      </div>
      
      {/* Panel Info */}
      <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Shot Type</div>
            <div style={{ backgroundColor: 'var(--bg-input)', padding: '6px', borderRadius: '4px', fontSize: '0.85rem' }}>{data.shotType}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Camera</div>
            <div style={{ backgroundColor: 'var(--bg-input)', padding: '6px', borderRadius: '4px', fontSize: '0.85rem' }}>{data.camera}</div>
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Action / Dialogue</div>
          <div style={{ backgroundColor: 'var(--bg-input)', padding: '8px', borderRadius: '4px', fontSize: '0.85rem', lineHeight: '1.4', minHeight: '60px' }}>
            {data.desc}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginTop: '5px' }}>
          <button onClick={onRegenerate} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>🔄 Regenerate</button>
          <button onClick={onEdit} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>✏️ Edit</button>
        </div>
      </div>
    </div>
  );
};

export default StoryboardPanel;
