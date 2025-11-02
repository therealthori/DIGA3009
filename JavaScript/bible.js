// API Configuration
// Using Bible API for verse retrieval
const BIBLE_API_KEY = 'Y1JmDWJF22OTcc5bzn2u_H'; // Get from https://scripture.api.bible/
const BIBLE_API_URL = 'https://api.scripture.api.bible/v1';
const BIBLE_ID = 'de4e12af7f28f599-02'; 

// Verse pool for random selection
const popularVerses = [
    { reference: 'John 3:16', book: 'John', chapter: 3, verse: 16 },
    { reference: 'Philippians 4:13', book: 'Philippians', chapter: 4, verse: 13 },
    { reference: 'Psalm 23:1', book: 'Psalms', chapter: 23, verse: 1 },
    { reference: 'Romans 8:28', book: 'Romans', chapter: 8, verse: 28 },
    { reference: 'Proverbs 3:5-6', book: 'Proverbs', chapter: 3, verse: '5-6' },
    { reference: 'Isaiah 41:10', book: 'Isaiah', chapter: 41, verse: 10 },
    { reference: 'Jeremiah 29:11', book: 'Jeremiah', chapter: 29, verse: 11 },
    { reference: 'Matthew 6:33', book: 'Matthew', chapter: 6, verse: 33 },
    { reference: 'Psalm 46:1', book: 'Psalms', chapter: 46, verse: 1 },
    { reference: 'Joshua 1:9', book: 'Joshua', chapter: 1, verse: 9 },
    { reference: '2 Timothy 1:7', book: '2Timothy', chapter: 1, verse: 7 },
    { reference: 'Romans 12:2', book: 'Romans', chapter: 12, verse: 2 },
    { reference: '1 Corinthians 13:4-5', book: '1Corinthians', chapter: 13, verse: '4-5' },
    { reference: 'Galatians 5:22-23', book: 'Galatians', chapter: 5, verse: '22-23' },
    { reference: 'Ephesians 2:8-9', book: 'Ephesians', chapter: 2, verse: '8-9' }
];

// Commentary templates for different themes
const commentaryThemes = {
    love: [
        "God's love is unconditional and everlasting. Today, reflect on how His love has transformed your life and share that love with others.",
        "In this verse, we see the depth of God's love for humanity. His love never fails, never gives up, and is always patient with us."
    ],
    faith: [
        "Faith is trusting God even when we cannot see the path ahead. This verse reminds us that our faith should be rooted in God's promises.",
        "Walking by faith means surrendering control and trusting that God's plan is perfect, even when we face uncertainty."
    ],
    hope: [
        "Hope is the anchor of our soul. In times of trouble, God's promises give us assurance that better days are ahead.",
        "This verse teaches us that our hope is not wishful thinking, but a confident expectation based on God's faithfulness."
    ],
    strength: [
        "When we are weak, God is strong. This verse reminds us that we can face any challenge with His power working in us.",
        "God's strength is made perfect in our weakness. Today, lean on Him for the courage and power you need."
    ],
    peace: [
        "God's peace surpasses all understanding. In the midst of chaos, He offers a calm that the world cannot give.",
        "This verse invites us to find rest in God's presence. His peace guards our hearts and minds from anxiety and fear."
    ],
    purpose: [
        "God has a plan and purpose for your life. Trust that He is working all things together for your good.",
        "Every moment of your life has meaning in God's grand design. Walk confidently knowing He directs your steps."
    ]
};

let currentVerse = null;
let savedDevotions = JSON.parse(localStorage.getItem('savedDevotions')) || [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDevotionPage();
    setupEventListeners();
    loadTodaysVerse();
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
    document.getElementById('generateBtn').addEventListener('click', generateNewDevotion);
    document.getElementById('saveBtn').addEventListener('click', saveCurrentDevotion);
    document.getElementById('shareBtn').addEventListener('click', shareDevotion);
}

// Load today's verse on page load
function loadTodaysVerse() {
    // Check if we already have a verse for today
    const today = new Date().toDateString();
    const cachedVerse = localStorage.getItem('todaysVerse');
    const cachedDate = localStorage.getItem('verseDate');

    if (cachedVerse && cachedDate === today) {
        const verse = JSON.parse(cachedVerse);
        displayVerse(verse);
    }
}

