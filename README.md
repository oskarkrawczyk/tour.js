# Tour.js
Create a website tour by moving a highlight box between specified elements

## Setting up

### HTML
    <p data-tour-desc="Element description"></p>

### JavaScript
#### Simple

    new Tour.Build('data-tour-desc');

#### Additional options
    new Tour.Build('data-tour-desc', {
      overlay: {
        opacity: 0.5
      },
      keyAccess: {
        previous: 'up',
        next: 'down'
      }
    });

## Options
* `classPrefix` (defaults to `tourjs`): Prefix for the CSS class
* `offset` (defaults to `5`): Additional padding between the highlighter and the highlighted element
* `overlay` (defaults to `options`)
	* `opacity` (defaults to `0.3`): Overlays opacity
* `tip` (defaults to `options`)
	* `opacity` (defaults to `1.0`): Tips opacity
	* `position`: Position. See Element.Position](http://mootools.net/docs/more/Element/Element.Position#Element:position) for reference
	* `follow` (defaults to `false`): Should the tip follow the highlighter
* `fx` (defaults to `5`)
	* `duration` (defaults to `500`): Duration of the highlighting animation
	* `transition` (defaults to `sine:out`): Transition type for the highlighting animation
* `keyAccess` (defaults to `options`)
	* `activate` (defaults to `fn`)
	* `start` (defaults to `start`)
	* `next` (defaults to `right`)
	* `previous` (defaults to `left`)
	* `end` (defaults to `esc`)

## Events
* `onReposition` (provides `outline, overlaySlices`)
* `onFirst` (provides `outline, overlaySlices`)
* `onLast` (provides `outline, overlaySlices`)