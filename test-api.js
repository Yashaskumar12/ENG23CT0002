const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const EXTERNAL_API = 'http://4.224.186.213/evaluation-service/notifications';

const tests = [
  {
    name: '1. Health Check',
    url: `${BASE_URL}/health`,
    method: 'GET'
  },
  {
    name: '2. Priority Inbox (Top 10)',
    url: `${BASE_URL}/api/v1/notifications/priority-inbox?studentId=1042&limit=10`,
    method: 'GET'
  },
  {
    name: '3. All Notifications (Paginated)',
    url: `${BASE_URL}/api/v1/notifications?studentId=1042&limit=20&offset=0`,
    method: 'GET'
  },
  {
    name: '4. Unread Count',
    url: `${BASE_URL}/api/v1/notifications/count/unread?studentId=1042`,
    method: 'GET'
  }
];

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('Notification API - Test Suite');
  console.log('='.repeat(70) + '\n');
  
  console.log(`Server URL: ${BASE_URL}`);
  console.log(`External API: ${EXTERNAL_API}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`📝 ${test.name}`);
    console.log(`   ${test.method} ${test.url}`);
    
    try {
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 5000
      });
      
      console.log(`   ✓ Status: ${response.status}`);
      console.log(`   ✓ Response time: ${response.headers['x-response-time'] || 'N/A'}`);
      
      if (response.data.statusCode === 200 || response.status === 200) {
        console.log(`   ✓ SUCCESS - Data received\n`);
        passed++;
        
        if (response.data.data) {
          const dataKeys = Object.keys(response.data.data);
          console.log(`   Data keys: ${dataKeys.join(', ')}\n`);
        }
      } else {
        console.log(`   ✗ FAILED - Unexpected status\n`);
        failed++;
      }
      
    } catch (error) {
      console.log(`   ✗ Error: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log(`   ℹ Server not running. Start with: node notification-api-server.js`);
      }
      console.log();
      failed++;
    }
  }
  
  console.log('='.repeat(70));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(70) + '\n');
  
  if (failed === 0) {
    console.log('✓ All tests passed! 🎉\n');
    console.log('Postman Hints:');
    console.log('1. Import Notification_API_Postman_Collection.json into Postman');
    console.log('2. Or manually create requests with URLs above');
    console.log('3. Test each endpoint\n');
  } else {
    console.log('✗ Some tests failed. Check errors above.\n');
  }
}

runTests();
