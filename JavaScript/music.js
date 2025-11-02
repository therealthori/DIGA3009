// SoundCloud Configuration
// IMPORTANT: Replace with your own SoundCloud playlist or tracks
const SOUNDCLOUD_PLAYLIST_URL = 'https://soundcloud.com/thoriso-shomang-977191300/sets/worship?si=f467d1849738423192900493c0657925&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing';

// Timer Variables
let timerInterval = null;
let remainingTime = 0;
let isTimerRunning = false;

// Music Player Variables
let widget = null;
let currentTrackIndex = 0;
let playlist = [];
let isPlaying = false;
let duration = 0;
let currentTime = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeSoundCloud();
    initializeTimer();
    initializeAnimations();
});

// Initialize SoundCloud Widget
function initializeSoundCloud() {
    // Create invisible iframe for SoundCloud widget
    const iframe = document.createElement('iframe');
    iframe.id = 'soundcloud-player';
    iframe.width = '0';
    iframe.height = '0';
    iframe.scrolling = 'no';
    iframe.frameborder = 'no';
    iframe.allow = 'autoplay';
    iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(SOUNDCLOUD_PLAYLIST_URL)}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
    
    document.body.appendChild(iframe);

    // Initialize SoundCloud Widget API
    widget = SC.Widget('soundcloud-player');

    // Wait for widget to be ready
    widget.bind(SC.Widget.Events.READY, () => {
        console.log('SoundCloud widget ready');
        
        // Get playlist information
        widget.getSounds((sounds) => {
            playlist = sounds;
            populatePlaylist(sounds);
            
            // Load first track
            if (sounds.length > 0) {
                loadTrack(0);
            }
        });

        // Bind events
        widget.bind(SC.Widget.Events.PLAY, onPlay);
        widget.bind(SC.Widget.Events.PAUSE, onPause);
        widget.bind(SC.Widget.Events.FINISH, onFinish);
        widget.bind(SC.Widget.Events.PLAY_PROGRESS, onPlayProgress);
    });
}

// Load track
function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    currentTrackIndex = index;
    const track = playlist[index];
    
    // Update UI
    document.getElementById('trackTitle').textContent = track.title;
    document.getElementById('artistName').textContent = track.user.username;
    
    // Update album art
    const albumImage = document.getElementById('albumImage');
    albumImage.src = track.artwork_url || track.user.avatar_url;
    
    // Update duration
    duration = track.duration / 1000; // Convert to seconds
    document.getElementById('duration').textContent = formatTime(duration);
    
    // Highlight active track in playlist
    updatePlaylistUI();
    
    // Skip to track
    widget.skip(index);
}

// Populate playlist UI
function populatePlaylist(sounds) {
    const playlistItems = document.getElementById('playlistItems');
    playlistItems.innerHTML = '';
    
    sounds.forEach((sound, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.innerHTML = `
            <div class="playlist-item-info">
                <h4>${sound.title}</h4>
                <p>${sound.user.username}</p>
            </div>
            <span>${formatTime(sound.duration / 1000)}</span>
        `;
        
        item.addEventListener('click', () => {
            loadTrack(index);
            widget.play();
        });
        
        playlistItems.appendChild(item);
    });
}

// Update playlist UI highlighting
function updatePlaylistUI() {
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        if (index === currentTrackIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Player Controls
document.getElementById('playPauseBtn').addEventListener('click', () => {
    widget.isPaused((paused) => {
        if (paused) {
            widget.play();
        } else {
            widget.pause();
        }
    });
});

document.getElementById('prevBtn').addEventListener('click', () => {
    const newIndex = currentTrackIndex - 1;
    if (newIndex >= 0) {
        loadTrack(newIndex);
        widget.play();
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    const newIndex = currentTrackIndex + 1;
    if (newIndex < playlist.length) {
        loadTrack(newIndex);
        widget.play();
    }
});

// Progress bar click
document.getElementById('progressBar').addEventListener('click', (e) => {
    const progressBar = e.currentTarget;
    const clickX = e.offsetX;
    const width = progressBar.offsetWidth;
    const percentage = (clickX / width);
    const seekTime = duration * percentage * 1000; // Convert to milliseconds
    
    widget.seekTo(seekTime);
});

// Widget Events
function onPlay() {
    isPlaying = true;
    document.getElementById('playIcon').style.display = 'none';
    document.getElementById('pauseIcon').style.display = 'block';
}

function onPause() {
    isPlaying = false;
    document.getElementById('playIcon').style.display = 'block';
    document.getElementById('pauseIcon').style.display = 'none';
}

function onFinish() {
    // Auto play next track
    const newIndex = currentTrackIndex + 1;
    if (newIndex < playlist.length) {
        loadTrack(newIndex);
        widget.play();
    }
}

function onPlayProgress(data) {
    currentTime = data.currentPosition / 1000; // Convert to seconds
    const totalDuration = data.duration / 1000;
    
    // Update progress bar
    const percentage = (data.currentPosition / data.duration) * 100;
    document.getElementById('progressFill').style.width = `${percentage}%`;
    
    // Update current time display
    document.getElementById('currentTime').textContent = formatTime(currentTime);
}

// Timer Functions
function initializeTimer() {
    const setTimeBtn = document.getElementById('setTimeBtn');
    const modal = document.getElementById('timerModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmBtn = document.getElementById('confirmBtn');

    setTimeBtn.addEventListener('click', () => {
        modal.classList.add('active');
        gsap.from('.modal-content', {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: 'back.out(1.7)'
        });
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    confirmBtn.addEventListener('click', () => {
        const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
        const seconds = parseInt(document.getElementById('secondsInput').value) || 0;
        
        remainingTime = (minutes * 60) + seconds;
        updateTimerDisplay();
        startTimer();
        
        modal.classList.remove('active');
    });

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

function startTimer() {
    if (isTimerRunning) {
        clearInterval(timerInterval);
    }

    isTimerRunning = true;
    
    timerInterval = setInterval(() => {
        remainingTime--;
        
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            remainingTime = 0;
            timerComplete();
        }
        
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

function timerComplete() {
    // Animate timer completion
    gsap.to('.timer-display', {
        scale: 1.1,
        duration: 0.3,
        yoyo: true,
        repeat: 3,
        ease: 'power2.inOut'
    });
    
    // Optional: Pause music when timer completes
    widget.pause();
    
    alert('Prayer time complete!');
}

// Utility Functions
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

// GSAP Animations
function initializeAnimations() {
    // Animate header
    gsap.from('.prayer-title', {
        duration: 1,
        y: -50,
        opacity: 0,
        ease: 'power3.out'
    });

    gsap.from('.prayer-subtitle', {
        duration: 1,
        y: -30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.2
    });

    // Animate timer
    gsap.from('.timer-section', {
        duration: 1,
        scale: 0.8,
        opacity: 0,
        ease: 'back.out(1.7)',
        delay: 0.4
    });

    // Animate player card
    gsap.from('.player-card', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.6
    });

    // Animate playlist
    gsap.from('.playlist', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.8
    });
}