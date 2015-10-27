goog.provide('OL3PanZoom');

goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.EventType');



/**
 * @constructor
 * @param {olx.control.PanZoomOptions=} opt_options Options.
 * @extends {ol.control.Control}
 * @api
 */
var OL3PanZoom = function(opt_options) {

  var options = opt_options || {};

  /**
   * @type {Array.<goog.events.Key>}
   * @private
   */
  this.listenerKeys_ = [];

  /**
   * @private
   * @type {number}
   */
  this.duration_ = options.duration !== undefined ? options.duration : 100;

  /**
   * @private
   * @type {number}
   */
  this.pixelDelta_ = options.pixelDelta !== undefined ?
      options.pixelDelta : 128;

  /**
   * @type {?string}
   * @private
   */
  this.className_ = options.className ? options.className : 'ol-panzoom';

  /**
   * @type {?string}
   * @private
   */
  this.imgPath_ = options.imgPath ? options.imgPath : null;

  /**
   * @type {Element}
   * @private
   */
  this.panEastEl_ = this.createButtonEl_('pan-east');

  /**
   * @type {Element}
   * @private
   */
  this.panNorthEl_ = this.createButtonEl_('pan-north');

  /**
   * @type {Element}
   * @private
   */
  this.panSouthEl_ = this.createButtonEl_('pan-south');

  /**
   * @type {Element}
   * @private
   */
  this.panWestEl_ = this.createButtonEl_('pan-west');

  var element = this.createEl_();
  element.appendChild(this.panNorthEl_);
  element.appendChild(this.panWestEl_);
  element.appendChild(this.panEastEl_);
  element.appendChild(this.panSouthEl_);

  goog.base(this, /** olx.control.ControlOptions */ ({
    element: element,
    target: options.target
  }));

};
goog.inherits(OL3PanZoom, ol.control.Control);


/**
 */
ol.control.PanZoom = OL3PanZoom;


/**
 * @inheritDoc
 */
OL3PanZoom.prototype.setMap = function(map) {

  var keys = this.listenerKeys_;

  var currentMap = this.getMap();
  if (currentMap) {
    keys.forEach(ol.Observable.unByKey);
    keys.length = 0;
  }

  goog.base(this, 'setMap', map);

  if (map) {
    keys.push(goog.events.listen(this.panEastEl_, goog.events.EventType.CLICK,
        this.handlePanEastClick_, false, this));
    keys.push(goog.events.listen(this.panNorthEl_, goog.events.EventType.CLICK,
        this.handlePanNorthClick_, false, this));
    keys.push(goog.events.listen(this.panSouthEl_, goog.events.EventType.CLICK,
        this.handlePanSouthClick_, false, this));
    keys.push(goog.events.listen(this.panWestEl_, goog.events.EventType.CLICK,
        this.handlePanWestClick_, false, this));
  }
};


/**
 * @return {Element}
 * @private
 */
OL3PanZoom.prototype.createEl_ = function() {
  var path = this.imgPath_;
  var className = this.className_;
  var cssClasses = [
    className,
    'ol-unselectable',
    'ol-control'
  ].join(' ');

  var element = document.createElement('div');
  element.className = cssClasses;

  if (path) {
    element.style.left = '4px';
    element.style.top = '4px';
  }

  return element;
};


/**
 * @param {string} action
 * @return {Element}
 * @private
 */
OL3PanZoom.prototype.createButtonEl_ = function(action) {
  var divEl = document.createElement('div');
  var path = this.imgPath_;

  if (path) {
    divEl.style.width = '18px';
    divEl.style.height = '18px';
    divEl.style.position = 'absolute';
    divEl.style.cursor = 'pointer';

    var imgEl = document.createElement('img');
    switch (action) {
      case 'pan-east':
        imgEl.src = [path, 'east-mini.png'].join('/');
        divEl.style.top = '22px';
        divEl.style.left = '22px';
        break;
      case 'pan-north':
        imgEl.src = [path, 'north-mini.png'].join('/');
        divEl.style.top = '4px';
        divEl.style.left = '13px';
        break;
      case 'pan-south':
        imgEl.src = [path, 'south-mini.png'].join('/');
        divEl.style.top = '40px';
        divEl.style.left = '13px';
        break;
      case 'pan-west':
        imgEl.src = [path, 'west-mini.png'].join('/');
        divEl.style.top = '22px';
        divEl.style.left = '4px';
        break;
    }
    divEl.appendChild(imgEl);
  }

  return divEl;
};


/**
 * @param {goog.events.BrowserEvent} evt
 * @return {boolean}
 * @private
 */
OL3PanZoom.prototype.handlePanEastClick_ = function(evt) {
  return this.pan_(evt, 'east');
};


/**
 * @param {goog.events.BrowserEvent} evt
 * @return {boolean}
 * @private
 */
OL3PanZoom.prototype.handlePanNorthClick_ = function(evt) {
  return this.pan_(evt, 'north');
};


/**
 * @param {goog.events.BrowserEvent} evt
 * @return {boolean}
 * @private
 */
OL3PanZoom.prototype.handlePanSouthClick_ = function(evt) {
  return this.pan_(evt, 'south');
};


/**
 * @param {goog.events.BrowserEvent} evt
 * @return {boolean}
 * @private
 */
OL3PanZoom.prototype.handlePanWestClick_ = function(evt) {
  return this.pan_(evt, 'west');
};


/**
 * @param {goog.events.BrowserEvent} evt
 * @param {string} direction
 * @return {boolean}
 * @private
 */
OL3PanZoom.prototype.pan_ = function(evt, direction) {
  var stopEvent = false;

  var map = this.getMap();
  goog.asserts.assert(map, 'map must be set');
  var view = map.getView();
  goog.asserts.assert(view, 'map must have view');
  var mapUnitsDelta = view.getResolution() * this.pixelDelta_;
  var deltaX = 0, deltaY = 0;
  if (direction == 'south') {
    deltaY = -mapUnitsDelta;
  } else if (direction == 'west') {
    deltaX = -mapUnitsDelta;
  } else if (direction == 'east') {
    deltaX = mapUnitsDelta;
  } else {
    deltaY = mapUnitsDelta;
  }
  var delta = [deltaX, deltaY];
  ol.coordinate.rotate(delta, view.getRotation());

  // pan
  var currentCenter = view.getCenter();
  if (currentCenter) {
    if (this.duration_ && this.duration_ > 0) {
      map.beforeRender(ol.animation.pan({
        source: currentCenter,
        duration: this.duration_,
        easing: ol.easing.linear
      }));
    }
    var center = view.constrainCenter(
        [currentCenter[0] + delta[0], currentCenter[1] + delta[1]]);
    view.setCenter(center);
  }

  evt.preventDefault();
  stopEvent = true;

  return !stopEvent;
};