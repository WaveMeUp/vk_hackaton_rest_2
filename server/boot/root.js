'use strict';

module.exports = (server) => {
  // Install a `/` route that returns server status
  /*var router = server.loopback.Router();
  router.get('/', server.loopback.status());
  server.use(router);*/

  server.dataSources.media.connector.getFilename = (file, req, res) => {
    let origFilename = file.name.replace(/\s/g, '');
    // optimisticly get the extension
    let parts = origFilename.split('.'),
      extension = parts[parts.length-1];

    // Using a local timestamp + user id in the filename (you might want to change this)
    return (new Date()).getTime()+'_'+parts[parts.length-2]+'.'+extension;
  };
};
