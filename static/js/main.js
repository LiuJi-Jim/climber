define(function(require, exports, module){
  var conf = require('conf');
  var utils = require('utils');
  var res = require('res');
  var input = require('input');
  var display = require('display');
  var game = require('game');
  var ui = require('ui');
  var sound = require('sound');

  $(window).on('load', function(){
    utils.log({
      type: 'PV'
    });
    Q.all([res.init(), sound.init()]).then(function(){
      return input.init();
    }).then(function(){
      return display.init($('#sky')[0], $('#ladder')[0], $('#player')[0], $('#fx')[0]);
    }).then(function(){
      return ui.init($('#ui'), exports);
    }).then(function(){
      exports.play();
    });
  });

  exports.play = function(){
    ui.reset();
    game.run(res, input, display, ui, sound).then(function(status){
      ui.gameover(status);
      utils.log({
        type: 'SCORE',
        score: status.level
      });
    });
  };
});