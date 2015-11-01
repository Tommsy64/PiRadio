var BullQueue = require('bull');
var exec = require('child_process').exec;
var songQueue = BullQueue('audio transmission', process.env.REDIS_PORT, process.env.REDIS_HOST);

function playSong(job, done) {
  exec('sudo ' + __dirname + '/fm_transmitter/fm_transmitter ' + __dirname + '/uploads/' + job.data.songId
     + ' ' + job.data.frequency,
    function (error, stdout, stderr) {
    console.log(stdout);
    if (error !== null) {
      console.log('stderr: ' + stderr);
      return done(Error('Exec error: ' + error));
    }
    done();
  });
}

songQueue.process(playSong);

// songQueue.getJob(jobId).then(function(job) { return job.remove(); })

module.exports = function () {
  return {
    add : function (songId, songName, frequency) {
      songQueue.add({
        songId : songId,
        songName : songName,
        frequency : frequency || 102
      });
    },
    clear : function () {
      songQueue.empty();
    },
    getQueued : function () {
      return songQueue.getWaiting();
    },
    getActive : function () {
      return songQueue.getActive();
    },
    getSong : function (id) {
      return songQueue.getJob(id);
    },
  };
};
