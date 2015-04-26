// PLAY SONGS FROM THE JAM
$('#player-list').on('click', '.jam-songs', function(e) {
  e.preventDefault();

  var jamID = $(this).attr('jam-id');
  var linkSongs = $('#jams-songs-list-' + jamID).children().children();

  playList = [];
  for (var i = 0; i < linkSongs.length; i++) {
    if (parseInt(linkSongs[i].id)) {
      playList.push({ sc_song_id: linkSongs[i].id });
    }
  }

  radioOrSongs = 'songs';
  posPlayingSong = $(this).attr('count');
  var soundcloudID = $(this).attr('sc-song-id');
  var jamName = $(this).attr('jam-name');
  $('#radio-playing').text(jamName);
  playSong(soundcloudID);
  refreshPlayList(jamID);
});

// CREATE LIST OF GUESTS
var guests = [];
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

$('#jamsongs-search-field').focusout(function() {
  $('#jamsongs-autocomplete-container').fadeOut();
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

// ADDS SONG TO JAM
var songID;
$('#jamsongs-autocomplete').on('click', '.song-title', function(e) {
  e.preventDefault();

  $('#new-song-label').hide();
  $('#new-jam-song').fadeIn();
  var songTitle = $(this).text();
  songID = $(this).attr('id');
  $('#jamsongs-search-field').val(songTitle);
});

$('#new-jam-song a').on('click', function(e) {
  e.preventDefault();

  SC.get('/tracks/' + songID, function(song) {
    $('#jamsongs-autocomplete-container').fadeOut();
    addJamSong(song);
  });
});

$('#search-field').focusout(function() {
  $('#autocomplete-container').fadeOut();
  $('#jamsongs-search-field').val('');
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

// DELETE A JAM SONG
$('#player-list').on('click', '.delete-jam-song', function(e) {
  e.preventDefault();

  var jamID = $(this).attr('jam-id');
  var songID = $(this).attr('id');
  var deleteJamSong = $.ajax({
    url: '/jams/' + jamID + '/jam_songs/' + songID,
    type: 'DELETE',
    dataType: 'json'
    });
  deleteJamSong.done(function(result) {
    alert(result.message);
    var switchPlaylist = $.ajax({
      url: '/jams',
      type: 'GET',
      dataType: 'json'
    });
    switchPlaylist.done(function(result) {
      createJamsList(result.jams);
      $('#jams-songs-list-' + jamID).show();
    });
  });
  deleteJamSong.fail(function() {
    alert('Something went wrong!');
  });
});

// CREATES THE LIST OF JAMS FOR THE CURRENT USER
function createJamsList(result) {
  var jamsHTML = [];
  jamsHTML.push('<ol id="jams-play-list">');
  for(var i = 0; i < result.jams.length; i++) {
    jamsHTML.push('<li class="jamlist-element row" id="jamlist-element-' + result.jams[i].jam.id + '">');
    jamsHTML.push('<img class="small-1 column" src="' + result.user.picture.url + '" alt="user pic">');
    jamsHTML.push('<p class="jamlist-element small-10 columns">');
    jamsHTML.push('<a class="jams jam-' + i + '" count="' + i + '" jam="' + result.jams[i].jam.id + '" href="#">' + result.jams[i].jam.name + '</a></p>');
    jamsHTML.push('<p class="jamlist-element small-1 column">');
    jamsHTML.push('<a class="delete-jam" id="' + result.jams[i].jam.id + '" count="' + i + '" href="#">X</a></p></li>');
    jamSongsList(result.jams[i].songs, result.jams[i].jam.id, jamsHTML, result.jams[i].jam.name);
  }

  for(var i = 0; i < result.guest_jams.length; i++) {
    jamsHTML.push('<li class="jamlist-element row" id="jamlist-element-' + result.guest_jams[i].jam.id + '">');
    jamsHTML.push('<img class="small-1 column" src="' + result.guest_jams[i].user.picture.url + '" alt="user pic">');
    jamsHTML.push('<p class="jamlist-element small-8 columns">');
    jamsHTML.push('<a class="jams jam-' + i + '" count="' + i + '" jam="' + result.guest_jams[i].jam.id + '" href="#">' + result.guest_jams[i].jam.name + '</a></p>');
    jamsHTML.push('<p class="jamlist-element small-2 columns">' + result.guest_jams[i].user.user_name + '</p>');
    jamsHTML.push('<p class="jamlist-element small-1 column"><a class="delete-jam" id="' + result.guest_jams[i].jam.id + '" count="' + i + '" href="#">X</a></p></li>');
    jamSongsList(result.guest_jams[i].songs, result.guest_jams[i].jam.id, jamsHTML, result.guest_jams[i].jam.name);
  }
  jamsHTML.push('</ol>');
  $('#player-list').empty();
  toggleSearchForm('jams');
  $('#player-list').append(jamsHTML.join(''));
}

function jamSongsList(songs, jamID, jamsHTML, jamName) {
  jamsHTML.push('<ul class="jams-songs-list" id="jams-songs-list-' + jamID + '">');
  var sMinutes;
  var sSeconds;
  for(var i = 0; i < songs.length; i++) {
    var p = '';
    parseInt(playingSong) === songs[i].sc_song_id ? p = 'playing-song' : p = '';
    jamsHTML.push('<li class="row jam-song-element ' + p + '" id="jam-song-element-' + songs[i].sc_song_id + '">');
    jamsHTML.push('<p class="small-11 columns playlist-element" id="' + songs[i].sc_song_id + '">');
    var min = Math.floor(songs[i].duration / 60000);
    var sec = Math.floor(songs[i].duration % 60);
    min.toString().length === 1 ? sMinutes = '0' + min : sMinutes = min;
    sec.toString().length === 1 ? sSeconds = '0' + sec : sSeconds = sec;
    jamsHTML.push('<a class="jam-songs song-' + i + '" count="' + i + '" sc-song-id="' + songs[i].sc_song_id + '" jam-name="' + jamName +
      '" jam-id="' + jamID + '" href="#">' + songs[i].title + ' (' + sMinutes + ':' + sSeconds + ')</a></p>');
    jamsHTML.push('<p class="small-1 columns playlist-element">');
    jamsHTML.push('<a class="delete-jam-song" id="' + songs[i].id + '" jam-id="' + jamID + '" href="#">X</a></p></li>');
  }
  jamsHTML.push('</ul>');
}

// ADD NEW SONG TO A JAM
function addJamSong(song) {
  var jamID = $('#jam_id').val();

  var newJamSong = $.ajax({
    url: '/jams/' + jamID + '/jam_songs',
    type: 'POST',
    data: { jam_id: jamID, song: { sc_song_id: song.id, title: song.title, duration: song.duration } },
    dataType: 'json'
  });
  newJamSong.done(function(result) {
    alert(result.message);
    $('#jam-song-shearch').val('');
    var getPlaylist = $.ajax({
      url: '/jams',
      type: 'GET',
      dataType: 'json'
    });
    getPlaylist.done(function(result) {
      $('#new-jam-song').hide();
      $('#new-song-label').fadeIn();
      createJamsList(result.jams);
      $('#jams-songs-list-' + jamID).show();
      $('#jamsongs-search-field').val('');
    });
  });
}

// TOGGLES THE PLAY LIST
$('#player-list').on('click', '.jams', function(e) {
  e.preventDefault();

  $('.jams-songs-list').hide();
  var jamID = $(this).attr('jam');
  $('#jams-songs-list-' + jamID).slideDown('slow');
});

// REFRESH PLAYLIST EVERY TIME SOMEONE ADDS A SONG
function refreshPlayList(jamID) {
  var playListLength = 0;
  setInterval(function() {
    console.log(playListLength);
    var getListLength = $.ajax({
      url: '/jams/' + jamID + '/jam_songs',
      type: 'GET',
      dataType: 'json'
    });
    getListLength.done(function(result) {
      if (result.songs_number !== playListLength) {
        playListLength = result.songs_number;
        var getPlaylist = $.ajax({
          url: '/jams',
          type: 'GET',
          dataType: 'json'
        });
        getPlaylist.done(function(result) {
          createJamsList(result.jams);
          $('#jams-songs-list-' + jamID).show();
        });
      }
    });
    }, 3000);
}
