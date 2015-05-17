// GLOBAL VARIABLES
var CLIENT_ID = '271b061d5469839b06f3e95da05b822c';
var radioOrSongs;
var playList = [];
var elementId;

// ##### HELPER FUNCTIONS #####
// Toggle play and pause buttons
function toggleButton(track) {
  if (playingSong) { elementId = playingSong.id };
  if (jamPlayingSong) { elementId = jamPlayingSong.id };

  if (track.paused) {
    $('#play-pause').removeClass('btn-pressed');
    $('.play-pause-btn').attr('src', '/assets/playbutton.png');
    $('#play-pause-' + radioID).attr('src', '/assets/playbutton.png');
    $('#play-pause-' + elementId).attr('src', '/assets/playbutton.png');
  } else {
    $('.list-element').removeClass('now-playing');
    $('#list-element-' + elementId).addClass('now-playing');
    $('#list-element-' + radioID).addClass('now-playing');
    $('#play-pause').addClass('btn-pressed');
    $('.play-pause-btn').attr('src', '/assets/pausebutton.png');
    $('.play-pause-container img').attr('src', '/assets/playbutton.png');
    $('#play-pause-' + radioID).attr('src', '/assets/pausebutton.png');
    $('#play-pause-' + elementId).attr('src', '/assets/pausebutton.png');
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
    track = "";
    var soundsIDs = soundManager.soundIDs;
    for (i = 0; i < soundsIDs.length; i++) {
      soundManager.destroySound(soundsIDs[i]);
    }
  }
}

// Animate trash can
$('#player-list')
  .on('mouseenter', '.list-element', function() {
    $(this).children('.delete').fadeIn('fast');
  })
  .on('mouseleave', '.list-element', function() {
    $(this).children('.delete').fadeOut('fast');
  });

// USER NAME
$('#user-name a').on('click', function() {
  animateButtons('user-name a');
});

// EFECT FOR TITLE OF SON AND ARTWORK
function artworkTitle(track) {
  $('#song-info-topbar-container').fadeOut('slow', function() {
    var titleSong;
    track.title.length > 45 ? titleSong = track.title.slice(0, 42) + '...' : titleSong = track.title
    var duration = formatTime(track);
    $('#artwork-url').attr('src', track.artwork_url || '/assets/jamlogo_sml.png');
    $('#song-title-topbar').text(titleSong);
    $('#artis-name-topbar').text(track.user.username);
    $('#duration-song-topbar').text('(' + duration + ')');

    $('#song-info-topbar-container').fadeIn('slow');
  });
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
  showFooter();

  $('#player-list').on('click', '#play-pause-' + elementId,
    function() {
      playPause(track);
    });

  $('#player-list').on('click', '#play-pause-' + radioID, function() {
    playPause(track);
  });

  $('.play-pause-btn').on('click', function() {
    playPause(track);
  });
  timer(track);
}

function playPause(track) {
  if (track.sID === soundManager.soundIDs[0]) {
    if (track.paused) {
      track.play();
      $('#song-title-container').animate({
        height: '2.1em'
      }, 600, "linear");
      $(this).attr('src', '/assets/pausebutton.png');
    } else {
      track.pause();
      $('#song-title-container').animate({
        height: '0.2em'
      }, 600, "linear");
      $(this).attr('src', '/assets/playbutton.png');
    }
  toggleButton(track);
  }
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
        $('#progress-bar').css('width', (progress * seconds));
      }
    }, 100);
}

// SWITCH BETWEEN PLAY LISTS
$('.switch a').on('click', function(e) {
  e.preventDefault();

  $('.switch').removeClass('btn-pressed');
  $(this).parent().addClass('btn-pressed');

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
      createSongsList(result.songs);
    } else {
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

function showFooter() {
  if ($('#footer-player').is(':hidden')) {
    $('#playlist-container').animate({
      height: '-=2.9em'
    }, 600, "linear");
    $('#footer-player').animate({
      height: 'toggle'
     }, 600, "linear", function() {
      $('#song-title-container').animate({
        height: 'toggle'
        }, 600, "linear");
     });
  }
}

$('#song-title-container')
  .on('mouseenter', function() {
     $('#song-title-container').animate({
       height: '0'
       }, 600, "linear", function() {
          $('#song-title-container').animate({
            height: '2.1em'
          }, 4000, "linear");
      });
    });
