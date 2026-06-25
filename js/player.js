/**
 * Melodix Music Player Controller
 * Manages the HTML5 Audio singleton player, UI state sync, 
 * searching, filtering, and local storage favorites.
 */

class MelodixPlayer {
    constructor() {
        this.audio = new Audio();
        this.currentTrack = null;
        this.isPlaying = false;
        this.tracks = [];
        this.favorites = JSON.parse(localStorage.getItem('melodix_favorites')) || [];
        
        // DOM Cache
        this.playerBar = document.getElementById('global-player-bar');
        this.playBtn = document.getElementById('player-play-btn');
        this.playIcon = document.getElementById('player-play-icon');
        this.prevBtn = document.getElementById('player-prev-btn');
        this.nextBtn = document.getElementById('player-next-btn');
        this.progressBg = document.getElementById('player-progress-bg');
        this.progressFill = document.getElementById('player-progress-fill');
        this.timeCurrent = document.getElementById('player-time-current');
        this.timeTotal = document.getElementById('player-time-total');
        this.volumeBg = document.getElementById('player-volume-bg');
        this.volumeFill = document.getElementById('player-volume-fill');
        this.trackCover = document.getElementById('player-track-cover');
        this.trackTitle = document.getElementById('player-track-title');
        this.trackArtist = document.getElementById('player-track-artist');
        this.playerFavBtn = document.getElementById('player-fav-btn');
        
        // Search & Filter Cache
        this.searchInput = document.getElementById('music-search');
        this.filterButtons = document.querySelectorAll('#artist-filters .filter-btn');
        this.cardGrid = document.getElementById('music-card-grid');
        this.noTracksAlert = document.getElementById('no-tracks-found');
        this.activeFilter = 'all';
        this.searchQuery = '';

        this.init();
    }

    init() {
        this.loadTracksFromDOM();
        this.setupAudioListeners();
        this.setupPlayerUIListeners();
        this.setupSearchAndFilterListeners();
        this.syncFavoritesUI();
        
        // Set default volume
        this.audio.volume = 0.8;
        if (this.volumeFill) this.volumeFill.style.width = '80%';
    }

    // Load track information from DOM markup attributes (allows reuse across Home and Music page)
    loadTracksFromDOM() {
        const trackElements = document.querySelectorAll('.music-card, .playlist-item');
        const idsSeen = new Set();
        
        trackElements.forEach(el => {
            const id = el.getAttribute('data-id');
            // Avoid duplicate tracking of same tracks across different sections
            if (id && !idsSeen.has(id)) {
                idsSeen.add(id);
                this.tracks.push({
                    id: id,
                    title: el.getAttribute('data-title'),
                    artist: el.getAttribute('data-artist'),
                    audio: el.getAttribute('data-audio'),
                    cover: el.getAttribute('data-cover'),
                    phone: el.getAttribute('data-phone')
                });
            }
        });
    }

    // Register audio element callbacks
    setupAudioListeners() {
        // Update progress bar as audio plays
        this.audio.addEventListener('timeupdate', () => {
            if (this.audio.duration) {
                const percent = (this.audio.currentTime / this.audio.duration) * 100;
                if (this.progressFill) this.progressFill.style.width = `${percent}%`;
                if (this.timeCurrent) this.timeCurrent.textContent = this.formatTime(this.audio.currentTime);
            }
        });

        // Set total duration when metadata is loaded
        this.audio.addEventListener('loadedmetadata', () => {
            if (this.timeTotal) this.timeTotal.textContent = this.formatTime(this.audio.duration);
        });

        // When track finishes, play the next one automatically
        this.audio.addEventListener('ended', () => {
            this.playNext();
        });
    }

