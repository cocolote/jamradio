var guests = [];
// CREATE LIST OF GUESTS
$('#friends-list').on('click', '.jam-friend', function(e) {
  e.preventDefault();

  friendId = $(this).attr('id');
  $('#friend-' + friendId).hide();
  guests.push(friendId);
  alert('Friend added to the jam');
});

// ADD JAM
$('#new-jam-form').on('submit', function(e) {
  e.preventDefault();

  var name = $('#jam-name').val();

  var newRadio = $.ajax({
    url: '/jams',
    type: 'POST',
    data: { jam: {name: name, guests: guests } },
    dataType: 'json'
    });
  newRadio.done(function(radio) {
    debugger;
    var radioHTML = [];
    radioHTML.push('<li class="row list-element" id="list-element-' + radio.id + '">');
    radioHTML.push('<p class="small-11 columns playlist-element">');
    radioHTML.push('<a class="radios" category="' + radio.category + '" name="' + radio.name + '" href="#">' + radio.name + '</a></p>');
    radioHTML.push('<p class="small-1 columns playlist-element">');
    radioHTML.push('<a class="delete-radio" id="' + radio.id + '" href="#">X</a></p></li>');
    $('#radio_name').val('');
    $('#radios-play-list').append(radioHTML.join(''));
  });
  newRadio.fail(function(messages) {
    alert(messages.responseJSON.errors[0]);
  });
});

// CREATES THE LIST OF JAMS FOR THE CURRENT USER
function createJamsList(jams) {
  debugger;
  var jamsHTML = [];
  jamsHTML.push('<ol id="jams-play-list">');
  for(var i = 0; i < jams.length; i++) {
    jamsHTML.push('<li class="list-element" id="list-element-' + jams[i].id + ' row">');
    jamsHTML.push('<img class="small-1 column" src="' + userPic + '" alt="user pic">');
    jamsHTML.push('<p class="playlist-element small-3 columns">');
    jamsHTML.push('<a class="jams jam-' + i + '" count="' + i + '" jam="' + jams[i].id + '" href="#">' + jams[i].name + '</a></p>');
    jamsHTML.push('<p class="playlist-element-right">');
    jamsHTML.push('<a class="delete-song" id="' + jams[i].id + '" count="' + i + '" href="#">X</a></p></li>');
  }

    radioHTML.push('<li class="row list-element" id="list-element-' + radios[i].id + '">');
    radioHTML.push('<p class="small-11 columns playlist-element">');
    radioHTML.push('<a class="radios" category="' + radios[i].category + '" name="' + radios[i].name + '" href="#">' + radios[i].name + '</a></p>');
    radioHTML.push('<p class="small-1 columns playlist-element">');
    radioHTML.push('<a class="delete-radio" id="' + radios[i].id + '" href="#">X</a></p></li>');

  jamsHTML.push('</ol>');
  $('#player-list').empty();
  toggleSearchForm('jams');
  $('#player-list').append(jamsHTML.join(''));
}
