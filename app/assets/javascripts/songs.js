var posPlayingSong = 0;
var playList = [];

// PLAY A SONG
$('#player-list').on('click', '.songs', function(e) {
  e.preventDefault();

  radioOrSongs = 'songs';
  posPlayingSong = $(this).attr('count');
  var soundcloudID = $(this).attr('sc-song-id');
  playSong(soundcloudID);
});

// PLAYS ONLY ONE SONG
function playSong(soundcloudID) {
  initialize(CLIENT_ID);
  stopMusic();
  SC.get('/tracks/' + soundcloudID, function(track) {
    $('#song-title').replaceWith('<p id="song-title"><marquee behavior="scroll" direction="left">' + track.title + '</marquee></p>');
    SC.stream('/tracks/' + track.id, { flashVersion: 9, autoPlay: true, multiShot: false, onfinish: function() {
      stopMusic();
      getNextSong(); } }, function(track) {
        songController(track);
    });
  });
}

// MY PLAYLIST LOOP
function getNextSong() {
  if(posPlayingSong < playList.length) {
    posPlayingSong++;
    playSong(playList[posPlayingSong].sc_song_id);
  } else {
    stopMusic();
  }
}

// ADD SONG
function addSong(song) {
  var likeSong = $.ajax({
    url: '/songs',
    type: 'POST',
    data: { song: { sc_song_id: song.id, title: song.title, duration: song.duration } },
    dataType: 'json'
    });
  likeSong.done(function(song) {
    playList.push(song);
    var songHTML = [];
    var i = playList.length - 1;
    songHTML.push('<div class="list-element" id="list-element-' + song.id + '"><li>');
    songHTML.push('<p class="playlist-element">');
    songHTML.push('<a class="songs song-' + i + '" count="' + i + '" sc-song-id="' + song.sc_song_id + '" href="#">' + song.title + ' (' + song.duration + ')</a></p>');
    songHTML.push('<p class="playlist-element-right">');
    songHTML.push('<a class="delete-song" id="' + song.id + '" count="' + i + ' href="#">X</a></p></li></div>');
    $('#songs-play-list').append(songHTML.join(''));
    alert("Song was add to your play list");
  });
  likeSong.fail(function(messages) {
    alert(messages.responseJSON.errors[0]);
  });
}

// DELETE SONG
$('#player-list').on('click', '.delete-song', function(e) {
  e.preventDefault();

  var radioID = $(this).attr('id');
  var deleteSong = $.ajax({
    url: '/songs/' + radioID,
    type: 'DELETE',
    dataType: 'json'
    });
  deleteSong.done(function(result) {
    var deleteSong = $('#' + result.id).attr('count');
    $('#list-element-' + result.id).remove();
    playList.splice(deleteSong, 1);
    createSongsList(playList);
    posPlayingSong--;
    alert(result.message);
  });
  deleteSong.fail(function() {
    alert('Something went wrong!');
  });
});

function createSongsList(songs) {
  var songHTML = [];
  songHTML.push('<ol id="songs-play-list">');
  for(var i = 0; i < songs.length; i++) {
    songHTML.push('<div class="list-element" id="list-element-' + songs[i].id + '"><li>');
    songHTML.push('<p class="playlist-element">');
    songHTML.push('<a class="songs song-' + i + '" count="' + i + '" sc-song-id="' + songs[i].sc_song_id + '" href="#">' + songs[i].title + ' (' + songs[i].duration + ')</a></p>');
    songHTML.push('<p class="playlist-element-right">');
    songHTML.push('<a class="delete-song" id="' + songs[i].id + '" count="' + i + '" href="#">X</a></p></li></div>');
  }
  songHTML.push('</ol>');
  $('#player-list').empty();
  toggleSearchForm("songs");
  $('#player-list').append(songHTML.join(''));
}
