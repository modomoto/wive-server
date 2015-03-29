var express = require('express');
//var router = express.Router();
var app = express();
var remote = require('./libs/remote');
var config = require('config');

  function getNumberOfConnections(io)
  {
    var connections = 0;
    for(var app_name in io.applications){
      console.log(app_name);
      for(var room_name in io.applications[app_name].rooms){
        console.log(room_name);
        console.log(io.applications[app_name].rooms);

        for(var user in io.applications[app_name].rooms[room_name].users){
          console.log(user);
          connections += io.applications[app_name].rooms[room_name].users[user].count;
        }
      }
    }
    return connections;
  }

exports.index = function(req, res){
  var app = req.app;
  var socketio = app.get('socketio');
  res.render('index', {
    title: 'Wive',
    applications: socketio.applications,
    connections: getNumberOfConnections(socketio)
  });
};

exports.disable_on = function(req,res){
  var app = req.app;
  var io = app.get('socketio');
  var app_name = req.body.app_name;
  var room_name = req.body.room_name;
  var code = remote.disable_on_code(req.body.disable_message);
  var nsp = io.of('/wive-socket');
  for(var name in io.applications[app_name].rooms){
    if(!room_name || room_name == name ){
      console.log('disable on ' + app_name + '-' + name);
      if(!room_name){
        io.applications[app_name].disable = req.body.disable_message;
      }else{
        io.applications[app_name].rooms[name].disable = req.body.disable_message;
      }
      nsp.to(app_name + '-' + name).emit('room_js', code );
    }
  }
  res.redirect('/');
};

exports.disable_off = function(req,res){
  var app = req.app;
  var io = app.get('socketio');
  var app_name = req.body.app_name;
  var room_name = req.body.room_name;
  var code = remote.disable_off_code();
  var nsp = io.of('/wive-socket');
  for(var name in io.applications[app_name].rooms){
    if(!room_name || room_name == name ){
      console.log('disable on ' + app_name + '-' + name);
      if(!room_name){
        io.applications[app_name].disable = false;
      }else{
        io.applications[app_name].rooms[name].disable = false;
      }
      nsp.to(app_name + '-' + name).emit('room_js', code );
    }
  }
  res.redirect('/');

};

exports.eval = function(req, res){
  var app = req.app;
  var io = app.get('socketio');
  var app_name = req.body.app_name;
  var room_name = req.body.room_name;
  var code = req.body.code;
  console.log('Eval Call: ' + app_name + '-' + room_name + '  ' + code );
  var nsp = io.of('/wive-socket');
  nsp.to(app_name + '-' + room_name).emit('room_js', code );
  res.redirect('/');
};

exports.client_js = function(req, res){
  res.render('client_js', {
    layout: false,
    base_url: config.get('base_url')
  });
};
