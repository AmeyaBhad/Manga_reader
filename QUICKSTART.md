# Quick Start Guide

Get your Manga Reader running in 5 minutes!

## Windows Setup

### Step 1: Install Node.js
Download and install Node.js from https://nodejs.org/ (LTS version recommended)

### Step 2: Start Backend Server

Open PowerShell in the `server` folder:
```powershell
cd server
npm install
npm start
```

You should see: `Server running on http://localhost:5000`

### Step 3: Start Frontend

Open another PowerShell in the `client` folder:
```powershell
cd client
npm install
npm start
```

The app will automatically open in your browser at `http://localhost:3000`

## What to Do Next

1. **Register an Account** - Click "Register" to create a new account
2. **Explore Manga** - Click "Search" to find manga
3. **Start Reading** - Click on any manga and select a chapter to read
4. **Add Favorites** - Click the heart icon to save manga you love
5. **Bookmark Pages** - While reading, click the bookmark button to save pages

## Features Available

✅ Browse & Search manga
✅ Read manga chapters  
✅ Track reading history
✅ Add to favorites
✅ Bookmark pages
✅ User accounts & login

## Troubleshooting

**Port already in use?**
- Edit `server/.env` and change `PORT=5000` to another port like `PORT=5001`

**Can't connect?**
- Make sure both server AND client are running
- Check that server is on `http://localhost:5000`
- Try opening browser console for errors

**Images not loading?**
- Some manga covers may not be available
- Placeholder images will show instead

## File Locations

- Server: `C:\Users\ameya\OneDrive\Desktop\Manga reader\server\`
- Client: `C:\Users\ameya\OneDrive\Desktop\Manga reader\client\`
- Database: `C:\Users\ameya\OneDrive\Desktop\Manga reader\server\manga.db` (created automatically)

## Next Steps

Read the full README.md for:
- Detailed feature documentation
- API endpoints reference
- Database schema
- Advanced configuration
- Feature implementation details

---

**Enjoy reading manga! 📚**
