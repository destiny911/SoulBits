# SoulBits

Extract a list of all songs from your Suno.com library.

## Easiest Way: Browser Console (Recommended)

**No installation needed!** Just run this while logged into Suno:

1. Log into Suno.com and go to your Library page
2. Press **F12** (or **Ctrl+Shift+J** / **Cmd+Option+J** on Mac)
3. Paste the contents of `extract_library.js` into the console
4. Press **Enter**
5. Wait for it to scroll and extract all songs
6. A JSON file will download automatically 🎉

See `BOOKMARKLET.md` for an even easier one-click bookmarklet method.

---

## What You Get

A JSON file with all your songs:
```json
[
  {
    "index": 1,
    "title": "My Song Title",
    "description": "Song description",
    "date": "2024-01-01",
    "duration": "3:45",
    "audio_url": "https://...",
    "image_url": "https://...",
    "url": "https://suno.com/song/...",
    "tags": ["tag1", "tag2"]
  }
]
```

---

## Alternative: Automated Method (Advanced)

If you need to run this automatically without manual login:

See `suno_library.py` for a Python/Playwright solution that:
- Logs in automatically
- Handles lazy loading
- Saves to JSON

Requires: `pip install -r requirements.txt && playwright install chromium`