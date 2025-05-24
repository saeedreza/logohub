/**
 * Main entry point for the logo scraper experiment
 *
 * Usage:
 *   node index.js                    # Run tests on predefined URLs
 *   node index.js <url>             # Test a specific URL
 */

import { testScraper } from './logo-scraper.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('📋 No URL provided. Run tests with:');
    console.log('   npm test           # Test multiple sites');
    console.log('   npm start <url>    # Test specific URL');
    return;
  }

  const url = args[0];

  // Basic URL validation
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error(
      '❌ Please provide a valid URL starting with http:// or https://'
    );
    return;
  }

  await testScraper(url);
}

main().catch(console.error);
