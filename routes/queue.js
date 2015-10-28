var express = require('express');
var router = express.Router();
var fs = require('fs');
var songQueue = require('../queue-processor')();

router.get('/', function (req, res, next) {
  res.send('Songs');
});

router.post('/add', function (req, res) {
  req.db.hexists('songs', req.body.songId, function (err, reply) {
    if (err)
      return res.sendStatus(500).end();
    if (reply !== 1 || req.body.frequency > 109 || req.body.frequency < 88)
      return res.sendStatus(400).end();
    console.log(req.body.songId + ' ADDED!!');
    songQueue.add(req.body.songId);
    return res.sendStatus(204).end();
  });
});

router.get('/list', function (req, res, next) {
  songQueue.getQueued().then(function (jobs) {
    var ids = [];
    for (var i = 0; i < jobs.length; i++) {
      ids[i] = jobs[i].jobId;
    }
    return res.json(ids);
  });
});

router.delete ('/remove/:song', function (req, res) {
  req.db.lrem('queued_songs', -1, req.params.song, function (err, reply) {
    if (err) {
      return res.sendStatus(500).end();
    }

    return res.sendStatus(204).end();
  });
});

router.delete ('/clear', function (req, res) {
  songQueue.clear();
  return res.sendStatus(204).end();
});

module.exports = router;
