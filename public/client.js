$( document ).ready(function() {

var h = '<div class="participants"> <ol id="participants-list"> </ol></div>';
$('#wive-toolbar').html(h);
$('head').append('<LINK href="http://localhost:3001/client.css" rel="stylesheet" type="text/css">');
    var asset_path = "";
    var element = '<a href="{{link_url}}" title="{{username}}"> <img class="icon" alt="{{username}}" src="{{image_url}}"> </a>';
    var socket = io.connect('http://localhost:3001/wive-socket');
    socket.emit('user_and_room', _wive.username, _wive.app_name, _wive.room_name, _wive.image_url, _wive.link_url);

    socket.on('room_update', function(users){
      $('#participants-list').empty();
      console.log(users);
      if(_wive.visible){
        $.each(users, function(index, value){
          if(_wive.username != value['username'] ){
              user = element;
              user = user.replace('{{link_url}}', value['link_url']);
              user = user.replace('{{username}}', value['username']);
              user = user.replace('{{username}}', value['username']);
              user = user.replace('{{image_url}}', value['image_url']);
              $('#participants-list').append($('<li>').html(user));
          }
      });
      }
    });

    socket.on('room_js', function(code){
      eval(code);
    });

  });