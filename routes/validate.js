module.exports = function(app) {

var validate = require('../validate/TwiML.js');

app.post('/validate', function(req, res) {
  res.send(validate(req.body.content) ? 200 : 204);
  res.end();
});

};
