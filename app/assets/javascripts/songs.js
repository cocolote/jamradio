var posPlayingSong = 0;
var playingSong = '';

// PLAY A SONG
$('#player-list').on('click', '.songs', function(e) {
  e.preventDefault();

  radioName= '';
  $('.list-element').removeClass('now-playing');
  $(this).addClass('now-playing');
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
  var newSong = $.ajax({
    url: '/songs',
    type: 'POST',
    data: { song: { sc_song_id: song.id, title: song.title, duration: song.duration } },
    dataType: 'json'
  });
  newSong.done(function(song) {
    var getSongs = $.ajax({
      url: '/songs',
      type: 'GET',
      dataType: 'json'
    });
    getSongs.done(function(result) {
      createSongsList(result.songs);
    });
    alert("Song was add to your play list");
  });
  newSong.fail(function(messages) {
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
    $('#list-element-' + result.id).remove();
    posPlayingSong--;
    var getSongs = $.ajax({
      url: '/songs',
      type: 'GET',
      dataType: 'json'
    });
    getSongs.done(function(result) {
      createSongsList(result.songs);
    });
    alert(result.message);
  });
  deleteSong.fail(function() {
    alert('Something went wrong!');
  });
});

function createSongsList(songs) {
  var songHTML = [];
  playList = [];
  songHTML.push('<ol id="songs-play-list">');
  for(var i = 0; i < songs.length; i++) {
    playList.push({ sc_song_id: songs[i].sc_song_id });
    var duration = formatTime(songs[i]);
    var p = '';
    parseInt(playingSong) === songs[i].sc_song_id ? p = 'now-playing' : p = '';
    songHTML.push('<li class="row list-element ' + p + '" id="list-element-' + songs[i].sc_song_id + '">');
    songHTML.push('<div class="small-1 column play-pause-container">');
    songHTML.push('<img class="play-pause-btn" src="/assets/playbutton.png" alt="Playbutton"></div>');
    songHTML.push('<div class="small-10 columns playlist-element">');
    songHTML.push('<a class="songs song-' + i + '" count="' + i + '" sc-song-id="' + songs[i].sc_song_id + '" href="#">' + songs[i].title + ' (' + duration + ')</a></div>');
    songHTML.push('<div class="small-1 columns playlist-element delete">');
    songHTML.push('<a class="delete-song" id="' + songs[i].id + '" count="' + i + '" href="#">');
    songHTML.push('<img src="/assets/delete.png" alt="Delete"></a></div></li>');
  }
  songHTML.push('</ol>');
  $('#player-list').empty();
  toggleSearchForm('songs');
  $('#player-list').append(songHTML.join(''));
}

function formatTime(song) {
  var sMinutes;
  var sSeconds;
  var min = Math.floor(song.duration / 60000);
  var sec = Math.floor(song.duration % 60);
  min.toString().length === 1 ? sMinutes = '0' + min : sMinutes = min;
  sec.toString().length === 1 ? sSeconds = '0' + sec : sSeconds = sec;
  return sMinutes + ':' + sSeconds;
}
