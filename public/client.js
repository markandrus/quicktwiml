// Forget about jQuery
// ===================

function removeClass(elm, str) {
  return elm.className = elm.className.split(' ').filter(function(s) {
    return s !== str;
  }).join(' ');
}

function addClass(elm, str) {
  return elm.className = removeClass(elm, str) + ' ' + str;
}

// Setup ACE
// =========

var editor = ace.edit('content-ace'),
    session = editor.getSession(),
    textarea = document.getElementById('content-textarea');

session.setValue(textarea.textContent);
textarea.style['display'] = 'none';
session.setMode('ace/mode/xml');
session.on('change', function() {
  var text = (textarea.textContent = session.getValue());
  validateTwiML(text);
});

// Handle asynchronous calls to TwiML validation service
// =====================================================

var lastxmlhttp,
    saveBtn = document.getElementById('save');

function validateTwiML(twiml) {
  var xmlhttp = (lastxmlhttp = new XMLHttpRequest());
  xmlhttp.open('POST', '/validate', true);
  xmlhttp.onreadystatechange = function() {
    if (lastxmlhttp !== xmlhttp)
      return (xmlhttp.onreadystatechange = function() { });
    else if (xmlhttp.readyState !== 2)
      return;
    else if (xmlhttp.status === 200) {
      saveBtn.disabled = false;
      removeClass(saveBtn, 'disabled');
    } else {
      saveBtn.disabled = true;
      addClass(saveBtn, 'disabled');
    }
  };
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.send(JSON.stringify({ content: twiml }));
}

// Revalidate on title change
// ==========================

// TODO: Make more responsive.

var title = document.getElementById('title');

title.onchange = function() {
  validateTwiML(textarea.textContent);
};

// Setup Twilio Client
// ===================

// NOTE: There will either be global variable `key` or `twiml` accessible to
// the following functions.

var callBtn = document.getElementById('call');

Twilio.Device.setup(token);

function call(key, val) {
  return function() {
    removeClass(callBtn, 'btn-success');
    addClass(callBtn, 'btn-danger');
    callBtn.value = callBtn.value.replace(/Call$/, "Hangup");
    callBtn.onclick = Twilio.Device.disconnectAll;
    var param = {}; param[key] = val;
    Twilio.Device.connect(param);
  };
}

var twiml;

function ready() {
  if (key)
    callBtn.onclick = call('key', key);
  else if (twiml)
    callBtn.onclick = call('twiml', twiml);
  callBtn.disabled = false;
  removeClass(callBtn, 'disabled');
}

Twilio.Device.ready(ready);

Twilio.Device.disconnect(function () {
  removeClass(callBtn, 'btn-danger');
  addClass(callBtn, 'btn-success');
  callBtn.value = callBtn.value.replace(/Hangup$/, "Call");
  ready();
});
