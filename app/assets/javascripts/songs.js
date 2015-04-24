var posPlayingSong = 0;
var playingSong = '';

// PLAY A SONG
$('#player-list').on('click', '.songs', function(e) {
  e.preventDefault();

  $('#radio-playing').text('My Playlist')
  radioOrSongs = 'songs';
  posPlayingSong = $(this).attr('count');
  var soundcloudID = $(this).attr('sc-song-id');
  playSong(soundcloudID);
});

// PLAYS ONLY ONE SONG
function playSong(soundcloudID) {
  initialize(CLIENT_ID);
  stopMusic();
  playingSong = soundcloudID;
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

// SEARCH WITH AUTOCOMPLETE
$('#search-field').on('keyup', function() {
  var q = $(this).val();

  initialize(CLIENT_ID);

  SC.get('/tracks', { state: 'finished', sharing: 'public', streamable: true, q: q, limit: 5 }, function(songs) {
    $('#autocomplete').empty();
    $('#autocomplete-container').show();
    for(var i = 0; i < songs.length; i++) {
      $('#autocomplete').append('<li><a href="#" class="song-title" id="'+ songs[i].id +'">' + songs[i].title + '</a></li>');
    }
  });
});

$('#autocomplete').on('click', '.song-title', function(e) {
  e.preventDefault();

  var songID = $(this).attr('id');
  SC.get('/tracks/' + songID, function(song) {
    $('#autocomplete-container').fadeOut();
    $('#search-field').val('');
    addSong(song);
  });
});

$('#search-field').focusout(function() {
  $('#autocomplete-container').fadeOut();
  $('#search-field').val('');
});

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
    var i = playList.length - 1;
    var songHTML = [];
    songHTML.push('<li class="row list-element" id="list-element-' + song.sc_song_id + '">');
    songHTML.push('<p class="small-11 columns playlist-element">');
    var min = Math.floor(song.duration / 60000);
    var sec = Math.floor(song.duration % 60);
    min.toString().length === 1 ? sMinutes = '0' + min : sMinutes = min;
    sec.toString().length === 1 ? sSeconds = '0' + sec : sSeconds = sec;
    songHTML.push('<a class="songs song-' + i + '" count="' + i + '" sc-song-id="' + song.sc_song_id + '" href="#">' + song.title + ' (' + sMinutes + ':' + sSeconds + ')</a></p>');
    songHTML.push('<p class="small-1 columns playlist-element">');
    songHTML.push('<a class="delete-song" id="' + song.id + '" count="' + i + '" href="#">X</a></p></li>');
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
  var sMinutes;
  var sSeconds;
  for(var i = 0; i < songs.length; i++) {
    var p = '';
    parseInt(playingSong) === songs[i].sc_song_id ? p = 'playing-song' : p = '';
    songHTML.push('<li class="row list-element ' + p + '" id="list-element-' + songs[i].sc_song_id + '">');
    songHTML.push('<p class="small-11 columns playlist-element">');
    var min = Math.floor(songs[i].duration / 60000);
    var sec = Math.floor(songs[i].duration % 60);
    min.toString().length === 1 ? sMinutes = '0' + min : sMinutes = min;
    sec.toString().length === 1 ? sSeconds = '0' + sec : sSeconds = sec;
    songHTML.push('<a class="songs song-' + i + '" count="' + i + '" sc-song-id="' + songs[i].sc_song_id + '" href="#">' + songs[i].title + ' (' + sMinutes + ':' + sSeconds + ')</a></p>');
    songHTML.push('<p class="small-1 columns playlist-element">');
    songHTML.push('<a class="delete-song" id="' + songs[i].id + '" count="' + i + '" href="#">X</a></p></li>');
  }
  songHTML.push('</ol>');
  $('#player-list').empty();
  toggleSearchForm('songs');
  $('#player-list').append(songHTML.join(''));
}
