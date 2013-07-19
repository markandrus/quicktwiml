// `token` is provided by the application that serves this script.

Twilio.Device.setup(token);

Twilio.Device.ready(function() {
  // Activate the "Call" button.
});

function call() {
  Twilio.Device.connect({
    'twiml-id': $()
  });
}
