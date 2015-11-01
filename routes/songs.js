var express = require('express'),
  router = express.Router(),
  pathAPI = require('path'),
  fs = require("fs"),
  multer = require('multer');

var upload = multer({
  dest: 'uploads/',
  fileSize: 30000000, // 30 MB
  files: '25'
});

router.post('/add', upload.array('songs', 25), function (req, res) {
  console.log(req.files);
  for (var i = 0; i < req.files.length; i++) {
    var name = req.body.songName || req.files[i].originalname;
    console.log(name);
    req.db.hset(['songs', req.files[i].filename, name]);
  }
  res.redirect("back");
});

router.get('/list', function (req, res, next) {
  req.db.hgetall('songs', function (err, replys) {
    if (err) {
      return res.sendStatus(500).end();
    }
    var songs = [];
    for (var reply in replys) {
      songs.push({
        id: reply,
        name: replys[reply],
      });
    }
    return res.json(songs);
  });
});

router.delete('/delete/:songId', function (req, res) {
  if (req.params.songId == null)
    return res.sendStatus(400).end();

  req.params.songId = req.params.songId.split(pathAPI.sep)[0]; // Make sure the id is not a path

  var path = __dirname + '/../uploads';
  fs.unlink(path + '/' + req.params.songId, function (err) {
    if (err)
      return res.sendStatus(400).end();
    req.db.hdel('songs', req.params.songId, function (err, reply) {
      if (err)
        return res.sendStatus(500).end();
      return res.sendStatus(204).end();
    });
  });
});

router.delete('/clear', function (req, res) {
  req.db.del('songs', function (err, reply) {
    if (err) {
      return res.sendStatus(500).end();
    }

    var path = __dirname + '/../uploads';
    fs.readdir(path, function (err, files) {
      files.forEach(function (file) {
        fs.unlink(path + '/' + file, function (err) { });
      });
    });
    return res.sendStatus(204).end();
  });
});

module.exports = router;
