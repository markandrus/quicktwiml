module.exports = function(app, basicAuth) {

var user = process.env.APP_AUTH_USER,
    pass = process.env.APP_AUTH_PASS;
    auth = (user && pass)
         ? basicAuth(function(user, pass, fn) {
             fn(null, user === process.env.APP_AUTH_USER &&
                      pass === process.env.APP_AUTH_PASS);
           })
         : function(req, res, next) {
             req.user = true;
             next();
           },
    twilio = require('twilio'),
    capability = new twilio.Capability();

capability.allowClientOutgoing(process.env.TWILIO_APP_SID);

// POST
// ----

// Response Codes

//   * 201
//   * 401

app.get('/token.js', auth, function(req, res) {
  res.set('Content-Type', 'application/javascript');
  if (req.user)
    res.send(201, "token='" + capability.generate() + "';");
  else
    res.send(200);
  res.end();
});

};
