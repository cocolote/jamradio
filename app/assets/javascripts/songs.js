var posPlayingSong = 0;
var playingSong;
var mySongs;

// PLAY A SONG
$('#player-list').on('click', '.songslist-element', function(e) {
  e.preventDefault();

  radioName = '';
  jamPlayingSong = null;
  currentTrack = null;
  radioOrSongs = 'songs';
  playList = mySongs;
  posPlayingSong = $(this).children('.songs').attr('count');
  var soundcloudID = $(this).children('.songs').attr('sc-song-id');
  getSong(soundcloudID, 'myMusic');
});

// PLAYS ONLY ONE SONG
function getSong(soundcloudID, from) {
  initialize(CLIENT_ID);
  stopMusic();
  SC.get('/tracks/' + soundcloudID, function(track) {
    if (from == 'myMusic') {
      playingSong = track;
    } else {
      jamPlayingSong = track;
    }
    artworkTitle(track);
    $('#song-title').replaceWith('<p id="song-title"><marquee behavior="scroll" direction="left">' + track.title + '</marquee></p>');
    playSong(track);
  });
}

function playSong(track) {
  SC.stream('/tracks/' + track.id, { flashVersion: 9, autoPlay: true, multiShot: false, onfinish: function() {
    stopMusic();
    getNextSong(); } }, function(track) {
      songController(track);
  });
}

// MY PLAYLIST LOOP
function getNextSong() {
  if(posPlayingSong < playList.length) {
    posPlayingSong++;
    getSong(playList[posPlayingSong].sc_song_id);
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

  var songUrl = $(this).attr('href');
  var deleteSong = $.ajax({
    url: songUrl,
    type: 'DELETE',
    dataType: 'json'
  });
  deleteSong.done(function(result) {
    var getSongs = $.ajax({
      url: '/songs',
      type: 'GET',
      dataType: 'json'
    });
    getSongs.done(function(result) {
      playList = result.songs;
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
  mySongs = songs;
  songHTML.push('<div id="title-container"><h2 id="title" class="info-songs-topbar">My Songs</h2>');
  songHTML.push('<div id="song-info-topbar-container" class="row info-songs-topbar">');
  songHTML.push('<div id="image-container" class="small-2 columns">');
  songHTML.push('<img id="artwork-url" src="#" alt="artwork"></div>');
  songHTML.push('<div id="info-container" class="small-10 columns">');
  songHTML.push('<h5 id="song-title-topbar"></h5>');
  songHTML.push('<h6 id="artis-name-topbar" class="artist-duration-topbar"></h6>');
  songHTML.push('<h6 id="duration-song-topbar" class="artist-duration-topbar"></h6></div></div></div>');
  songHTML.push('<ol id="songs-playlist">');

  for(var i = 0; i < songs.length; i++) {
    var duration = formatTime(songs[i]);
    var p;
    var icon;
    if (playingSong && playingSong.id === songs[i].sc_song_id) {
      p = 'now-playing';
      icon = "/assets/pausebutton.png";
      posPlayingSong = i;
    } else {
      p = '';
      icon = "/assets/playbutton.png";
    };
    songHTML.push('<li class="row list-element ' + p + '" id="list-element-' + songs[i].sc_song_id + '">');
    songHTML.push('<div class="small-1 column play-pause-container">');
    songHTML.push('<img src="' + icon + '" alt="Playbutton" id="play-pause-' + songs[i].sc_song_id + '"></div>');
    songHTML.push('<div class="small-10 columns songslist-element">');
    songHTML.push('<a class="songs song-' + i + '" count="' + i + '" sc-song-id="'
+ songs[i].sc_song_id + '" href="#">' + songs[i].title + ' (' + duration + ')</a></div>');
    songHTML.push('<div class="small-1 columns delete">');
    songHTML.push('<a class="delete-song" count="' + i + '" href="/songs/' + songs[i].id + '">');
    songHTML.push('<img src="/assets/delete.png" alt="Delete"></a></div></li>');
  }
  songHTML.push('</ol>');
  $('#player-list').empty();
  toggleSearchForm('songs');
  $('#player-list').append(songHTML.join(''));

  if (playingSong) {
    artworkTitle(playingSong);
  }
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
