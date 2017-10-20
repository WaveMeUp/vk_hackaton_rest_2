'use strict';

let request = require('request');
let config = require('../constants.json');

module.exports.getUserProfile = (AccessToken) => {
  return new Promise((resolve, reject) => {
    request(config.vk.host+'users.get?fields=photo_max,city,verified&access_token='+AccessToken, (err, res, body) => {
      resolve(JSON.parse(body).response[0]);
    })
  })
}
