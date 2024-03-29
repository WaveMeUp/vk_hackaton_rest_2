'use strict';

let loopback = require('loopback');
let boot = require('loopback-boot');

let app = module.exports = loopback();

let frameguard = require('frameguard');

app.use(frameguard({
  action: 'allow-from',
  domain: 'https://vk.com'
}));


app.start = () => {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    let baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      let explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

app.use(loopback.token({
  model: app.models.AccessToken
}));

app.use(function (req, res, next) {
  if ( ! req.accessToken) return next();
  app.models.User.findById(req.accessToken.userId, function(err, user) {
    if (err) return next(err);
    if ( ! user) return next(new Error('No user with this access token was found.'));
    res.locals.currentUser = user;
    next();
  });
});

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, (err) => {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

// TODO подключить storage, сделать методы для загрузки файлов и видео


