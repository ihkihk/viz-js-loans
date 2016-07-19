* Testing if a variable is a string:

  `if (v instanceof String || typeof(v) === "string")`

* Binding a callback to `this`:

  `on('click', function(d) { this.ctrl.onClick(d); }.bind(this))`

  _Note: this overrides the binding to the event emitting DOM element that the event manager does on the callback._
