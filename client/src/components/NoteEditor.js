import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NoteEditor.css';

function NoteEditor({ note, onUpdate, onDelete }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [correcting, setCorrecting] = useState(false);
  const [showCorrections, setShowCorrections] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setShowCorrections(false);
  }, [note._id]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdate(note._id, { title: newTitle });
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    onUpdate(note._id, { content: newContent });
  };

  const correctGrammar = async () => {
    if (!content.trim()) {
      setStatus('Please write something to correct');
      return;
    }

    setCorrecting(true);
    setStatus('Checking grammar...');

    try {
      const response = await axios.post(`/api/notes/${note._id}/correct-grammar`);
      const updatedNote = response.data;
      
      onUpdate(note._id, {
        correctedContent: updatedNote.correctedContent,
        corrections: updatedNote.corrections
      });

      setShowCorrections(true);
      setStatus(`✓ Found ${updatedNote.corrections.length} correction${updatedNote.corrections.length === 1 ? '' : 's'}`);
    } catch (error) {
      console.error('Error correcting grammar:', error);
      setStatus('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setCorrecting(false);
    }
  };

  const applyCorrections = () => {
    if (note.correctedContent) {
      setContent(note.correctedContent);
      onUpdate(note._id, { content: note.correctedContent });
      setShowCorrections(false);
      setStatus('Corrections applied!');
      setTimeout(() => setStatus(''), 2000);
    }
  };

  return (
    <div className="note-editor">
      <div className="editor-header">
        <input
          type="text"
          className="editor-title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
        />
        <div className="editor-actions">
          <button
            className="btn btn-primary"
            onClick={correctGrammar}
            disabled={correcting || !content.trim()}
          >
            {correcting ? '⏳ Checking...' : '✨ Check Grammar'}
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm('Delete this note?')) {
                onDelete(note._id);
              }
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="editor-body">
        <div className="editor-section">
          <label>Your note:</label>
          <textarea
            className="editor-textarea"
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing..."
          />
        </div>

        {showCorrections && note.corrections && note.corrections.length > 0 && (
          <div className="editor-section corrections-panel">
            <div className="corrections-header">
              <h3>Corrections ({note.corrections.length})</h3>
              <button
                className="btn btn-success"
                onClick={applyCorrections}
              >
                ✓ Apply Corrections
              </button>
            </div>

            <div className="corrected-preview">
              <h4>Corrected version:</h4>
              <div className="corrected-text">
                {note.correctedContent}
              </div>
            </div>

            <div className="corrections-list">
              <h4>Changes:</h4>
              {note.corrections.map((correction, index) => (
                <div key={index} className="correction-item">
                  <span className={`correction-type ${correction.type}`}>
                    {correction.type.toUpperCase()}
                  </span>
                  <div className="correction-content">
                    <div className="original">
                      <strong>Original:</strong> "{correction.original}"
                    </div>
                    <div className="suggested">
                      <strong>Suggested:</strong> "{correction.suggestion}"
                    </div>
                    <div className="explanation">
                      {correction.explanation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showCorrections && note.corrections && note.corrections.length === 0 && (
          <div className="editor-section success-panel">
            <div className="success-message">
              ✓ No corrections needed! Your writing looks great.
            </div>
          </div>
        )}
      </div>

      {status && <div className="editor-status">{status}</div>}
    </div>
  );
}

export default NoteEditor;
