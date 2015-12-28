define(function(require, exports, module){
  var conf = require('conf');
  var utils = require('utils');
  var res = require('res');

  var sky = require('sky');
  var ladder = require('ladder');
  var player = require('player');
  var fx = require('fx');

  exports.init = function(skyCanvas, ladderCanvas, playerCanvas, fxCanvas){
    var defer = Q.defer();
    var ratio = exports.ratio = window.devicePixelRatio || 2;
    ratio = exports.ratio = 2; // 呃
    /*var canvasWidth = exports.canvasWidth
                    = skyCanvas.width
                    = ladderCanvas.width
                    = playerCanvas.width
                    = fxCanvas.width
                    = $(document).width() * ratio;

    var canvasHeight = exports.canvasHeight
                     = skyCanvas.height
                     = ladderCanvas.height
                     = playerCanvas.height
                     = fxCanvas.height
                     = $(document).height() * ratio;*/
    var canvasWidth = exports.canvasWidth
                    = skyCanvas.width
                    = ladderCanvas.width
                    = playerCanvas.width
                    = fxCanvas.width
                    = $(skyCanvas).width() * ratio;

    var canvasHeight = exports.canvasHeight
                     = skyCanvas.height
                     = ladderCanvas.height
                     = playerCanvas.height
                     = fxCanvas.height
                     = $(skyCanvas).height() * ratio;

    //alert(window.devicePixelRatio + ' x ' + canvasWidth + ',' + canvasHeight + ' ; ' + window.innerWidth + ',' + window.innerHeight);
    //alert([ratio, canvasWidth, canvasHeight].join('\n'));
    //utils.debug('ratio:' + ratio);
    //utils.debug('size:' + canvasWidth + 'x' + canvasHeight);

    Q.all([
      sky.init(res, exports, skyCanvas),
      ladder.init(res, exports, ladderCanvas),
      player.init(res, exports, playerCanvas),
      fx.init(res, exports, fxCanvas)
    ]).done(function(){
      defer.resolve();
    });

    return defer.promise;
  };

  exports.update = function(elapsed, game){
    sky.update(elapsed, game);
    ladder.update(elapsed, game);
    player.update(elapsed, game);
    fx.update(elapsed, game);
  };

  exports.render = function(game){
    sky.render(game);
    ladder.render(game);
    player.render(game);
    fx.render(game);
  };
});