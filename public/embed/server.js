(function(clientURL) {

var Helper = (function() {

  function removeClass(elm, str) {
    return elm.className = elm.className.split(' ').filter(function(s) {
      return s !== str;
    }).join(' ');
  }

  function addClass(elm, str) {
    return elm.className = removeClass(elm, str) + ' ' + str;
  }

  function enableBtn(btn) {
    btn.disabled = false;
    removeClass(btn, 'disabled');
  }

  function disableBtn(btn) {
    btn.disabled = true;
    addClass(btn, 'disabled');
  }

  return {
    removeClass: removeClass,
    addClass: addClass,
    enableBtn: enableBtn,
    disableBtn: disableBtn
  };

})();

var Presentation = (function() {

  var textarea   = document.getElementById('content-textarea'),
      aceElem    = document.getElementById('content-ace'),
      formDiv    = document.getElementById('twiml-form').parentElement,
      title      = document.getElementById('title'),
      callBtn    = document.getElementById('call'),
      saveBtn    = document.getElementById('save'),
      editor     = ace.edit('content-ace'),
      session    = editor.getSession(),
      localTwiML = null;

  function resizeEditor(suppressMessage) {
    // TODO: Make more configurable.
    aceElem.style.height = ((session.getLength() + 1) * 16) + 'px';
    editor.resize();
    if (!suppressMessage)
      Messaging.sendSizeMessage();
  }

  // Update buttons and global variable `twiml`.
  function handleValidation(validTwiML) {
    if (validTwiML) {
      if (saveBtn)
        Helper.enableBtn(saveBtn);
      if (callBtn && Presentation.hasToken)
        Helper.enableBtn(callBtn);
      localTwiML = validTwiML;
    } else {
      if (saveBtn)
        Helper.disableBtn(saveBtn);
      if (callBtn)
        Helper.disableBtn(callBtn);
      localTwiML = null;
    }
  }

  function ready() {
    function makeCallFunction(key, val) {
      return function() {
        // Update button.
        Helper.removeClass(callBtn, 'btn-success');
        Helper.addClass(callBtn, 'btn-danger');
        callBtn.value = callBtn.value.replace(/Call$/, 'Hangup');
        callBtn.onclick = Twilio.Device.disconnectAll;
        // Initiate call.
        var param = {};
        param[key] = encodeURIComponent(val());
        Twilio.Device.connect(param);
      };
    }
    if (!callBtn)
      return;
    else if (!Presentation.hasToken || !localTwiML && !key)
      return Helper.disableBtn(callBtn);
    else if (localTwiML)
      callBtn.onclick = makeCallFunction('twiml',
        function () { return localTwiML; });
    else if (key)
      callBtn.onclick = makeCallFunction('key',
        function () { return key; });
    Helper.enableBtn(callBtn);
  }

  function disconnect() {
    Helper.removeClass(callBtn, 'btn-danger');
    Helper.addClass(callBtn, 'btn-success');
    callBtn.value = callBtn.value.replace(/Hangup$/, 'Call');
    ready();
  }

  function setup() {
    // TODO: Move?
    session.setValue(textarea.textContent);
    session.setMode('ace/mode/xml');
    textarea.style.display = 'none';
    session.on('change', 
      // Update the textarea, validate, and resize.
      function onTwiMLChange() {
        resizeEditor();
        Request.validateTwiML(textarea.textContent = session.getValue(),
          handleValidation);
      }
    );
    title.onchange = title.onkeydown = title.onpaste = title.oninput =
      // Go through the validation flow again to determine if we should save.
      function () {
        Request.validateTwiML(textarea.textContent = session.getValue(),
          handleValidation);
      };
    resizeEditor(true);
  }

  return {
    hasToken: false,
    setup: setup,
    ready: ready,
    disconnect: disconnect,
    sizeMessage: function sizeMessage() {
      return [formDiv.scrollWidth, formDiv.scrollHeight];
    }
  };

})();

var Messaging = (function(sizeMessage) {

  var id, sentInitialSizeMessage = false;

  // If provided, the server will filter out any messages that do not originate
  // from `clientURL`.
  function setupServerMessaging(clientURL) {

    // Server's Dispatch Table
    // -----------------------

    function respondToMessage(e) {
      var strs, action, params;
      if (typeof clientURL === 'undefined' || e.origin === clientURL) {
        strs   = e.data.split(':'),
        action = strs[0],
        params = strs[1];
        switch (action) {
          case 'assign': 
            return respondToAssignMessage.apply(null, params.split(','));
          case 'size?':
            return respondToSizeMessage(e);
          default:
            console.log('Could not handle message, "' + e.data + '".');
        }
      } else
        console.log('Ignoring message from ' + e.origin);
    }

    window.addEventListener('message', respondToMessage, false);

  }

  // Message Handlers
  // ----------------

  function respondToAssignMessage(i) {
    if (!id) {
      id = parseInt(i);
      if (!sentInitialSizeMessage) {
        sentInitialSizeMessage = false;
        sendSizeMessage();
      }
    } else
      console.log('Cannot reassign ID. ID was set to ' + id + '.');
  }

  function respondToSizeMessage(e) {
    var size = sizeMessage(), w = size[0], h = size[1];
    if (!id)
      return console.log('Responding to size message before ID is set!');
    e.source.postMessage('size:' + id + ',' + w + ',' + h, e.origin);
  }

  // Shorthand form used by `resizeEditor`.
  function sendSizeMessage() {
    respondToSizeMessage({ source: window.parent, origin: '*' });
  }

  return {
    setupServerMessaging: setupServerMessaging,
    sendSizeMessage: sendSizeMessage
  };

})(Presentation.sizeMessage);

var Request = (function() {

  // Cache of `XMLHttpRequest`s, since the responses may arrive out of order.
  var lastxmlhttp = { };

  // TwiML Validator
  // ---------------

  // Takes a TwiML String, and a callback that accepts either a valid TwiML
  // String or undefined.
  function validateTwiML(twiml, next) {
    var xmlhttp = (lastxmlhttp[validateTwiML] = new XMLHttpRequest());
    xmlhttp.open('POST', '/validate', true);
    xmlhttp.onreadystatechange = function() {
      if (lastxmlhttp[validateTwiML] !== xmlhttp)
        return xmlhttp.onreadystatechange = function noop() {};
      else if (xmlhttp.readyState !== 2)
        return;
      else
        next(xmlhttp.status === 200 ? twiml : undefined);
    };
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify({ content: twiml }));
  }

  // Get Token
  // ---------

  // Takes a callback that accepts either a token String or undefined.
  function getToken(next) {
    var xmlhttp = (lastxmlhttp[getToken] = new XMLHttpRequest());
    xmlhttp.open('GET', '/json/token.json', true);
    xmlhttp.onreadystatechange = function() {
      if (lastxmlhttp[getToken] !== xmlhttp)
        return xmlhttp.onreadystatechange = function noop() {};
      else if (xmlhttp.readyState !== 4)
        return;
      else
        next(JSON.parse(xmlhttp.response).token);
    };
    xmlhttp.send();
  }

  return {
    validateTwiML: validateTwiML,
    getToken: getToken
  };

})();

// Start
// -----

Messaging.setupServerMessaging(clientURL);

Presentation.setup();

Twilio.Device.ready(Presentation.ready);

Twilio.Device.disconnect(Presentation.disconnect);

Twilio.Device.error(Presentation.disconnect);

Request.getToken(function(token) {
  if (token) {
    Presentation.hasToken = true;
    Twilio.Device.setup(token);
  } else
    console.log('Server denied request for token.');
});

})();
