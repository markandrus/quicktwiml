var Schema = require('jugglingdb').Schema,
    schema = new Schema('postgres', {
               database: process.env.DATABASE_URL || process.env.DATABASE_NAME
             }),
    crypto = require('crypto');

/* Generate a random, URL-safe key. */
function randKey(n) {
  return crypto.randomBytes(n).toString('base64').replace(/\+/g, '-')
                                                 .replace(/\//g, '_')
                                                 .replace(/=+$/,  '');
}

// TwiML
// -----

var TwiML = schema.define('TwiML', {
  key: { type: String, length: 8, default: function() { return randKey(8); } },
  title: { type: String, length: 255, default: function() { return "New TwiML Script"; } },
  content: { type: Schema.Text },
  date: { type: Date, default: function() { return new Date; } },
  /* Must specify 'bigint' instead of `Number` when using Postgres. */
  timestamp: { type: 'bigint', default: Date.now }
});

TwiML.validatesUniquenessOf('key', { message: 'Key is not unique.' });

module.exports = {
  _schema: schema,
  TwiML: TwiML
};
