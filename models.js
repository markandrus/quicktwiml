var crypto = require('crypto'),
    Schema = require('jugglingdb').Schema,
    schema = new Schema('postgres', !process.env.APP_DB_HOST
           /* Database for local development. */
           ? { database: 'hello-world' }
           /* Database for production. */
           : { database: process.env.APP_DB_NAME,
               username: process.env.APP_DB_USER,
               host: process.env.APP_DB_HOST,
               port: process.env.APP_DB_PORT,
               password: process.env.APP_DB_PASS });

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

schema.autoupdate();

module.exports = {
  TwiML: TwiML
};
