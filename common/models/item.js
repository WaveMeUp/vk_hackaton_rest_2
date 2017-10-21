'use strict';

let vk = require('../services/vk');

module.exports = (Item) => {
  let updateItem = (id, req, isUp) => {
    return new Promise((resolve, reject) => {
      let userId = req.accessToken.userId;
      if (!userId) reject();
      Item.findById(id, (err, instance) => {
        if (instance) {
          let rating = instance.rating;
          if (isUp) {
            rating.up.count = rating.up.count + 1;
            rating.up.users.push(userId);
          }
          else {
            rating.down.count = rating.down.count + 1;
            rating.up.users.push(userId);
          }

          instance.updateAttributes({'rating': rating}, (err, instance) => {
            resolve (instance)
          })
        } else reject()
      })
    });
  };

  /**
   * Обработка массива с новостями
   */
  Item.afterRemote ('find', (ctx, instance, next) => {
    if(ctx.req.accessToken) {
      let userId = ctx.req.accessToken.userId.toString();
      console.log(userId);
      // console.log(ctx.result);
      // ctx.result = ['kek'];
      for(let i=0; i<ctx.result.length; i++) {
        let liked = ctx.result[i].rating.up.users.map(userId => userId.toString()).indexOf(userId) > -1;
        ctx.result[i].rating.isVoted = liked || ctx.result[i].rating.down.users.map(userId => userId.toString()).indexOf(userId) > -1;
        ctx.result[i].rating.isLiked = liked
        console.log(ctx.result[i].rating);
      }
      next();
    } else next()
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
  Item.sendToVk = (req, itemId, cb) => {
    cb (null, req.url);
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
      accepts: [
        {
          arg: 'req',
          type: 'object',
          http: { source: 'req' }
        },
        {
          arg: 'itemId',
          type: 'string',
          required: true
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
