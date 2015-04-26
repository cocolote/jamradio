// GLOBAL VARIABLES
var CLIENT_ID = '271b061d5469839b06f3e95da05b822c';
var radioOrSongs;
var playList = [];

// ##### HELPER FUNCTIONS #####
// Toggle play and pause buttons
function toggleButton(track) {
  if (track.paused) {
    $('#play-pause-btn').removeClass('btn-pressed');
  } else {
    $('.list-element').removeClass('playing-song');
    $('.jam-song-element').removeClass('playing-song');
    $('#list-element-' + playingSong).addClass('playing-song');
    $('#jam-song-element-'+ playingSong).addClass('playing-song');
    $('#play-pause-btn').addClass('btn-pressed');
  }
}

function animateButtons(element) {
  $('#' + element).addClass('btn-pressed');
  $(this).on('mouseup', function() {
    $('#' + element).removeClass('btn-pressed');
  });
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
  animateButtons('like-btn');
  addSong(currentTrack);
});

// NEXT SONG
$('#next-btn').on('mousedown', function() {
  animateButtons('next-btn');
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
        progress = (parseInt(containerWidth) - 6) / (track.durationEstimate / 1000);
        $('#progess-bar').css('width', (progress * seconds));
      }
    }, 100);
}

// SWITCH BETWEEN PLAY LISTS
$('.switch a').on('click', function(e) {
  e.preventDefault();

  $('.switch').removeClass('switch-pressed');
  $(this).parent().addClass('switch-pressed');

  var url = $(this).attr('url');
  var switchPlaylist = $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json'
    });
  switchPlaylist.done(function(result) {
    if (result.radios) {
      createRadiosList(result.radios);
    } else if (result.songs) {
      playList = result.songs;
      createSongsList(result.songs);
    } else {
      createJamsList(result.jams);
    }
  });
});

function toggleSearchForm(name) {
  if (name == 'radios') {
    $('#create-jam').hide();
    $('#search-songs').hide();
    $('#new-jam-form').hide();
    $('#new-radio').fadeIn();
  } else if (name == 'songs') {
    $('#create-jam').hide();
    $('#new-radio').hide();
    $('#new-jam-form').hide();
    $('#search-songs').fadeIn();
  } else {
    $('#new-radio').hide();
    $('#search-songs').hide();
    $('#create-jam').fadeIn();
  }
}
