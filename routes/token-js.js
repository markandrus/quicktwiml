module.exports = function(app, basicAuth) {

var twilio = require('twilio'),
    capability = new twilio.Capability();

capability.allowClientOutgoing(process.env.TWILIO_APP_SID);

// POST
// ----

// Response Codes

//   * 201
//   * 401

app.get('/token.js', function(req, res) {
  res.set('Content-Type', 'application/javascript');
  if (process.env.APP_ENABLE_CALLS)
    res.send(201, "var token='" + capability.generate() + "';");
  else
    res.send(200, 'var token=false;');
  res.end();
});

};
