$(document).ready(function() {
  bindEnterKey('#songInput');
  function addSong() {
    var songId = $('#songInput').val();
    if ($.trim(songId).length = 0)
        return;
    $.post('/queue/add', { songId: songId }, function() {
      updateLists();
    });
    $('#songInput').val(''); // Clear textbox
  }

  $('#songInput').bind('enterKey', addSong);

  $('#addSong').click(addSong);

  $('#refresh').click(function() {
    updateLists();
  });

  $("#clearQueue").click(function() {
    $.ajax({
        url: '/queue/clear',
        type: 'DELETE',
        success: function(result) {
          updateLists();
        }
    });
  });

  $("#deleteSongs").click(function() {
    $.ajax({
        url: '/songs/clear',
        type: 'DELETE',
        success: function(result) {
          updateLists();
        }
    });
  });
  updateLists();
  setInterval(updateLists, 2000);
});

function bindEnterKey(element) {
  $(element).keyup(function(e){
    if(e.keyCode == 13)
    {
      $(this).trigger("enterKey");
    }
  });
}

function updateLists() {
  $.get( "/songs/list", function( data ) {
    var list = "";
    var i = 0;
    for (var key in data) {
      var song = data[key];
      list = list + "<br>\n" + ++i + ". " + song + "\n";
    }
    $( "#songList" ).html(list);
  });

  $.get( "/queue/list", function( data ) {
    var list = "";
    data.reverse();
    for (var i = 0; i < data.length; i++) {
      list = list + "<br>\n" + (i + 1) + ". " + data[i] + "\n";
    }
    $( "#queueList" ).html(list);
  });
}
