var express = require('express'),
  path = require('path'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  dotenv = require('dotenv'),
  errorhandler = require('errorhandler'),
  oauthserver = require('node-oauth2-server');

dotenv.config({ path: './config.env' });
dotenv.load();

var app = express();

// redis setup
var expressRedis = require('express-redis')(process.env.REDIS_PORT, process.env.REDIS_HOST);
app.use(expressRedis);

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.oauth = oauthserver({
  model: require('./model')(expressRedis.client),
  grants: ['password', 'refresh_token'],
  debug: app.get('env') === 'development'
});

app.all('/oauth2/token', app.oauth.grant());

app.get('/', app.oauth.authorise(), function (req, res) {
  res.send('Secret area');
});

app.use('/api/songs', require('./routes/songs'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/chat', require('./routes/chat')); // TMP


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(app.oauth.errorHandler());

// error handlers
if (app.get('env') === 'development') {
  // will print stacktrace
  app.use(errorhandler({ log: true }));
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.status || 500).send(err.message);
  });
}

module.exports = app;
