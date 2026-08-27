const http = require('http');

async function runQA() {
    console.log('--- AGENT 4 QA & INTEGRATION TEST RUNNER ---');

    // 1. Test Static Upload Server Endpoint
    console.log('\n[TEST 1] Testing Document File Endpoint: http://localhost:5001/uploads/cert_front-1787656677907.jpeg');
    
    http.get('http://localhost:5001/uploads/cert_front-1787656677907.jpeg', (res) => {
        console.log(`HTTP Status Code: ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode === 200) {
            console.log('✅ TEST 1 PASSED: Document file is served cleanly (HTTP 200 OK, No 404).');
        } else {
            console.error(`❌ TEST 1 FAILED: Received HTTP ${res.statusCode}`);
        }
    }).on('error', (err) => {
        console.error('❌ TEST 1 ERROR:', err.message);
    });
}

runQA();
