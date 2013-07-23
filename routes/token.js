module.exports = function(app, basicAuth) {

var user = process.env.APP_AUTH_USER,
    pass = process.env.APP_AUTH_PASS;
    auth = (user && pass)
         ? basicAuth(user, pass)
         : function(req, res, next) { next(); },
    twilio = require('twilio'),
    capability = new twilio.Capability();

capability.allowClientOutgoing(process.env.TWILIO_APP_SID);

// POST
// ----

// Response Codes

//   * 201
//   * 401

app.post('/token', auth, function(req, res) {
  res.set('Content-Type', 'text/plain');
  res.send(201, capability.generate());
  res.end();
});

};
