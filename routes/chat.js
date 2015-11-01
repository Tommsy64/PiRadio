var express = require('express'),
  router = express.Router();

router.post('/add', function (req, res) {
  req.db.lpush('chat', req.body.chatItem, function (err, songName) {
    if (err) {
      console.log(err);
      return res.sendStatus(500).end();
    }
    console.log(req.body.chatItem);
    return res.sendStatus(204).end();
  });
});

router.get('/list', function (req, res, next) {
  req.db.lrange('chat', 0, -1, function (err, reply) {
    if (err)
      return res.sendStatus(500).end();
    return res.json(reply);
  });
});

router.delete('/clear', function (req, res) {
  req.db.del('chat', function (err, reply) {
    return res.sendStatus(204).end();
  });
});

module.exports = router;
