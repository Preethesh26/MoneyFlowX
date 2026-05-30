import React, { useState, useEffect } from 'react'
import api from '../services/api'

const COLORS = ['#6c63ff', '#f7971e', '#43e97b', '#ff6584', '#4facfe', '#a855f7']
const EMPTY = { title: '', body: '', reminderDate: '', color: COLORS[0] }

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const today = new Date().toDateString()

  const load = () => api.get('/api/notes').then(r => setNotes(r.data)).catch(console.error)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/api/notes', form)
    setShowModal(false)
    setForm(EMPTY)
    load()
  }

  const isDue = (note) => note.reminderDate && new Date(note.reminderDate).toDateString() === today

  return (
    <div>
      <div className="flex-between mb-16">
        <div className="page-header" style={{ margin: 0 }}>
          <div className="page-title">Notes</div>
          <div className="page-subtitle">{notes.length} note{notes.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(EMPTY); setShowModal(true) }}>+ Add Note</button>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📝</div><div className="empty-title">No notes yet</div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {notes.map(note => (
            <div key={note._id} style={{
              background: `${note.color || COLORS[0]}18`,
              border: `1px solid ${isDue(note) ? note.color : `${note.color}44`}`,
              borderRadius: 'var(--radius)', padding: '16px', position: 'relative',
              boxShadow: isDue(note) ? `0 0 12px ${note.color}44` : 'none',
            }}>
              {isDue(note) && <div style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '0.65rem', fontWeight: 700, color: note.color, background: `${note.color}22`, padding: '2px 6px', borderRadius: '8px' }}>🔔 DUE TODAY</div>}
              <button onClick={async () => { await api.delete(`/api/notes/${note._id}`); load() }}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}>✕</button>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: note.color, marginBottom: '8px', marginTop: isDue(note) ? '16px' : '0' }} />
              {note.title && <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>{note.title}</div>}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{note.body}</div>
              {note.reminderDate && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>📅 {new Date(note.reminderDate).toLocaleDateString('en-IN')}</div>}
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(note.createdAt).toLocaleDateString('en-IN')}</div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Note</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" placeholder="Note title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Content</label><textarea className="form-textarea" placeholder="Write your note..." value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Reminder Date (optional)</label><input className="form-input" type="date" value={form.reminderDate} onChange={e => setForm({ ...form, reminderDate: e.target.value })} /></div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none' }} />
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Save Note</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
