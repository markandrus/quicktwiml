var express = require('express'),
    app = express(),
    models = require('./models.js');

app.enable('trust proxy');

if (process.env.APP_FORCE_HTTPS)
  app.use(function(req, res, next) {
    if (!req.secure)
      return res.redirect('https://' + req.get('Host') + req.url);
    next();
  });

app.use(express.bodyParser());

app.set('view engine', 'ejs');

require('./routes/token-js.js')(app, express.basicAuth);
require('./routes/client-js.js')(app);
require('./routes/validate.js')(app);
require('./routes/TwiML.js')(app, models.TwiML);
require('./routes/Twilio.js')(app);

app.use(express.static('public'));

app.listen(process.env.PORT || 3000);
