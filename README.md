# Manga Reader

A full-featured manga reading platform built with Node.js/Express and React, integrated with the free MangaDex API.

## Features

✅ **User Accounts & Authentication**
- User registration and login
- JWT token-based authentication
- Secure password hashing

✅ **Manga Browsing & Search**
- Search manga by title
- Browse trending manga
- View detailed manga information (description, genres, authors, artists, tags)

✅ **Chapter Reading**
- Full-page manga reader
- Navigate between pages and chapters
- High-quality image display

✅ **Reading History**
- Automatic progress tracking
- Continue where you left off
- View all previously read manga

✅ **Bookmarks**
- Bookmark specific pages for later
- Manage all bookmarked pages
- Quick access to bookmarked content

✅ **Favorites**
- Add manga to favorites
- Maintain a personal favorite list
- Quick access to loved titles

## Tech Stack

**Backend:**
- Node.js & Express.js
- SQLite3 database
- JWT authentication
- Axios for API calls
- bcryptjs for password hashing

**Frontend:**
- React 18
- React Router for navigation
- Axios for API requests
- CSS3 for styling

**API:**
- MangaDex API v5 (Free, no authentication required)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. (Optional) Update `.env` with your configuration:
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

5. Start the server:
```bash
npm start
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Manga
- `GET /api/manga/search?query=...` - Search manga
- `GET /api/manga/trending` - Get trending manga
- `GET /api/manga/:id` - Get manga details

### Chapters
- `GET /api/chapters/manga/:mangaId` - Get chapters for manga
- `GET /api/chapters/:chapterId/pages` - Get pages for chapter
- `POST /api/chapters/reading-history` - Save reading progress (requires auth)
- `GET /api/chapters/reading-history` - Get reading history (requires auth)

### Bookmarks
- `POST /api/bookmarks` - Create bookmark (requires auth)
- `GET /api/bookmarks` - Get all bookmarks (requires auth)
- `DELETE /api/bookmarks/:id` - Delete bookmark (requires auth)
- `GET /api/bookmarks/manga/:mangaId/bookmarks` - Get bookmarks for manga (requires auth)

### Favorites
- `POST /api/favorites/:mangaId` - Add to favorites (requires auth)
- `GET /api/favorites` - Get all favorites (requires auth)
- `DELETE /api/favorites/:mangaId` - Remove from favorites (requires auth)
- `GET /api/favorites/is-favorite/:mangaId` - Check if favorited (requires auth)

## Database Schema

### Users
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password` - Hashed password
- `created_at` - Registration timestamp

### Manga
- `id` - Primary key (MangaDex ID)
- `title` - Manga title
- `description` - Manga description
- `cover_url` - Cover image URL
- `status` - Publication status
- `year` - Publication year
- `content_rating` - Content rating

### Chapters
- `id` - Primary key (MangaDex chapter ID)
- `manga_id` - Foreign key to manga
- `chapter_number` - Chapter number
- `title` - Chapter title
- `pages` - Page count
- `published_at` - Publication date

### Reading History
- `id` - Primary key
- `user_id` - Foreign key to user
- `manga_id` - Foreign key to manga
- `chapter_id` - Current chapter
- `page_number` - Current page
- `last_read` - Last read timestamp

### Bookmarks
- `id` - Primary key
- `user_id` - Foreign key to user
- `manga_id` - Foreign key to manga
- `chapter_id` - Foreign key to chapter
- `page_number` - Bookmarked page
- `created_at` - Bookmark timestamp

### Favorites
- `id` - Primary key
- `user_id` - Foreign key to user
- `manga_id` - Foreign key to manga
- `created_at` - Favorite timestamp

## Usage Guide

### 1. Register & Login
- Click "Register" to create a new account
- Use your credentials to login
- Your session will be saved (7-day token expiration)

### 2. Search & Browse
- Use the search bar to find manga by title
- Browse trending manga on the homepage
- Click on any manga to see details

### 3. Read Manga
- Click "Start Reading" on a manga detail page
- Navigate between pages with Previous/Next buttons
- Switch chapters using the dropdown
- Your progress is automatically saved

### 4. Bookmark Pages
- While reading, click the bookmark button to mark a page
- Access all bookmarked pages from the "Bookmarks" section
- Remove bookmarks anytime

