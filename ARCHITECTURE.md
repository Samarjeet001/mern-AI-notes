# MERN Notes App - Architecture & Implementation

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React)                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │          App.js (Main Container)                 │  │
│  │  ┌──────────────┐        ┌─────────────────┐   │  │
│  │  │ NotesList    │        │  NoteEditor     │   │  │
│  │  │              │        │                 │   │  │
│  │  │ - Display    │        │ - Edit content  │   │  │
│  │  │ - Select     │        │ - Check grammar │   │  │
│  │  │ - Delete     │        │ - Apply fixes   │   │  │
│  │  └──────────────┘        └─────────────────┘   │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│                  Axios HTTP Client                      │
└─────────────────────────────────────────────────────────┘
                            ↓ HTTP
┌─────────────────────────────────────────────────────────┐
│               BACKEND (Express.js)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Express Server (port 5000)              │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │         API Routes                       │   │  │
│  │  │  GET    /api/notes                       │   │  │
│  │  │  POST   /api/notes                       │   │  │
│  │  │  PUT    /api/notes/:id                   │   │  │
│  │  │  DELETE /api/notes/:id                   │   │  │
│  │  │  POST   /api/notes/:id/correct-grammar   │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────┘  │
│           ↓                            ↓                │
│      Mongoose                    Axios (Claude API)    │
└─────────────────────────────────────────────────────────┘
        ↓                                ↓
   ┌─────────────┐            ┌──────────────────┐
   │  MongoDB    │            │  Claude API      │
   │  (Database) │            │  (Grammar Check) │
   └─────────────┘            └──────────────────┘
```

## Data Flow

### 1. Creating a Note
```
User clicks "New" 
    ↓
Front-end: App.js calls createNewNote()
    ↓
Axios: POST /api/notes { title, content }
    ↓
Backend: Creates new Note in MongoDB
    ↓
Response: Returns created note with _id
    ↓
Front-end: Updates notes list, selects new note
```

### 2. Grammar Correction Flow
```
User clicks "Check Grammar"
    ↓
Front-end: NoteEditor.js calls correctGrammar()
    ↓
Axios: POST /api/notes/:id/correct-grammar
    ↓
Backend: 
  - Fetches note from MongoDB
  - Sends content to Claude API
  - Claude analyzes and returns corrections
  - Stores corrections in note
    ↓
Response: { correctedContent, corrections: [...] }
    ↓
Front-end: 
  - Displays corrected version
  - Shows detailed correction list
  - User can apply or dismiss
```

### 3. Updating a Note
```
User types in textarea
    ↓
NoteEditor: handleContentChange() triggered
    ↓
Auto-call: onUpdate() with new content
    ↓
Axios: PUT /api/notes/:id { content, ... }
    ↓
Backend: Updates note in MongoDB
    ↓
