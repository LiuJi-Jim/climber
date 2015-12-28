define(function(require, exports, module){
  var conf = require('conf');
  var utils = require('utils');

  var status = exports.status = {
    level: 0,
    levelQueue: [],
    isClimbAnimating: false,
    climbAnimationFrame: 0
  };

  function generateLevels(){
    var count = status.levelCount,
        queue = status.levelQueue;
    while (queue.length < count){
      var level = Math.random() < 0.5 ? 1 : 2;
      queue.push(level);
    }
  }

  exports.run = function(res, input, display, ui, sound){
    var defer = Q.defer();
    var counter = 0;
    status.levelCount = Math.ceil(display.canvasHeight / conf.LevelHeight); // 需要计算多少层
    status.levelQueue.length = 0;
    generateLevels();
    status.currentSide = status.levelQueue[0]; // 初始位置
    status.isClimbAnimating = false;
    status.climbAnimationFrame = 0;
    status.level = 0;
    status.life = 50;
    var isAnimationEndFrame = false;

    input.clear();

    var fpsTimer = utils.keepFPS(function(elapsed, real){
      //utils.debug(elapsed, real);
      var harm = 0;
      if (status.level > 0){
        var acc = status.level - 1;
        harm = 1 + acc / conf.HarmDivisor;
        if (harm > conf.MaxHarm) harm = conf.MaxHarm;
      }
      var realHarm = harm * (elapsed / 1000);
      status.life -= realHarm;
      //utils.debug(status.life.toFixed(2), realHarm.toFixed(2), harm.toFixed(2));
      if (status.life < 0){
        status.life = 0;
        // gameover
        utils.cancelKeepFPS(fpsTimer);
        defer.resolve(utils.objClone(status));

        sound.play('/canjiao');

        return;
      }

      if (!isAnimationEndFrame){
        if (status.isClimbAnimating){
          status.climbAnimationFrame++;
          if (status.climbAnimationFrame > conf.ClimbAnimationFrameCount){
            // 一次动画结束
            status.isClimbAnimating = false;
            status.climbAnimationFrame = 0;

            status.currentSide = status.towardsSide;

            status.levelQueue.shift();
            generateLevels();

            if (status.currentSide !== status.levelQueue[0]){
              // gameover
              utils.cancelKeepFPS(fpsTimer);
              defer.resolve(utils.objClone(status));

              sound.play('/canjiao');

              return;
            }
            status.level++;

            status.life += 1;
            if (status.life > 100){
              status.life = 100;
            }

            //isAnimationEndFrame = true;
          }
        }
        if (!status.isClimbAnimating){

          if (input.keyPress > 0){
            var key = input.keyPress === 1 ? 'LEFT' : 'RIGHT';

            status.isClimbAnimating = true;
            status.climbAnimationFrame = 0;
            status.towardsSide = input.keyPress;

            input.clear();

            sound.play('/jump');
          }else{
          }
        }
      }else{
        isAnimationEndFrame = false;
      }

      display.update(elapsed, exports);
      ui.update(elapsed, exports);

      display.render(exports);
      ui.render(exports);
    }, conf.FPS);

    return defer.promise;
  };
});