var guests = [];
// CREATE LIST OF GUESTS
$('#friends-list').on('click', '.jam-friend', function(e) {
  e.preventDefault();

  friendId = $(this).attr('id');
  $('#friend-' + friendId).hide();
  guests.push(friendId);
  alert('Friend added to the jam');
});

// TOGGLE THE NEW-JAM FORM
$('#new-jam').on('click', function(e) {
  e.preventDefault();

  if ($('#new-jam-form').is(':visible')){
    $('#new-jam-form').slideUp('slow');
  } else {
    $('#new-jam-form').slideDown('slow');
  }
});

// SEARCH SONGS WITH AUTOCOMPLETE
$('#jamsongs-search-field').on('keyup', function() {
  var q = $(this).val();

  initialize(CLIENT_ID);

  SC.get('/tracks', { state: 'finished', sharing: 'public', streamable: true, q: q, limit: 5 }, function(songs) {
    $('#jamsongs-autocomplete').empty();
    $('#jamsongs-autocomplete-container').show();
    for(var i = 0; i < songs.length; i++) {
      $('#jamsongs-autocomplete').append('<li><a href="#" class="song-title" id="'+ songs[i].id +'">' + songs[i].title + '</a></li>');
    }
  });
});

// ADDS SONG TO JAM
var songID;
$('#jamsongs-autocomplete').on('click', '.song-title', function(e) {
  e.preventDefault();

  var songTitle = $(this).text();
  songID = $(this).attr('id');
  $('#jamsongs-search-field').val(songTitle);
});

$().on('submit', function(e) {
  e.preventDefault();

  var songID = $('#jamsongs-search-field').attr('class');

  SC.get('/tracks/' + songID, function(song) {
    $('#jamsongs-autocomplete-container').fadeOut();
    $('#search-field').val('');
    addSong(song);
  });
});

$('#search-field').focusout(function() {
  $('#autocomplete-container').fadeOut();
  $('#jamsongs-search-field').val('');
});

// ADD JAM
$('#new-jam-form').on('submit', function(e) {
  e.preventDefault();

  $('#new-jam-form').slideUp('slow');
  var name = $('#jam-name').val();
  var newJam = $.ajax({
    url: '/jams',
    type: 'POST',
    data: { jam: {name: name, guests: guests } },
    dataType: 'json'
    });
  newJam.done(function() {
    var switchPlaylist = $.ajax({
      url: '/jams',
      type: 'GET',
      dataType: 'json'
      });
    switchPlaylist.done(function(result) {
      createJamsList(result.jams);
    });
  });
  newJam.fail(function(messages) {
    alert(messages.responseJSON.errors[0]);
  });
});

// DELETE A JAM
$('#player-list').on('click', '.delete-jam', function(e) {
  e.preventDefault();

  var jamID = $(this).attr('id');
  var deleteJam = $.ajax({
    url: '/jams/' + jamID,
    type: 'DELETE',
    dataType: 'json'
    });
  deleteJam.done(function(result) {
    alert(result.message);
    var switchPlaylist = $.ajax({
      url: '/jams',
      type: 'GET',
      dataType: 'json'
      });
    switchPlaylist.done(function(result) {
      createJamsList(result.jams);
    });
  });
  deleteJam.fail(function() {
    alert('Something went wrong!');
  });
});

// CREATES THE LIST OF JAMS FOR THE CURRENT USER
function createJamsList(result) {
  debugger;
  var jamsHTML = [];
  jamsHTML.push('<ol id="jams-play-list">');
  for(var i = 0; i < result.jams.length; i++) {
    jamsHTML.push('<li class="list-element" id="list-element-' + result.jams[i].jam.id + ' row">');
    jamsHTML.push('<img class="small-1 column" src="' + result.user.picture.url + '" alt="user pic">');
    jamsHTML.push('<p class="playlist-element small-10 columns">');
    jamsHTML.push('<a class="jams jam-' + i + '" count="' + i + '" jam="' + result.jams[i].jam.id + '" href="#">' + result.jams[i].jam.name + '</a></p>');
    jamsHTML.push('<p class="playlist-element small-1 column">');
    jamsHTML.push('<a class="delete-jam" id="' + result.jams[i].jam.id + '" count="' + i + '" href="#">X</a></p></li>');
    jamSongsList(result.jams[i].songs, jamsHTML);
  }

  for(var i = 0; i < result.guest_jams.length; i++) {
    jamsHTML.push('<li class="list-element" id="list-element-' + result.guest_jams[i].jam.id + ' row">');
    jamsHTML.push('<img class="small-1 column" src="' + result.guest_jams[i].user.picture.url + '" alt="user pic">');
    jamsHTML.push('<p class="playlist-element small-8 columns">');
    jamsHTML.push('<a class="jams jam-' + i + '" count="' + i + '" jam="' + result.guest_jams[i].jam.id + '" href="#">' + result.guest_jams[i].jam.name + '</a></p>');
    jamsHTML.push('<p class="playlist-element small-3 column">' + result.guest_jams[i].user.user_name + '</p></li>');
    jamSongsList(result.guest_jams[i].songs, jamsHTML);
  }
  jamsHTML.push('</ol>');
  $('#player-list').empty();
  toggleSearchForm('jams');
  $('#player-list').append(jamsHTML.join(''));
}

function jamSongsList(songs, jamsHTML) {
  jamsHTML.push('<ul class="jams-songs-list">');
  var sMinutes;
  var sSeconds;
  for(var i = 0; i < songs.length; i++) {
    var p = '';
    parseInt(playingSong) === songs[i].sc_song_id ? p = 'playing-song' : p = '';
    jamsHTML.push('<li class="row list-element ' + p + '" id="list-element-' + songs[i].sc_song_id + '">');
    jamsHTML.push('<p class="small-11 columns playlist-element">');
    var min = Math.floor(songs[i].duration / 60000);
    var sec = Math.floor(songs[i].duration % 60);
    min.toString().length === 1 ? sMinutes = '0' + min : sMinutes = min;
    sec.toString().length === 1 ? sSeconds = '0' + sec : sSeconds = sec;
    jamsHTML.push('<a class="songs song-' + i + '" count="' + i + '" sc-song-id="' + songs[i].sc_song_id + '" href="#">' + songs[i].title + ' (' + sMinutes + ':' + sSeconds + ')</a></p>');
    jamsHTML.push('<p class="small-1 columns playlist-element">');
    jamsHTML.push('<a class="delete-song" id="' + songs[i].id + '" count="' + i + '" href="#">X</a></p></li>');
  }
  jamsHTML.push('</ul>');
}
