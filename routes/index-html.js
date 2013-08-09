module.exports = function(app) {

app.get('/', function(req, res) {
  res.render('index-html', {
    // FIXME: ...
    appDomain: process.env.APP_DOMAIN || '127.0.0.1:3000'
  });
});

};