// Generate new devotion
async function generateNewDevotion() {
    const btn = document.getElementById('generateBtn');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
        // Select random verse
        const randomVerse = popularVerses[Math.floor(Math.random() * popularVerses.length)];
        
        // Fetch verse text
        const verseData = await fetchVerseFromAPI(randomVerse);
        
        // Display verse and commentary
        displayVerse(verseData);
        
        // Cache for today
        const today = new Date().toDateString();
        localStorage.setItem('todaysVerse', JSON.stringify(verseData));
        localStorage.setItem('verseDate', today);
        
        // Animate new content
        animateContentChange();
        
    } catch (error) {
        console.error('Error generating devotion:', error);
        showToast('Error loading verse. Please try again.');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// Fetch verse from Bible.org API (no key required)
async function fetchVerseFromAPI(verseData) {
    try {
        // Use Bible.org API - it doesn't require authentication
        const passage = `${verseData.book}+${verseData.chapter}:${verseData.verse}`;
        const response = await fetch(`${BIBLE_ORG_API}?passage=${passage}&type=json`);
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            return {
                reference: verseData.reference,
                text: data[0].text.trim(),
                book: verseData.book,
                chapter: verseData.chapter,
                verse: verseData.verse
            };
        } else {
            // Fallback to hardcoded verses
            return getFallbackVerse(verseData.reference);
        }
    } catch (error) {
        console.error('API Error:', error);
        // Return fallback verse
        return getFallbackVerse(verseData.reference);
    }
}

// Fallback verses in case API fails
function getFallbackVerse(reference) {
    const fallbackVerses = {
        'John 3:16': {
            reference: 'John 3:16',
            text: 'For God loved the world so much that he gave his only Son, so that everyone who believes in him may not die but have eternal life.',
            theme: 'love'
        },
        'Philippians 4:13': {
            reference: 'Philippians 4:13',
            text: 'I can do all things through Christ who strengthens me.',
            theme: 'strength'
        },
        'Psalm 23:1': {
            reference: 'Psalm 23:1',
            text: 'The Lord is my shepherd; I have everything I need.',
            theme: 'peace'
        },
        'Romans 8:28': {
            reference: 'Romans 8:28',
            text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
            theme: 'purpose'
        },
        'Jeremiah 29:11': {
            reference: 'Jeremiah 29:11',
            text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
            theme: 'hope'
        }
    };

    return fallbackVerses[reference] || fallbackVerses['John 3:16'];
}

// Display verse and generate commentary
function displayVerse(verseData) {
    currentVerse = verseData;
    
    // Update verse reference and text
    document.getElementById('verseReference').textContent = verseData.reference;
    document.getElementById('verseText').textContent = verseData.text;
    
    // Generate and display commentary
    const commentary = generateCommentary(verseData);
    document.getElementById('commentaryContent').innerHTML = commentary;
}

// Generate contextual commentary
function generateCommentary(verseData) {
    // Determine theme based on verse content
    const text = verseData.text.toLowerCase();
    let theme = 'faith'; // default
    
    if (text.includes('love')) theme = 'love';
    else if (text.includes('strength') || text.includes('strong')) theme = 'strength';
    else if (text.includes('peace') || text.includes('rest')) theme = 'peace';
    else if (text.includes('hope')) theme = 'hope';
    else if (text.includes('plan') || text.includes('purpose')) theme = 'purpose';
    
    const themeCommentaries = commentaryThemes[theme];
    const selectedCommentary = themeCommentaries[Math.floor(Math.random() * themeCommentaries.length)];
    
    // Create multi-paragraph commentary
    const commentary = `
        <p>${selectedCommentary}</p>
        <p>As you meditate on this verse today, consider how God is speaking to your current situation. His word is alive and active, ready to transform your heart and mind.</p>
        <p>Take a moment to pray and ask God to reveal the deeper meaning of this scripture in your life. Write down any insights or applications that come to mind.</p>
    `;
    
    return commentary;
}

// Animate content change
function animateContentChange() {
    gsap.from('.verse-content', {
        duration: 0.6,
        x: -30,
        opacity: 0,
        ease: 'power2.out'
    });

    gsap.from('#commentaryContent', {
        duration: 0.6,
        y: 20,
        opacity: 0,
        ease: 'power2.out',
        delay: 0.2
    });
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
        verse: currentVerse,
        commentary: document.getElementById('commentaryContent').innerHTML
    };

    savedDevotions.unshift(devotion);
    localStorage.setItem('savedDevotions', JSON.stringify(savedDevotions));
    
    showToast('Saved to your devotions!');
    
    // Animate save button
    gsap.to('#saveBtn', {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1
    });
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
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('Copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy text:', err);
            showToast('Could not copy to clipboard');
        });
    }
    
    // Animate share button
    gsap.to('#shareBtn', {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1
    });
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}