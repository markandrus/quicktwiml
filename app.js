var express = require('express'),
    app = express();
app.set('view engine', 'ejs');
app.use(express.bodyParser());
require('./routes/client-js.js')(app);
require('./routes/TwiML.js')(app);
require('./routes/validate.js')(app);
app.use(express.static('public'));
app.listen(3000);
