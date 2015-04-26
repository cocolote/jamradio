// SEARCH ALL USER TO FIND A FRIEND
$('#search-friends').on('keyup', function() {
  var q = $(this).val();

  var userRequest = $.ajax({
    url: '/users',
    type: 'GET',
    data: { q: q },
    dataType: 'json'
  });
  userRequest.done(function(users) {
    $('#users-list').empty();
    $('#users-list-container').show();
    for(var i = 0; i < users.length; i++) {
      $('#users-list').append('<li><a href="#" class="user-name" id="'+ users[i].id +'">' + users[i].user_name + '</a></li>');
    }
  });
  userRequest.fail(function() {
    $('#users-list-container').fadeOut();
    $('#search-friends').val('');
    alert("Something went wrong ups!");
  });
});

$('#users-list').on('click', '.user-name', function(e) {
  e.preventDefault();

  var friendID = $(this).attr('id');
  var friendName = $(this).text();

  var saveFriend = $.ajax({
    url: '/friends',
    type: 'POST',
    data: { id: friendID },
    dataType: 'json'
  });
  saveFriend.done(function(friend) {
    var newFriendHTML = [];
    $('#users-list-container').fadeOut();
    $('#search-friends').val('');
    newFriendHTML.push('<li class="small-4 columns friend" id="friend-' + friend.id + '">');
    newFriendHTML.push('<a id="' + friend.id + '" class="jam-friend" href="#">');
    newFriendHTML.push('<img class="friend_pic" src="' + friend.picture.url + '" alt="user-picture"></a>');
    newFriendHTML.push('<p class="user-name">' + friend.user_name + '</p></li>');
    $('#friends-list').append(newFriendHTML.join(''));
    alert(friendName + ' now is your fiend');
  });
  saveFriend.fail(function(friend) {
    alert(friend.responseJSON.errors);
  });
});

$('#search-friends').focusout(function() {
  $('#users-list-container').fadeOut();
  $('#search-friends').val('');
});
