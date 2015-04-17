// GLOBAL VARIABLES
var CLIENT_ID = '271b061d5469839b06f3e95da05b822c';
var currentTracks;
var radioName;
var radioCategory;
var currentTrack;
var quantSongs;
var posPlayingSong;

// ##### HELPER FUNCTIONS #####
// Toggle play and pause buttons
function toggleButton(track) {
  if (track.paused) {
    $('#play-pause-btn').attr('src', '/assets/play.png');
  } else {
    $('#play-pause-btn').attr('src', '/assets/pause.png');
  }
}

// Initialize the user on soundcloud
function initialize(client) {
  SC.initialize({
    client_id: client
  });
}

// Stops and destroy the tracks
function stopMusic(track) {
  if(typeof(soundManager) !== 'undefined'){
    soundManager.stopAll();
    var soundsIDs = soundManager.soundIDs;
    for (i = 0; i < soundsIDs.length; i++) {
      soundManager.destroySound(soundsIDs[i]);
    }
  }
}

// PLAY A SONG
$('#player-list').on('click', '.songs', function(e) {
  e.preventDefault();

  posPlayingSong = $(this).attr('count');
  var soundcloudID = $(this).attr('sc-song-id');
  playSong(soundcloudID);
});

// PLAY A RADIO
$('#player-list').on('click', '.radios', function(e) {
  e.preventDefault();

  radioName = $(this).attr('name');
  radioCategory = $(this).attr('category');
  $('#radio-playing').text(radioName);
  getTracks();
});

// CREATES THE PLAYLIST
function getParameters(radio) {
  var serchParameters;
  if (radio === 'genres') {
    serchParameters = { state: 'finished', sharing: 'public', streamable: true, genres: radioName, limit: 200 };
  }else{
    serchParameters = { state: 'finished', sharing: 'public', streamable: true, q: radioName, limit: 200 };
  }
  return serchParameters;
}

function getTracks() {
  initialize(CLIENT_ID);
  SC.get('/tracks', getParameters(radioCategory), function(songs) {
    stopMusic();
    currentTracks = songs;
    pickRandomSong(currentTracks);
  });
}

// GETS THE SONG AND PLAYS IT
function pickRandomSong(tracks) {
  var i = Math.floor(Math.random() * tracks.length);
  currentTrack = tracks[i];
  playRadioSong(tracks[i]);
}

// LIKE A SONG
$('#like-btn').on('click', function(e) {
  addSong(currentTrack);
});

function playRadioSong(track) {
  $('#song-title').replaceWith('<p id="song-title"><marquee behavior="scroll" direction="left">' + track.title + '</marquee></p>');
  SC.stream('/tracks/' + track.id, { flashVersion: 9, autoPlay: true, multiShot: false, onfinish: function() {
    stopMusic();
    pickRandomSong(currentTracks); } }, function(track) {
      songController(track);
  });
}

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
  if(posPlayingSong < currentTracks.length) {
    posPlayingSong++;
    playSong(currentTracks[posPlayingSong].sc_song_id);
  } else {
    stopMusic();
  }
}

// NEXT SONG
$('#next-btn').on('mousedown', function() {
  var element = $(this).attr('id');
  // animateButtons(element);
  stopMusic();
  pickRandomSong(currentTracks);
});

// CONTROLLER FOR THE PLAY PAUSE BUTTON
function songController(track) {
  toggleButton(track);
  timer(track);

  $('#play-pause-btn').on('mousedown', function() {
    var element = $(this).attr('id');
    // animateButtons(element);
  });

  $('#play-pause-btn').on('click', function() {
    if (track.paused) {
      track.play();
    } else {
      track.pause();
    }
    toggleButton(track);
  });
}

// UPDATES THE SONG TIMER
function timer(track) {
  var sMinutes;
  var sSeconds;
  setInterval(function() {
    if (track.sID === soundManager.soundIDs[0]) {
        var seconds = track.position / 1000;
        var min = Math.floor(seconds / 60);
        var sec = Math.floor(seconds % 60);
        min.toString().length === 1 ? sMinutes = '0' + min : sMinutes = min;
        sec.toString().length === 1 ? sSeconds = '0' + sec : sSeconds = sec;
        $('#timer-p').text(sMinutes + ':' + sSeconds);
        containerWidth = $('#progress-bar-container').css('width');
        progress = parseInt(containerWidth) / (track.durationEstimate / 1000);
        $('#progess-bar').css('width', (progress * seconds));
      }
    }, 100);
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
    currentTracks.push(song);
    var songHTML = [];
    var i = quantSongs++;
    songHTML.push('<div class="list-element" id="list-element-' + song.id + '"><li>');
    songHTML.push('<p class="playlist-element">');
    songHTML.push('<a class="songs song-' + i + '" count="' + i + '" sc-song-id="' + song.sc_song_id + '" href="#">' + song.title + ' (' + song.duration + ')</a></p>');
    songHTML.push('<p class="playlist-element-right">');
    songHTML.push('<a class="delete-song" id="' + song.id + '" href="#">X</a></p></li></div>');
    $('#songs-play-list').append(songHTML.join(''));
    alert("Song was add to your play list");
  });
  likeSong.fail(function(messages) {
    alert(messages.responseJSON.errors[0]);
  });
}

