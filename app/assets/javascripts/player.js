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
    radioHTML.push('<p class="playlist-element">');
    radioHTML.push('<a class="delete-radio "id="' + radio.id + '" href="#">X</a></p></li></div>');
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
