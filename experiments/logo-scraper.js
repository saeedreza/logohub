/**
 * Basic logo scraper - experimental tool for detecting logos on websites
 *
 * Attempts to find SVG logos and logo images using common patterns.
 * This is a proof of concept to test feasibility.
 */

import puppeteer from 'puppeteer';

/**
 * Scrapes a website looking for potential logo elements
 * @param {string} url - The website URL to scrape
 * @returns {Promise<Array>} Array of potential logo candidates
 */
export async function scrapeLogo(url) {
  console.log(`🔍 Scraping logos from: ${url}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set a reasonable timeout and user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    );
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });

    // Look for potential logos using multiple strategies
    const logoElements = await page.evaluate(() => {
      const candidates = [];

      // Strategy 1: Find SVG elements that might be logos
      const svgElements = document.querySelectorAll('svg');
      svgElements.forEach((svg, index) => {
        // Check if it's likely a logo based on common patterns
        const parent = svg.closest(
          'a, header, nav, .logo, .brand, [class*="logo"], [class*="brand"]'
        );
        const hasLogoClass =
          svg.className.baseVal &&
          svg.className.baseVal.toLowerCase().includes('logo');
        const hasLogoId = svg.id && svg.id.toLowerCase().includes('logo');

        if (parent || hasLogoClass || hasLogoId) {
          candidates.push({
            type: 'svg',
            content: svg.outerHTML,
            context: parent ? parent.tagName.toLowerCase() : 'standalone',
            index,
            confidence: parent ? 'high' : 'medium',
          });
        }
      });

      // Strategy 2: Find img elements with logo-like attributes
      const imgElements = document.querySelectorAll('img');
      imgElements.forEach((img, index) => {
        const alt = img.alt?.toLowerCase() || '';
        const src = img.src?.toLowerCase() || '';
        const className = img.className?.toLowerCase() || '';

        const isLogoLike =
          alt.includes('logo') ||
          src.includes('logo') ||
          className.includes('logo') ||
          alt.includes('brand') ||
          src.includes('brand');

        if (isLogoLike && img.src) {
          candidates.push({
            type: 'img',
            src: img.src,
            alt: img.alt || '',
            className: img.className || '',
            index,
            confidence: alt.includes('logo') ? 'high' : 'medium',
          });
        }
      });

      return candidates;
    });

    console.log(`✓ Found ${logoElements.length} potential logo candidates`);
    return logoElements;
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error.message);
    return [];
  } finally {
    await browser.close();
  }
}

/**
 * Test the scraper with a single URL
 * @param {string} url - URL to test
 */
export async function testScraper(url) {
  console.log(`\n=== Testing Logo Scraper ===`);

  try {
    const results = await scrapeLogo(url);

    if (results.length === 0) {
      console.log('❌ No logo candidates found');
      return;
    }

    console.log(`\n📊 Results for ${url}:`);
    results.forEach((candidate, i) => {
      console.log(
        `\n${i + 1}. ${candidate.type.toUpperCase()} (${candidate.confidence} confidence)`
      );

      if (candidate.type === 'svg') {
        console.log(`   Context: ${candidate.context}`);
        console.log(`   Content: ${candidate.content.substring(0, 100)}...`);
      } else {
        console.log(`   Source: ${candidate.src}`);
        console.log(`   Alt: ${candidate.alt}`);
        console.log(`   Class: ${candidate.className}`);
      }
    });
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}
