import React, { useState, useEffect } from 'react'
import api from '../services/api'

const NOTE_COLORS = ['#2563eb', '#f7971e', '#059669', '#ff6b8a', '#06b6d4', '#7c6bef']
const today = new Date().toDateString()

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', reminderDate: '', color: NOTE_COLORS[0] })

  const load = () => api.get('/api/notes').then(r => setNotes(r.data)).catch(console.error)
  useEffect(() => { load() }, [])

  const isDue = n => n.reminderDate && new Date(n.reminderDate).toDateString() === today

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e0e0f0' }}>Notes</div>
          <div style={{ color: '#555570', fontSize: '0.82rem', marginTop: '2px' }}>{notes.length} note{notes.length !== 1 ? 's' : ''}</div>
        </div>
        <button onClick={() => { setForm({ title: '', body: '', reminderDate: '', color: NOTE_COLORS[0] }); setShowModal(true) }}
          style={{ background: '#7c6bef', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
          + Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#555570' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📝</div>
          <div style={{ fontWeight: 600, color: '#8080a0', marginBottom: '4px' }}>No notes yet</div>
          <div style={{ fontSize: '0.82rem' }}>Add reminders and financial notes</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {notes.map(note => (
            <div key={note._id} style={{
              background: `${note.color}12`,
              border: `1px solid ${isDue(note) ? note.color : `${note.color}33`}`,
              borderRadius: '18px', padding: '18px', position: 'relative',
              boxShadow: isDue(note) ? `0 0 20px ${note.color}33` : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: note.color, flexShrink: 0 }} />
                {isDue(note) && (
                  <span style={{ background: `${note.color}22`, color: note.color, fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔔 Due Today</span>
                )}
              </div>
              {note.title && <div style={{ color: '#e0e0f0', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>{note.title}</div>}
              <div style={{ color: '#8080a0', fontSize: '0.82rem', lineHeight: 1.5 }}>{note.body}</div>
              {note.reminderDate && <div style={{ color: '#555570', fontSize: '0.72rem', marginTop: '10px' }}>📅 {new Date(note.reminderDate).toLocaleDateString('en-IN')}</div>}
              <button onClick={() => api.delete(`/api/notes/${note._id}`).then(load)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#333350', fontSize: '0.9rem' }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#111118', borderRadius: '24px 24px 0 0', padding: '24px', width: '100%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ color: '#e0e0f0', fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>Add Note</div>
            <form onSubmit={async e => { e.preventDefault(); await api.post('/api/notes', form); setShowModal(false); load() }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: '#6b6b8a', fontSize: '0.72rem', fontWeight: 600, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</label>
                <input style={{ width: '100%', padding: '12px 14px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '12px', color: '#e0e0f0', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} placeholder="Note title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: '#6b6b8a', fontSize: '0.72rem', fontWeight: 600, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Content</label>
                <textarea style={{ width: '100%', padding: '12px 14px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '12px', color: '#e0e0f0', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', minHeight: '90px' }} placeholder="Write your note..." value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: '#6b6b8a', fontSize: '0.72rem', fontWeight: 600, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reminder Date (optional)</label>
                <input type="date" style={{ width: '100%', padding: '12px 14px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '12px', color: '#e0e0f0', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} value={form.reminderDate} onChange={e => setForm({ ...form, reminderDate: e.target.value })} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#6b6b8a', fontSize: '0.72rem', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {NOTE_COLORS.map(c => (
                    <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: `3px solid ${form.color === c ? 'white' : 'transparent'}`, cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none' }} />
                  ))}
                </div>
              </div>
              <button type="submit" style={{ width: '100%', background: '#7c6bef', color: 'white', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Save Note</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
