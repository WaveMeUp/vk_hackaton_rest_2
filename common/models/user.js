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
        let user = new User({
          imgSrc: userProfile.photo_max,
          username: userProfile.uid,
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          password: '123qweasd',
          email: 'wavemeup1@gmail.com'
        });
        User.findOrCreate({ username: userProfile.uid }, user, (err, instance, created) => {
          // console.log(err, instance, created);
          if (err) cb (new Error(err));
          else {
            User.login({ username: userProfile.uid, password: '123qweasd'}, (err, data) => {
              if (err) cb (new Error(err));
              else {
                userProfile.userId = instance.id;
                userProfile.accessToken = data.id;
                cb (null, userProfile);
              }
            })
          }
        });
      }, err => {
        let error = new Error(err);
        cb (error);
      })

  };

  User.updateImage = (userId, imgName, cb) => {
    User.findById(userId, (err, instance) => {
      if (instance) {
        instance.updateAttribute('imgSrc', imgName, (err, instance) => {
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
        arg: 'response',
        type: 'string'
      }
    }
  )
};
