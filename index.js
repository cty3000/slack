const http = require('http');

// Initialize an Express application
const express = require('express');
const bodyParser = require('body-parser');

// Initialize using verification token from environment variables
const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);
const port = process.env.PORT || 3000;

const app = express();

// You must use a body parser for JSON before mounting the adapter
app.use(bodyParser.json());

// Mount the event handler on a route
// NOTE: you must mount to a path that matches the Request URL that was configured earlier
app.use('/slack/events', slackEvents.expressMiddleware());

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event)=> {
  console.log(event);
  if (process.env.API_HOSTNAME && process.env.API_PORT && process.env.API_PATH) {
    const postData = querystring.stringify(event);
    const options = {
      hostname: process.env.API_HOSTNAME,
      port: process.env.API_PORT,
      path: process.env.API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        console.log('***** Response  End  *****');
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });
    // write data to request body
    console.log('***** Request Start *****');
    req.write(postData);
    req.end();
  }
});

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);

// Start the express application
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});