### 5. Manage Favorites
- Click the heart icon on a manga to add to favorites
- View all favorites in the "Favorites" section
- Easily find and re-read your favorite manga

### 6. Check Reading History
- Your reading progress is automatically tracked
- View "History" to see all manga you're reading
- Continue reading where you left off

## File Structure

```
manga-reader/
├── server/
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── manga.js         # Manga search & details
│   │   ├── chapters.js      # Chapters & reading history
│   │   ├── bookmarks.js     # Bookmark management
│   │   └── favorites.js     # Favorite management
│   ├── db.js                # Database initialization
│   ├── middleware.js        # Auth middleware
│   ├── index.js             # Main server file
│   ├── package.json
│   └── manga.db             # SQLite database (created on first run)
│
├── client/
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js              # Trending manga
│   │   │   ├── Search.js            # Search & browse
│   │   │   ├── MangaDetail.js       # Manga details & chapters
│   │   │   ├── Reader.js            # Manga reader
│   │   │   ├── Login.js             # Login page
│   │   │   ├── Register.js          # Registration page
│   │   │   ├── ReadingHistory.js    # Reading history
│   │   │   ├── Favorites.js         # Favorites
│   │   │   └── Bookmarks.js         # Bookmarks
│   │   ├── App.js           # Main app component
│   │   ├── App.css          # Styling
│   │   ├── api.js           # API client
│   │   ├── AuthContext.js   # Authentication context
│   │   └── index.js         # React entry point
│   └── package.json
│
└── README.md
```

## Features Implementation Details

### 1. Authentication (✅ Complete)
- User registration with email validation
- Secure login with password hashing
- JWT token-based session management
- Token stored in localStorage
- Auto-refresh user on page load
- Protected routes requiring authentication

### 2. Manga Browsing & Search (✅ Complete)
- Integrated with MangaDex API v5
- Search with pagination
- Trending manga display
- Detailed manga information with cover images
- Genre and tag information
- Author and artist details

### 3. Chapter Reading (✅ Complete)
- Full manga reader interface
- Page-by-page navigation
- Chapter selection dropdown
- Auto-save reading progress
- High-quality image display
- Responsive design for all devices

### 4. Reading History (✅ Complete)
- Automatic progress tracking on every page view
- Persistent history in database
- Continue reading feature
- Last read date/time tracking
- Visual display of all reading activity

### 5. Bookmarks (✅ Complete)
- Bookmark specific pages while reading
- Unique bookmarks per user
- View all bookmarks with manga details
- Quick navigation to bookmarked pages
- Remove bookmarks easily

### 6. Favorites (✅ Complete)
- Add/remove manga from favorites
- Persistent favorite list per user
- Check favorite status before display
- Quick access to favorite manga
- Favorite counter on manga cards

## Performance Optimizations

- Image caching with fallback placeholders
- Lazy loading for manga grids
- Efficient database queries with indexes
- JWT token caching in localStorage
- Minimal API calls with combined endpoints

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected API endpoints
- CORS enabled for frontend access
- Input validation on all endpoints
- SQL injection prevention (prepared statements)

## Known Limitations

- MangaDex API rate limiting (handled gracefully)
- Cover image availability depends on MangaDex
- Chapter availability varies by manga
- English translations only

## Future Enhancements

- Dark mode toggle
- Manga notifications
- Reading recommendations
- User profiles
- Comments & ratings
- Offline reading (PWA)
- Multiple language support
- Advanced filters & sorting

## Troubleshooting

### Server won't start
```bash
# Check if port 5000 is already in use
# Kill process on port 5000 or change PORT in .env
```

### Frontend won't connect to API
```bash
# Ensure server is running on http://localhost:5000
# Check REACT_APP_API_URL in .env if using custom API URL
# Clear browser cache and refresh
```

### Images not loading
- Some covers may not be available on MangaDex
- Placeholder images are shown as fallback
- Check browser console for CORS issues

### Manga pages won't load
- MangaDex may have rate limiting
- Try reading a different chapter
- Check your internet connection

## License

MIT

## Credits

- **MangaDex API** - Free manga API (https://mangadex.org)
- **React** - UI framework
- **Express.js** - Backend framework
- **SQLite** - Database

## Support

For issues or feature requests, please create an issue in the repository.

---

**Happy Reading! 📚**
