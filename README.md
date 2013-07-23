quicktwiml
==========

quicktwiml is a web app allowing you to quickly save, share, and call
[TwiML](https://www.twilio.com/docs/api/twiml) scripts from your browser. See
[quicktwiml.herokuapp.com](https://quicktwiml.herokuapp.com) for a demo.

The rest of this document explains how to deploy quicktwiml on Heroku.

Create a Heroku App
-------------------

Sign up with [Heroku](https://www.heroku.com/) if you haven't already.

1. Log into your dashboard at [Heroku](https://dashboard.heroku.com/apps).

2. Create a new app, and record its URL (you will need this to configure your
   TwiML app).

3. Navigate to your app's dashboard. Under "Resources", click "Get Add-ons" and
   choose Heroku Postgres.

4. [Select your newly-created database](https://postgres.heroku.com/databases)
   and record its host, database, user, port, and password (you will need 
   these to configure quicktwiml).

Create a TwiML App
------------------

Sign up with [Twilio](https://www.twilio.com) if you haven't already.

1. Log into your dashboard at [Twilio](https://www.twilio.com), and record your
   Twilio Account SID and Auth Token (you will need these to configure
   quicktwiml).

2. [Create a new TwiML app](https://www.twilio.com/user/account/apps/add).

3. Set the Voice and SMS Request URLs to your Heroku app's URL. Make sure to
   specify HTTPS, and include the trailing slash! For example,
   `https://quicktwiml.herokuapp.com/`.

4. Save your changes, and record your TwiML app's SID (you will need this to
   configure quicktwiml).

Configure quicktwiml
--------------------

quicktwiml reads the information you recorded in the previous steps from
environment variables. When deploying with Heroku, you can configure these like
so:

```sh
# Set the Twilio-specific environment variables.
heroku config:set TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID
heroku config:set TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN
heroku config:set TWILIO_APP_SID=$TWILIO_APP_SID

# Then set the database-specific environment variables.
heroku config:set APP_DB_HOST=$APP_DB_HOST
heroku config:set APP_DB_NAME=$APP_DB_NAME
heroku config:set APP_DB_USER=$APP_DB_USER
heroku config:set APP_DB_PORT=$APP_DB_PORT
heroku config:set APP_DB_PASS=$APP_DB_PASS
```

Finally, push this code (or your own fork) to your Heroku app! Questions? Open
a GitHub issue and I'll try to help out.