Auto-save: Note updated in database
```

## Component Structure

### Frontend Components

#### App.js
- **Purpose**: Main container, state management
- **State**:
  - `notes`: Array of all notes
  - `selectedNoteId`: Currently selected note ID
  - `loading`: Loading state
- **Key Methods**:
  - `fetchNotes()`: GET all notes
  - `createNewNote()`: POST new note
  - `updateNote(id, updates)`: PUT note changes
  - `deleteNote(id)`: DELETE note

#### NotesList.js
- **Purpose**: Display list of notes in sidebar
- **Props**:
  - `notes`: Array of notes
  - `selectedId`: Currently selected note ID
  - `onSelect`: Callback to select note
  - `onDelete`: Callback to delete note
- **Features**:
  - Smart date formatting (Today/Yesterday/Date)
  - Content preview (first 50 chars)
  - Delete button with confirmation

#### NoteEditor.js
- **Purpose**: Edit note content and handle grammar correction
- **Props**:
  - `note`: Current note object
  - `onUpdate`: Callback to update note
  - `onDelete`: Callback to delete note
- **State**:
  - `title`: Note title (editable)
  - `content`: Note content (editable)
  - `correcting`: Loading state for API call
  - `showCorrections`: Toggle corrections panel
  - `status`: Status message display
- **Key Methods**:
  - `correctGrammar()`: POST request to Claude API
  - `applyCorrections()`: Update content with corrected version
  - `handleTitleChange()`: Update note title
  - `handleContentChange()`: Update note content

### Backend Structure

#### Express Server (server.js)

**Middleware**:
- `cors()`: Enable cross-origin requests
- `express.json()`: Parse JSON bodies

**Database Connection**:
- Mongoose connects to MongoDB
- Automatic reconnection on failure

**Schema - Note Model**:
```javascript
{
  title: String,
  content: String,
  correctedContent: String,
  corrections: [{
    type: String,
    original: String,
    suggestion: String,
    explanation: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**API Routes**:

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | /api/notes | Fetch all notes sorted by updatedAt |
| GET | /api/notes/:id | Fetch single note by ID |
| POST | /api/notes | Create new note |
| PUT | /api/notes/:id | Update note (title, content, corrections) |
| DELETE | /api/notes/:id | Delete note |
| POST | /api/notes/:id/correct-grammar | Check grammar via Claude API |

## Key Features Explained

### 1. Auto-Save
- Every content/title change triggers `onUpdate()`
- Debouncing NOT implemented (intentional for simplicity)
- For production, add debounce to reduce API calls

### 2. Grammar Correction
```javascript
// Claude API Request Format
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1000,
  "messages": [
    {
      "role": "user",
      "content": "Check grammar and return JSON with correctedText and changes array"
    }
  ]
}

// Returns
{
  "correctedText": "string",
  "changes": [
    {
      "type": "grammar|punctuation|spelling",
      "original": "original text",
      "suggestion": "corrected text",
      "explanation": "reason for correction"
    }
  ]
}
```

### 3. Responsive Design
- **Desktop**: Side-by-side layout (sidebar 300px + main content)
- **Mobile**: Stacked layout (sidebar collapses)
- Media query at 768px breakpoint

### 4. Error Handling
- Try-catch blocks in all async functions
- User-friendly error messages
- Server returns appropriate HTTP status codes
- Client displays error messages with status indicator

## Security Considerations

### Current Implementation
- Environment variables for sensitive data
- Input validation on server
- CORS configured for development

### Production Recommendations
1. **Authentication**: Add JWT or OAuth
2. **Authorization**: Validate user ownership of notes
3. **Input Validation**: Sanitize all inputs
4. **Rate Limiting**: Prevent API abuse
5. **HTTPS**: Use in production only
6. **Environment**: Keep API keys secret
7. **Logging**: Monitor API calls and errors

## Performance Optimizations

### Current
- Efficient MongoDB queries
- Single API call per correction

### Potential Improvements
1. **Client-side Caching**: Cache notes locally
2. **Debouncing**: Debounce auto-save calls
3. **Pagination**: Load notes in chunks
4. **Compression**: Gzip responses
5. **CDN**: Serve static assets from CDN
6. **Indexing**: Create MongoDB indexes on frequently queried fields

## Environment Variables

### Server (.env)
```
MONGODB_URI          # MongoDB connection string
ANTHROPIC_API_KEY    # Claude API key
PORT                 # Server port (default: 5000)
NODE_ENV             # development/production
```

## Testing

### Manual Testing Checklist
- [ ] Create new note
- [ ] Edit note title
- [ ] Edit note content (auto-saves)
- [ ] Check grammar with various content
- [ ] Apply corrections
- [ ] Delete note with confirmation
- [ ] Switch between notes
- [ ] Test on mobile (responsive)

### Sample Test Data
```javascript
// Intentional grammar mistakes for testing
"I goes to the store and buys milk, eggs and bread."
"Its a beautiful day isnt it"
"The quick brown fox jump over the lazy dog"
```

## Troubleshooting Guide

### Backend Issues
1. **MongoDB won't connect**
   - Check MONGODB_URI format
   - Ensure MongoDB service is running
   - For Atlas: whitelist IP address

2. **Claude API errors**
   - Verify ANTHROPIC_API_KEY is correct
   - Check API rate limits
   - Ensure account has sufficient credits

3. **CORS errors**
   - Verify proxy in client/package.json
   - Check Express CORS configuration
   - Ensure correct port numbers

### Frontend Issues
1. **Notes not loading**
   - Check browser console for errors
   - Verify server is running
   - Check network tab for failed requests

2. **Grammar check not working**
   - Verify API key is set
   - Check server logs for errors
   - Ensure note content is not empty

## Future Enhancements

1. **User Authentication**: Multi-user support
2. **Categories/Tags**: Organize notes
3. **Search**: Full-text search across notes
4. **Rich Text Editor**: Formatting options
5. **Collaboration**: Share notes with others
6. **Export**: PDF, Markdown export
7. **Voice Notes**: Transcription support
8. **Offline Support**: PWA with service workers
9. **Dark Mode**: Theme switching
10. **Advanced Analytics**: Word count, reading time

## Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas cluster created
- [ ] Anthropic API key validated
- [ ] Frontend built (`npm run build`)
- [ ] Backend tested with production database
- [ ] CORS configured for production domain
- [ ] Error logging enabled
- [ ] Rate limiting configured
- [ ] HTTPS/SSL enabled
- [ ] Backups configured for MongoDB
