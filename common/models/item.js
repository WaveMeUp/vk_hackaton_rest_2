'use strict';

let vk = require('../services/vk');

module.exports = (Item) => {
  let updateItem = (id, req, isUp) => {
    return new Promise((resolve, reject) => {
      let accessToken = req.accessToken;
      // if (!userId) reject();
      Item.findById(id, (err, instance) => {
        if (instance) {
          let rating = instance.rating;
          if (isUp) {
            rating.up.count = rating.up.count + 1;
            if (accessToken) rating.up.users.push(accessToken.userId);
          }
          else {
            rating.down.count = rating.down.count + 1;
            if (accessToken) rating.down.users.push(accessToken.userId);
          }

          instance.updateAttributes({'rating': rating}, (err, instance) => {
            resolve (instance)
          })
        } else reject(err)
      })
    });
  };

  /**
   * Обработка массива с новостями
   */
  Item.afterRemote ('find', (ctx, instance, next) => {
      // console.log(ctx.result);
      // ctx.result = ['kek'];
      for(let i=0; i<ctx.result.length; i++) {
        if (ctx.req.accessToken) {
          let userId = ctx.req.accessToken.userId.toString();
          let liked = ctx.result[i].rating.up.users.map(userId => userId.toString()).indexOf(userId) > -1;
          ctx.result[i].rating.isVoted = liked || ctx.result[i].rating.down.users.map(userId => userId.toString()).indexOf(userId) > -1;
          ctx.result[i].rating.isLiked = liked
        }
        ctx.result[i].rating.up = ctx.result[i].rating.up.count;
        ctx.result[i].rating.down = ctx.result[i].rating.down.count;
      }
      next();
  });


  /**
   * Голосование за
   * @param id
   * @param req
   * @param cb
   */
  Item.voteUp = (id, req, cb) => {
    updateItem(id, req, true)
      .then((item) => {
      item.rating.up = item.rating.up.count;
      item.rating.down = item.rating.down.count;
        cb (null, item.rating);
      }, (err) => {
        let error = new Error('Instance not found');
        error.status = 404;
        cb (error)
      })
  };

  /**
   * Голосование против
   * @param id
   * @param req
   * @param cb
   */
  Item.voteDown = (id, req, cb) => {
    updateItem(id, req, false)
      .then((item) => {
        item.rating.up = item.rating.up.count;
        item.rating.down = item.rating.down.count;
        cb (null, item.rating);
      }, (err) => {
        let error = new Error('Instance not found');
        error.status = 404;
        cb (error)
      })
  };

  /**
   * Отправка поста в VK
   * @param req
   * @param itemId
   * @param cb
   */
  Item.sendToVk = (req, code, access_token, itemId, cb) => {
    console.log('BODY',req.body);
    vk.getAccessToken(code, "http://localhost:3000/api/news/vk/post?itemId="+itemId)
      .then(res => {
        Item.findById(itemId, (err, instance) => {
          if (err) cb (new Error(err));
          else {
            // cb(null, instance);
            vk.postNews(res, instance)
              .then(res => {
                cb (null, res)
              }, err => {
                cb (new Error(err))
              })
            // cb (null, res)
          }
        })
      }, err => cb (new Error(err)))
    /*if (code) {
      console.log(code, itemId);
      vk.getAccessToken(code, "http://localhost:3000/api/news/vk/post?itemId="+itemId)
        .then(res => {
          console.log('got access token', res);
          Item.findById(itemId.toString(), (err, instance) => {
            console.log('find', err, instance);
            if (err) cb (new Error(err));
            else {
              vk.postNews(res, instance)
                .then(res => {
                  cb (null, res)
                }, err => {
                  cb (new Error(err))
                })
            }
          }, err => cb (new Error(err)));
        }, err => {
          cb (new Error(err))
        })
    }*/
    /*Item.findById(itemId, (err, instance) => {
      if (err) cb(new Error(err));
      else {
        vk.postNews(accessToken, instance)
          .then(res => {
            cb (null, res)
          }, err => {
            cb (new Error(err))
          })
      }
    })*/
  };

  Item.remoteMethod(
    'sendToVk', {
      accepts: [{
        arg: 'req',
        type: 'object',
        http: { source: 'req' }
      },
        {
          arg: 'code',
          type: 'string'
        },
        {
          arg: 'access_token',
          type: 'string'
        },
        {
          arg: 'itemId',
          type: 'string'
        }],
      http: {
        path: '/vk/post',
        verb: 'get'
      },
      returns: {
        arg: 'response',
        type: 'object'
      }
    }
  );

  Item.remoteMethod(
    'voteUp', {
      accepts: [{
        arg: 'id',
        type: 'string',
        required: true
      },
        {
          arg: 'req',
          type: 'object',
          http: { source: 'req' }
        }],
      http: {
        path: '/voteUp',
        verb: 'put'
      },
      returns: {
        arg: 'response',
        type: 'number'
      }
    }
  );

  Item.remoteMethod(
    'voteDown', {
      accepts: [{
        arg: 'id',
        type: 'string',
        required: true
      },
        {
          arg: 'req',
          type: 'object',
          http: { source: 'req' }
        }],
      http: {
        path: '/voteDown',
        verb: 'put'
      },
      returns: {
        arg: 'response',
        type: 'number'
      }
    }
  )
};
