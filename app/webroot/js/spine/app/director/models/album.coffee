
class Album extends Spine.Model
  @configure "Album", 'title', 'description', 'count', 'user_id'

  @extend Spine.Model.Ajax
  @extend Spine.Model.AjaxRelations
  @extend Spine.Model.Uri
  @extend Spine.Model.Filter
  @extend Spine.Model.Extender

  @caches: []

  @selectAttributes: ['title']

  @url: ->
    '' + base_url + @className.toLowerCase() + 's'

  @nameSort: (a, b) ->
    aa = (a or '').title?.toLowerCase()
    bb = (b or '').title?.toLowerCase()
    return if aa == bb then 0 else if aa < bb then -1 else 1

  @foreignModels: ->
    'Gallery':
      className             : 'Gallery'
      joinTable             : 'GalleriesAlbum'
      foreignKey            : 'album_id'
      associationForeignKey : 'gallery_id'
    'Photo':
      className             : 'Photo'
      joinTable             : 'AlbumsPhoto'
      foreignKey            : 'album_id'
      associationForeignKey : 'image_id'

  
  @cacheList: (recordID) =>
    id = recordID or @record.id
    return unless id
    for item in @caches
      return item[id] if item[id]

  @cache: (record, url) ->
    cache = @cacheList record?.id
    return unless cache
    for item in cache
      return item[url] if item[url]

  @addToCache: (record, url, uri) ->
    cache = @cacheList record?.id
    return unless cache# or uri.length
    dummy = {}
    dummy[url] = uri
    cache.push dummy unless @cache(record, url)
    cache
    
  @emptyCache: (id) ->
    originalList = @cacheList(id)
    originalList[0...originalList.length] = []
    originalList
    
  init: (instance) ->
    return unless instance
    newSelection = {}
    newSelection[instance.id] = []
    @constructor.selection.push(newSelection)
    
    cache = {}
    cache[instance.id] = []
    @constructor.caches.push(cache)
    
  cache: (url) ->
    @constructor.cache @, url
    
  addToCache: (url, uri) ->
    @constructor.addToCache(@, url, uri)
    
  emptyCache: ->
    @constructor.emptyCache @id
    
  selectAttributes: ->
    result = {}
    result[attr] = @[attr] for attr in @constructor.selectAttributes
    result

  select: (id) ->
    #id should be gallery.id
    ga = GalleriesAlbum.filter(id)
    for record in ga
      return true if record.album_id is @id
      
Spine.Model.Album = Album

