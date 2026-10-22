# MERN Notes App - Complete Project Structure

## 📁 File Structure

```
mern-notes-app/
│
├── 📄 README.md                          # Full documentation
├── 📄 QUICK_START.md                     # 5-minute setup guide
├── 📄 ARCHITECTURE.md                    # Technical architecture
├── 📄 .gitignore                         # Git ignore rules
│
├── 📂 server/                            # Express.js Backend
│   ├── 📄 package.json                   # Backend dependencies
│   ├── 📄 server.js                      # Main Express server
│   │   ├── MongoDB connection & setup
│   │   ├── Note schema & model
│   │   ├── GET /api/notes
│   │   ├── GET /api/notes/:id
│   │   ├── POST /api/notes
│   │   ├── PUT /api/notes/:id
│   │   ├── DELETE /api/notes/:id
│   │   └── POST /api/notes/:id/correct-grammar
│   └── 📄 .env                           # Environment variables
│       ├── MONGODB_URI
│       ├── ANTHROPIC_API_KEY
│       └── PORT
│
└── 📂 client/                            # React Frontend
    ├── 📄 package.json                   # Frontend dependencies
    │
    ├── 📂 public/
    │   └── 📄 index.html                 # HTML entry point
    │
    └── 📂 src/
        ├── 📄 index.js                   # React root entry
        ├── 📄 index.css                  # Global styles
        │
        ├── 📄 App.js                     # Main React component
        │   ├── State: notes[], selectedNoteId, loading
        │   ├── Methods: fetchNotes(), createNewNote(), updateNote(), deleteNote()
        │   └── Renders: Sidebar + MainContent
        │
        ├── 📄 App.css                    # App container styles
        │   ├── .app (flex container)
        │   ├── .sidebar (300px fixed)
        │   ├── .main-content
        │   └── Responsive design
        │
        └── 📂 components/
            ├── 📄 NotesList.js           # Notes sidebar list
            │   ├── Props: notes[], selectedId, onSelect(), onDelete()
            │   ├── Display list of notes with preview
            │   ├── Smart date formatting
            │   └── Delete button with confirmation
            │
            ├── 📄 NotesList.css          # NotesList styles
            │   ├── .notes-list (scrollable)
            │   ├── .note-item (clickable)
            │   ├── .note-item.active (highlight)
            │   └── .note-delete-btn
            │
            ├── 📄 NoteEditor.js          # Note editor & corrections
            │   ├── Props: note, onUpdate(), onDelete()
            │   ├── State: title, content, correcting, showCorrections, status
            │   ├── Features:
            │   │   ├── Editable title
            │   │   ├── Auto-saving content
            │   │   ├── Grammar check button
            │   │   ├── Corrections panel
            │   │   └── Apply corrections
            │   └── Methods:
            │       ├── handleTitleChange()
            │       ├── handleContentChange()
            │       ├── correctGrammar()
            │       └── applyCorrections()
            │
            └── 📄 NoteEditor.css         # NoteEditor styles
                ├── .editor-header
                ├── .editor-body
                ├── .editor-textarea
                ├── .corrections-panel
                ├── .correction-item
                ├── .change-type (grammar|punctuation|spelling)
                └── Responsive layout
```

## 🔄 Data Flow

### Note Creation
```
User → Click "New" → App.js → Axios POST → Express → MongoDB → Response → Update state → Re-render
```

### Grammar Check
```
User → Click "Check" → NoteEditor → Axios POST → Express → Claude API → Parse → Store → Display
```

### Note Update (Auto-save)
```
User → Type text → handleContentChange() → onUpdate() → Axios PUT → Express → MongoDB → Silent update
```

## 📊 Component Hierarchy

```
<App>
  ├── <Sidebar>
  │   ├── <SidebarHeader>
  │   │   ├── "Notes" title
  │   │   └── "New" button
  │   │
  │   └── <NotesList>
  │       ├── <NoteItem> (multiple)
  │       │   ├── Note title
  │       │   ├── Content preview
  │       │   ├── Last modified date
  │       │   └── Delete button
  │       │
  │       └── Empty state (if no notes)
  │
  └── <MainContent>
      ├── <NoteEditor> (if note selected)
      │   ├── <EditorHeader>
      │   │   ├── Title input
      │   │   ├── Check Grammar button
      │   │   └── Delete button
      │   │
      │   └── <EditorBody>
      │       ├── <EditorSection>
      │       │   └── Content textarea
      │       │
      │       └── <CorrectionsPanel> (conditional)
      │           ├── Corrected version
      │           ├── Apply Corrections button
      │           └── Changes list
      │               └── <CorrectionItem> (multiple)
      │
      └── <EmptyState> (if no note selected)
```

