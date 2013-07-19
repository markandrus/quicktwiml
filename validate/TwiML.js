var libxmljs = require('libxmljs'),
    fs = require('fs'),
    xsd = libxmljs.parseXml(fs.readFileSync('validate/TwiML.xsd').toString());

module.exports = function validateTwiML(twiml) {
  var res = false;
  try {
    res = libxmljs.parseXml(twiml).validate(xsd);
  } catch (e) {
    return false;
  }
  return res;
};
