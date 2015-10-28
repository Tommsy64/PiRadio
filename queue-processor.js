var BullQueue = require('bull');
var exec = require('child_process').exec;

var songQueue = BullQueue('audio transmission', 6379, '127.0.0.1');

function playSong(job, done) {
  exec('sudo ' + __dirname + '/fm_transmitter/fm_transmitter ' + __dirname + '/uploads/' + job.data.songId
     + ' ' + job.data.frequency,
    function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      return done(Error('Exec error: ' + error));
    }
    done();
  });
}

songQueue.process(playSong);

// songQueue.getJob(jobId).then(function(job) { return job.remove(); })

module.exports = function () {
  return {
    add : function (songId, frequency) {
      songQueue.add({
        songId : songId,
        frequency : frequency || 100
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
  };
};
