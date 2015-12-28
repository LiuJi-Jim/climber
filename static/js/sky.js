define(function(require, exports, module){
  var conf = require('conf');
  var utils = require('utils');
  var res, display, canvas, ctx;
  var width, height;
  var skyGradient;

  var lastLevel = 0;
  var cloud, cloudOffset = 0, cloudSpeed = 1;

  exports.init = function(_res, _display, _canvas){
    var defer = Q.defer();
    res = _res;
    display = _display;
    canvas = _canvas;
    ctx = canvas.getContext('2d');

    width = display.canvasWidth;
    height = display.canvasHeight;

    skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#0498ff');
    skyGradient.addColorStop(1, '#f3f9ff');
    //skyGradient.addColorStop(0, '#001e42');
    //skyGradient.addColorStop(1, '#00344f');

    cloud = res.data['/images/cloud.png'];

    defer.resolve();
    return defer.promise;
  };

  exports.update = function(elapsed, game){
    var level = game.status.level;
    var frame = game.status.climbAnimationFrame;
    var acc = level * level * 0.3;
    if (acc < 10) acc = 10;
    if (acc >= 50) acc = 50;
    var offset = (acc * cloudSpeed) * (frame / conf.ClimbAnimationFrameCount);
    cloudOffset += offset;
    cloudOffset %= cloud.height;
  };

  exports.render = function(game){
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    var x = (width - cloud.width) / 2;
    var startY = cloudOffset;
    if (cloudOffset > 0){
      startY -= cloud.height;
    }
    while (startY < height){
      ctx.drawImage(cloud, x, startY);
      startY += cloud.height;
    }
  };
});