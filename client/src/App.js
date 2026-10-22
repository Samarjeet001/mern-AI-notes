import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all notes
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notes');
      setNotes(response.data);
      if (response.data.length > 0 && !selectedNoteId) {
        setSelectedNoteId(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewNote = async () => {
    try {
      const response = await axios.post('/api/notes', {
        title: 'Untitled Note',
        content: ''
      });
      setNotes([response.data, ...notes]);
      setSelectedNoteId(response.data._id);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`);
      setNotes(notes.filter(note => note._id !== id));
      if (selectedNoteId === id) {
        setSelectedNoteId(notes.length > 1 ? notes[0]._id : null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const updateNote = async (id, updates) => {
    try {
      const response = await axios.put(`/api/notes/${id}`, updates);
      setNotes(notes.map(note => note._id === id ? response.data : note));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const selectedNote = notes.find(note => note._id === selectedNoteId);

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Notes</h1>
          <button className="new-note-btn" onClick={createNewNote}>
            ➕ New
          </button>
        </div>
        <NotesList
          notes={notes}
          selectedId={selectedNoteId}
          onSelect={setSelectedNoteId}
          onDelete={deleteNote}
        />
      </div>

      <div className="main-content">
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onUpdate={updateNote}
            onDelete={deleteNote}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>No notes yet</h2>
            <p>Create a new note to get started</p>
            <button className="primary-btn" onClick={createNewNote}>
              Create your first note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
