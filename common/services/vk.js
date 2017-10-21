'use strict';

let request = require('request');
let config = require('../constants.json');

/**
 * Получаем профиль пользователя из VK
 * @param AccessToken
 * @returns {Promise}
 */
module.exports.getUserProfile = (AccessToken) => {
  return new Promise((resolve, reject) => {
    request(config.vk.host+'users.get?fields=photo_max,city,verified&access_token='+AccessToken, (err, res, body) => {
      let data = JSON.parse(body);
      if (data.error) reject(data.error.error_msg);
      else resolve(data.response[0]);
    })
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
