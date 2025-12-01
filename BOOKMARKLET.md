# Suno Library Extractor - Bookmarklet

## Quick Method: Bookmarklet

Save this as a browser bookmark to extract your library with one click:

```javascript
javascript:(function(){fetch('https://raw.githubusercontent.com/destiny911/SoulBits/main/extract_library.js').then(r=>r.text()).then(eval);})();
```

### How to install:
1. Create a new bookmark in your browser
2. Name it "Extract Suno Library"
3. Paste the code above as the URL
4. Save it

### How to use:
1. Log into Suno.com
2. Go to your Library page
3. Click the "Extract Suno Library" bookmark
4. Wait for it to scroll and extract
5. JSON file downloads automatically

---

## Alternative: Console Method

If you prefer not to use a bookmark:

1. Log into Suno.com and go to your Library
2. Press **F12** (or Ctrl+Shift+J / Cmd+Option+J on Mac) to open console
3. Copy the entire contents of `extract_library.js`
4. Paste into console and press Enter
5. JSON file downloads automatically

---

## What You Get

A JSON file with all your songs:

```json
[
  {
    "index": 1,
    "title": "My Song Title",
    "description": "Song description or lyrics",
    "date": "2024-01-01",
    "duration": "3:45",
    "audio_url": "https://...",
    "image_url": "https://...",
    "url": "https://suno.com/song/...",
    "tags": ["tag1", "tag2"]
  }
]
```

The script:
- Automatically scrolls to load ALL songs (handles lazy loading)
- Extracts title, description, date, duration, URLs, etc.
- Downloads as timestamped JSON file
- Also copies to clipboard
