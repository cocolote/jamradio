// CREATES THE LIST OF JAMS FOR THE CURRENT USER
function createJamsList(jams) {
  var jamsHTML = [];
  jamsHTML.push('<ol id="jams-play-list">');
  for(var i = 0; i < jams.length; i++) {
    jamsHTML.push('<div class="list-element" id="list-element-' + jams[i].id + '"><li>');
    jamsHTML.push('<p class="playlist-element">');
    jamsHTML.push('<a class="songs jam-' + i + '" count="' + i + '" jam="' + jams[i].id + '" href="#">' + jams[i].name + '</a></p>');
    jamsHTML.push('<p class="playlist-element-right">');
    jamsHTML.push('<a class="delete-song" id="' + jams[i].id + '" count="' + i + '" href="#">X</a></p></li></div>');
  }
  jamsHTML.push('</ol>');
  $('#player-list').empty();
  toggleSearchForm('jams');
  $('#player-list').append(jamsHTML.join(''));
}

// RENDER THE NEW VIEW TO ADD A JAM
$('#create-jam a').on('click', function(e) {
  e.preventDefault();

  var getNewView = $.ajax({
    url: '/jams/new',
    type: 'GET',
    contentType: 'text/html; charset=utf-8'
  });
  getNewView.done(function(page) {
    debugger;
  });
  getNewView.fail(function(errors) {
    debugger;
  });
});