## 🔌 API Contract

### Create Note
```
POST /api/notes
Body: { title: string, content: string }
Response: { _id, title, content, createdAt, updatedAt }
```

### Fetch All Notes
```
GET /api/notes
Response: [{ _id, title, content, correctedContent, corrections, createdAt, updatedAt }]
```

### Fetch One Note
```
GET /api/notes/:id
Response: { _id, title, content, correctedContent, corrections, createdAt, updatedAt }
```

### Update Note
```
PUT /api/notes/:id
Body: { title?, content?, correctedContent?, corrections? }
Response: { updated note object }
```

### Delete Note
```
DELETE /api/notes/:id
Response: { message: "Note deleted" }
```

### Grammar Check
```
POST /api/notes/:id/correct-grammar
Response: {
  _id, title, content,
  correctedContent: string,
  corrections: [
    { type: "grammar|punctuation|spelling", original, suggestion, explanation }
  ]
}
```

## 🎨 Styling Architecture

### Global Styles (index.css)
- Font family setup
- Body styles
- Default element styling

### App Styles (App.css)
- Layout: flex container
- Sidebar: 300px width
- Main content: flex-1
- Responsive: 768px breakpoint

### Component Styles
- **NotesList.css**: List item styling, active state, delete button
- **NoteEditor.css**: Editor panels, textarea, correction display, buttons

### Color Scheme
- Primary: #007bff (blue)
- Danger: #dc3545 (red)
- Success: #28a745 (green)
- Warning: #ffc107 (yellow)
- Background: #f5f5f5 (light gray)
- Borders: #e0e0e0 (gray)

## 🚀 Dependencies

### Backend (server/package.json)
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **cors**: Cross-origin support
- **dotenv**: Environment variables
- **axios**: HTTP client

### Frontend (client/package.json)
- **react**: UI library
- **react-dom**: React DOM renderer
- **axios**: HTTP client
- **react-scripts**: Create React App scripts

## 📝 Key Concepts

### State Management
- App.js: Centralized state for all notes
- NoteEditor.js: Local state for current note editing
- Real-time sync between components

### Auto-save
- Every content/title change triggers update
- No debouncing (can be added for optimization)
- Saves to MongoDB immediately

### Error Handling
- Try-catch in all async operations
- User-friendly error messages
- Server logs for debugging

### Responsive Design
- Mobile: Single column layout
- Desktop: Sidebar + main content
- Breakpoint: 768px

## ✅ Features Checklist

- [x] Create notes
- [x] Edit notes (title & content)
- [x] Delete notes
- [x] View all notes
- [x] Select/switch notes
- [x] Auto-save functionality
- [x] Grammar check via Claude AI
- [x] Display corrections with explanations
- [x] Apply corrections to note
- [x] Last modified timestamp
- [x] Note preview in list
- [x] Responsive design
- [x] Error handling
- [x] Loading states

## 🔒 Environment Setup

```bash
# server/.env
MONGODB_URI=mongodb://localhost:27017/notes-app
ANTHROPIC_API_KEY=sk-ant-...
PORT=5000

# client package.json
"proxy": "http://localhost:5000"
```

## 📚 Documentation Files

1. **README.md** - Full documentation, setup, API reference
2. **QUICK_START.md** - 5-minute setup guide for developers
3. **ARCHITECTURE.md** - Technical architecture and implementation details
4. **This file** - Project structure and overview

## 🛠️ Common Commands

```bash
# Backend
npm install          # Install dependencies
npm run dev         # Start with hot reload
npm start           # Start server

# Frontend
npm install         # Install dependencies
npm start           # Start dev server
npm build           # Build for production
npm test            # Run tests
```

## 📦 Deployment Ready

The project is structured for easy deployment:
- Clear separation of frontend/backend
- Environment variable configuration
- Production build scripts
- Error handling and logging
- API-first architecture

Ready to deploy to: Heroku, AWS, Google Cloud, DigitalOcean, etc.
