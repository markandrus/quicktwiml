var Schema = require('jugglingdb').Schema,
    schema = new Schema('memory'),
    crypto = require('crypto');

function randKey(n) {
  return crypto.randomBytes(n)
               .toString('base64')
               .replace(/\+/g, '-') // Convert '+' to '-'
               .replace(/\//g, '_') // Convert '/' to '_'
               .replace(/=+$/, ''); // Remove ending '='
}

var TwiML = schema.define('TwiML', {
  key: { type: String, length: 8, default: function() { return randKey(8); } },
  title: { type: String, length: 255, default: function() { return "New TwiML Script"; } },
  content: { type: Schema.Text },
  date: { type: Date, default: function() { return new Date; } },
  timestamp: { type: Number, default: Date.now }
});

TwiML.validatesUniquenessOf('key', { message: 'Key is not unique.' });

module.exports = {
  TwiML: TwiML
};
