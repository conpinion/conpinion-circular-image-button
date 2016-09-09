Polymer

  is: 'conpinion-circular-image-button'

  behaviors: [Polymer.PaperButtonBehavior]

  properties:
    src: {type: String, observer: 'srcChanged'}
    mini: {type: Boolean, value: true}
    disabled: {type: Boolean, value: false}

  srcChanged: ->
    @$.image.style.backgroundImage = "url('#{@src}')"
