define(function(require, exports, module){
  var conf = require('conf');
  var utils = require('utils');

  var Key = exports.Key = {
    Left: 1,
    Right: 2
  };
  var keyCodes = {
    A: 65,
    D: 68,
    Z: 90,
    SLASH: 191,
    LEFT: 37,
    RIGHT: 39
  };
  exports.keyPress = 0;

  function keyEventHandler(e){
    var processed = false;
    var keyCode = e.keyCode;
    if (keyCode === keyCodes.A || keyCode === keyCodes.LEFT || keyCode === keyCodes.Z){
      exports.keyPress = Key.Left;
      processed = true;
    }
    if (keyCode === keyCodes.D || keyCode === keyCodes.RIGHT || keyCode === keyCodes.SLASH){
      exports.keyPress = Key.Right;
      processed = true;
    }
    if (processed){
      e.preventDefault();
      e.stopPropagation();
    }
  }
  var width = $('#wrap').width();
  function touchEventHandler(e){
    e = e.originalEvent;
    var touch = e.changedTouches[0];
    var x = touch.clientX;
    if (x < width / 2){
      exports.keyPress = Key.Left;
    }else{
      exports.keyPress = Key.Right;
    }
  }

  exports.init = function(){
    var defer = Q.defer();
    $(function(){
      $(window).on('keydown', keyEventHandler);

      $('#wrap').on('touchstart', touchEventHandler);
      defer.resolve();
    });
    return defer.promise;
  };
  exports.clear = function(){
    exports.keyPress = 0;
  };
});