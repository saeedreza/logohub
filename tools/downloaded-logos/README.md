# Downloaded Logos Cache

## ⚠️ This folder can be safely deleted

This directory serves as a **temporary cache** for SVG files downloaded from external logo sources during the import process.

## Purpose

The `downloaded-logos/` folder is used by import tools to store SVG files downloaded from:
- **Gilbarbara's logo repository** (files ending with `-gilbarbara.svg`)
- **Simple Icons repository** (files ending with `-simple-icons.svg`)
- Other external logo sources

## Current Contents

The folder currently contains **28 SVG files** (~150KB total) from recent import operations:

### From Gilbarbara Repository:
- bluesky, mattermost, zoom, datadog, sentry, segment, mixpanel
- airtable, obsidian, linear, insomnia, postman, planetscale
- supabase, cloudflare, steam, unity, framer, shopify
- paypal, stripe, anthropic, openai

### From Simple Icons Repository:
- render, railway, digitalocean, canva, coinbase

## Can I Delete This Folder?

**✅ YES** - This folder can be safely deleted at any time because:

1. **Temporary Storage**: Files here are temporary downloads, not permanent assets
2. **Regenerable**: All files can be re-downloaded using the import tools
3. **Not Used by API**: The LogoHub API doesn't serve files from this directory
4. **Space Saving**: Regularly deleting saves disk space

## When to Delete

### Recommended Deletion Times:
- ✅ After successful logo imports
- ✅ During regular maintenance 
- ✅ When cleaning up development environment
- ✅ Before committing to version control

### Safe to Delete When:
- Import processes are complete
- Logos have been successfully imported to the main `logos/` directory
- No active download operations are running

## How Files Get Here

Files appear in this folder when running:
```bash
# Downloads logos to this cache folder
node import-export/logo-downloader.js

# Uses cached files for batch import
node import-export/logo-batch-import.js

# Processes Gilbarbara logos
node import-export/add-gilbarbara-logo.js
```

## Automated Cleanup

You can add this folder to your cleanup scripts:

```bash
# Clean download cache
rm -rf tools/downloaded-logos/*

# Or remove the entire folder (will be recreated when needed)
rm -rf tools/downloaded-logos/
```

## Git Ignore

Consider adding this folder to `.gitignore` to prevent temporary files from being committed:

```gitignore
# Temporary download cache
tools/downloaded-logos/*.svg
```

---

**💡 Bottom Line**: Delete this folder whenever you want to free up space. The tools will recreate it automatically when needed. 