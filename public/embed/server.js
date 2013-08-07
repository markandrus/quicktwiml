(function(clientURL) {

// Client Messaging
// ----------------

// See `embed/embed.js`.

// Server Messaging
// ----------------

// If provided, the server will filter out any messages that do not originate
// from `clientURL`.
function setupServerMessaging(clientURL) {

  // Server's Dispatch Table
  // -----------------------

  function respondToMessage(e) {
    if (typeof clientURL === 'undefined' || e.origin === clientURL) {
      switch (e.data) {
        case 'size?':
          return respondToSizeMessage(e);
        default:
          console.log('Could not handle message, "' + e.data + '".');
      }
    } else
      console.log('Ignoring message from ' + e.origin);
  }

  // Message Handlers
  // ----------------

  function respondToSizeMessage(e) {
    e.source.postMessage('size:' + document.body.scrollWidth +
                             ',' + document.body.scrollHeight, e.origin);
  }

  window.addEventListener('message', respondToMessage, false);

}

setupServerMessaging();

})();
