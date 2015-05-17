var refreshInterval;
var refreshJams;
var jamPlayingSong;

// PLAY SONGS FROM THE JAM
$('#player-list').on('click', '.jamsonglist-element', function(e) {
  e.preventDefault();
  radioOrSongs = 'songs';
  posPlayingSong = $(this).children('.jam-songs').attr('count');
  var soundcloudID = $(this).children('.jam-songs').attr('sc-song-id');

  radioName = '';
  playingSong = null;
  currentTrack = null;
  var jamUrl = $(this).children('.jam-songs').attr('href');
  var getSongs = $.ajax({
    url: jamUrl,
    type: 'GET',
    dataType: 'json'
  });
  getSongs.done(function(result) {
    playList = result.songs;
  });

  getSong(soundcloudID, 'jams');
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
    $('.friend').show();
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
  newJam.done(function(jam) {
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
    var getPlayList = $.ajax({
      url: '/jams',
      type: 'GET',
      dataType: 'json'
    });
    getPlayList.done(function(result) {
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
    var getSongs = $.ajax({
      url: '/jams/' + jamID + '/jam_songs',
      type: 'GET',
      dataType: 'json'
    });
    getSongs.done(function(result) {
      playList = result.songs;
      playListLength = result.songs.length;
      var getPlaylist = $.ajax({
        url: '/jams',
        type: 'GET',
        dataType: 'json'
      });
      getPlaylist.done(function(result) {
        createJamsList(result.jams);
        $('#jams-songs-list-' + jamID).show();
      });
    });
  });
  deleteJamSong.fail(function() {
    alert('Something went wrong!');
  });
});

// CREATES THE LIST OF JAMS FOR THE CURRENT USER
function createJamsList(result) {
  var jamsHTML = [];
  var optionHTML = [];
  jamsHTML.push('<div id="title-container"><h2 id="title" class="info-songs-topbar">Jams</h2>');
  jamsHTML.push('<div id="song-info-topbar-container" class="row info-songs-topbar">');
  jamsHTML.push('<div id="image-container" class="small-2 columns">');
  jamsHTML.push('<img id="artwork-url" src="#" alt="artwork"></div>');
  jamsHTML.push('<div id="info-container" class="small-10 columns">');
  jamsHTML.push('<h5 id="song-title-topbar"></h5>');
  jamsHTML.push('<h6 id="artis-name-topbar" class="artist-duration-topbar"></h6>');
  jamsHTML.push('<h6 id="duration-song-topbar" class="artist-duration-topbar"></h6></div></div></div>');

  jamsHTML.push('<ol id="jams-list">');
  for(var i = 0; i < result.jams.length; i++) {
    jamsHTML.push('<li class="list-element row" id="list-element-' + result.jams[i].jam.id + '">');
    jamsHTML.push('<div class="small-1 column user-pic-container">');
    jamsHTML.push('<img class="user-pic" src="' + result.user.picture.url + '" alt="user pic"></div>');
    jamsHTML.push('<div class="jamlist-element small-10 columns">');
    jamsHTML.push('<a class="jams jam-' + i + '" count="' + i + '" jam="'
+ result.jams[i].jam.id + '" href="#">' + result.jams[i].jam.name + '</a></div>');
    jamsHTML.push('<div class="small-1 column delete">');
    jamsHTML.push('<a class="delete-jam" id="' + result.jams[i].jam.id + '" count="' + i + '" href="#">');
    jamsHTML.push('<img src="/assets/delete.png" alt="Delete"></a></div></li>');

    optionHTML.push('<option value="' + result.jams[i].jam.id + '">' + result.jams[i].jam.name + '</option>');

    jamSongsList(result.jams[i].songs, result.jams[i].jam.id, jamsHTML, result.jams[i].jam.name);
  }

  for(var i = 0; i < result.guest_jams.length; i++) {
    jamsHTML.push('<li class="list-element row" id="list-element-' + result.guest_jams[i].jam.id + '">');
    jamsHTML.push('<div class="small-1 column user-pic-container">');
    jamsHTML.push('<img class="user-pic" src="' + result.guest_jams[i].user.picture.url + '" alt="user pic"></div>');
    jamsHTML.push('<div class="jamlist-element small-8 columns">');
    jamsHTML.push('<a class="jams jam-' + i + '" count="' + i + '" jam="'
+ result.guest_jams[i].jam.id + '" href="#">' + result.guest_jams[i].jam.name + '</a></div>');
    jamsHTML.push('<div class="jamlist-element small-2 columns">(' + result.guest_jams[i].user.user_name + ')</div>');
    jamsHTML.push('<div class="small-1 column delete">');
    jamsHTML.push('<a class="delete-jam" id="' + result.guest_jams[i].jam.id + '" count="' + i + '" href="#">');
    jamsHTML.push('<img src="/assets/delete.png" alt="Delete"></a></div></li>');

    optionHTML.push('<option value="' + result.guest_jams[i].jam.id + '">' + result.guest_jams[i].jam.name + '</option>');

    jamSongsList(result.guest_jams[i].songs, result.guest_jams[i].jam.id, jamsHTML, result.guest_jams[i].jam.name);
  }

  jamsHTML.push('</ol>');
  $('#player-list').empty();
  $('#jam_id').empty();
  toggleSearchForm('jams');
  $('#player-list').append(jamsHTML.join(''));
  $('#jam_id').append(optionHTML.join(''));

  if (jamPlayingSong) {
    artworkTitle(jamPlayingSong);
  }

}

function jamSongsList(songs, jamID, jamsHTML, jamName) {
  jamsHTML.push('<ol class="jams-songs-list" id="jams-songs-list-' + jamID + '">');
  var sMinutes;
  var sSeconds;
  for(var i = 0; i < songs.length; i++) {
    var duration = formatTime(songs[i]);
    var p;
    var icon;
    if (jamPlayingSong && jamPlayingSong.id === songs[i].sc_song_id) {
      p = 'now-playing';
      icon = "/assets/pausebutton.png";
    } else {
      p = '';
      icon = "/assets/playbutton.png";
    };
    jamsHTML.push('<li class="row list-element ' + p + '" id="list-element-' + songs[i].sc_song_id + '">');
    jamsHTML.push('<div class="small-1 column play-pause-container">');
    jamsHTML.push('<img src="' + icon + '" alt="Playbutton" id="play-pause-' + songs[i].sc_song_id + '"></div>');
    jamsHTML.push('<div class="small-10 columns jamsonglist-element">');
    jamsHTML.push('<a class="jam-songs song-' + i + '" count="' + i 
+ '" sc-song-id="' + songs[i].sc_song_id + '" href="/jams/' + jamID + '/jam_songs">'
+ songs[i].title + ' (' + duration + ')</a></div>');
    jamsHTML.push('<div class="small-1 columns delete">');
    jamsHTML.push('<a class="delete-jam-song" id="' + songs[i].id + '" jam-id="' + jamID + '" href="#">');
    jamsHTML.push('<img src="/assets/delete.png" alt="Delete"></a></p></li>');
  }
  jamsHTML.push('</ol>');
}

// ADD NEW SONG TO A JAM
function addJamSong(song) {
  var jamID = $('#jam_id').val();

  playList.push({ sc_song_id: song.id });
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
$('#player-list').on('click', '.jamlist-element', function(e) {
  e.preventDefault();

  clearInterval(refreshInterval);
  $('.jams-songs-list').hide();
  var jamID = $(this).children('.jams').attr('jam');
  var getSongsList = $.ajax({
    url: '/jams/' + jamID + '/jam_songs',
    type: 'GET',
    dataType: 'json'
  });
  getSongsList.done(function(result) {
    $('#jams-songs-list-' + jamID).slideDown('slow');
  });
});

// REFRESH PLAYLIST EVERY TIME SOMEONE ADDS A SONG
function refreshPlayList(jamID) {
  var playListLength = 0;
  refreshInterval = setInterval(function() {
    var getListLength = $.ajax({
      url: '/jams/' + jamID + '/jam_songs',
      type: 'GET',
      dataType: 'json'
    });
    getListLength.done(function(result) {
      if (result.songs.length !== playListLength) {
        playList = result.songs;
        playListLength = result.songs.length;
        var getPlaylist = $.ajax({
          url: '/jams',
          type: 'GET',
          dataType: 'json'
        });
        getPlaylist.done(function(result) {
          createJamsList(result.jams);
          $('#jams-songs-list-' + jamID).slideDown('slow');
        });
      }
    });
    }, 1000);
}

// REFRESH THE JAMS LIST
function refreshJamsList() {
  var jamsLength = 0;
  refreshJams = setInterval(function() {
    var getPlaylist = $.ajax({
      url: '/jams',
      type: 'GET',
      dataType: 'json'
    });
    getPlaylist.done(function(result) {
      var quantJams = result.jams.jams.length + result.jams.guest_jams.length;
      if (quantJams !== jamsLength) {
        jamsLength = quantJams;
        createJamsList(result.jams);
      }
    });
  }, 1000);
}
