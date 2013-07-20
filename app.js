var express = require('express'),
    app = express(),
    models = require('./models.js');

app.set('view engine', 'ejs');

app.use(express.bodyParser());

require('./routes/client-js.js')(app);
require('./routes/validate.js')(app);
require('./routes/TwiML.js')(app, models.TwiML);
require('./routes/Twilio.js')(app);

app.use(express.static('public'));

app.listen(process.env.PORT || 3000);
