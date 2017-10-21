'use strict';

let vk = require('../services/vk');

module.exports = (User) => {
  User.media = (cb) => {
    let response = 'Media method here!';

    cb(null, response);
  };

  let auth = (accessToken, code, redirect_uri) => {
    return new Promise((resolve, reject) => {
      vk.getUserProfile(accessToken, code, redirect_uri)
        .then((userProfile) => {
          let user = new User({
            imgSrc: userProfile.photo_max,
            username: userProfile.uid,
            first_name: userProfile.first_name,
            last_name: userProfile.last_name,
            password: '123qweasd',
            email: userProfile.uid + '@vk.com'
          });
          User.findOrCreate({where: {username: userProfile.uid.toString() }}, user, (err, instance, created) => {
            if (err) reject (new Error(err));
            else {
              User.login({ username: userProfile.uid.toString(), password: '123qweasd'}, (err, data) => {
                if (err) reject (new Error(err));
                else {
                  instance.accessToken = data.id;
                  resolve (instance);
                }
              })
            }
          });
        }, err => {
          reject (new Error(err));
        })
    })
  };

  User.authAccessToken = (accessToken, cb) => {
    auth(accessToken, null, null)
      .then(res => {
        cb (null, res);
      }, err => {
        cb (err)
      })
  };

  User.authCode = (code, redirect_uri, cb) => {
    auth(null, code, redirect_uri)
      .then(res => {
        cb (res);
      }, err => {
        cb (err)
      })

  };

  /**
   * Задаём кошелек пользователя
   * @param userId
   * @param value
   * @param cb
   */
  User.setWallet = (userId, value, cb) => {
    User.findById(userId, (err, instance) => {
      if (instance) {
        instance.updateAttribute('btc_wallet', value, (err, instance) => {
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
    'setWallet', {
      accepts: [
        {
          arg: 'userId',
          type: 'string',
          required: true
        },
        {
          arg: 'value',
          type: 'string',
          required: true
        }],
      http: {
        path: '/setWallet',
        verb: 'post'
      },
      returns: {
        arg: 'response',
        type: 'string'
      }
  }
  )

/*  User.updateImage = (userId, imgName, cb) => {
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
  );*/

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
    'authCode', {
      accepts: [{
        arg: 'code',
        type: 'string',
        required: true
      },
        {
        arg: 'redirect_uri',
        type: 'string',
        required: true
      }],
      http: {
        path: '/auth/code',
        verb: 'post'
      },
      returns: {
        arg: 'response',
        type: 'string'
      }
    }
  )

  User.remoteMethod(
    'authAccessToken', {
      accepts: {
        arg: 'access_token',
        type: 'string',
        required: true
      },
      http: {
        path: '/auth/token',
        verb: 'post'
      },
      returns: {
        arg: 'response',
        type: 'string'
      }
    }
  )
};
