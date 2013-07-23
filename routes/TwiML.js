module.exports = function (app, TwiML) {

var twilio = require('twilio'),
    validate = require('../validate/TwiML.js');

function update(req, res, next, found) {
  var twiml = found || new TwiML;
  twiml.title = req.body.title;
  twiml.content = req.body.content;
  twiml.save(function(err) {
    if (!err)
      return next(res, twiml);
    console.error(err);
    res.send(500);
    res.end();
  });
}

// POST
// ----

// Clients can create new TwiML by POST-ing to `/TwiML'. Successful POST-s
// receive a 303 response.

// Response Codes:

//   * 303
//   * 400
//   * 500

app.post('/TwiML', function(req, res) {
  if (validate(req.body.content))
    return update(req, res, function(res, twiml) {
      res.redirect(303, '/TwiML/' + twiml.key);
    });
  res.send(400);
  res.end();
});

// PUT
// ---

// Clients can update existing TwiML, but attempts to create new TwiML via PUT
// receive a 403 response. Successful PUT-s receive a 200 response.

// Response Codes:

//   * 200
//   * 400
//   * 403
//   * 500

app.put('/TwiML/:key', function(req, res) {
  if (validate(req.body.content))
    return TwiML.findOne({ where: { key: req.params.key } },
      function(err, twiml) {
        if (err) {
          console.error(err);
          res.send(500);
        } else if (!twiml)
          res.send(403);
        else
          return update(req, res, function(res) { 
            res.send(200);
            res.end();
          }, twiml);
        res.end();
      }
    );
  res.send(400);
  res.end();
});

// DELETE
// ------

// Response Codes:

//   * 200
//   * 404
//   * 500

app.del('/TwiML/:key', function(req, res) {
  TwiML.findOne({ where: { key: req.params.key } }, function(err, twiml) {
    if (err) {
      console.error(err);
      res.send(500);
    } else if (!twiml)
      res.send(404);
    else
      return twiml.destroy(function(err) {
        if (err) {
          console.error(err);
          res.send(500);
        } else
          res.send(200);
        res.end();
      });
  });
});

// GET
// ---

// Requests from Twilio are answered with `application/xml'. Requests from
// clients are answered with `text/html'.

// Response Codes:

//   * 200
//   * 404
//   * 500

app.get('/TwiML/:key?', function(req, res) {
  if (key = req.params.key)
    return TwiML.findOne({ where: { key: key } }, function(err, twiml) {
      if (err) {
        console.error(err);
        res.send(500);
      } else if (!twiml)
        res.send(404);
      /* Serve TwiML for Twilio. */
      else if
          (twilio.validateExpressRequest(req, process.env.TWILIO_AUTH_TOKEN)) {
        res.set('Content-Type', 'application/xml');
        res.send(200, twiml.content);
      /* Serve TwiML for a user. */
      } else {
        res.set('Content-Type', 'text/html');
        return res.render('TwiML', {
          twiml: twiml,
          embed: req.query.embed ? true : false
        });
      }
      res.end();
    });
  /* Serve TwiML index. */
  var skip = parseInt(req.query.skip) || 0;
  TwiML.all({ order: 'title', limit: 10, skip: skip * 10 }, function(err, twimls) {
    if (!err)
      return res.render('TwiML-index', {
        twimls: twimls,
        twiml: {},
        embed: false
      });
    console.error(err);
    res.send(500);
    res.end();
  });
});

};
