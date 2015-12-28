define(function(require, exports, module){
  var conf = require('conf');
  var utils = require('utils');
  var res, display, canvas, ctx;
  var width, height;
  var tree, playerLeft, playerRight, playerBoth;

  var paddingBottom = conf.PaddingBottom;
  var playerWidth, playerHeight;
  var hangingY, hangingLeftX, hangingRightX;

  exports.init = function(_res, _display, _canvas){
    var defer = Q.defer();
    res = _res;
    display = _display;
    canvas = _canvas;
    ctx = canvas.getContext('2d');

    width = display.canvasWidth;
    height = display.canvasHeight;

    tree = res.data['/images/tree.png'];
    playerLeft = res.data['/images/player-left.png'];
    playerRight = res.data['/images/player-right.png'];
    playerBoth = res.data['/images/player-both.png'];

    playerWidth = playerBoth.width;
    playerHeight = playerBoth.height;
    hangingY = height - paddingBottom - 35;
    hangingLeftX = (width - tree.width) / 2 - 20 - playerWidth;
    hangingRightX = (width - tree.width) / 2 + tree.width + 20;

    defer.resolve();
    return defer.promise;
  };

  exports.update = function(elapsed){

  };

  var staticFrame = 0;
  function renderStaticPlayer(game){
    var currentSide = game.status.currentSide;
    var img = currentSide === 1 ? playerLeft : playerRight;
    var x = currentSide === 1 ? hangingLeftX : hangingRightX,
        y = hangingY;

    staticFrame++;
    if (staticFrame >= 19){
      staticFrame = 0;
    }
    var offset = 0.1 * (staticFrame - 10);

    ctx.drawImage(img, x, y + offset);
  }
  function renderMovingPlayer(game){
    var currentSide = game.status.currentSide,
        towardsSide = game.status.towardsSide;
    var frame = game.status.climbAnimationFrame;
    var fromX = currentSide === 1 ? hangingLeftX : hangingRightX,
        fromY = hangingY;
    var toX = towardsSide === 1 ? hangingLeftX : hangingRightX,
        toY = hangingY - conf.LevelHeight;
    var x = fromX + (toX - fromX) * (frame / conf.ClimbAnimationFrameCount),
        y = fromY;
    ctx.save();
    //ctx.moveTo(x, y);
    if (currentSide === towardsSide){
      // 向上跳
      ctx.setTransform(1, 0, 0, 1.2, 0, -1.2 * playerHeight)
      ctx.drawImage(playerBoth, x, y);
    }else{
      //var tan = towardsSide === 1 ? Math.tan(45) : Math.tan(-45);
      var tan = towardsSide === 1 ? 0.3 : -0.3;
      var offsetY = towardsSide == 1 ? -playerHeight * ((conf.ClimbAnimationFrameCount - frame + 1) / conf.ClimbAnimationFrameCount) : -playerHeight + playerHeight * ((frame + 2) / conf.ClimbAnimationFrameCount);
      ctx.setTransform(1, tan, 0, 1, 0, offsetY)
      ctx.drawImage(playerBoth, x, y);
    }
    ctx.restore();
  }

  exports.render = function(game){
    ctx.clearRect(0, 0, width, height);
    if (game.status.isClimbAnimating){
      renderMovingPlayer(game);
    }else{
      renderStaticPlayer(game);
    }
  };
});