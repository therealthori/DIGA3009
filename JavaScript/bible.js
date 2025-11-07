const CONFIG = {
    BIBLE_API_URL: 'https://bible-api.com'
};

// Verse database with book codes for API
const popularVerses = [
    { reference: 'John 3:16', apiRef: 'John 3:16', theme: 'love' },
    { reference: 'Philippians 4:13', apiRef: 'Philippians 4:13', theme: 'strength' },
    { reference: 'Psalm 23:1', apiRef: 'Psalms 23:1', theme: 'peace' },
    { reference: 'Romans 8:28', apiRef: 'Romans 8:28', theme: 'purpose' },
    { reference: 'Proverbs 3:5-6', apiRef: 'Proverbs 3:5-6', theme: 'faith' },
    { reference: 'Isaiah 41:10', apiRef: 'Isaiah 41:10', theme: 'strength' },
    { reference: 'Jeremiah 29:11', apiRef: 'Jeremiah 29:11', theme: 'hope' },
    { reference: 'Matthew 6:33', apiRef: 'Matthew 6:33', theme: 'purpose' },
    { reference: 'Psalm 46:1', apiRef: 'Psalms 46:1', theme: 'strength' },
    { reference: 'Joshua 1:9', apiRef: 'Joshua 1:9', theme: 'strength' },
    { reference: '2 Timothy 1:7', apiRef: '2 Timothy 1:7', theme: 'strength' },
    { reference: 'Romans 12:2', apiRef: 'Romans 12:2', theme: 'faith' },
    { reference: '1 Corinthians 13:4-5', apiRef: '1 Corinthians 13:4-5', theme: 'love' },
    { reference: 'Galatians 5:22-23', apiRef: 'Galatians 5:22-23', theme: 'faith' },
    { reference: 'Ephesians 2:8-9', apiRef: 'Ephesians 2:8-9', theme: 'faith' },
    { reference: 'Psalm 119:105', apiRef: 'Psalms 119:105', theme: 'faith' },
    { reference: 'Matthew 11:28', apiRef: 'Matthew 11:28', theme: 'peace' },
    { reference: 'James 1:2-3', apiRef: 'James 1:2-3', theme: 'faith' },
    { reference: 'Colossians 3:23', apiRef: 'Colossians 3:23', theme: 'purpose' },
    { reference: 'Hebrews 11:1', apiRef: 'Hebrews 11:1', theme: 'faith' },
    { reference: 'Psalm 27:1', apiRef: 'Psalms 27:1', theme: 'strength' },
    { reference: 'Matthew 28:20', apiRef: 'Matthew 28:20', theme: 'peace' },
    { reference: '1 Peter 5:7', apiRef: '1 Peter 5:7', theme: 'peace' },
    { reference: 'Proverbs 16:3', apiRef: 'Proverbs 16:3', theme: 'purpose' },
    { reference: 'Isaiah 40:31', apiRef: 'Isaiah 40:31', theme: 'strength' }
];

// Commentary templates
const commentaryThemes = {
    love: [
        "God's love is unconditional and everlasting. Today, reflect on how His love has transformed your life and share that love with others around you.",
        "In this verse, we see the depth of God's love for humanity. His love never fails, never gives up, and is always patient with us through every season of life."
    ],
    faith: [
        "Faith is trusting God even when we cannot see the path ahead. This verse reminds us that our faith should be rooted firmly in God's unchanging promises.",
        "Walking by faith means surrendering control and trusting that God's plan is perfect, even when we face uncertainty and challenges in our daily lives."
    ],
    hope: [
        "Hope is the anchor of our soul in turbulent times. In times of trouble, God's promises give us assurance that better days are ahead and He is working all things for our good.",
        "This verse teaches us that our hope is not wishful thinking, but a confident expectation based on God's faithfulness throughout generations."
    ],
    strength: [
        "When we are weak, God is strong. This verse reminds us that we can face any challenge with His power working in us and through us.",
        "God's strength is made perfect in our weakness. Today, lean on Him for the courage, endurance, and power you need to overcome obstacles."
    ],
    peace: [
        "God's peace surpasses all understanding and logic. In the midst of chaos and uncertainty, He offers a calm that the world cannot give or take away.",
        "This verse invites us to find rest in God's presence. His peace guards our hearts and minds from anxiety, fear, and worry about tomorrow."
    ],
    purpose: [
        "God has a unique plan and purpose for your life. Trust that He is working all things together for your good, even when you can't see the full picture.",
        "Every moment of your life has divine meaning in God's grand design. Walk confidently knowing He directs your steps and orders your path."
    ]
};

