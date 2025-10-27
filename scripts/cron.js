const cron = require('node-cron');
const http = require('http');
require("dotenv").config();

// Function to make HTTP request to internal API
function callCronApi() {
  return new Promise((resolve, reject) => {
    const options = {
      // hostname: 'localhost',
      port: process.env.PORT || 3000,
      path: '/api/cron',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Optional: Add authorization header if needed
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(response);
          } else {
            reject(new Error(`API returned status ${res.statusCode}: ${response.error || 'Unknown error'}`));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse API response: ${parseError.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Schedule word generation every 20 minutes
const task = cron.schedule(`*/${process.env.CRON_INTERVAL_MINUTES || '20'} * * * *`, async () => {
  console.log('Starting scheduled word generation via API...');

  try {
    const response = await callCronApi();
    console.log(`Successfully generated and saved ${response.wordsGenerated} new words via API`);

  } catch (error) {
    console.error('Error in scheduled word generation via API:', error.message);
  }
}, {
  scheduled: true,
  timezone: "UTC"
});

console.log('Cron job scheduled to run every', process.env.CRON_INTERVAL_MINUTES || '20', 'minutes');
console.log('Word generation will call internal API endpoint /api/cron');

task.start();

console.log('Cron job started. Press Ctrl+C to exit.');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping cron job...');
  task.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping cron job...');
  task.stop();
  process.exit(0);
});