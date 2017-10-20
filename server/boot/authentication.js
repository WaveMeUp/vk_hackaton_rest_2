'use strict';

module.exports = (server) => {
  // enable authentication
  server.enableAuth({dataSource: 'mongo'});

  let router = server.loopback.Router();
};
