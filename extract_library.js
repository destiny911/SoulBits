/**
 * Suno Library Extractor
 *
 * Extracts all songs from your Suno.com library with:
 * - Clean title
 * - Song URL
 * - Model version (v4, v4.5+, etc.)
 *
 * Usage:
 * 1. Log into Suno.com and go to your Library page
 * 2. Open browser console (F12)
 * 3. Paste this entire script and press Enter
 * 4. Click through all pagination pages (script will capture as you go)
 * 5. When done, type: downloadCaptured()
 * 6. JSON file downloads automatically
 */

(function captureAllPages() {
    console.log('🎵 Suno Library Extractor - Starting...');

    const allSongs = [];
    const seenIds = new Set();

    // STEP 1: Capture songs already visible on current page
    console.log('📄 Capturing current page...');
    const currentRows = document.querySelectorAll('[data-testid="song-row"]');
    currentRows.forEach(row => {
        const link = row.querySelector('a[href*="/song/"]');
        if (!link) return;

        const id = link.href.split('/song/')[1];
        if (seenIds.has(id)) return;
        seenIds.add(id);

        // Clean up title
        let title = link.textContent.trim()
            .replace(/^\d+:\d+/, '')                      // Remove duration
            .replace(/\s*\(Cover\)\s*/gi, '')             // Remove (Cover)
            .replace(/\s*v\d+\s*$/i, '')                  // Remove version at end
            .replace(/\s*(Publish|Edit|Delete|\d+)\s*$/gi, '') // Remove buttons
            .replace(/\s+/g, ' ')                         // Collapse whitespace
            .trim();

        // Extract version
        const versionMatch = row.textContent.match(/\bv(\d+(\.\d+)?(\+)?)\b/i);

        allSongs.push({
            title: title,
            url: link.href,
            version: versionMatch ? versionMatch[0] : null
        });
    });

    console.log(`✅ Page 1: ${allSongs.length} songs captured`);

    // STEP 2: Intercept API calls to capture songs from other pages
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await originalFetch.apply(this, args);
        const clone = response.clone();

        const urlArg = args[0];
        const urlString = typeof urlArg === 'string' ? urlArg : urlArg?.url || '';

        if (urlString.includes && urlString.includes('feed/v2')) {
            try {
                const data = await clone.json();

                if (data.clips && data.clips.length > 0) {
                    let newCount = 0;
                    data.clips.forEach(clip => {
                        if (!seenIds.has(clip.id)) {
                            seenIds.add(clip.id);

                            const version = clip.metadata?.model_badges?.songrow?.display_name ||
                                           clip.major_model_version ||
                                           null;

                            allSongs.push({
                                title: clip.title,
                                url: `https://suno.com/song/${clip.id}`,
                                version: version
                            });
                            newCount++;
                        }
                    });

                    console.log(`📄 Page captured: +${newCount} new songs (total: ${allSongs.length})`);
                }
            } catch (e) {
                // Not JSON or parsing error, ignore
            }
        }

        return response;
    };

    console.log('✅ Capture active! Now click through all pages.');
    console.log('💡 When finished, type: downloadCaptured()');

    // STEP 3: Download function
    window.downloadCaptured = function() {
        console.log(`\n📥 Downloading ${allSongs.length} songs...`);

        const json = JSON.stringify(allSongs, null, 2);
        const blob = new Blob([json], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `suno_library_${allSongs.length}_songs.json`;
        a.click();

        console.log('✅ Downloaded!');
        console.log('\nSample (first 2 songs):');
        console.log(JSON.stringify(allSongs.slice(0, 2), null, 2));

        // Cleanup
        window.fetch = originalFetch;
        console.log('\n🧹 Cleaned up - script is now inactive');
    };
})();
