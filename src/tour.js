Element.implement({
  getCoordinatesWithOffset: function(offset){
    return {
      'top': this.getCoordinates().top - offset,
      'left': this.getCoordinates().left - offset,
      'width': this.getCoordinates().width + (offset * 2),
      'height': this.getCoordinates().height + (offset * 2)
    };
  },
  
  fadestroy: function(){
    new Fx.Tween(this, {
      onComplete: function(){
        this.dispose();
      }.bind(this)
    }).start('opacity', 0);
  }
});

var Tour = new Class({
  
  Implements: [Options, Events],
  
  options: {
    classPrefix: 'tourjs',
    offset: 5,
    overlay: {
      opacity: 0.3
    },
    tip: {
      opacity: 1,
      position: {},
      follows: false
    },
    fx: {
      duration: 500,
      transition: 'sine:out'
    },
    keyAccess: {
      activate: function(){
        return this.shift && this.key === '/';
      },
      start: 'start',
      next: 'right',
      previous: 'left',
      end: 'esc'
    }
    // onReposition: function(outline, overlaySlices){},
    // onFirst: function(outline, overlaySlices){},
    // onLast: function(outline, overlaySlices){}
  },
  
  initialize: function(presentation, options){
    this.setOptions(options);
    this.active = false;
    this.slicesDir = ['north', 'east', 'west', 'south'];
    this.slices = {};
    this.presentation = presentation || [{}];
    this.body = document.getElement(document.body);
    
    this.current = {
      slide: 0
    };
    
    this.bound = {
      navigate: this.navigate.bind(this),
      reposition: this.reposition.bind(this),
      end: function(event){
        this.action.call(this, event, 'end');
      }.bind(this),
      next: function(event){
        this.action.call(this, event, 'next');
      }.bind(this),
      previous: function(event){
        this.action.call(this, event, 'previous');
      }.bind(this)
    };
    
    this.nav = {};
    
    this.fx = {};
    
    window.addEvents({
      keydown: function(event){
        if (this.options.keyAccess.activate.call(event)){
          this.start();
        }
        if (event.key === this.options.keyAccess.start && !this.current.demo){
          this.show();
        }
        if (event.key === this.options.keyAccess.end && this.current.demo){
          this.hide();
        }
      }.bind(this),
      resize: this.bound.reposition
    });
  },
  
  reposition: function(){
    this.expose();
  },
  
  start: function(presentation){
    if (presentation){
      this.presentation = presentation;
    }
    window.fireEvent('keydown', {
      key: this.options.keyAccess.start
    });
  },
  
  action: function(event, mode){
    event.stop();
    this[mode]();
  },
  
  create: function(){
    this.current.demo = true;
    this.createSlices();
    this.createOutline();
    this.createTip();
    this.addFx();
    window.addEvents({
      keydown: this.bound.navigate
    });
  },
  
  show: function(){
    this.create();
    this.expose();
  },
  
  createSlices: function(){
    if (this.options.overlay){
      var sliceProp = {
        'class': this.options.classPrefix + '_slice',
        'styles': {
          'opacity': this.options.overlay.opacity
        },
        'events': {
          'click': function(){
            this.hide();
          }.bind(this)
        }
      };
      for (var i = 0; i < this.slicesDir.length; i++){
        this.slices[this.slicesDir[i]] = Element('span', sliceProp).inject(this.body);
      }
    }
  },
  
  createOutline: function(){
    this.outline = Element('span', {
      'class': this.options.classPrefix + '_outline'
    }).inject(this.body);
  },
  
  createTip: function(){
    if (this.options.tip){
      this.current.tip = Element('span', {
        'class': this.options.classPrefix + '_tip',
        'html': '',
        'styles': {
          'opacity': 0
        }
      }).inject(this.options.tip.follows ? this.outline : this.body);
      this.fx.tip = new Fx.Tween(this.current.tip, {
        link: 'cancel'
      });
    }
  },
  
  addFx: function(){
    this.collected = [this.slices.north, this.slices.east, this.slices.west, this.slices.south, this.outline];
    this.fx.slices = new Fx.Elements(this.collected, {
      onComplete: function(){
        this.tip();
        this.fireEvent('onReposition', [this.outline, this.collected]);
        
        // @todo: find a way to scroll only when the highlighter is out of the view port
        // $log(!(this.outline.getPosition().y >= window.getSize().y-this.outline.getSize().y));
        // scroll to the highlight (either the tip or the outline)
        // new Fx.Scroll(this.body).toElement($pick(this.current.tip, this.outline));
      }.bind(this),
      duration: this.options.fx.duration,
      transition: this.options.fx.transition
    });
  },
  
  navigate: function(event){
    if (event.key === this.options.keyAccess.previous || event.key === this.options.keyAccess.next){
      if (this.current.slide <= 0 && event.key === this.options.keyAccess.previous){
        this.fireEvent('onFirst', [this.outline, this.collected]);
        return;
      }
      
      if (this.current.slide >= this.presentation.length - 1 && event.key === this.options.keyAccess.next){
        this.fireEvent('onLast', [this.outline, this.collected]);
        return;
      }
      this.expose(event.key);
    }
  },
  
  hide: function(){
    for (var i = 0; i < this.slicesDir.length; i++){
      this.slices[this.slicesDir[i]].fadestroy();
    }
    this.outline.fadestroy();
    this.current.tip.fadestroy();
    this.current.slide = 0;
    this.current.demo = false;
    window.removeEvent('keydown', this.bound.navigate);
  },
  
  expose: function(key){
    if (key){
      this.current.slide = (key == this.options.keyAccess.previous ? this.current.slide - 1 : this.current.slide + 1);
    }
    this.current.element = this.body.getElement(this.presentation[this.current.slide].element);
    this.current.description = this.presentation[this.current.slide].description;
    this.highlighter(this.current.element);
    if (this.current.tip){
      this.fx.tip.start('opacity', 0);
    }
  },
  
  tip: function(){
    if (this.current.tip){
      this.current.tip.set('html', this.current.description);
      this.fx.tip.start('opacity', this.options.tip.opacity);
      this.current.tip.position(Object.merge({
        relativeTo: this.outline,
        position: {
          x: 'center',
          y: 'bottom'
        },
        edge: {
          x: 'center',
          y: 'top'
        },
        ignoreMargins: true,
        offset: {
          x: 0,
          y: 15
        }
      }, this.options.tip.position));
    }
  },
  
  highlighter: function(element){
    var elCoords = element.getCoordinatesWithOffset(this.options.offset);
    
    if (this.options.overlay){
      this.fx.slices.start({
        '0': {
          'height': elCoords.top,
          'width': window.getSize().x
        },
        '1': {
          'height': elCoords.height,
          'width': elCoords.left,
          'top': elCoords.top
        },
        '2': {
          'height': elCoords.height,
          'width': window.getSize().x - (elCoords.left + elCoords.width),
          'left': elCoords.left + elCoords.width,
          'top': elCoords.top
        },
        '3': {
          'height': window.getScrollSize().y - (elCoords.top + elCoords.height),
          'width': window.getSize().x,
          'top': elCoords.top + elCoords.height
        },
        '4': elCoords
      });
    }
  }
});

// Builder
Tour.Build = new Class({
  
  Slides: [],
  
  initialize: function(dataParam, options){
    document.getElements('*[' + dataParam + ']').each(function(element){
      var uid = 'tuid-' + Number.random(1000, 9999);
      element.set('data-tour-uid', uid);
      var option = {
        element: '*[data-tour-uid=' + uid + ']',
        description: element.get(dataParam)
      };
      this.Slides.push(option);
    }, this);
    new Tour(this.Slides, options);
  }
  
});
