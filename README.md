# Melodix — Premium Neon Music Experience

Melodix is a responsive, multi-page web application featuring a sleek, dark synthwave aesthetic with neon pink, purple, and blue highlights. The application is built using semantic HTML5, clean vanilla CSS variables, and modular Vanilla Javascript.

## 🚀 Live Demo & Preview
To run the project locally:
1. Clone this repository or download the project files.
2. Open `index.html` in your favorite web browser, or use a local development server like VS Code Live Server.

---

## 📂 Project Directory Structure

```text
music-website-template/
├── index.html          # Homepage with hero, promo banner, stats, & playlists
├── music.html          # Interactive Music Library with live search & filters
├── artist.html         # Featured Artist Biography & contact cards
├── about.html          # About section explaining platform capabilities
├── contact.html        # Booking form with real-time word counter
├── README.md           # Project documentation (this file)
├── css/
│   └── styles.css      # Core styles, responsive design, and CSS theme custom properties
├── js/
│   ├── main.js         # Mobile navigation & Dark/Light mode theme engine
│   ├── player.js       # Audio singleton player, favorites tracker, & library filters
│   └── contact.js      # Contact form constraints checking & custom toast notifications
├── audio/              # HTML5 audio assets (.wav/.mp3 files)
└── images/             # Visual graphic assets (covers, hero, & profile images)
```

---

## ✨ Features

### 🌓 1. Theme Engine (Dark & Light Mode)
- Toggle between a default high-contrast dark neon scheme and a light theme.
- Remembers user preferences by caching the selection in local storage (`melodix_theme`).

### 🎛️ 2. Sticky Audio Player & Playlist Controller
- **HTML5 Audio Singleton**: A unified player persistent at the bottom of the screen allowing smooth play, pause, progress bar seeking, and volume adjustment.
- **Dynamic Playlist Handling**: Scrapes track properties (`data-id`, `data-title`, `data-artist`, etc.) dynamically from page elements to load tracks.
- **Queue Navigation**: Features automatic track progression (ended listener) and manual previous/next buttons.
- **Favorites System**: Integrates star buttons to bookmark tracks to `localStorage`.

### 🔍 3. Live Search & Interactive Filters
- **Instant Search**: Search through the music catalog in real-time matching track name or artist name.
- **Artist Filters & Favorites Playlist**: Quick tabs to filter tracks by specific artists or to isolate your bookmarked favorites list.
- **No-Results State**: Displays a clean fallback alert when search queries yield no matches.

### 📝 4. Booking Form with Rules Validation & Toast Messages
- **Real-Time Word Counter**: Monitors text length inside the message area and turns the counter red if you exceed the 200-word limit.
- **Validation Rules**:
  - All form fields (Name, Email, Phone, Message) are mandatory.
  - Checks for standard email address syntax.
  - Validates the phone number to ensure it has exactly 10 digits and contains only numbers.
- **Toast Notifications**: Interactive toast alerts slide into view from the top right to notify users of submission successes or validation errors.

### 📱 5. Responsive Layouts & Sticky Header
- Interactive hamburger-to-close menu icon transitions for small screens.
- Translucent backdrop filter applied to the navigation header on scroll.

---

## 🛠️ Technologies Used
- **Structure**: HTML5 Semantic Markup
- **Styling**: Vanilla CSS3 (Custom Variables, Flexbox, CSS Grid, Transitions)
- **Logic & Control**: Vanilla JavaScript (ES6+ Classes, Audio API, Custom Events)

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
