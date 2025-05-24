/**
 * Test runner for the logo scraper
 *
 * Tests the scraper against a few different types of websites
 * to understand its effectiveness and limitations.
 */

import { testScraper } from './logo-scraper.js';

// Test URLs - starting with some well-known sites that should have clear logos
const testUrls = [
  'https://stripe.com',
  'https://github.com',
  'https://vercel.com',
  'https://linear.app',
  'https://figma.com',
];

/**
 * Run tests on multiple URLs
 */
async function runTests() {
  console.log('🚀 Starting logo scraper tests...\n');

  for (const url of testUrls) {
    try {
      await testScraper(url);
      console.log('\n' + '='.repeat(50));
    } catch (error) {
      console.error(`❌ Failed to test ${url}:`, error.message);
    }

    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ All tests completed!');
}

// Run if this file is executed directly
if (process.argv[1].endsWith('test-scraper.js')) {
  runTests().catch(console.error);
}
