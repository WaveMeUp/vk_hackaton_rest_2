'use strict';

let vk = require('../services/vk');

module.exports = (User) => {
  User.media = (cb) => {
    let response = 'Media method here!';

    cb(null, response);
  };

  User.auth = (data, cb) => {
    vk.getUserProfile(data)
      .then((userProfile) => {
        cb (null, userProfile)
      }, err => {
        let error = new Error(err);
        cb (error);
      })

  };

  User.updateImage = (userId, imgName, cb) => {
    User.findById(userId, (err, instance) => {
      if (instance) {
        instance.updateAttribute('imgId', imgName, (err, instance) => {
          cb(null, true);
        });
      } else {
        let error = new Error('User not found');
        error.status = 404;
        cb(error);
      }
    });
  };

  User.remoteMethod(
    'updateImage', {
      accepts: [{
        arg: 'userId',
        type: 'string',
        required: true
      },
        {
          arg: 'imgName',
          type: 'string',
          required: true
        }],
      http: {
        path: '/updateImage',
        verb: 'post'
      },
      returns: {
        arg: 'response',
        type: 'string'
      }
    }
  );

  User.remoteMethod(
    'media', {
      http: {
        path: '/media',
        verb: 'post'
      },
      returns: {
        arg: 'response',
        type: 'string'
      }
    }
  );

  User.remoteMethod(
    'auth', {
      accepts: {
        arg: 'data',
        type: 'string',
        required: true
      },
      http: {
        path: '/auth',
        verb: 'post'
      },
      returns: {
        arg: 'userData',
        type: 'string'
      }
    }
  )
};
