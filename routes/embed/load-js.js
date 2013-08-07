module.exports = function(app) {

app.get('/embed/load.js', function(req, res) {
  res.set('Content-Type', 'application/javascript');
  if ('key' in req.query)
    return res.render('embed/load-js', { key: req.query.key });
  res.send('');
  res.end();
});

};
