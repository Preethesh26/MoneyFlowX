import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { ScreenWrapper, PageHeader, Input, Btn, EmptyState } from '../components/UI'
import api from '../services/api'

const COLORS = ['#6c63ff', '#f7971e', '#43e97b', '#ff6584', '#4facfe', '#a855f7']
const today = new Date().toDateString()

export default function NotesScreen() {
  const { colors } = useTheme()
  const [notes, setNotes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', reminderDate: '', color: COLORS[0] })

  const load = () => api.get('/api/notes').then(r => setNotes(r.data)).catch(console.error)
  useEffect(() => { load() }, [])

  const isDue = (note) => note.reminderDate && new Date(note.reminderDate).toDateString() === today

  return (
    <ScreenWrapper colors={colors}>
      <PageHeader title="Notes" subtitle={`${notes.length} note${notes.length !== 1 ? 's' : ''}`} colors={colors}
        action={<Btn title="+ Add" onPress={() => { setForm({ title: '', body: '', reminderDate: '', color: COLORS[0] }); setShowModal(true) }} colors={colors} style={{ paddingVertical: 8, paddingHorizontal: 14 }} />} />

      {notes.length === 0 ? <EmptyState icon="📝" title="No notes yet" desc="Add reminders and financial notes" colors={colors} /> : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {notes.map(note => (
            <View key={note._id} style={{
              width: '47%', backgroundColor: `${note.color || COLORS[0]}18`,
              borderRadius: 16, padding: 14,
              borderWidth: isDue(note) ? 2 : 1,
              borderColor: isDue(note) ? note.color : `${note.color}44`,
            }}>
              {isDue(note) && (
                <View style={{ backgroundColor: `${note.color}33`, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 6, alignSelf: 'flex-start' }}>
                  <Text style={{ color: note.color, fontSize: 10, fontWeight: '700' }}>🔔 DUE TODAY</Text>
                </View>
              )}
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: note.color, marginBottom: 6 }} />
              {note.title && <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13, marginBottom: 4 }}>{note.title}</Text>}
              <Text style={{ color: colors.textSub, fontSize: 12, lineHeight: 18 }}>{note.body}</Text>
              {note.reminderDate && <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 6 }}>📅 {new Date(note.reminderDate).toLocaleDateString('en-IN')}</Text>}
              <TouchableOpacity onPress={async () => { await api.delete(`/api/notes/${note._id}`); load() }} style={{ position: 'absolute', top: 8, right: 8 }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Add Note</Text>
            <Input label="Title" colors={colors} value={form.title} onChangeText={v => setForm({ ...form, title: v })} placeholder="Note title" />
            <Input label="Content" colors={colors} value={form.body} onChangeText={v => setForm({ ...form, body: v })} placeholder="Write your note..." multiline style={{ minHeight: 80 }} />
            <Input label="Reminder Date (YYYY-MM-DD, optional)" colors={colors} value={form.reminderDate} onChangeText={v => setForm({ ...form, reminderDate: v })} placeholder="2024-12-01" />
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' }}>Color</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setForm({ ...form, color: c })}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c, borderWidth: form.color === c ? 3 : 0, borderColor: 'white' }} />
              ))}
            </View>
            <Btn title="Save Note" onPress={async () => { await api.post('/api/notes', form); setShowModal(false); load() }} colors={colors} />
            <Btn title="Cancel" variant="ghost" onPress={() => setShowModal(false)} colors={colors} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}
