'use strict';

let request = require('request');
let config = require('../constants.json');

module.exports.getAccessToken = (code, redirect_uri) => {
  return new Promise((resolve, reject) => {
    let qs = {
      client_id: config.vk.clientId,
      client_secret: config.vk.clientSecret,
      redirect_uri,
      code
    };
    console.log(qs);
    request({url: 'https://oauth.vk.com/access_token', qs}, (err, res, body) => {
      let data = JSON.parse(body);
      if (data.error) reject(data.error_description);
      else resolve(data['access_token'])
    })
  });
};

/**
 * Получаем профиль пользователя VK
 * @param AccessToken
 * @param code
 * @param redirect_uri
 * @returns {*}
 */
module.exports.getUserProfile = (AccessToken, code, redirect_uri) => {
  let getProfile = (access_token) => {
    return new Promise((resolve, reject) => {
      let qs = {
        fields: 'photo_max,city,verified',
        access_token
      };
      request({url: config.vk.host+'users.get', qs}, (err, res, body) => {
        let data = JSON.parse(body);
        if (data.error) reject(data.error.error_msg);
        else {
          data.response[0]['vk_access_token'] = access_token;
          resolve(data.response[0]);
        }
      })
    })
  };

  return new Promise((resolve, reject) => {
    if (AccessToken) getProfile(AccessToken).then(res => resolve(res), err => reject(err));
    else {
      module.exports.getAccessToken(code, redirect_uri)
        .then(accessToken => {
          getProfile(accessToken)
            .then(res => resolve(res), err => reject(err))
        }, err => reject(err))
    }
    }, err => {
      reject(err)
    })
};

/**
 * Публикуем пост в группу
 * @param AccessToken
 * @param item
 */
module.exports.postNews = (AccessToken, item) => {
  console.log(AccessToken);
  return new Promise((resolve, reject) => {
    request(config.vk.host+'wall.post?owner_id=-'+config.vk.clubId+'&from_group=1&message='+item.description+'&access_token='+AccessToken, (err, res, body) => {
      let data = JSON.parse(body);
      console.log('data', data);
      if (data.error) reject(data.error.error_msg);
      else resolve(data.response);
    })
  })
};
