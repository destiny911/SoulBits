/**
 * Suno Library Extractor - Browser Console Script
 *
 * USAGE:
 * 1. Log into Suno.com
 * 2. Go to your Library page
 * 3. Open browser console (F12 or Ctrl+Shift+J)
 * 4. Paste this entire script and press Enter
 * 5. Wait for it to scroll and extract all songs
 * 6. A JSON file will download automatically
 */

(async function extractSunoLibrary() {
    console.log('🎵 Starting Suno library extraction...');

    // Scroll to load all lazy-loaded content
    console.log('📜 Scrolling to load all songs...');
    let previousHeight = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 50;

    while (scrollAttempts < maxScrollAttempts) {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const currentHeight = document.body.scrollHeight;
        if (currentHeight === previousHeight) {
            console.log('✓ Reached end of content');
            break;
        }
        previousHeight = currentHeight;
        scrollAttempts++;
    }

    // Scroll back to top
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('🔍 Extracting song data...');

    // Try multiple selectors to find song elements
    const songs = [];

    // Try to find song cards/items (adjust selectors as needed)
    const possibleSelectors = [
        '[data-testid*="song"]',
        '[data-testid*="track"]',
        '.song-card',
        '.track-item',
        'article',
        '[class*="SongCard"]',
        '[class*="TrackItem"]',
    ];

    let songElements = [];
    for (const selector of possibleSelectors) {
        songElements = document.querySelectorAll(selector);
        if (songElements.length > 0) {
            console.log(`✓ Found ${songElements.length} elements using selector: ${selector}`);
            break;
        }
    }

    if (songElements.length === 0) {
        console.error('❌ Could not find song elements. The page structure may have changed.');
        console.log('💡 Trying alternative extraction method...');

        // Alternative: try to extract from any visible text that looks like songs
        songElements = document.querySelectorAll('h1, h2, h3, h4, .title, [class*="title"], [class*="Title"]');
    }

    songElements.forEach((el, index) => {
        try {
            const song = {
                index: index + 1,
            };

            // Extract title
            const titleEl = el.querySelector('h1, h2, h3, h4, .title, [class*="title"], [class*="Title"]') || el;
            if (titleEl) {
                song.title = titleEl.textContent.trim();
            }

            // Only add if we found a title
            if (!song.title || song.title.length === 0) {
                return;
            }

            // Extract description/lyrics
            const descEl = el.querySelector('.description, .lyrics, [class*="description"], [class*="Description"]');
            if (descEl) {
                song.description = descEl.textContent.trim();
            }

            // Extract date
            const dateEl = el.querySelector('time, .date, [class*="date"], [class*="Date"]');
            if (dateEl) {
                song.date = dateEl.textContent.trim() || dateEl.getAttribute('datetime');
            }

            // Extract duration
            const durationEl = el.querySelector('.duration, [class*="duration"], [class*="Duration"]');
            if (durationEl) {
                song.duration = durationEl.textContent.trim();
            }

            // Extract tags
            const tagEls = el.querySelectorAll('.tag, [class*="tag"], [class*="Tag"]');
            if (tagEls.length > 0) {
                song.tags = Array.from(tagEls).map(tag => tag.textContent.trim());
            }

            // Extract audio URL
            const audioEl = el.querySelector('audio, [src*=".mp3"], [src*=".wav"], [src*="audio"]');
            if (audioEl) {
                song.audio_url = audioEl.src || audioEl.getAttribute('src');
            }

            // Extract image/cover art
            const imgEl = el.querySelector('img');
            if (imgEl) {
                song.image_url = imgEl.src || imgEl.getAttribute('src');
            }

            // Extract any links
            const linkEl = el.querySelector('a[href]');
            if (linkEl) {
                song.url = linkEl.href;
            }

            // Get all data attributes (might contain useful info)
            if (el.dataset) {
                Object.keys(el.dataset).forEach(key => {
                    if (!song[key]) {
                        song[key] = el.dataset[key];
                    }
                });
            }

            songs.push(song);
        } catch (err) {
            console.warn(`Warning: Error processing element ${index}:`, err);
        }
    });

    console.log(`✓ Extracted ${songs.length} songs`);

    if (songs.length === 0) {
        console.error('❌ No songs found! Please check the page structure.');
        console.log('💡 You may need to adjust the selectors in the script.');
        return;
    }

    // Show sample
    console.log('\n📋 Sample (first song):');
    console.log(JSON.stringify(songs[0], null, 2));

    // Download as JSON
    const dataStr = JSON.stringify(songs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `suno_library_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log(`\n✅ Success! Downloaded ${songs.length} songs to JSON file`);

    // Also copy to clipboard
    try {
        await navigator.clipboard.writeText(dataStr);
        console.log('📋 Also copied to clipboard!');
    } catch (err) {
        console.log('💡 Could not copy to clipboard, but file was downloaded');
    }

    return songs;
})();
