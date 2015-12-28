define(function(require, exports, module){
  var conf = require('conf');
  var utils = require('utils');
  var main;
  var uiDiv, loadingDiv, scoreDiv, hpDiv, hpValue, replay, shareDiv, shareWeixinGuide;
  var title;
  var status;

  function getShareText(){
    return '我在#人猿泰山#获得了{0}分，来吧！战个痛'.replace('{0}', status.level);
  }

  function shareWeibo(){
    var baseUrl = 'http://service.weibo.com/share/share.php?';
    var params = {
      title: getShareText(),
      url: conf.SiteUrl,
      sharePic: 'false'
    }
    var arr = [];
    for (var key in params){
      arr.push(key + '=' + encodeURIComponent(params[key]));
    }
    var url = baseUrl + arr.join('&');

    location.href = url;
  }
  function shareWeixin(){
    WeixinJSBridge.invoke('shareTimeline', {
      img_url: conf.ShareImgUrl,
      title: '人猿泰山',
      link: conf.SiteUrl,
      desc: getShareText()
    }, function(res){
      //alert(JSON.stringify(res))
    });
  }

  exports.init = function(_uiDiv, main){
    var defer = Q.defer();

    uiDiv = _uiDiv;

    scoreDiv = uiDiv.find('#score');
    loadingDiv = uiDiv.find('#loading');
    hpDiv = uiDiv.find('#hp');
    hpValue = hpDiv.find('#hp-value');
    replay = uiDiv.find('#replay');

    var clickEvent = 'ontouchstart' in window ? 'touchstart' : 'click';
    replay.on(clickEvent, function(e){
      e.stopPropagation();
      e.preventDefault();

      main.play();
    });

    loadingDiv.hide();

    shareWeixinGuide = uiDiv.find('#share-weixin-guide');
    shareDiv = uiDiv.find('#share');
    if (typeof WeixinJSBridge !== 'undefined'){
      shareDiv.find('#share-weixin')/*.show()*/.on(clickEvent, function(e){
        e.stopPropagation();
        e.preventDefault();
        shareWeixin();
        // 我了割草，用不了啊
      });
    }
    shareDiv.find('#share-weibo').on(clickEvent, function(e){
      e.stopPropagation();
      e.preventDefault();
      shareWeibo();
    });

    title = document.title;

    defer.resolve();
    return defer.promise;
  };

  exports.gameover = function(_status){
    status = _status;
    replay.show();
    shareDiv.show();
    if (typeof WeixinJSBridge !== 'undefined'){
      shareWeixinGuide.show();
    }
    document.title = getShareText();
  };

  exports.reset = function(){
    scoreDiv.html(0);
    hpValue.css('width', '50%');
    replay.hide();
    shareDiv.hide();
    shareWeixinGuide.hide();
    scoreDiv.show();
    hpDiv.show();

    document.title = title;
  };

  exports.update = function(elapsed, game){
  };

  exports.render = function(game){
    scoreDiv.html(game.status.level);
    hpValue.css('width', game.status.life + '%');
  };
});