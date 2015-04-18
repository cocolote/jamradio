var radioName;
var radioCategory;
var radioTracks = [];
var currentTrack;

// PLAY A RADIO
$('#player-list').on('click', '.radios', function(e) {
  e.preventDefault();

  radioOrSongs = 'radio';
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
    radioTracks = songs;
    pickRandomSong(radioTracks);
  });
}

// PIKS A RANDOM SONG
function pickRandomSong(tracks) {
  var i = Math.floor(Math.random() * tracks.length);
  currentTrack = tracks[i];
  playRadioSong(tracks[i]);
}

// PLAYS THE SONG
function playRadioSong(track) {
  $('#song-title').replaceWith('<p id="song-title"><marquee behavior="scroll" direction="left">' + track.title + '</marquee></p>');
  SC.stream('/tracks/' + track.id, { flashVersion: 9, autoPlay: true, multiShot: false, onfinish: function() {
    stopMusic();
    pickRandomSong(radioTracks); } }, function(track) {
      songController(track);
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
