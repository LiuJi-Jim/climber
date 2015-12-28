define(function(require, exports, module){
  var conf = require('conf');
  var utils = require('utils');
  exports.data = {};

  var Pool = function(src, size){
    this.size = size = size || 5;
    this.src = src;
    this.pool = new Array(size);
    this.index = 0;
  };
  Pool.prototype.init = function(){
    var size = this.size;
    var defer = Q.defer();
    var waits = new Array(size);
    for (var i=0; i<size; ++i){
      waits.push(this.initOne(i));
    }
    Q.all(waits).then(function(){
      defer.resolve();
    });
    return defer.promise;
  };
  Pool.prototype.initOne = function(i){
    var me = this;
    var pool = me.pool;
    var defer = Q.defer();
    var audio = new Audio();
    audio.volume = 0;
    audio.addEventListener('ended', function(e){
      audio.currentTime = 0;
    });
    audio.preload = 'auto';
    audio.src = '/static/res' + me.src + conf.SoundFileExt;// + '?__n=' + i;
    audio.addEventListener('play', function(e){
      audio.pause();
      utils.debug('load', me.src, i);
      audio.removeEventListener('play', arguments.callee);
    });
    audio.play();
    utils.debug('loading', me.src, i);
    pool[i] = audio;
    defer.resolve();
    return defer.promise;
  };
  Pool.prototype.play = function(){
    var audio = this.pool[this.index];
    this.index++;
    if (this.index >= this.size) this.index = 0;
    if (audio){
      audio.volume = 1;
      audio.play();
    }
  };

  function loadSound(src, n){
    var defer = Q.defer();
    var pool = new Pool(src, n);
    pool.init().then(function(){
      exports.data[src] = pool;
      defer.resolve();
    });
    return defer.promise;
  }
  exports.play = function(name){
    var src = '/sound' + name;
    var audio = exports.data[src];
    if (audio){
      audio.play();
    }
  }
  exports.init = function(){
    var defer = Q.defer();
    var soundList = [];
    var jumpCount = utils.isIOS() ? 2 : 2;
    if (navigator.platform === 'Win32') jumpCount = 3;
    soundList.push(loadSound('/sound/jump', jumpCount));
    soundList.push(loadSound('/sound/canjiao', 1));
    Q.all(soundList).done(function(){
      defer.resolve();
    });
    return defer.promise;
  };
});