// ADD RADIO
$('#new_radio').on('submit', function(e) {
  e.preventDefault();

  var category = $('#radio_category').val();
  var name = $('#radio_name').val();
  var radio = {name: name, category: category};

  var newRadio = $.ajax({
    url: '/radios',
    type: 'POST',
    data: { radio: radio },
    dataType: 'json'
    });
  newRadio.done(function(radio) {
    var radioHTML = [];
    radioHTML.push('<div class="list-element" id="list-element-' + radio.id + '"><li>');
    radioHTML.push('<p class="playlist-element">');
    radioHTML.push('<a class="radios" category="' + radio.category + '" name="' + radio.name + '" href="#">' + radio.name + '</a></p>');
    radioHTML.push('<p class="playlist-element-right">');
    radioHTML.push('<a class="delete-radio" id="' + radio.id + '" href="#">X</a></p></li></div>');
    $('#radio_name').val('');
    $('#radios-play-list').append(radioHTML.join(''));
  });
  newRadio.fail(function(messages) {
    alert(messages.responseJSON.errors[0]);
  });
});

// DELETE RADIO
$('#player-list').on('click', '.delete-radio', function(e) {
  e.preventDefault();

  var radioID = $(this).attr('id');
  var deleteRadio = $.ajax({
    url: '/radios/' + radioID,
    type: 'DELETE',
    dataType: 'json'
    });
  deleteRadio.done(function(result) {
    $('#list-element-' + result.id).remove();
    alert(result.message);
  });
  deleteRadio.fail(function() {
    alert('Something went wrong!');
  });
});

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
    alert(result.message);
  });
  deleteSong.fail(function() {
    alert('Something went wrong!');
  });
});

// SWITCH BETWEEN PLAY LISTS
$('.switch a').on('click', function(e) {
  e.preventDefault();

  var url = $(this).attr('url');
  var switchPlaylist = $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json'
    });
  switchPlaylist.done(function(result) {
    if (result.radios) {
      createRadiosList(result.radios);
    } else {
      currentTracks = result.songs;
      createSongsList(result.songs);
    }
  });
});

function createRadiosList(radios) {
  var radioHTML = [];
  radioHTML.push('<ol id="radios-play-list">');
  for(var i = 0; i < radios.length; i++) {
    radioHTML.push('<div class="list-element" id="list-element-' + radios[i].id + '"><li>');
    radioHTML.push('<p class="playlist-element">');
    radioHTML.push('<a class="radios" category="' + radios[i].category + '" name="' + radios[i].name + '" href="#">' + radios[i].name + '</a></p>');
    radioHTML.push('<p class="playlist-element-right">');
    radioHTML.push('<a class="delete-radio" id="' + radios[i].id + '" href="#">X</a></p></li></div>');
  }
  radioHTML.push('</ol>');
  $('#player-list').empty();
  toggleSearchForm("radios");
  $('#player-list').append(radioHTML.join(''));
}

function createSongsList(songs) {
  var songHTML = [];
  quantSongs = songs.length - 1;
  songHTML.push('<ol id="songs-play-list">');
  for(var i = 0; i < songs.length; i++) {
    songHTML.push('<div class="list-element" id="list-element-' + songs[i].id + '"><li>');
    songHTML.push('<p class="playlist-element">');
    songHTML.push('<a class="songs song-' + i + '" count="' + i + '" sc-song-id="' + songs[i].sc_song_id + '" href="#">' + songs[i].title + ' (' + songs[i].duration + ')</a></p>');
    songHTML.push('<p class="playlist-element-right">');
    songHTML.push('<a class="delete-song" id="' + songs[i].id + '" href="#">X</a></p></li></div>');
  }
  songHTML.push('</ol>');
  $('#player-list').empty();
  toggleSearchForm("songs");
  $('#player-list').append(songHTML.join(''));
}

function toggleSearchForm(name) {
  if(name === 'songs') {
    $('#new-radio').hide();
    $('#search-songs').fadeIn();
  } else {
    $('#search-songs').hide();
    $('#new-radio').fadeIn();
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
      $('#autocomplete').append('<li><a href="#" class="song-title" id="'+ songs[i].id +'">' + songs[i].title + '</a></li>')
    }
  });
});

$('#autocomplete').on('click', '.song-title', function() {
  var songID = $(this).attr('id');
  SC.get('/tracks/' + songID, function(song) {
    $('#autocomplete-container').fadeOut();
    $('#search-field').val('');
    addSong(song);
  });
});
