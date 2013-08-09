module.exports = function(app) {

app.get('/js/load.js', function(req, res) {
  res.set('Content-Type', 'application/javascript');
  if ('key' in req.query)
    return res.render('js/load-js', {
      key: req.query.key,
      // FIXME: ...
      appDomain: process.env.APP_DOMAIN || '127.0.0.1:3000'
    });
  res.send('');
  res.end();
});

};
