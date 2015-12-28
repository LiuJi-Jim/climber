define(function(require, exports, module){
  var conf = require('conf');
  Q.longStackSupport = true;

  var noop = function(){};
  /**
   * extend，和jQuery.extend一样
   * @method
   * @return {Object}
   */
  var extend = exports.extend = (function(){
    // from node-extend
    // https://www.npmjs.org/package/extend
    var hasOwn = Object.prototype.hasOwnProperty;
    var toString = Object.prototype.toString;

    function isPlainObject(obj) {
      if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval)
        return false;

      var has_own_constructor = hasOwn.call(obj, 'constructor');
      var has_is_property_of_method = hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
      // Not own constructor property must be Object
      if (obj.constructor && !has_own_constructor && !has_is_property_of_method)
        return false;

      // Own properties are enumerated firstly, so to speed up,
      // if last one is own, then all properties are own.
      var key;
      for ( key in obj ) {}

      return key === undefined || hasOwn.call( obj, key );
    }

    var extend = function() {
      var options, name, src, copy, copyIsArray, clone,
          target = arguments[0] || {},
          i = 1,
          length = arguments.length,
          deep = false;

      // Handle a deep copy situation
      if ( typeof target === "boolean" ) {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
      }

      // Handle case when target is a string or something (possible in deep copy)
      if ( typeof target !== "object" && typeof target !== "function") {
        target = {};
      }

      for ( ; i < length; i++ ) {
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) !== null ) {
          // Extend the base object
          for ( name in options ) {
            src = target[ name ];
            copy = options[ name ];

            // Prevent never-ending loop
            if ( target === copy ) {
              continue;
            }

            // Recurse if we're merging plain objects or arrays
            if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) ) ) {
              if ( copyIsArray ) {
                copyIsArray = false;
                clone = src && Array.isArray(src) ? src : [];

              } else {
                clone = src && isPlainObject(src) ? src : {};
              }

              // Never move original objects, clone them
              target[ name ] = extend( deep, clone, copy );

            // Don't bring in undefined values
            } else if ( copy !== undefined ) {
              target[ name ] = copy;
            }
          }
        }
      }

      // Return the modified object
      return target;
    };

    return extend;
  })();

  exports.arrClone = function(arr){
    return Array.prototype.slice.call(arr, 0);
  };

  exports.objClone = function(obj){
    return extend({}, obj);
  };

  /**
   * 简单的事件机制，可以将其extend到任意对象上使其获得on/off/one/fire功能
   */
  exports.Events = {
    on: function(name, callback) {
      var events = name.split(/\s+/);
      if (typeof this._events === 'undefined') this._events = {};
      for (var i = 0; i < events.length; ++i) {
        var event = events[i],
          callbacks = this._events[event] || (this._events[event] = []);
        callbacks.push(callback);
      }
      return this;
    },
    off: function(name, callback) {
      var events = name.split(/\s+/);
      if (typeof this._events === 'undefined') this._events = {};
      for (var i = 0; i < events.length; ++i) {
        var event = events[i],
          callbacks = this._events[event] || (this._events[event] = []);
        for (var j = 0; j < callbacks.length; ++j) {
          if (callbacks[i] === callback) {
            callbacks.splice(i, 1);
            break;
          }
        }
      }
      return this;
    },
    one: function(name, callback) {
      return this.on(name, function(e) {
        callback.call(this, e);
        this.off(name, arguments.callee);
      });
    },
    fire: function(name, data) {
      var events = name.split(/\s+/);
      if (typeof this._events === 'undefined') this._events = {};
      for (var i = 0; i < events.length; ++i) {
        var event = events[i],
          callbacks = this._events[event] || (this._events[event] = []);
        for (var j = 0; j < callbacks.length; ++j) {
          callbacks[j].call(this, {
            name: event,
            data: data
          });
        }
      }
      return this;
    }
  };

  /**
   * 返回一个this上下文固定的函数
   * @method
   * @param  {Function} fn
   * @param  {Any}   thisObj
   * @return {Function}
   */
  exports.proxy = function(fn, thisObj){
    return function(){
      return fn.apply(thisObj, [].slice.call(arguments, 0));
    };
  };

  /**
   * 高精度计时（在不支持的时候会使用低精度）
   * @method
   * @return {Double} 毫秒
   */
  exports.hrtime = (function(){
    if (typeof window !== 'undefined'){
      // browser
      if (typeof window.performance !== 'undefined' && typeof performance.now !== 'undefined'){
        // support hrt
        return function(){
          return performance.now();
        };
      }else{
        // oh no..
        return function(){
          return (new Date()).getTime();
        };
      }
    }else{
      // node.js
      return function(){
        var diff = process.hrtime();
        return (diff[0] * 1e9 + diff[1]) / 1e6; // nano second -> ms
      };
    }
  })();

  function proxyThese(arr, thisObj){
    for (var i=0; i<arr.length; ++i){
      var fn = arr[i];
      if (typeof fn !== 'undefined'){
        return exports.proxy(fn, thisObj);
      }
    }
    return false;
  }

  /**
   * requestAnimationFrame的兼容
   * @method
   * @return {int} 句柄
   */
  exports.requestAnimationFrame = (function(){
    return proxyThese([
             window.requestAnimationFrame,
             window.webkitRequestAnimationFrame,
             window.mozRequestAnimationFrame,
             window.oRequestAnimationFrame
           ], window) ||
           function (fn){
             return setTimeout(fn, 1000 / 60);
           };
  })();
  /**
   * cancelAnimationFrame的兼容
   * @method
   * @param {int} id 句柄
   */
  exports.cancelAnimationFrame = (function(){
    return proxyThese([
             window.cancelAnimationFrame,
             window.webkitCancelAnimationFrame,
             window.mozCancelAnimationFrame,
             window.oCancelAnimationFrame
           ], window) ||
           function (id){
             clearTimeout(id);
           };
  })();

  /**
   * 保持帧数的循环
   * @param  {Function(elapsed, realElapsed)} callback 每帧回调，参数为距离上一帧游戏时间，距离上一帧真实时间
   * @param  {int}   fps
   * @param  {int}   err 允许误差，默认为每帧时间/20
   * @return {int}   ID
   */
  exports.keepFPS = function(callback, fps, err){
    var lastFrameTime = 0,//exports.hrtime(),
        frameTime = 1000 / fps;
    err = err | (frameTime / 20);
    var id = setInterval(function(){
      var now = exports.hrtime();
      var elapsed = now - lastFrameTime;
      if (elapsed + err >= frameTime){
        callback(elapsed * conf.GameSpeed, elapsed);
        lastFrameTime = now;
      }
    }, 0);
    return id;
  };
  /**
   * 取消保持帧数的循环
   * @param  {int} id
   */
  exports.cancelKeepFPS = function(id){
    clearInterval(id);
  };
  exports.isNumber = function(a){
    //return (a == +a);
    return !isNaN(a); // WARNING 靠不靠谱呢
  };
  exports.initArray = function(len, cont){
    var arr = new Array(len);
    for (var i=0; i<len; ++i){
      arr[i] = (typeof cont == 'function') ? new cont() : {};
    }
    return arr;
  };
  exports.timestamp = function(){
    return (new Date()).getTime();
  };
  exports.random = function(min, max){
    if (max < min) return min;
    return min + ~~(Math.random() * (max - min));
  };
  exports.sleep = function(ms){
    return Q.delay(ms);
  };

  exports.debug = function(msg){
    if (!conf.DEBUG) return;
    var div = $('#debug'), children = div.children();
    if (children.size() >= conf.DEBUG) $(children[0]).remove();
    if (arguments.length > 1){
      msg = Array.prototype.join.call(arguments, ' ');
    }
    $('#debug').append('<p>' + msg + '</p>');
    console.log(msg);
  };

  exports.log = function(params, callback){
    var baseUrl = conf.LogBaseUrl;
    var arr = [];
    for (var key in params){
      arr.push(key + '=' + encodeURIComponent(params[key]));
    }
    arr.push('___t=' + Math.random());
    var url = baseUrl + arr.join('&');
    var id = Math.random(),
        img = window[id] = new Image();
    img.onload = img.onerror = function(){
      img.onload = img.onerror = null;
      delete window[id];
      if ($.isFunction(callback)) callback();
    };
    img.src = url;
  };

  exports.isAndroid = function(){
    return !!navigator.userAgent.match(/Android/);
  };
  exports.isIOS = function(){
    return !!navigator.userAgent.match(/i(Phone|Pod|Pad)/);
  };
});