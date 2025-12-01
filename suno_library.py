#!/usr/bin/env python3
"""
Suno.com Library Scraper
Logs into Suno.com and retrieves all songs from your library
"""

import os
import json
import asyncio
from playwright.async_api import async_playwright
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SunoScraper:
    def __init__(self, email=None, password=None):
        self.email = email or os.getenv('SUNO_EMAIL')
        self.password = password or os.getenv('SUNO_PASSWORD')

        if not self.email or not self.password:
            raise ValueError("Email and password must be provided via env vars or parameters")

    async def get_library(self, headless=True, output_file='suno_library.json'):
        """
        Log into Suno.com and retrieve all songs from library

        Args:
            headless: Run browser in headless mode (default: True)
            output_file: Path to save the library JSON (default: 'suno_library.json')

        Returns:
            List of songs from library
        """
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(headless=headless)
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080}
            )
            page = await context.new_page()

            try:
                print("Navigating to Suno.com...")
                await page.goto('https://suno.com', timeout=60000)

                # Wait for page to load
                await page.wait_for_load_state('networkidle')

                # Look for sign in button and click it
                print("Looking for sign in button...")
                await page.wait_for_selector('text=/sign in|log in/i', timeout=10000)
                await page.click('text=/sign in|log in/i')

                # Wait for login form
                await page.wait_for_timeout(2000)

                # Enter credentials
                print("Entering credentials...")
                await page.fill('input[type="email"]', self.email)
                await page.fill('input[type="password"]', self.password)

                # Submit login
                await page.click('button[type="submit"]')

                # Wait for navigation after login
                print("Logging in...")
                await page.wait_for_load_state('networkidle', timeout=30000)

                # Navigate to library/creations page
                print("Navigating to library...")
                # Try to find and click on library/creations link
                try:
                    await page.click('text=/library|my creations|my songs/i', timeout=5000)
                except:
                    # If direct navigation doesn't work, try URL
                    await page.goto('https://suno.com/library', timeout=60000)

                await page.wait_for_load_state('networkidle')
                await page.wait_for_timeout(3000)

                # Scroll to load all songs (lazy loading)
                print("Loading all songs...")
                await self._scroll_to_load_all(page)

                # Extract song data
                print("Extracting song data...")
                songs = await self._extract_songs(page)

                # Save to file
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(songs, f, indent=2, ensure_ascii=False)

                print(f"\n✓ Successfully retrieved {len(songs)} songs")
                print(f"✓ Saved to {output_file}")

                return songs

            finally:
                await browser.close()

    async def _scroll_to_load_all(self, page):
        """Scroll page to trigger lazy loading of all content"""
        previous_height = 0
        while True:
            # Scroll to bottom
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            await page.wait_for_timeout(2000)

            # Check if new content loaded
            current_height = await page.evaluate('document.body.scrollHeight')
            if current_height == previous_height:
                break
            previous_height = current_height

    async def _extract_songs(self, page):
        """Extract song data from the page"""
        # This selector will need to be adjusted based on Suno's actual HTML structure
        # We'll try to extract common song attributes
        songs = await page.evaluate('''() => {
            const songElements = document.querySelectorAll('[data-testid*="song"], .song-item, .track-item, article');
            const songs = [];

            songElements.forEach(el => {
                // Try to extract song information
                const titleEl = el.querySelector('h1, h2, h3, h4, .title, [class*="title"]');
                const title = titleEl ? titleEl.textContent.trim() : null;

                // Skip if no title found
                if (!title) return;

                const song = {
                    title: title,
                    element_html: el.outerHTML.substring(0, 500) // First 500 chars for debugging
                };

                // Try to extract other common fields
                const descEl = el.querySelector('.description, [class*="description"]');
                if (descEl) song.description = descEl.textContent.trim();

                const dateEl = el.querySelector('time, .date, [class*="date"]');
                if (dateEl) song.date = dateEl.textContent.trim() || dateEl.getAttribute('datetime');

                const durationEl = el.querySelector('.duration, [class*="duration"]');
                if (durationEl) song.duration = durationEl.textContent.trim();

                // Try to find audio/play button
                const audioEl = el.querySelector('audio, [src*=".mp3"], [src*=".wav"]');
                if (audioEl) song.audio_url = audioEl.src || audioEl.getAttribute('src');

                // Try to find image
                const imgEl = el.querySelector('img');
                if (imgEl) song.image_url = imgEl.src || imgEl.getAttribute('src');

                songs.push(song);
            });

            return songs;
        }''')

        return songs


async def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Scrape Suno.com library')
    parser.add_argument('--email', help='Suno account email (or set SUNO_EMAIL env var)')
    parser.add_argument('--password', help='Suno account password (or set SUNO_PASSWORD env var)')
    parser.add_argument('--output', default='suno_library.json', help='Output JSON file (default: suno_library.json)')
    parser.add_argument('--visible', action='store_true', help='Show browser window (not headless)')

    args = parser.parse_args()

    scraper = SunoScraper(email=args.email, password=args.password)
    songs = await scraper.get_library(
        headless=not args.visible,
        output_file=args.output
    )

    # Print summary
    print(f"\n📋 Library Summary:")
    print(f"   Total songs: {len(songs)}")
    if songs:
        print(f"\n   Sample (first song):")
        print(f"   {json.dumps(songs[0], indent=4)}")


if __name__ == '__main__':
    asyncio.run(main())
