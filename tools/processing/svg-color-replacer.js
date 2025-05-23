#!/usr/bin/env node

/**
 * SVG Color Replacer
 * 
 * A simple utility for replacing colors in SVG files.
 * 
 * Usage:
 *   node svg-color-replacer.js input.svg output.svg "#oldColor" "#newColor"
 * 
 * Multiple color replacements:
 *   node svg-color-replacer.js input.svg output.svg "#color1" "#new1" "#color2" "#new2"
 */

const fs = require('fs');

// Check arguments
if (process.argv.length < 6 || process.argv.length % 2 !== 0) {
  console.error(`
Usage:
  node svg-color-replacer.js input.svg output.svg "#oldColor" "#newColor"

Multiple color replacements:
  node svg-color-replacer.js input.svg output.svg "#color1" "#new1" "#color2" "#new2"
  `);
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

// Get color pairs to replace
const colorPairs = [];
for (let i = 4; i < process.argv.length; i += 2) {
  colorPairs.push({
    oldColor: process.argv[i],
    newColor: process.argv[i + 1]
  });
}

// Read input file
try {
  const svgContent = fs.readFileSync(inputFile, 'utf8');
  
  // Replace colors
  let modifiedContent = svgContent;
  for (const pair of colorPairs) {
    const regex = new RegExp(escapeRegExp(pair.oldColor), 'g');
    modifiedContent = modifiedContent.replace(regex, pair.newColor);
  }
  
  // Write output file
  fs.writeFileSync(outputFile, modifiedContent);
  
  console.log(`Successfully replaced colors in ${inputFile} and saved to ${outputFile}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

// Helper function to escape special characters in regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 