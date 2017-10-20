'use strict';

module.exports = function(Item) {
  let updateItem = (id, isUp) => {
    return new Promise((resolve, reject) => {
      Item.findById(id, (err, instance) => {
        if (instance) {
          let rating = instance.rating;
          if (isUp) rating.up = rating.up + 1;
          else rating.down = rating.down + 1;
          instance.updateAttribute('rating', rating, (err, instance) => {
            resolve (instance)
          })
        } else reject()
      })
    });
  };

  Item.voteUp = (id, cb) => {
    updateItem(id, true)
      .then((item) => {
        cb (null, item.rating);
      }, (err) => {
        let error = new Error('Instance not found');
        error.status = 404;
        cb (error)
      })
  };

  Item.voteDown = (id, cb) => {
    updateItem(id, false)
      .then((item) => {
        cb (null, item.rating);
      }, (err) => {
        let error = new Error('Instance not found');
        error.status = 404;
        cb (error)
      })
  };

  Item.remoteMethod(
    'voteUp', {
      accepts: {
        arg: 'id',
        type: 'string',
        required: true
      },
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
      accepts: {
        arg: 'id',
        type: 'string',
        required: true
      },
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
