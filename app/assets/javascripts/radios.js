var radioID;
var radioName;
var radioCategory;
var radioTracks = [];
var currentTrack;

// ANIMATE TRASH CAN
$('#player-list')
  .on('mouseenter', '.list-element', function() {
    $(this).children('.delete').animate({
      width: '1.2em'
    }, 100, 'linear');
  })
  .on('mouseleave', '.list-element', function() {
    $(this).children('.delete').animate({
      width: '0em'
    }, 100, 'linear');
  });

// PLAY A RADIO
$('#player-list').on('click', '.radioslist-element', function(e) {
  e.preventDefault();

  playingSong = '';

  radioID = $(this).attr('radio-id');
  radioOrSongs = 'radio';
  radioName = $(this).children('.radios').attr('name');
  radioCategory = $(this).children('.radios').attr('category');
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
  artworkTitle(track);
  $('#song-title').replaceWith(
    '<p id="song-title"><marquee behavior="scroll" direction="left">' + 
    track.title + '</marquee></p>');
  SC.stream('/tracks/' + track.id, 
    { flashVersion: 9, 
      autoPlay: true, 
      multiShot: false, 
      onfinish: function() {
        stopMusic();
        pickRandomSong(radioTracks) } }, 
      function(track) {
        songController(track);
  });
}

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
    $('#radio_name').val('');
    var getRadios = $.ajax({
      url: '/radios',
      type: 'GET',
      dataType: 'json'
      });
    getRadios.done(function(result) {
      createRadiosList(result.radios);
    });
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
  radioHTML.push('<div id="title-container"><h2 id="title" class="info-songs-topbar">Radios</h2>');
  radioHTML.push('<div id="song-info-topbar-container" class="row info-songs-topbar">');
  radioHTML.push('<div id="image-container" class="small-2 columns">');
  radioHTML.push('<img id="artwork-url" src="#" alt="artwork"></div>');
  radioHTML.push('<div id="info-container" class="small-10 columns">');
  radioHTML.push('<h5 id="song-title-topbar"></h5>');
  radioHTML.push('<h6 id="artis-name-topbar" class="artist-duration-topbar"></h6>');
  radioHTML.push('<h6 id="duration-song-topbar" class="artist-duration-topbar"></h6></div></div></div>');
  radioHTML.push('<ol id="radios-play-list">');
  for(var i = 0; i < radios.length; i++) {
    var p;
    var icon;
    if (radioName == radios[i].name) {
      p = 'now-playing';
      icon = "/assets/pausebutton.png";
    } else {
      p = '';
      icon = "/assets/playbutton.png";
    };
    radioHTML.push('<li class="row list-element '+ p +'" id="list-element-' + radios[i].id + '">');
    radioHTML.push('<div class="small-1 column play-pause-container">');
    radioHTML.push('<img src="' + icon + '" alt="Playbutton" id="play-pause-' + radios[i].id + '"></div>');
    radioHTML.push('<div class="small-10 columns radioslist-element" radio-id="' + radios[i].id + '">');
    radioHTML.push('<a class="radios" category="' + radios[i].category + '" name="' + radios[i].name + '" href="#">' + radios[i].name + '</a></div>');
    radioHTML.push('<div class="small-1 column radioslist-element delete">');
    radioHTML.push('<a class="delete-radio" id="' + radios[i].id + '" href="#">');
    radioHTML.push('<img src="/assets/delete.png" alt="Delete"></a></div></li>');
  }
  
  radioHTML.push('</ol>');
  $('#player-list').empty();
  toggleSearchForm('radios');
  $('#player-list').append(radioHTML.join(''));

  if (currentTrack) {
    artworkTitle(currentTrack);
  }
}
