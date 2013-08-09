function removeClass(elm, str) {
  return elm.className = elm.className.split(' ').filter(function(s) {
    return s !== str;
  }).join(' ');
}

function addClass(elm, str) {
  return elm.className = removeClass(elm, str) + ' ' + str;
}

// Setup ACE
// ---------

var editor = ace.edit('content-ace'),
    session = editor.getSession(),
    textarea = document.getElementById('content-textarea'),
    elem = document.getElementById('content-ace');

function resizeEditor() {
  elem.setAttribute('style', 'width: 100%; height: ' +
    ((session.getLength() + 1) * 16) + 'px;');
  editor.resize();
  var form = document.getElementById('twiml-form').parentElement;
  window.parent.postMessage('size:' + form.scrollWidth +
                                ',' + form.scrollHeight, '*');
}

session.setValue(textarea.textContent);
textarea.style['display'] = 'none';
session.setMode('ace/mode/xml');
session.on('change', function() {
  var text = (textarea.textContent = session.getValue());
  validateTwiML(text);
  resizeEditor();
});

elem.setAttribute('style', 'width: 100%; height: ' +
  ((session.getLength() + 1) * 16) + 'px;');

// Handle asynchronous calls to TwiML validation service
// -----------------------------------------------------

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
      // FIXME: ...
      if (token) {
        // callBtn.disabled = false;
        // removeClass(callBtn, 'disabled');
        callBtn.disabled = true;
        addClass(callBtn, 'disabled');
      }
      echo = twiml;
    } else {
      saveBtn.disabled = true;
      addClass(saveBtn, 'disabled');
      if (token) {
        callBtn.disabled = true;
        addClass(callBtn, 'disabled');
      }
      echo = undefined;
    }
  };
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.send(JSON.stringify({ content: twiml }));
}

// Revalidate on title change
// --------------------------

// TODO: Make more responsive.

var title = document.getElementById('title');

title.onchange = function() {
  validateTwiML(textarea.textContent);
};

// Setup Twilio Client
// -------------------

// NOTE: There will either be global variable `key` or `echo` accessible to
// the following functions.

if (token) {

  var callBtn = document.getElementById('call');

  Twilio.Device.setup(token);

  function call(key, val) {
    return function() {
      removeClass(callBtn, 'btn-success');
      addClass(callBtn, 'btn-danger');
      callBtn.value = callBtn.value.replace(/Call$/, "Hangup");
      callBtn.onclick = Twilio.Device.disconnectAll;
      var param = {}; param[key] = encodeURIComponent(val());
      Twilio.Device.connect(param);
    };
  }

  var echo;

  function ready() {
    if (!key)
      return callBtn.onclick = call('twiml', function() { return echo; });
    callBtn.onclick = call('key', function() { return key; });
    callBtn.disabled = false;
    removeClass(callBtn, 'disabled');
  }

  Twilio.Device.ready(ready);

  function disconnect() {
    removeClass(callBtn, 'btn-danger');
    addClass(callBtn, 'btn-success');
    callBtn.value = callBtn.value.replace(/Hangup$/, "Call");
    ready();
  }

  Twilio.Device.disconnect(disconnect);

  Twilio.Device.error(disconnect);

}
