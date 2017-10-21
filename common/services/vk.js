'use strict';

let request = require('request');
let config = require('../constants.json');

let getAccessToken = (code, redirect_uri) => {
  return new Promise((resolve, reject) => {
    let query = {
      client_id: config.vk.clientId,
      client_secret: config.vk.clientSecret,
      redirect_uri,
      code
    };
    request({url: 'https://oauth.vk.com/access_token', qs: query}, (err, res, body) => {
      let data = JSON.parse(body);
      if (data.error) reject(data.error_description);
      else resolve(data['access_token'])
    })
  });
};

/**
 * Получаем профиль пользователя из VK
 * @param accessToken
 * @returns {Promise}
 */
module.exports.getUserProfile = (code, redirect_uri) => {
  return new Promise((resolve, reject) => {
    getAccessToken(code, redirect_uri)
    .then(res => {
        request(config.vk.host+'users.get?fields=photo_max,city,verified&access_token='+accessToken, (err, res, body) => {
          let data = JSON.parse(body);
          if (data.error) reject(data.error.error_msg);
          else resolve(data.response[0]);
        })
      }, err => reject(err))
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
  return new Promise((resolve, reject) => {
    request(config.vk.host+'wall.post?owner_id=-'+config.vk.clubId+'&from_group=1&message='+item.description+'&access_token'+AccessToken, (err, res, body) => {
      let data = JSON.parse(body);
      if (data.error) reject(data.error.error_msg);
      else resolve(data.response);
    })
  })
};