    // Register bottom player bar control listeners
    setupPlayerUIListeners() {
        // Play/Pause button click
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.togglePlayState());
        }

        // Previous button click
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.playPrev());
        }

        // Next button click
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.playNext());
        }

        // Click progress bar to seek
        if (this.progressBg) {
            this.progressBg.addEventListener('click', (e) => {
                if (!this.currentTrack) return;
                const rect = this.progressBg.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                const seekFraction = clickX / width;
                this.audio.currentTime = seekFraction * this.audio.duration;
            });
        }

        // Click volume bar to adjust volume
        if (this.volumeBg) {
            this.volumeBg.addEventListener('click', (e) => {
                const rect = this.volumeBg.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                let volume = clickX / width;
                volume = Math.max(0, Math.min(1, volume)); // clamp between 0 and 1
                
                this.audio.volume = volume;
                if (this.volumeFill) this.volumeFill.style.width = `${volume * 100}%`;
            });
        }

        // Sticky player favorite button click
        if (this.playerFavBtn) {
            this.playerFavBtn.addEventListener('click', () => {
                if (this.currentTrack) {
                    this.toggleFavorite(this.currentTrack.id);
                }
            });
        }

        // Card and playlist item play triggers
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.card-play-trigger');
            if (trigger) {
                e.preventDefault();
                const trackContainer = e.target.closest('.music-card, .playlist-item');
                if (trackContainer) {
                    const id = trackContainer.getAttribute('data-id');
                    this.selectAndPlayTrack(id);
                }
            }

            // Favorites trigger on cards
            const favTrigger = e.target.closest('.card-fav-trigger');
            if (favTrigger) {
                e.preventDefault();
                const trackContainer = e.target.closest('.music-card');
                if (trackContainer) {
                    const id = trackContainer.getAttribute('data-id');
                    this.toggleFavorite(id);
                }
            }
        });
    }

    // Register search inputs and filter buttons
    setupSearchAndFilterListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.filterTracks();
            });
        }

        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilter = btn.getAttribute('data-filter');
                this.filterTracks();
            });
        });
    }

    // Main playback trigger
    selectAndPlayTrack(id) {
        const track = this.tracks.find(t => t.id === id);
        if (!track) return;

        // If clicked track is already loaded, toggle play/pause
        if (this.currentTrack && this.currentTrack.id === track.id) {
            this.togglePlayState();
        } else {
            // Otherwise load the new track
            this.currentTrack = track;
            this.audio.src = track.audio;
            this.audio.load();
            
            // Show player bar
            if (this.playerBar) this.playerBar.classList.add('active');
            
            // Update metadata details in bottom bar
            if (this.trackCover) this.trackCover.src = track.cover;
            if (this.trackTitle) this.trackTitle.textContent = track.title;
            if (this.trackArtist) this.trackArtist.textContent = track.artist;
            
            this.isPlaying = false;
            this.togglePlayState(true); // force play
        }
    }

    // Toggle Play/Pause state
    togglePlayState(forcePlay = false) {
        if (!this.currentTrack && this.tracks.length > 0) {
            // If no track is active, pick the first one
            this.selectAndPlayTrack(this.tracks[0].id);
            return;
        }

        if (forcePlay || !this.isPlaying) {
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    this.updatePlaybackUI();
                })
                .catch(err => console.error("Playback failed:", err));
        } else {
            this.audio.pause();
            this.isPlaying = false;
            this.updatePlaybackUI();
        }
    }

    // Plays the next track in the list
    playNext() {
        if (!this.currentTrack || this.tracks.length === 0) return;
        const currentIdx = this.tracks.findIndex(t => t.id === this.currentTrack.id);
        let nextIdx = currentIdx + 1;
        if (nextIdx >= this.tracks.length) nextIdx = 0; // loop back to first
        this.selectAndPlayTrack(this.tracks[nextIdx].id);
    }

    // Plays the previous track in the list
    playPrev() {
        if (!this.currentTrack || this.tracks.length === 0) return;
        const currentIdx = this.tracks.findIndex(t => t.id === this.currentTrack.id);
        let prevIdx = currentIdx - 1;
        if (prevIdx < 0) prevIdx = this.tracks.length - 1; // loop back to last
        this.selectAndPlayTrack(this.tracks[prevIdx].id);
    }

    // Synchronize play icons across cards, list items, and player bar
    updatePlaybackUI() {
        // 1. Update the bottom player button SVG
        if (this.playIcon) {
            if (this.isPlaying) {
                // Set to Pause icon
                this.playIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
            } else {
                // Set to Play icon
                this.playIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
            }
        }

        // 2. Update all card overlays and playlist items
        const allTrackContainers = document.querySelectorAll('.music-card, .playlist-item');
        allTrackContainers.forEach(container => {
            const containerId = container.getAttribute('data-id');
            const playBtn = container.querySelector('.circle-play-btn');
            
            if (this.currentTrack && containerId === this.currentTrack.id && this.isPlaying) {
                container.classList.add('playing');
                if (playBtn) {
                    playBtn.classList.add('playing');
                    playBtn.setAttribute('aria-label', `Pause ${this.currentTrack.title}`);
                    // Change play button inner icon to pause
                    const svg = playBtn.querySelector('svg');
                    if (svg) svg.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
                }
            } else {
                container.classList.remove('playing');
                if (playBtn) {
                    playBtn.classList.remove('playing');
                    const title = container.getAttribute('data-title');
                    playBtn.setAttribute('aria-label', `Play ${title}`);
                    const svg = playBtn.querySelector('svg');
                    if (svg) svg.innerHTML = `<path d="M8 5v14l11-7z"/>`;
                }
            }
        });

        // 3. Update bottom bar favorite button indicator
        if (this.currentTrack && this.playerFavBtn) {
            if (this.favorites.includes(this.currentTrack.id)) {
                this.playerFavBtn.classList.add('active');
            } else {
                this.playerFavBtn.classList.remove('active');
            }
        }
    }

    // Toggle track favorite status
    toggleFavorite(id) {
        const index = this.favorites.indexOf(id);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(id);
        }
        
        // Save to local storage
        localStorage.setItem('melodix_favorites', JSON.stringify(this.favorites));
        
        this.syncFavoritesUI();
        this.updatePlaybackUI();
        
        // If showing favorites filter page, trigger re-filtering
        if (this.activeFilter === 'favorites') {
            this.filterTracks();
        }
        
        // Dispatch custom global event (so other parts of code can show toasts)
        const isFav = this.favorites.includes(id);
        const track = this.tracks.find(t => t.id === id);
        const detail = { id, isFavorite: isFav, title: track ? track.title : "Track" };
        document.dispatchEvent(new CustomEvent('trackFavoriteToggled', { detail }));
    }

    // Sync heart shapes on cards with favorite list
    syncFavoritesUI() {
        const cards = document.querySelectorAll('.music-card');
        cards.forEach(card => {
            const id = card.getAttribute('data-id');
            const favBtn = card.querySelector('.card-fav-trigger');
            if (favBtn) {
                if (this.favorites.includes(id)) {
                    favBtn.classList.add('active');
                    favBtn.setAttribute('aria-label', 'Remove from Favorites');
                } else {
                    favBtn.classList.remove('active');
                    favBtn.setAttribute('aria-label', 'Add to Favorites');
                }
            }
        });
    }

    // Filter tracks dynamically on Music Library page
    filterTracks() {
        // If not on music library page, exit
        if (!this.cardGrid) return;

        const cards = this.cardGrid.querySelectorAll('.music-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const id = card.getAttribute('data-id');
            const artist = card.getAttribute('data-artist');
            const title = card.getAttribute('data-title').toLowerCase();
            const artistLower = artist.toLowerCase();

            // Match artist filter
            let matchFilter = false;
            if (this.activeFilter === 'all') {
                matchFilter = true;
            } else if (this.activeFilter === 'favorites') {
                matchFilter = this.favorites.includes(id);
            } else {
                matchFilter = (artist === this.activeFilter);
            }

            // Match search query
            const matchSearch = title.includes(this.searchQuery) || artistLower.includes(this.searchQuery);

            if (matchFilter && matchSearch) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Toggle "No tracks found" alert
        if (this.noTracksAlert) {
            if (visibleCount === 0) {
                this.noTracksAlert.style.display = 'block';
            } else {
                this.noTracksAlert.style.display = 'none';
            }
        }
    }

    // Helper: format raw seconds into mm:ss
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

// Instantiate player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.melodixPlayer = new MelodixPlayer();
});
