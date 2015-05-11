// GLOBAL VARIABLES
var CLIENT_ID = '271b061d5469839b06f3e95da05b822c';
var radioOrSongs;
var playList = [];

// ##### HELPER FUNCTIONS #####
// Toggle play and pause buttons
function toggleButton(track) {
  if (track.paused) {
    $('#play-pause').css({ 
        'border-color': '#222',
        'box-shadow': '0px 0px 10px 0px transparent'
      });
  } else {
    $('.list-element').removeClass('playing-song');
    $('.jam-song-element').removeClass('playing-song');
    $('#list-element-' + playingSong).addClass('playing-song');
    $('#jam-song-element-'+ playingSong).addClass('playing-song');
    $('#play-pause').css({ 
        'border-color': '#1EB500',
        'box-shadow': '0px 0px 10px 0px #1EB533'
      });
  }
}

function animateButtons(element) {
  $('#' + element).css({ 
        'border-color': '#1EB500',
        'box-shadow': '0px 0px 10px 0px #1EB533'
      });
  $(this).on('mouseup', function() {
    $('#' + element).css({ 
        'border-color': '#222',
        'box-shadow': '0px 0px 10px 0px transparent'
      });
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
    track = "";
    var soundsIDs = soundManager.soundIDs;
    for (i = 0; i < soundsIDs.length; i++) {
      soundManager.destroySound(soundsIDs[i]);
    }
  }
}

// LIKE A SONG
$('#like-btn').on('click', function(e) {
  animateButtons('like-song');
  var likeSong = $.ajax({
    url: '/songs',
    type: 'POST',
    data: { song: { sc_song_id: currentTrack.id, 
                    title: currentTrack.title, 
                    duration: currentTrack.duration } 
          },
    dataType: 'json'
  });
  likeSong.done(function(song) {
    alert("Song was add to your play list");
  });
  likeSong.fail(function(messages) {
    alert(messages.responseJSON.errors[0]);
  });
});

// NEXT SONG
$('#next-btn').on('mousedown', function() {
  animateButtons('next-song');
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
  
  $('#song-title-container').animate({
    height: '2.1em'
    }, 600, "linear");
  
  playPause(track);
  timer(track);
}

function playPause(track) {
  $('#play-pause-btn').on('click', function() {
    if (track.sID === soundManager.soundIDs[0]) {
    
      if (track.paused) {
        track.play();
        $('#song-title-container').animate({
          height: '2.1em'
        }, 600, "linear");
      } else {
        track.pause();
        $('#song-title-container').animate({
          height: '0.2em'
        }, 600, "linear");
      }
    toggleButton(track);
    }
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
        progress = (parseInt(containerWidth) - 1) / (track.durationEstimate / 1000);
        $('#progess-bar').css('width', (progress * seconds));
      }
    }, 100);
}

$('#hide-show-title').on('click', function() {
})

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
      refreshJamsList();
    }
  });
});

function toggleSearchForm(name) {
  if (name == 'radios') {
    clearInterval(refreshInterval);
    clearInterval(refreshJams);
    $('#create-jam').hide();
    $('#search-songs').hide();
    $('#new-jam-form').hide();
    $('#new-radio').fadeIn();
  } else if (name == 'songs') {
    clearInterval(refreshInterval);
    clearInterval(refreshJams);
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
