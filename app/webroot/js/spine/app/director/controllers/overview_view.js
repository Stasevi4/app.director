var $, OverviewView;
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
OverviewView = (function() {
  __extends(OverviewView, Spine.Controller);
  OverviewView.extend(Spine.Controller.Toolbars);
  OverviewView.prototype.elements = {
    ".items": "items",
    '.optClose': 'btnClose'
  };
  OverviewView.prototype.events = {
    "click .optClose": "close"
  };
  OverviewView.prototype.template = function(items) {
    return $("#overviewTemplate").tmpl(items);
  };
  OverviewView.prototype.toolsTemplate = function(items) {
    return $("#toolsTemplate").tmpl(items);
  };
  function OverviewView() {
    this.callback = __bind(this.callback, this);    OverviewView.__super__.constructor.apply(this, arguments);
    this.maxRecent = 16;
    this.bind('render:toolbar', this.proxy(this.renderToolbar));
    Spine.bind('overview', this.proxy(this.show));
    Recent.bind('recent', this.proxy(this.render));
  }
  OverviewView.prototype.render = function(items) {
    var item, recents, _i, _len;
    recents = [];
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      recents.push(item['Photo']);
    }
    this.items.html(this.template(recents));
    return this.uri(items);
  };
  OverviewView.prototype.previewSize = function(width, height) {
    if (width == null) {
      width = 70;
    }
    if (height == null) {
      height = 70;
    }
    return {
      width: width,
      height: height
    };
  };
  OverviewView.prototype.uri = function(items, mode) {
    if (mode == null) {
      mode = 'html';
    }
    console.log('PhotoList::uri');
    return Photo.uri(items, this.previewSize(), mode, __bind(function(xhr, record) {
      return this.callback(items, xhr);
    }, this));
  };
  OverviewView.prototype.callback = function(items, json) {
    var ele, img, item, jsn, photo, searchJSON, src, _i, _len, _results;
    console.log('PhotoList::callback');
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
      photo = item['Photo'];
      jsn = searchJSON(photo.id);
      _results.push(jsn ? (ele = this.items.children().forItem(photo, true), src = jsn.src, img = new Image, img.element = ele, img.src = src, img.onload = this.imageLoad) : void 0);
    }
    return _results;
  };
  OverviewView.prototype.imageLoad = function() {
    var css;
    css = 'url(' + this.src + ')';
    return $('.thumbnail', this.element).css({
      'backgroundImage': css,
      'backgroundPosition': 'center, center'
    });
  };
  OverviewView.prototype.loadRecent = function() {
    return Recent.check(this.maxRecent);
  };
  OverviewView.prototype.show = function() {
    var cont, _i, _len, _ref;
    _ref = App.contentManager.controllers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cont = _ref[_i];
      if (cont.isActive()) {
        this.savedView = cont;
      }
    }
    App.contentManager.change(this);
    return this.loadRecent();
  };
  OverviewView.prototype.close = function() {
    return App.contentManager.change(this.savedView);
  };
  OverviewView.prototype.renderToolbar = function() {};
  return OverviewView;
})();
if (typeof module !== "undefined" && module !== null) {
  module.exports = OverviewView;
}