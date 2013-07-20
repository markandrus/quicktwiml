// Forget about jQuery!

function removeClass(strs, str) {
  strs = strs || "";
  return strs.split(' ').filter(function(s) {
    return s !== str;
  }).join(' ');
}

function addClass(strs, str) {
  strs = strs || "";
  return removeClass(strs, str) + ' ' + str;
}

// Setup ACE.

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

// Handle asynchronous calls to TwiML validation service.

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
      saveBtn.className = removeClass(saveBtn.className, 'disabled');
    } else {
      saveBtn.disabled = true;
      saveBtn.className = addClass(saveBtn.className, 'disabled');
    }
  };
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.send(JSON.stringify({ content: twiml }));
}

// Revalidate on title change.

var title = document.getElementById('title');

title.onchange = function() {
  validateTwiML(textarea.textContent);
};

// Setup Twilio Client.

var callBtn = document.getElementById('call');

Twilio.Device.Setup(token);

function call(key) {
  return function() {
    Twilio.Device.connect({
      key: key
    });
  };
}

Twilio.Device.ready(function() {
  callBtn.className = removeClass(callBtn.className, 'disabled');
  callBtn.onclick = call(key);
});
