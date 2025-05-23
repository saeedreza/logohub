/**
 * Logo Data Generator for VitePress Website
 * 
 * Scans all logo directories, reads their metadata.json files,
 * and generates a consolidated logos.json file for the documentation website.
 */

const fs = require('fs').promises;
const path = require('path');

async function generateLogoData() {
  console.log('🔍 Scanning logos directory...');
  
  const logosDir = path.join(process.cwd(), 'logos');
  const outputFile = path.join(process.cwd(), 'docs', '.vitepress', 'data', 'logos.json');
  
  try {
    // Read all logo directories
    const logoDirectories = await fs.readdir(logosDir);
    const logos = [];
    
    // Process each logo directory
    for (const logoId of logoDirectories) {
      // Skip hidden files and non-directories
      if (logoId.startsWith('.')) continue;
      
      const logoPath = path.join(logosDir, logoId);
      const stat = await fs.stat(logoPath);
      
      if (!stat.isDirectory()) continue;
      
      try {
        // Read metadata.json
        const metadataPath = path.join(logoPath, 'metadata.json');
        const metadataContent = await fs.readFile(metadataPath, 'utf8');
        const metadata = JSON.parse(metadataContent);
        
        // Check if main SVG file exists
        const svgPath = path.join(logoPath, `${logoId}.svg`);
        let hasMainSvg = false;
        
        try {
          await fs.access(svgPath);
          hasMainSvg = true;
        } catch {
          hasMainSvg = false;
        }
        
        // Build logo entry for website
        const logoEntry = {
          id: logoId,
          name: metadata.name || metadata.title || logoId,
          website: metadata.website || `https://${logoId}.com`,
          colors: metadata.colors || [],
          hasSymbol: metadata.hasSymbol || false,
          hasMainSvg: hasMainSvg,
          created: metadata.created || '2025-05-23',
          updated: metadata.updated || new Date().toISOString()
        };
        
        logos.push(logoEntry);
        console.log(`✓ Processed ${logoId}`);
        
      } catch (error) {
        console.warn(`⚠️  Warning: Could not process ${logoId} - ${error.message}`);
      }
    }
    
    // Sort logos by name
    logos.sort((a, b) => a.name.localeCompare(b.name));
    
    // Generate output data
    const output = {
      logos: logos,
      generated: new Date().toISOString(),
      count: logos.length
    };
    
    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    
    // Write the consolidated data file
    await fs.writeFile(outputFile, JSON.stringify(output, null, 2));
    
    console.log(`\n🎉 Generated logo data successfully!`);
    console.log(`📊 Total logos: ${logos.length}`);
    console.log(`📁 Output file: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Error generating logo data:', error);
    process.exit(1);
  }
}

// Run the generator
generateLogoData(); 