var express = require('express');
var router = express.Router();
var fs = require("fs");
var multer = require('multer');
var upload = multer({
    dest : 'uploads/',
    fileSize : 30000000, // 30 MB
    files : '25'
  });

router.get('/', function (req, res, next) {
  res.send('Songs');
});

router.post('/add', upload.array('songs', 25), function (req, res) {
  console.log(req.files);
  for (i = 0; i < req.files.length; i++) {
    req.db.hset(['songs', req.files[i].filename, req.files[i].originalname]);
  }
  res.redirect("back");
});

router.get('/list', function (req, res, next) {
  req.db.hgetall('songs', function (err, reply) {
    if (err) {
      return res.sendStatus(500).end();
    }

    return res.json(reply);
  });
});

router.delete('/delete/:song', function (req, res) {
  req.db.lrem('songs', -1, req.params.song, function (err, reply) {
    if (err) {
      return res.sendStatus(500).end();
    }

    return res.sendStatus(204).end();
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
        fs.unlink(path + '/' + file, function (err) {});
      });
    });
    return res.sendStatus(204).end();
  });
});

module.exports = router;
