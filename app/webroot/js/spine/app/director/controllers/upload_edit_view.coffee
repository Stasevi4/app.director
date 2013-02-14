Spine ?= require("spine")
$      = Spine.$

class UploadEditView extends Spine.Controller

  elements:
    '.files'                      : 'filesEl'
    '.uploadinfo'                 : 'uploadinfoEl'

  events:
    'change select'               : 'changeSelected'
    'fileuploaddone'              : 'done'
    'fileuploadsubmit'            : 'submit'
    'fileuploadadd'               : 'add'
    'fileuploadpaste'             : 'paste'
    'fileuploadsend'              : 'send'
    'fileuploadprogressall'       : 'alldone'
    
  template: (item) ->
    $('#fileuploadTemplate').tmpl item
    
  constructor: ->
    super
#    @bind("change", @change)
#    Album.bind('change', @proxy @change)
    Spine.bind('change:selectedAlbum', @proxy @change)
    @queue = []
    
  change: (item) ->
    @render()
    
  render: ->
    console.log 'UploadView::render'
    selection = Gallery.selectionList()
    gallery = Gallery.record
#    @album = Album.record
    @album = (Album.find(selection[0]) if Album.exists(selection[0])) || false
    @uploadinfoEl.html @template
      gallery: gallery
      album: @album
    @refreshElements()
    @el
    
  add: (e, data) ->
#    album_id = Album.record?.id
    list = Gallery.selectionList()
    return unless list.length
    album_id = list[list.length-1]
    
    if data.files.length
      $.extend data, link: album_id if album_id
      @c = App.hmanager.hasActive()
      App.hmanager.change @
      unless App.showView.isQuickUpload()
        App.showView.openPanel('upload')
        
  send: (e, data) ->
#    alert 'UploadView::send'
    album = Album.exists(data.link)
    Spine.trigger('loading:start', album) if album
    
  alldone: (e, data) ->
    
  done: (e, data) ->
    album = Album.exists(data.link)
    raws = $.parseJSON(data.jqXHR.responseText)
    Photo.refresh(raws, clear: false)
    
    # create joins if we dropped it all in an album
    if album
      for raw, idx in raws
        photo = Photo.exists(raw['Photo'].id)
        Photo.trigger('create:join', photo, album) if photo
        Spine.trigger('loading:done', album)
      Spine.trigger('album:updateBuffer', album)
    
    if App.showView.isQuickUpload()
      App.hmanager.change @c
        
    e.preventDefault()
    
  paste: (e, data) ->
    
  submit: (e, data) ->
    
  changeSelected: (e) ->
    el = $(e.currentTarget)
    id = el.val()
    album = Album.exists(id)
    if album
      album.updateSelection [album.id]
      Spine.trigger('album:activate')
    
module?.exports = UploadEditView