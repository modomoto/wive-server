module.exports = function(server){
 // var http = require('http').Server(app);
  var io = require('socket.io')(server);
  var remote = require('./remote');
  io.applications = {};

  //DO NOT USE within connect / disconnect callbacks
  function getRoomsHash(nsp)
  {
    var h = {};
    for(var i in nsp.connected) {
      var client = nsp.connected[i];
      if(client.username !== undefined ){
        for( var r in client.rooms) {
          var room = client.rooms[r];
          if(client.id != room ){
            if(h[room] === undefined){
              h[room] = [];
            }
            h[room].push(client.username);
          }
        }
      }
    }
    return h;
  }

  function getSocketUserName(app_name, room, user){
    return app_name + '-' + room  + '-' + user;
  }

  function getSocketRoomName(app_name, room){
    return app_name + '-' + room;
  }
  var nsp = io.of('/wive-socket');
  nsp.on('connection', function(socket){
    socket.on('user_and_room', function(user, app_name, room, image_url, link_url){
      socket.username = getSocketUserName(app_name, room, user);
      socket.join(getSocketRoomName(app_name, room));
      if(io.applications[app_name] === undefined){
        io.applications[app_name] = {};
        io.applications[app_name].rooms = {};
      }
      if(io.applications[app_name].rooms[room] === undefined){
        io.applications[app_name].rooms[room] = {};
        io.applications[app_name].rooms[room].users = {};
      }
      var socket_user = io.applications[app_name].rooms[room].users[user];
      if( socket_user === undefined){
        var data = {};
        data['socket_username'] = getSocketUserName(app_name, room, user);
        data['username'] = user;
        data['count'] = 1;
        socket_user = data;
      } else {
        socket_user['count'] = socket_user['count'] + 1;
      }
      if(image_url){
        socket_user['image_url'] = image_url;
      }else{
        socket_user['image_url'] = "http://localhost:3001/letters/letter-" + user[0].toLowerCase() + ".png";
      }
      socket_user['link_url'] = link_url;

      io.applications[app_name].rooms[room].users[user] = socket_user;

      nsp.to(app_name + '-' + room).emit('room_update', io.applications[app_name].rooms[room].users );

      //disable new connected clients
      if(io.applications[app_name].disable || io.applications[app_name].rooms[room].disable ){
        socket.emit('room_js', remote.disable_on_code(io.applications[app_name].disable || io.applications[app_name].rooms[room].disable) );
      }
    });


    socket.on('disconnect', function(){
      for(var app_name in io.applications){
        for(var room_name in io.applications[app_name].rooms){
          if(io.applications[app_name].rooms[room_name] !== undefined){
            for(var user in io.applications[app_name].rooms[room_name].users){
              if(io.applications[app_name].rooms[room_name].users[user]['socket_username'] == socket.username){
                if(io.applications[app_name].rooms[room_name].users[user]['count'] > 1) {
                  io.applications[app_name].rooms[room_name].users[user]['count'] = io.applications[app_name].rooms[room_name].users[user]['count'] - 1;
                } else {
                  delete io.applications[app_name].rooms[room_name].users[user];
                  if(Object.keys(io.applications[app_name].rooms[room_name]).length == 0){
                    delete io.applications[app_name].rooms[room_name];
                  }
                }
                break;
              }
            }
          }
        }
        nsp.to(getSocketRoomName(app_name, room_name)).emit('room_update', io.applications[app_name].rooms[room_name].users );
      }
    });
  });
return io;
}