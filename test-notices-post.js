// Simple Node.js script to test Notices POST API
const https = require('http');

const data = JSON.stringify({
  email: 'admin@glec.io',
  password: 'admin123!'
});

// Step 1: Login to get token
const loginOptions = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('1️⃣ Attempting login...');
const loginReq = https.request(loginOptions, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('Login response:', body);

    try {
      const loginData = JSON.parse(body);

      if (!loginData.success || !loginData.data || !loginData.data.token) {
        console.error('❌ Login failed:', loginData);
        return;
      }

      const token = loginData.data.token;
      console.log('✅ Got token:', token.substring(0, 20) + '...');

      // Step 2: Create notice
      const noticeData = JSON.stringify({
        title: `Test Notice ${Date.now()}`,
        content: 'Test content',
        category: 'GENERAL',
        status: 'PUBLISHED'
      });

      const noticeOptions = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/admin/notices',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': noticeData.length,
          'Authorization': `Bearer ${token}`
        }
      };

      console.log('\n2️⃣ Creating notice...');
      const noticeReq = https.request(noticeOptions, (res) => {
        let noticeBody = '';

        res.on('data', (chunk) => {
          noticeBody += chunk;
        });

        res.on('end', () => {
          console.log('Notice response status:', res.statusCode);
          console.log('Notice response:', noticeBody);

          if (res.statusCode === 201) {
            console.log('✅ Notice created successfully!');
          } else {
            console.error('❌ Failed to create notice');
          }
        });
      });

      noticeReq.on('error', (error) => {
        console.error('❌ Request error:', error);
      });

      noticeReq.write(noticeData);
      noticeReq.end();

    } catch (e) {
      console.error('❌ Parse error:', e);
    }
  });
});

loginReq.on('error', (error) => {
  console.error('❌ Login request error:', error);
});

loginReq.write(data);
loginReq.end();
