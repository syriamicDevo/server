const cron = require('cron');
const https = require('https');

const backendURL = 'provide_backend_api_endpoint_that_is_provided_by_render';

const job = new cron.CronJob('*/14 * * * *', function () {
  console.log('Restarting server');

  https.get(backendURL, (res) => {
    if (res.statusCode === 200) {
      console.log('Server restarted');
    } else {
      console.error(`Failed to restart server with status code: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error('Error during Restart:', err.message);
  });
});

module.exports = {
  job,
};
