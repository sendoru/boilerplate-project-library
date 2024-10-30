/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

// mongodb object id
const ObjectId = require('mongodb').ObjectId;

module.exports = function (app, collection) {

  app.route('/api/books')
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      collection.find().toArray((err, data) => {
        if (err) {
          console.error(err);
        } else {
          data.forEach(book => { book.commentcount = book.comments.length });
          res.json(data);
        }
      });
    })

    .post(function (req, res) {
      let title = req.body.title;
      if (!title) {
        return res.send('missing required field title');
      }
      //response will contain new book object including atleast _id and title
      collection.insertOne({ title: title, comments: [] }, (err, data) => {
        if (err) {
          console.error(err);
        } else {
          const res_body = data.ops[0];
          res_body.commentcount = res_body.comments.length;
          res.json(res_body);
        }
      });
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      collection.deleteMany({}, (err, data) => {
        if (err) {
          console.error(err);
        } else {
          res.send('complete delete successful');
        }
      });
    });

  app.route('/api/books/:id')
    .get(function (req, res) {
      let bookid = req.params.id;
      if (ObjectId.isValid(bookid) === false) {
        return res.send('no book exists');
      }
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      collection.find(
        { _id: ObjectId(bookid) }
      ).toArray((err, data) => {
        if (err) {
          console.error(err);
        } else {
          if (data.length === 0) {
            return res.send('no book exists');
          }
          data[0].commentcount = data[0].comments.length;
          res.json(data[0]);
        }
      });
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (!bookid) {
        return res.send('missing required field _id');
      }
      if (!comment) {
        return res.send('missing required field comment');
      }
      if (ObjectId.isValid(bookid) === false) {
        return res.send('no book exists');
      }
      //json res format same as .get
      collection.updateOne(
        { _id: ObjectId(bookid) },
        { $push: { comments: comment } },
        (err, data) => {
          if (err) {
            console.error(err);
          } else {
            if (data.modifiedCount === 0) {
              return res.send('no book exists');
            }
            collection.findOne(
              { _id: ObjectId(bookid) },
              (err, data) => {
                if (err) {
                  console.error(err);
                } else {
                  res.json(data);
                }
              }
            )
          }
        }
      )
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      if (ObjectId.isValid(bookid) === false) {
        return res.send('no book exists');
      }
      //if successful response will be 'delete successful'
      collection.deleteOne(
        { _id: ObjectId(bookid) },
        (err, data) => {
          if (err) {
            console.error(err);
          } else {
            if (data.deletedCount === 0) {
              return res.send('no book exists');
            }
            res.send('delete successful');
          }
        }
      );
    });
};