let currentVerse = null;
let savedDevotions = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDevotionPage();
    setupEventListeners();
    loadTodaysVerse();
    loadSavedDevotions();
});

function initializeDevotionPage() {
    // Animate page elements
    gsap.from('.devotion-title', {
        duration: 1,
        y: -50,
        opacity: 0,
        ease: 'power3.out'
    });

    gsap.from('.devotion-subtitle', {
        duration: 1,
        y: -30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.2
    });

    gsap.from('.generate-btn', {
        duration: 1,
        scale: 0.8,
        opacity: 0,
        ease: 'back.out(1.7)',
        delay: 0.4
    });

    gsap.from('.verse-card', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.6
    });

    gsap.from('.commentary-section', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.8
    });

    gsap.from('.action-buttons', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power3.out',
        delay: 1
    });
}

function setupEventListeners() {
    const generateBtn = document.getElementById('generateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    if (generateBtn) generateBtn.addEventListener('click', generateNewDevotion);
    if (saveBtn) saveBtn.addEventListener('click', saveCurrentDevotion);
    if (shareBtn) shareBtn.addEventListener('click', shareDevotion);
}

function loadSavedDevotions() {
    try {
        const saved = localStorage.getItem('savedDevotions');
        if (saved) {
            savedDevotions = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading saved devotions:', error);
        savedDevotions = [];
    }
}

// Load today's verse on page load
function loadTodaysVerse() {
    const today = new Date().toDateString();
    const cachedVerse = localStorage.getItem('todaysVerse');
    const cachedDate = localStorage.getItem('verseDate');

    if (cachedVerse && cachedDate === today) {
        try {
            const verse = JSON.parse(cachedVerse);
            displayVerse(verse);
        } catch (error) {
            console.error('Error loading cached verse:', error);
            generateNewDevotion();
        }
    }
}

// Fetch verse from bible-api.com
async function fetchVerseFromAPI(verseData) {
    try {
        const url = `${CONFIG.BIBLE_API_URL}/${encodeURIComponent(verseData.apiRef)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.text) {
            // Clean the text - remove verse numbers and extra formatting
            let cleanText = data.text.trim();
            
            // If it's a range of verses, format nicely
            if (data.verses && data.verses.length > 0) {
                cleanText = data.verses.map(v => v.text).join(' ');
            }
            
            // Remove extra whitespace
            cleanText = cleanText.replace(/\s+/g, ' ').trim();
            
            return {
                reference: verseData.reference,
                text: cleanText,
                theme: verseData.theme
            };
        }
        
        throw new Error('No verse text returned');
        
    } catch (error) {
        console.error('Bible API Error:', error);
        throw error;
    }
}

// Generate new devotion
async function generateNewDevotion() {
    const btn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const loader = document.getElementById('loader');
    
    if (!btn) return;
    
    btn.classList.add('loading');
    btn.disabled = true;

    try {
        // Get random verse from database
        const randomVerse = popularVerses[Math.floor(Math.random() * popularVerses.length)];
        
        // Fetch from API
        const verseData = await fetchVerseFromAPI(randomVerse);
        
        // Display verse and commentary
        displayVerse(verseData);
        
        // Cache for today
        const today = new Date().toDateString();
        localStorage.setItem('todaysVerse', JSON.stringify(verseData));
        localStorage.setItem('verseDate', today);
        
        // Animate new content
        animateContentChange();
        
        showToast('New devotion loaded!');
        
    } catch (error) {
        console.error('Error generating devotion:', error);
        showToast('Error loading verse. Please try again.');
    } finally {
        if (btn) {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }
}

// Display verse and generate commentary
function displayVerse(verseData) {
    currentVerse = verseData;
    
    const verseRefElement = document.getElementById('verseReference');
    const verseTextElement = document.getElementById('verseText');
    const commentaryElement = document.getElementById('commentaryContent');
    
    if (!verseRefElement || !verseTextElement || !commentaryElement) {
        console.error('Required elements not found');
        return;
    }
    
    // Update verse reference and text
    verseRefElement.textContent = verseData.reference;
    verseTextElement.textContent = verseData.text;
    
    // Generate and display commentary
    const commentary = generateCommentary(verseData);
    commentaryElement.innerHTML = commentary;
}

// Generate contextual commentary
function generateCommentary(verseData) {
    const theme = verseData.theme || 'faith';
    const themeCommentaries = commentaryThemes[theme] || commentaryThemes.faith;
    const selectedCommentary = themeCommentaries[Math.floor(Math.random() * themeCommentaries.length)];
    
    const commentary = `
        <p>${selectedCommentary}</p>
        <p>As you meditate on this verse today, consider how God is speaking directly to your current situation. His word is alive and active, ready to transform your heart and renew your mind with truth.</p>
        <p>Take a moment to pray and ask God to reveal the deeper meaning of this scripture in your life. Write down any insights, promises, or applications that come to mind as you reflect on His word.</p>
    `;
    
    return commentary;
}

// Animate content change
function animateContentChange() {
    const verseContent = document.querySelector('.verse-content');
    const commentary = document.getElementById('commentaryContent');
    
    if (verseContent) {
        gsap.from(verseContent, {
            duration: 0.6,
            x: -30,
            opacity: 0,
            ease: 'power2.out'
        });
    }

    if (commentary) {
        gsap.from(commentary, {
            duration: 0.6,
            y: 20,
            opacity: 0,
            ease: 'power2.out',
            delay: 0.2
        });
    }
}

// Save current devotion
function saveCurrentDevotion() {
    if (!currentVerse) {
        showToast('No devotion to save');
        return;
    }

    const devotion = {
        id: Date.now(),
        date: new Date().toISOString(),
        dateString: new Date().toLocaleDateString(),
        verse: currentVerse,
        commentary: document.getElementById('commentaryContent')?.innerHTML || ''
    };

    savedDevotions.unshift(devotion);
    
    // Keep only last 30 devotions
    if (savedDevotions.length > 30) {
        savedDevotions = savedDevotions.slice(0, 30);
    }
    
    try {
        localStorage.setItem('savedDevotions', JSON.stringify(savedDevotions));
        showToast('Saved to your devotions!');
    } catch (error) {
        console.error('Error saving devotion:', error);
        showToast('Error saving devotion');
    }
    
    // Animate save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        gsap.to(saveBtn, {
            scale: 0.9,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });
    }
}

// Share devotion
function shareDevotion() {
    if (!currentVerse) {
        showToast('No devotion to share');
        return;
    }

    const shareText = `${currentVerse.reference}\n\n"${currentVerse.text}"\n\n- SELAH Daily Devotion`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Daily Devotion',
            text: shareText
        }).then(() => {
            showToast('Shared successfully!');
        }).catch(err => {
            if (err.name !== 'AbortError') {
                copyToClipboard(shareText);
            }
        });
    } else {
        copyToClipboard(shareText);
    }
    
    // Animate share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        gsap.to(shareBtn, {
            scale: 0.9,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy text:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('Copied to clipboard!');
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showToast('Could not copy to clipboard');
    }
    
    document.body.removeChild(textArea);
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) {
        console.log(message);
        return;
    }
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}