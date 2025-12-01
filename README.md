# SoulBits

Extract a complete list of all songs from your Suno.com library with clean titles, URLs, and version info.

## How to Use

**Step 1: Open Your Library**
- Log into [Suno.com](https://suno.com)
- Navigate to your Library page

**Step 2: Open Browser Console**
- Press **F12** (or **Ctrl+Shift+J** / **Cmd+Option+J** on Mac)
- Click the **"Console"** tab

**Step 3: Run the Script**
- Copy the entire contents of `extract_library.js`
- Paste into the console
- Press **Enter**

**Step 4: Click Through Pages**
- The script will capture page 1 automatically
- Manually click through pages 2, 3, 4... to the last page
- The console will show progress as you go:
  ```
  ✅ Page 1: 40 songs captured
  📄 Page captured: +40 new songs (total: 80)
  📄 Page captured: +40 new songs (total: 120)
  ...
  ```

**Step 5: Download**
- When you've clicked through all pages, type in the console:
  ```javascript
  downloadCaptured()
  ```
- Press **Enter**
- A JSON file will download with all your songs!

## Output Format

You'll get a clean JSON file with:

```json
[
  {
    "title": "Song Title",
    "url": "https://suno.com/song/...",
    "version": "v4.5+"
  },
  {
    "title": "Another Song",
    "url": "https://suno.com/song/...",
    "version": "v4"
  }
]
```

## Notes

- Works with any number of songs (tested with 450+)
- Version indicates which Suno model was used (v4, v4.5+, etc.)
- Titles are automatically cleaned (removes duration, buttons, etc.)
- No installation required - runs entirely in your browser
- Safe - only reads data you already have access to

## Troubleshooting

**Pages not changing?**
- Make sure you paste the script **before** clicking pagination
- Reload the page and start over if needed

**Missing songs?**
- Make sure you clicked through **all** pages
- Check the console for the total count before downloading

**Script not working?**
- Make sure you're on the Library page (not Songs/Playlists/etc.)
- Try in a different browser (Chrome/Firefox/Edge)
