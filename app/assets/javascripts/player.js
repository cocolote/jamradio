// GLOBAL VARIABLES
var CLIENT_ID = '271b061d5469839b06f3e95da05b822c';
var currentTracks;
var radioName;
var radioCategory;

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
    // var trackID = soundsIDs[0];
    for (i = 0; i < soundsIDs.length; i++) {
      soundManager.destroySound(soundsIDs[i]);
    }
  }
}

// PLAY A RADIO
$('#radios-play-list').on('click', '.radios', function(e) {
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
    playSong(currentTracks);
  });
}

// GETS THE SONG AND PLAYS IT
function playSong(tracks) {
  var i = Math.floor(Math.random() * tracks.length);
  $('#song-title').replaceWith('<p id="song-title"><marquee behavior="scroll" direction="left">' + tracks[i].title + '</marquee></p>');
  SC.stream('/tracks/' + tracks[i].id, { flashVersion: 9, autoPlay: true, multiShot: false, onfinish: function() {
    stopMusic(); playSong(currentTracks); } }, function(track) {
    songController(track);
  });
}

// NEXT SONG
$('#next-btn').on('mousedown', function() {
  var element = $(this).attr('id');
  // animateButtons(element);
  stopMusic();
  playSong(currentTracks);
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
$('#radios-play-list').on('click', '.delete-radio', function(e) {
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
