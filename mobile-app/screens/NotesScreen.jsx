import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, StyleSheet } from 'react-native'
import api from '../services/api'

const BG='#080810';const MUTED='#50507a';const SUB='#9090b0';const TEXT='#f2f2fa'
const COLORS=['#3b82f6','#f97316','#10b981','#f43f5e','#06b6d4','#8b5cf6']
const today = new Date().toDateString()

export default function NotesScreen() {
  const [notes, setNotes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', reminderDate: '', color: COLORS[0] })

  const load = () => api.get('/api/notes').then(r => setNotes(r.data)).catch(console.error)
  useEffect(() => { load() }, [])
  const isDue = n => n.reminderDate && new Date(n.reminderDate).toDateString() === today

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={s.header}>
        <View><Text style={s.title}>Notes</Text><Text style={s.sub}>{notes.length} note{notes.length !== 1 ? 's' : ''}</Text></View>
        <TouchableOpacity onPress={() => { setForm({ title: '', body: '', reminderDate: '', color: COLORS[0] }); setShowModal(true) }} style={s.addBtn}>
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {notes.length === 0 ? (
          <View style={s.empty}><Text style={s.emptyIcon}>📝</Text><Text style={s.emptyTitle}>No notes yet</Text><Text style={s.emptySub}>Add reminders and financial notes</Text></View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {notes.map(note => (
              <View key={note._id} style={{
                width: '47%', backgroundColor: `${note.color}10`,
                borderRadius: 18, padding: 16, borderWidth: isDue(note) ? 2 : 1,
                borderColor: isDue(note) ? note.color : `${note.color}30`,
                position: 'relative',
              }}>
                {isDue(note) && (
                  <View style={{ backgroundColor: `${note.color}20`, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 8, alignSelf: 'flex-start' }}>
                    <Text style={{ color: note.color, fontSize: 10, fontWeight: '700' }}>🔔 DUE TODAY</Text>
                  </View>
                )}
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: note.color, marginBottom: 8 }} />
                {note.title ? <Text style={{ color: TEXT, fontWeight: '700', fontSize: 13, marginBottom: 5 }}>{note.title}</Text> : null}
                <Text style={{ color: SUB, fontSize: 12, lineHeight: 18 }}>{note.body}</Text>
                {note.reminderDate && <Text style={{ color: MUTED, fontSize: 10, marginTop: 8 }}>📅 {new Date(note.reminderDate).toLocaleDateString('en-IN')}</Text>}
                <TouchableOpacity onPress={() => api.delete(`/api/notes/${note._id}`).then(load)}
                  style={{ position: 'absolute', top: 10, right: 10 }}>
                  <Text style={{ color: MUTED, fontSize: 14 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={s.overlay}><View style={s.sheet}>
          <Text style={s.modalTitle}>Add Note</Text>
          <Text style={s.fieldLabel}>Title</Text>
          <TextInput style={s.field} placeholder="Note title" placeholderTextColor={MUTED} value={form.title} onChangeText={v => setForm({ ...form, title: v })} />
          <Text style={s.fieldLabel}>Content</Text>
          <TextInput style={[s.field, { minHeight: 80, textAlignVertical: 'top' }]} placeholder="Write your note..." placeholderTextColor={MUTED} multiline value={form.body} onChangeText={v => setForm({ ...form, body: v })} />
          <Text style={s.fieldLabel}>Reminder Date (YYYY-MM-DD)</Text>
          <TextInput style={s.field} placeholder="2024-12-01" placeholderTextColor={MUTED} value={form.reminderDate} onChangeText={v => setForm({ ...form, reminderDate: v })} />
          <Text style={s.fieldLabel}>Color</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            {COLORS.map(c => (
              <TouchableOpacity key={c} onPress={() => setForm({ ...form, color: c })}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c, borderWidth: form.color === c ? 3 : 0, borderColor: 'white' }} />
            ))}
          </View>
          <TouchableOpacity onPress={async () => { await api.post('/api/notes', form); setShowModal(false); load() }} style={[s.submitBtn, { backgroundColor: '#8b5cf6' }]}>
            <Text style={s.submitBtnText}>Save Note</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowModal(false)} style={s.cancelBtn}><Text style={s.cancelBtnText}>Cancel</Text></TouchableOpacity>
        </View></View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  title: { color: TEXT, fontSize: 22, fontWeight: '800' }, sub: { color: MUTED, fontSize: 12, marginTop: 2 },
  addBtn: { backgroundColor: '#8b5cf6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 }, addBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 60 }, emptyIcon: { fontSize: 38, marginBottom: 10 },
  emptyTitle: { color: SUB, fontWeight: '600', fontSize: 16 }, emptySub: { color: MUTED, fontSize: 13, marginTop: 4 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { backgroundColor: '#0e0e18', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: '#222232' },
  modalTitle: { color: TEXT, fontWeight: '700', fontSize: 18, marginBottom: 16 },
  fieldLabel: { color: MUTED, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 },
  field: { backgroundColor: '#13131e', borderWidth: 1, borderColor: '#222232', borderRadius: 12, padding: 13, color: TEXT, fontSize: 15, marginBottom: 14 },
  submitBtn: { borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 4 }, submitBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', marginTop: 12, paddingBottom: 4 }, cancelBtnText: { color: MUTED, fontSize: 14 },
})
