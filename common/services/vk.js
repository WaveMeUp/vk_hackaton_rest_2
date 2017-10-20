'use strict';

let request = require('request');
let config = require('../constants.json');

module.exports.getUserProfile = (AccessToken) => {
  return new Promise((resolve, reject) => {
    request(config.vk.host+'users.get?fields=photo_max,city,verified&access_token='+AccessToken, (err, res, body) => {
      let data = JSON.parse(body);
      if (data.error) reject(data.error.error_msg);
      else resolve(data.response[0]);
    })
  })
}
