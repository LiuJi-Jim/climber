define(function(require, exports, module){
  var conf = require('conf');
  var utils = require('utils');
  var res, display, canvas, ctx;
  var width, height;
  var tree, branchLeft, branchRight;
  var branchLeftX, branchRightX;

  var paddingBottom = conf.PaddingBottom;

  exports.init = function(_res, _display, _canvas){
    var defer = Q.defer();
    res = _res;
    display = _display;
    canvas = _canvas;
    ctx = canvas.getContext('2d');

    width = display.canvasWidth;
    height = display.canvasHeight;

    tree = res.data['/images/tree.png'];
    branchLeft = res.data['/images/branch-left.png'];
    branchRight = res.data['/images/branch-right.png'];

    branchLeftX = (width - tree.width) / 2 - branchLeft.width + 6;
    branchRightX = (width - tree.width) / 2 + tree.width - 6;

    defer.resolve();
    return defer.promise;
  };

  exports.update = function(elapsed){

  };

  function renderTrunk(game){
    var x = (width - tree.width) / 2;
    var y = 0;
    while (y < height){
      ctx.drawImage(tree, x, y);
      y += tree.height;
    }
  }

  function renderBranch(game){
    var offsetY = height - paddingBottom;
    var queue = game.status.levelQueue;
    var frame = game.status.climbAnimationFrame;
    for (var i=0,len=queue.length; i<len; ++i){
      var dir = queue[i],
          img = dir === 1 ? branchLeft : branchRight;
      var x = dir === 1 ? branchLeftX : branchRightX,
          y = offsetY - img.height + (frame / conf.ClimbAnimationFrameCount) * conf.LevelHeight;
      ctx.drawImage(img, x, y);
      offsetY -= conf.LevelHeight;
    }
  }

  exports.render = function(game){
    ctx.clearRect(0, 0, width, height);
    renderTrunk(game);
    renderBranch(game);
  };
});