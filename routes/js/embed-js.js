module.exports = function(app) {

app.get('/js/embed.js', function(req, res) {
  res.set('Content-Type', 'application/javascript');
  res.render('js/embed-js', {
    key: req.query.key,
    // FIXME: ...
    appDomain: process.env.APP_DOMAIN || '127.0.0.1:3000',
    appDomainRegex:
      (process.env.APP_DOMAIN || '127.0.0.1:3000').replace(/./, '\.')
  });
});

};
