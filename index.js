var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rooms = {};

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

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/a', function(req, res){
  res.sendfile('index.html');
});

app.get('/b', function(req, res){
  res.sendfile('index.html');
});

app.get('/status', function(req, res){
  var nsp = io.of('/wiv');
  var s = '<h1>Status</h1>';
  s = s + "Sockets: " + nsp.sockets.length + "<br>";

  s = s + "Rooms: ";
  s = s + "<ul>";

  h = getRoomsHash(nsp);
  for(var r in h){
    s = s + "<li>";
    s = s + "<b>" + r + "</b>"
    s = s + h[r];
    s = s + "</li>";
  }

  s = s + "</ul>";
  res.send(s);
  
});


var nsp = io.of('/wiv');
nsp.on('connection', function(socket){
  socket.on('user_and_room', function(user,room, image_url, link_url){
    socket.username = user;
    socket.join(room);
    if(rooms[room] === undefined){
      rooms[room] = {};
    }
    if(rooms[room][user] === undefined){
      var data = {};
      data['username'] = user;
      data['count'] = 1;
      rooms[room][user] = data;
    } else {
      rooms[room][user]['count'] = rooms[room][user]['count'] + 1;
    }
    rooms[room][user]['image_url'] = image_url;
    rooms[room][user]['link_url'] = link_url;

    console.log(user + " connected " + room);
    nsp.to(room).emit('room_update', rooms[room] );
  });



  socket.on('disconnect', function(){
    console.log(socket.username + " disconnected");
    for(var r in socket.rooms){
      var room = socket.rooms[r];
      if(rooms[room] !== undefined){

        for(var el in rooms[room]){
          if(rooms[room][el]['username'] == socket.username){
            if(rooms[room][el]['count'] > 1) {
              rooms[room][el]['count'] = rooms[room][el]['count'] - 1;
            } else {
              delete rooms[room][el];
            }
            break;
          }
        }
      }
    }
  });
});


http.listen(3855, function(){
  console.log('listening on *:3855');
});