// add offset to the fetched coords
Element.implement({
  getCoordinatesWithOffset: function(offset){
    return {
      'top': this.getCoordinates().top - offset,
      'left': this.getCoordinates().left - offset,
      'width': this.getCoordinates().width + (offset * 2),
      'height': this.getCoordinates().height + (offset * 2)
    };
  },
  
  destroy: function(){
    // fade it out ...
    this.fade('out');
    
    // ... and dispose of the element
    (function(){
      this.dispose();
    }).delay(300, this);
  }
});

Window.implement({
  $log: function(){
    if (typeof console !== 'undefined' && typeof console.log !== 'undefined'){
      console.log(arguments.length <= 1 ? arguments[0] : arguments);
    }
  }
});

var Tour = new Class({
  
  Implements: [Options, Events],
  
  options: {
    classPrefix: 'tourjs',
    offset: 5,
    overlay: true,
    overlayOpacity: 0.3,
    tipOpacity: 1,
    tipPosition: function(){},
    tipFollows: false,
    tipDisabled: false,
    fx: {
      duration: 500,
      transition: 'sine:out'
    },
    keyAccess: {
      activate: function(){
        return this.shift && this.key === 't';
      },
      start: 'start',
      next: 'right',
      previous: 'left',
      end: 'esc'
    },
    onReposition: function(outline, overlaySlices){
      $log('Repositioned expose.');
    },
    onFirst: function(outline, overlaySlices){
      $log('Already at the first slide.');
    },
    onLast: function(outline, overlaySlices){
      $log('At the last slide, cannot go any further.');
    }
  },
  
  initialize: function(presentation, options){
    this.setOptions(options);
    this.active = false;
    this.slicesDir = ['north', 'east', 'west', 'south'];
    this.slices = {};
    this.presentation = presentation || [{}];
    this.body = document.getElement(document.body);
    
    // slide details
    this.current = {
      slide: 0
    };

    // create binds
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
    
    // store nav reference
    this.nav = {};
    
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
    
    // create the overlay if needed
    if (this.options.overlay){
      var sliceProp = {
        'class': this.options.classPrefix + '_slice',
        'styles': {
          'opacity': this.options.overlayOpacity
        },
        'events': {
          'click': function(){
            this.hide();
          }.bind(this)
        }
      };
      
      // create the slices
      for (var i = 0; i < this.slicesDir.length; i++){
        this.slices[this.slicesDir[i]] = Element('span', sliceProp).inject(document.body);
      }
    }
    
    // create the highlighter
    this.outline = Element('span', {
      'class': this.options.classPrefix + '_outline'
    }).inject(this.body);
    
    // create the tip if needed
    if (!this.options.tipDisabled){
      this.current.tip = Element('span', {
        'class': this.options.classPrefix + '_tip',
        'html': '',
        'styles': {
          'opacity': 0
        }
      }).inject(this.options.tipFollows ? this.outline : document.body); // either follow the highlight or stay in one position
    }
    
    // navigate by pressing arrow right and arrow left
    window.addEvent('keydown', this.bound.navigate);
  },
  
  show: function(){
    this.create();
    this.expose();
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

    // destroy the overlay
    for (var i = 0; i < this.slicesDir.length; i++){
      this.slices[this.slicesDir[i]].destroy();
    }
    
    // destroy the outline
    this.outline.destroy();
    
    // destroy the tip
    this.current.tip.destroy();
    
    // go back to the fist slide
    this.current.slide = 0;
    
    this.current.demo = false;
    
    // remove events
    window.removeEvent('keydown', this.bound.navigate);
  },
  
  expose: function(key){
    if (key){
      this.current.slide = (key == this.options.keyAccess.previous ? this.current.slide - 1 : this.current.slide + 1);
    }
    
    // get the presented element
    this.current.element = this.body.getElement(this.presentation[this.current.slide].element);
    
    // get the presented description
    this.current.description = this.presentation[this.current.slide].description;

    // highlight current element
    this.highlighter(this.current.element);

    // destroy the previous tip
    if (this.current.tip){
      this.current.tip.fade(0);
    }
  },
  
  tip: function(){
    if (this.current.tip){
      // update and show the tip
      this.current.tip.set('html', this.current.description).fade(this.options.tipOpacity);

      // reposition the tip
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
      }, this.options.tipPosition));
    }
  },
  
  highlighter: function(el){
    
    // get the coords with additional offset
    var elCoords = el.getCoordinatesWithOffset(this.options.offset);
    
    // collect all slices and the outline
    this.collected = [this.slices.north, this.slices.east, this.slices.west, this.slices.south, this.outline];
    
    // instance the animation
    this.fxSlices = new Fx.Elements(this.collected, {
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
    
    if (this.options.overlay){
      // animate
      this.fxSlices.start({
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
