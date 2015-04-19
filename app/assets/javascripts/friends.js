// SEARCH WITH AUTOCOMPLETE
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
  userRequest.fail(function(result) {
    $('#users-list-container').fadeOut();
    $('#search-friends').val('');
    alert("Something went wrong ups!");
  });
});

$('#users-list').on('click', '.user-name', function(e) {
  e.preventDefault();
  var friendID = $(this).attr('id');

  var saveFriend = $.ajax({
    url: '/friends',
    type: 'POST',
    data: { id: friendID },
    dataType: 'json'
  });
  saveFriend.done(function(friend) {
    $('#users-list-container').fadeOut();
    $('#search-friends').val('');
  });
  saveFriend.fail(function(friend) {
    alert(friend.responseJSON.errors);
  });
});

$('#users-list-container').on('focusout', function() {
  $('#users-list').empty();
  $(this).hide();
  $('#search-friends').val('');
})
