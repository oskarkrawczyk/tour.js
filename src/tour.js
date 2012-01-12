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
    offset: 5,
    overlay: true,
    overlayOpacity: 0.2,
    tipOpacity: 1,
    tipPosition: function(){},
    tipFollows: false,
    tipDisabled: false,
    keyAccess: {
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
      'navigate': this.navigate.bind(this),
      'reposition': this.reposition.bind(this),
      'end': function(event){
        this.action.call(this, event, 'end');
      }.bind(this),
      'next': function(event){
        this.action.call(this, event, 'next');
      }.bind(this),
      'previous': function(event){
        this.action.call(this, event, 'previous');
      }.bind(this)
    };
    
    // store nav reference
    this.nav = {};
    
    window.addEvents({
      keydown: function(event){
        switch (event.key){
          case this.options.keyAccess.start:
            if (!this.current.demo) this.show();
            break;
          case this.options.keyAccess.end:
            if (this.current.demo) this.hide();
            break;
        }
      }.bind(this),
      resize: this.bound.reposition
    });
  },
  
  reposition: function(){
    this.expose();
  },
  
  start: function(presentation){
    if(presentation){
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
  
  navigation: function(){
    
    // demoo_nav
    this.nav.cont = Element('ul', {
      'class': 'demoo_nav',
      'styles': {
        'opacity': 0
      }
    });
    
    // demoo_nav demo_nav_close
    this.nav.close = Element('li', {
      'class': 'demoo_nav_close'
    }).inject(this.nav.cont);
    
    // demoo_nav demo_nav_close a
    this.nav.close.anchor = Element('a', {
      'href': '#close',
      'text': 'X',
      'events': {
        click: this.bound.end
      }
    }).inject(this.nav.close);
    
    // demoo_nav demo_nav_prev
    this.nav.prev = Element('li', {
      'class': 'demoo_nav_prev'
    }).inject(this.nav.cont);
    
    // demoo_nav demo_nav_prev a
    this.nav.close.anchor = Element('a', {
      'href': '#previous-slide',
      'text': '<',
      'events': {
        click: this.bound.previous
      }
    }).inject(this.nav.prev);
    
    // demoo_nav demo_nav_next
    this.nav.next = Element('li', {
      'class': 'demoo_nav_next'
    }).inject(this.nav.cont);
      
    // demoo_nav demo_nav_next a
    this.nav.close.anchor = Element('a', {
      'href': '#next-slide',
      'text': '>',
      'events': {
        click: this.bound.next
      }
    }).inject(this.nav.next);
      
    // @todo use wraps/grab or sth... the one that injects multiple els at once
    this.showNav.delay(1000, this);
  },
  
  showNav: function(){
    this.nav.cont.inject(document.body).fade('in');
  },
  
  create: function(){
    this.current.demo = true;
    
    // create the overlay if needed
    if (this.options.overlay){
      var sliceProp = {
        'class': 'demoo_slice',
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
      'class': 'demoo_outline'
    }).inject(this.body);
    
    // create the tip if needed
    if (!this.options.tipDisabled){
      this.current.tip = Element('span', {
        'class': 'demoo_tip',
        'html': '',
        'styles': {
          'opacity': 0
        }
      }).inject(this.options.tipFollows ? this.outline : document.body); // either follow the highlight or stay in one position
    }
    
    // navigate by pressing arrow right and arrow left
    window.addEvent('keydown', this.bound.navigate);
    
    // activate the navigation
    // this.navigation();
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
    
    // destroy the navigation
    this.nav.cont.destroy();
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
    var elcoords = el.getCoordinatesWithOffset(this.options.offset);
    
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
      duration: 500,
      transition: 'sine:out'
    });
    
    if (this.options.overlay){
      // animate
      this.fxSlices.start({
        '0': {
          'height':   elcoords.top,
          'width':  window.getSize().x
        },
        '1': {
          'height':   elcoords.height,
          'width':  elcoords.left,
          'top':    elcoords.top
        },
        '2': {
          'height':   elcoords.height,
          'width':  window.getSize().x-(elcoords.left+elcoords.width),
          'left':   (elcoords.left+elcoords.width),
          'top':    elcoords.top
        },
        '3': {
          'height':   window.getScrollSize().y-(elcoords.top+elcoords.height),
          'width':  window.getSize().x,
          'top':    (elcoords.top+elcoords.height)
        },
        '4': elcoords
      });
    }
  }
});
