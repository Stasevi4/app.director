var $, SlideshowView;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
if (typeof Spine === "undefined" || Spine === null) {
  Spine = require("spine");
}
$ = Spine.$;
SlideshowView = (function() {
  __extends(SlideshowView, Spine.Controller);
  SlideshowView.prototype.elements = {
    '.items': 'items',
    '.thumbnail': 'thumb'
  };
  SlideshowView.prototype.template = function(items) {
    return $("#photosSlideshowTemplate").tmpl(items);
  };
  function SlideshowView() {
    this.sliderStart = __bind(this.sliderStart, this);    SlideshowView.__super__.constructor.apply(this, arguments);
    this.el.data({
      current: {
        className: 'Slideshow'
      }
    });
    this.thumbSize = 140;
    this.fullScreen = true;
    this.autoplay = false;
    Spine.bind('show:slideshow', this.proxy(this.show));
    Spine.bind('play:slideshow', this.proxy(this.play));
    Spine.bind('slider:change', this.proxy(this.size));
    Spine.bind('slider:start', this.proxy(this.sliderStart));
  }
  SlideshowView.prototype.render = function(items) {
    if (!this.isActive()) {
      return;
    }
    console.log('SlideshowView::render');
    this.items.html(this.template(items));
    this.uri(items, 'append');
    this.refreshElements();
    this.size(App.showView.sliderOutValue());
    this.items.html5Sortable('photo');
    return this.el;
  };
  SlideshowView.prototype.params = function(width, height) {
    if (width == null) {
      width = this.parent.thumbSize;
    }
    if (height == null) {
      height = this.parent.thumbSize;
    }
    return {
      width: width,
      height: height
    };
  };
  SlideshowView.prototype.modalParams = function() {
    return {
      width: 600,
      height: 451,
      square: 2,
      force: false
    };
  };
  SlideshowView.prototype.uri = function(items, mode) {
    console.log('SlideshowView::uri');
    return Album.record.uri(this.params(), mode, __bind(function(xhr, record) {
      return this.callback(items, xhr);
    }, this));
  };
  SlideshowView.prototype.callback = function(items, json) {
    var ele, img, item, jsn, searchJSON, src, _i, _len;
    console.log('PhotosList::callback');
    searchJSON = function(id) {
      var itm, _i, _len;
      for (_i = 0, _len = json.length; _i < _len; _i++) {
        itm = json[_i];
        if (itm[id]) {
          return itm[id];
        }
      }
    };
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      jsn = searchJSON(item.id);
      if (jsn) {
        ele = this.items.children().forItem(item);
        src = jsn.src;
        img = new Image;
        img.element = ele;
        img.onload = this.imageLoad;
        img.src = src;
      }
    }
    return this.loadModal(items);
  };
  SlideshowView.prototype.loadModal = function(items, mode) {
    if (mode == null) {
      mode = 'html';
    }
    return Album.record.uri(this.modalParams(), mode, __bind(function(xhr, record) {
      return this.callbackModal(items, xhr);
    }, this));
  };
  SlideshowView.prototype.callbackModal = function(items, json) {
    var el, item, jsn, searchJSON, _i, _len, _results;
    console.log('Slideshow::callbackModal');
    searchJSON = function(id) {
      var itm, _i, _len;
      for (_i = 0, _len = json.length; _i < _len; _i++) {
        itm = json[_i];
        if (itm[id]) {
          return itm[id];
        }
      }
    };
    _results = [];
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      jsn = searchJSON(item.id);
      _results.push(jsn ? (el = this.items.children().forItem(item), $('div.thumbnail', el).attr({
        'data-href': jsn.src,
        'title': item.title || item.src,
        'rel': 'gallery'
      })) : void 0);
    }
    return _results;
  };
  SlideshowView.prototype.imageLoad = function() {
    var css;
    css = 'url(' + this.src + ')';
    return $('.thumbnail', this.element).css({
      'backgroundImage': css,
      'backgroundPosition': 'center, center',
      'backgroundSize': '100%'
    });
  };
  SlideshowView.prototype.show = function() {
    var filterOptions, items;
    console.log('Slideshow::show');
    Spine.trigger('change:canvas', this);
    filterOptions = {
      key: 'album_id',
      joinTable: 'AlbumsPhoto',
      sorted: true
    };
    items = Photo.filterRelated(Album.record.id, filterOptions);
    return this.render(items);
  };
  SlideshowView.prototype.sliderStart = function() {
    return this.refreshElements();
  };
  SlideshowView.prototype.size = function(val, bg) {
    if (val == null) {
      val = this.thumbSize;
    }
    if (bg == null) {
      bg = 'none';
    }
    return this.thumb.css({
      'height': val + 'px',
      'width': val + 'px',
      'backgroundSize': bg
    });
  };
  SlideshowView.prototype.play = function() {
    var res;
    if (this.parent.slideshowMode === App.SILENTMODE) {
      return;
    }
    res = this.parent.slideshowable();
    if (res.length) {
      res[0].click();
    }
    return this.parent.slideshowMode = App.SILENTMODE;
  };
  SlideshowView.prototype.toggleFullScreen = function(activate) {
    var active, root;
    active = this.fullScreenEnabled();
    root = document.documentElement;
    if (!active) {
      $('#modal-gallery').addClass('modal-fullscreen');
      if (root.webkitRequestFullScreen) {
        return root.webkitRequestFullScreen(window.Element.ALLOW_KEYBOARD_INPUT);
      } else if (root.mozRequestFullScreen) {
        return root.mozRequestFullScreen();
      }
    } else {
      $('#modal-gallery').removeClass('modal-fullscreen');
      return (document.webkitCancelFullScreen || document.mozCancelFullScreen || $.noop).apply(document);
    }
  };
  SlideshowView.prototype.fullScreenEnabled = function() {
    return !!window.fullScreen || $('#modal-gallery').hasClass('modal-fullscreen');
  };
  return SlideshowView;
})();
if (typeof module !== "undefined" && module !== null) {
  module.exports = SlideshowView;
}
