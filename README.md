# Tour.js
Create a tour by moving a highlighted box between elements on the website

## Setting up

### Simple
```html
<p data-tour-desc="Element description"></p>
```

```javascript
document.getElements('.tour').tour();
```

#### Additional options
```html
<p class="tour" data-title="Element description"></p>
```

```javascript
document.getElements('.tour').tour({
  description: 'data-title',
  overlay: {
    opacity: 0.5
  },
  accesskey: {
    previous: 'up',
    next: 'down'
  }
});
```
## Options

<table>
	<tr>
		<th>Name</th>
		<th>Type</th>
		<th>Default</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>classPrefix</td>
		<td>string</td>
		<td>tourjs</td>
		<td>Prefix for the CSS class</td>
	</tr>
	<tr>
		<td>offset</td>
		<td>integer</td>
		<td>5</td>
		<td>Additional padding between the highlighter and the highlighted element</td>
	</tr>
	<tr>
		<td>overlay.opacity</td>
		<td>integer</td>
		<td>0.3</td>
		<td>Overlays opacity</td>
	</tr>
	<tr>
		<td>tip.opacity</td>
		<td>integer</td>
		<td>1.0</td>
		<td>Tips opacity</td>
	</tr>
	<tr>
		<td>tip.position</td>
		<td>string</td>
		<td></td>
		<td>Position. See <a href="http://mootools.net/docs/more/Element/Element.Position#Element:position">Element.Position</a> for reference</td>
	</tr>
	<tr>
		<td>tip.follow</td>
		<td>boolean</td>
		<td>false</td>
		<td>Should the tooltip follow the highlighter</td>
	</tr>
	<tr>
		<td>tip.duration</td>
		<td>integer</td>
		<td>300</td>
		<td>Duration of the tip animation</td>
	</tr>
	<tr>
		<td>fx.duration</td>
		<td>integer</td>
		<td>500</td>
		<td>Duration of the highlighting animation</td>
	</tr>
	<tr>
		<td>fx.transition</td>
		<td>string/object</td>
		<td>sine:out</td>
		<td>Transition type for the highlighting animation</td>
	</tr>
	<tr>
		<td>keyAccess.activate</td>
		<td>fn</td>
		<td></td>
		<td>Function triggering the activation - see source for details</td>
	</tr>
	<tr>
		<td>accesskey.start</td>
		<td>string</td>
		<td>start</td>
		<td>Event to start the tour</td>
	</tr>
	<tr>
		<td>accesskey.next</td>
		<td>string</td>
		<td>right</td>
		<td>Next slide</td>
	</tr>
	<tr>
		<td>accesskey.previous</td>
		<td>string</td>
		<td>left</td>
		<td>Previous slide</td>
	</tr>
	<tr>
		<td>accesskey.end</td>
		<td>string</td>
		<td>esc</td>
		<td>Close tour</td>
	</tr>
</table>

## Events
<table>
	<tr>
		<th>Name</th>
		<th>Provides</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>onReposition</td>
		<td>outline, overlaySlices</td>
		<td>Fires when the highligher gets repositioned</td>
	</tr>
	<tr>
		<td>onFirst</td>
		<td>outline, overlaySlices</td>
		<td>Fires when highlighter is currently on the first slide</td>
	</tr>
	<tr>
		<td>onLast</td>
		<td>outline, overlaySlices</td>
		<td>Fires when highlighter is currently on the last slide</td>
	</tr>
</table>
