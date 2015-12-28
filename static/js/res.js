define(function(require, exports, module){
  exports.data = {};
  function loadImage(src){
    var defer = Q.defer();
    var img = new Image();
    img.src = '/static/res' + src;
    img.onload = function(){
      exports.data[src] = img;
      defer.resolve(img);
    };
    return defer.promise;
  }

  exports.init = function(){
    var defer = Q.defer();
    var imageList = [];
    $.each('cloud tree branch-left branch-right player-both player-left player-right'.split(' '), function(i, name){
      imageList.push(loadImage('/images/' + name + '.png'));
    });

    Q.all(imageList).done(function(){
      defer.resolve();
    });
    return defer.promise;
  };
});