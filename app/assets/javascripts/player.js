// GLOBAL VARIABLES
var CLIENT_ID = '271b061d5469839b06f3e95da05b822c';
var radioOrSongs;

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

// LIKE A SONG
$('#like-btn').on('click', function(e) {
  addSong(currentTrack);
});

// NEXT SONG
$('#next-btn').on('mousedown', function() {
  var element = $(this).attr('id');
  // animateButtons(element);
  stopMusic();
  if(radioOrSongs === 'radio') {
    pickRandomSong(radioTracks);
  } else {
    getNextSong();
  }
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
      playList = result.songs;
      createSongsList(result.songs);
    }
  });
});

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
      $('#autocomplete').append('<li><a href="#" class="song-title" id="'+ songs[i].id +'">' + songs[i].title + '</a></li>');
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
