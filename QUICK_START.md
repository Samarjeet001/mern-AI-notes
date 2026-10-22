# Quick Start Guide

## Prerequisites
- Node.js 14+ installed
- MongoDB running (local or Atlas)
- Anthropic API key from https://console.anthropic.com

## 5-Minute Setup

### Step 1: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend (in new terminal)
cd client
npm install
```

### Step 2: Configure Environment

Create `server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/notes-app
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
PORT=5000
```

### Step 3: Start Services

**Terminal 1** - MongoDB (if running locally):
```bash
mongod
```

**Terminal 2** - Backend Server:
```bash
cd server
npm run dev
```
✓ Server running on http://localhost:5000

**Terminal 3** - Frontend:
```bash
cd client
npm start
```
✓ App opening on http://localhost:3000

## Testing the App

1. **Create a Note**
   - Click "New" button
   - Write some text with intentional grammar mistakes

2. **Check Grammar**
   - Click "Check Grammar" button
   - Wait for AI to analyze
   - Review corrections

3. **Apply Corrections**
   - Click "Apply Corrections" button
   - Note content updates

## Common Issues

| Issue | Solution |
|-------|----------|
| Can't connect to MongoDB | Make sure `mongod` is running or update MONGODB_URI in .env |
| API Key error | Verify ANTHROPIC_API_KEY in .env file is correct |
| Port 5000 already in use | Kill existing process or change PORT in .env |
| CORS errors | Ensure proxy in client/package.json points to :5000 |

## Next Steps

- Customize styling in CSS files
- Add authentication (passport.js)
- Deploy to production (Heroku, AWS, etc.)
- Add more features (tags, categories, search)

## File Locations

```
server/
  ├── server.js       ← Main API server
  ├── .env            ← Your API keys here
  └── package.json

client/
  ├── src/
  │   ├── App.js      ← Main React component
  │   └── components/ ← Note components
  └── package.json
```

## Documentation

Full documentation available in README.md
