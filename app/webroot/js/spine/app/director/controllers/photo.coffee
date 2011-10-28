Spine ?= require("spine")
$      = Spine.$

class PhotoView extends Spine.Controller

  events:
    "click .item": "click"
    
  constructor: ->
    super
    @bind("change", @change)

module?.exports = PhotoView