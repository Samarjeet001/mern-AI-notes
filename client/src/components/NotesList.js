import React from 'react';
import './NotesList.css';

function NotesList({ notes, selectedId, onSelect, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getPreview = (content) => {
    return content.substring(0, 50).replace(/\n/g, ' ') + (content.length > 50 ? '...' : '');
  };

  return (
    <div className="notes-list">
      {notes.length === 0 ? (
        <div className="notes-empty">
          <p>No notes yet</p>
        </div>
      ) : (
        notes.map(note => (
          <div
            key={note._id}
            className={`note-item ${selectedId === note._id ? 'active' : ''}`}
            onClick={() => onSelect(note._id)}
          >
            <div className="note-item-content">
              <h3 className="note-item-title">{note.title}</h3>
              <p className="note-item-preview">
                {getPreview(note.content) || 'No content'}
              </p>
            </div>
            <div className="note-item-meta">
              <span className="note-item-date">
                {formatDate(note.updatedAt)}
              </span>
              <button
                className="note-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this note?')) {
                    onDelete(note._id);
                  }
                }}
                title="Delete note"
              >
                🗑️
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default NotesList;
