var express = require('express'),
  router = express.Router(),
  fs = require('fs'),
  songQueue = require('../queue-processor')();

router.get('/', function (req, res, next) {
  res.send('Songs');
});

router.post('/add', function (req, res) {
  req.db.hget('songs', req.body.songId, function (err, songName) {
    if (err)
      return res.sendStatus(500).end();
    if (songName == null || req.body.frequency > 109 || req.body.frequency < 88)
      return res.sendStatus(400).end();
    console.log(req.body.songId + ' ADDED!!');
    songQueue.add(req.body.songId, songName, req.body.frequency);
    return res.sendStatus(204).end();
  });
});

router.get('/list', function (req, res, next) {
  songQueue.getQueued().then(function (jobs) {
    var songs = {};
    for (var i = 0; i < jobs.length; i++) {
      songs[jobs[i].jobId] = {
        songId: jobs[i].data.songId,
        songName: jobs[i].data.songName
      };
    }
    return res.json(songs);
  });
});

router.delete('/remove/:id([0-9]+)', function (req, res) {
  songQueue.getSong(req.params.id).then(function (job) {
    if (job == null)
      return res.sendStatus(400).end();
    job.remove();
    return res.sendStatus(204).end();
  });
});

router.delete('/clear', function (req, res) {
  songQueue.clear();
  return res.sendStatus(204).end();
});

module.exports = router;
