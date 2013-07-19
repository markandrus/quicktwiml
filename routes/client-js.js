module.exports = function(app) {

var twilio = require('twilio'),
    capability = new twilio.Capability(),
    fs = require('fs');

capability.allowClientOutgoing(process.env.TWILIO_APP_SID);

app.get('/client.js', function(req, res) {
  fs.readFile('public/client.js', function(err, file) {
    if (err) {
      res.send(500);
    } else {
      res.set('Content-Type', 'application/javascript');
      res.send(200,
        '(function(token) {\n\n' +
        file +
        '\n})(\'' + capability.generate() + '\');'
      );
    }
    res.end();
  });
});

};