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

function makeKey(i, n, pepper) {
  return crypto.createHash('md5')
               .update(i + pepper)
               .digest('base64')
               .replace(/\+/g, '-')
               .replace(/\//g, '_')
               .replace(/=+$/, '')
               .slice(-n);
}

// TwiML
// -----

var TwiML = schema.define('TwiML', {
  key: { type: String, length: 8 },
  secret: { type: String, length: 8 },
  title: { type: String, length: 255, default: function() { return "New TwiML Script"; } },
  content: { type: Schema.Text },
  date: { type: Date, default: function() { return new Date; } },
  /* Must specify 'bigint' instead of `Number` when using Postgres. */
  timestamp: { type: 'bigint', default: Date.now }
});

TwiML.afterSave = function(next) {
  if (!this.key && !this.secret) {
    this.updateAttribute('key', makeKey(this.id, 8, ''));
    this.updateAttribute('secret', makeKey(this.id, 8,
      process.env.APP_PEPPER || 'you really need to change this'));
  }
  next();
};

schema.autoupdate();

module.exports = {
  TwiML: TwiML
};
