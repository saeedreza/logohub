#!/usr/bin/env node

/**
 * @fileoverview Development Testing Script for LogoHub
 * @description Comprehensive testing tool that verifies both API server and VitePress website functionality.
 * Tests API endpoints, image conversion, CORS configuration, and website pages.
 * 
 * @category Development
 * @requires axios
 * @version 1.0.0
 * @author LogoHub Team
 * 
 * @example
 * # Run all tests
 * node development/dev-test.js
 * 
 * # Test only API
 * const { testAPI } = require('./development/dev-test.js');
 * await testAPI();
 */

const axios = require('axios').default || require('axios');

/**
 * Test API server functionality
 * @async
 * @function testAPI
 * @description Tests all API endpoints including health, logos list, SVG/PNG retrieval, metadata, and CORS headers
 * @param {string} baseUrl - Base URL for the API (default: localhost)
 * @returns {Promise<boolean>} True if all tests pass, false otherwise
 * 
 * @example
 * const success = await testAPI();
 * if (success) console.log('API is working correctly');
 */
async function testAPI(baseUrl = 'http://localhost:3000') {
  console.log(`🧪 Testing API endpoints at ${baseUrl}...\n`);
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${baseUrl}/api/health`);
    console.log(`   ✅ Health: ${health.data.status}\n`);
    
    // Test logos list
    console.log('2. Testing logos list...');
    const logos = await axios.get(`${baseUrl}/api/v1/logos?limit=5`);
    console.log(`   ✅ Found ${logos.data.total} logos`);
    console.log(`   🎯 First 5: ${logos.data.logos.map(l => l.name).join(', ')}\n`);
    
    // Test specific logo
    console.log('3. Testing specific logo (SVG)...');
    const logoId = logos.data.logos[0].id;
    const svgResponse = await axios.get(`${baseUrl}/api/v1/logos/${logoId}`);
    console.log(`   ✅ ${logoId} SVG: ${svgResponse.data.length} bytes\n`);
    
    // Test PNG conversion
    console.log('4. Testing PNG conversion...');
    const pngResponse = await axios.get(`${baseUrl}/api/v1/logos/${logoId}?format=png&size=64`, {
      responseType: 'arraybuffer'
    });
    console.log(`   ✅ ${logoId} PNG (64px): ${pngResponse.data.length} bytes\n`);
    
    // Test metadata
    console.log('5. Testing metadata...');
    const metadata = await axios.get(`${baseUrl}/api/v1/logos/${logoId}/metadata`);
    console.log(`   ✅ ${logoId} metadata: ${metadata.data.name}\n`);
    
    // Test CORS headers
    console.log('6. Testing CORS headers...');
    const corsResponse = await axios.get(`${baseUrl}/api/v1/logos/${logoId}?size=64`, {
      headers: { 'Origin': baseUrl.includes('localhost') ? 'http://localhost:5173' : 'https://logohub.dev' },
      responseType: 'arraybuffer'
    });
    const corsHeaders = corsResponse.headers['access-control-allow-origin'];
    console.log(`   ✅ CORS headers: ${corsHeaders ? 'Configured' : 'Missing'}\n`);
    
    console.log('🎉 API tests passed!\n');
    return true;
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

/**
 * Test VitePress website functionality
 * @async
 * @function testWebsite
 * @description Tests website homepage and logo browser page accessibility
 * @returns {Promise<boolean>} True if all tests pass, false otherwise
 * 
 * @example
 * const success = await testWebsite();
 * if (success) console.log('Website is working correctly');
 */
async function testWebsite() {
  console.log('🌐 Testing website...\n');
  
  try {
    // Test website homepage
    console.log('1. Testing homepage...');
    const homepage = await axios.get('http://localhost:5173/');
    console.log(`   ✅ Homepage loaded: ${homepage.data.length} bytes\n`);
    
    // Test logo browser page
    console.log('2. Testing logo browser...');
    const browser = await axios.get('http://localhost:5173/logos');
    console.log(`   ✅ Logo browser loaded: ${browser.data.length} bytes\n`);
    
    console.log('🎉 Website tests passed!\n');
    return true;
    
  } catch (error) {
    console.error('❌ Website test failed:', error.message);
    console.log('   💡 Make sure VitePress is running: npm run website:dev\n');
    return false;
  }
}

/**
 * Test production API functionality
 * @async
 * @function testProduction
 * @description Tests production API at logohub.dev
 * @returns {Promise<boolean>} True if all tests pass, false otherwise
 */
async function testProduction() {
  return await testAPI('https://logohub.dev');
}

/**
 * Run complete test suite
 * @async
 * @function runTests
 * @description Executes both API and website tests, provides summary report
 * @returns {Promise<void>}
 * @throws {Error} Exits process with code 1 if tests fail
 */
async function runTests() {
  console.log('🚀 LogoHub Development Test Suite\n');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--prod') || args.includes('--production')) {
    console.log('Testing production API at logohub.dev...\n');
    const prodOk = await testProduction();
    
    console.log('📋 PRODUCTION TEST SUMMARY\n');
    console.log(`Production API: ${prodOk ? '✅ Working' : '❌ Failed'}`);
    
    if (prodOk) {
      console.log('\n🎉 Production API operational!');
      console.log('\n🔗 Production API: https://logohub.dev/api/v1/logos');
      process.exit(0);
    } else {
      console.log('\n❌ Production tests failed.');
      process.exit(1);
    }
  } else {
    console.log('Testing both API server and VitePress website...\n');
    
    const apiOk = await testAPI();
    const websiteOk = await testWebsite();
    
    console.log('📋 TEST SUMMARY\n');
    console.log(`API Server:     ${apiOk ? '✅ Working' : '❌ Failed'}`);
    console.log(`Website:        ${websiteOk ? '✅ Working' : '❌ Failed'}`);
    
    if (apiOk && websiteOk) {
      console.log('\n🎉 All systems operational!');
      console.log('\n🔗 Quick Links:');
      console.log('   • API:     http://localhost:3000/api/v1/logos');
      console.log('   • Website: http://localhost:5173/logos');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Check the output above.');
      console.log('\n💡 Make sure both servers are running:');
      console.log('   • npm start (API server)');
      console.log('   • npm run website:dev (VitePress)');
      process.exit(1);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPI, testWebsite, testProduction }; 