# QSO Mapper

Show Amateur Radio QSOs on an interactive map and table.

There are two basic ways this web application is designed to be used:

1. Uploading local [ADIF files][adif] from a web browser for local display (default).
2. Using the URL parameter to load a web-accessible [ADIF file][adif] and possibly share your QSOs and map.

Both ways require you to get your own *access token* for the map provider you choose to use. The default map provider is [OpenStreetMap][osm] which is *open* but prefers you get map tiles from a third-party like [MapBox](http://mapbox.com). If you fork (or clone) this repo for you own use, you should really [get an API key from MapBox](https://www.mapbox.com/studio/account/tokens/). Then change the `mapTiles` variable in `leaflet-map.js` to `mapbox` and set `mapAccessToken` to your API token.

The project stated using [Google Maps][gmaps] but that fork has not been updated. The code is in `google-map.js` and commented out in `index.html` (for now). [OpenStreetMap][osm] and [Leflet][leaflet] are used in the current branch. These are both *open* products.

# Uploading Local ADIF File(s)

This method is intended to be used to view a log of contacts (QSOs) that you have on your computer in [ADIF format][adif]. The application works in this mode by default.

   [Upload QSO Map Example](https://stephenhouser.com/qso-mapper)

By using `Select file...` at the top-right of the application window you can upload a local [ADIF file][adif]. The QSOs in the file will be loaded and shown on the interactive map as markers or Maidenhead (grid square) Locators. The `Reset` button will clear the markers so you can load a different file. You can load multiple files, just don't click `Reset` between each load and the new QSOs will be added to the current ones.

When using the application this way, the map is not directly sharable with others. To share the map you could send your [ADIF file][adif] to someone else and they would upload and view the same way. However, a better way to share your QOS map is to use the second method below and not this one.

# Using a URL to ADIF File(s)

This method allows you to show and share a log of your contacts. You upload your [ADIF file][adif] to a website and then others can see the QSOs mapped directly, without uploading anything.

   [Shared QSO Map Example](https://stephenhouser.com/qso-mapper?url=sample/short.adi)

The application loads a web-accessible [ADIF file][adif] and displays it on the map. The file could be on another server or in the same location (or same repository) as the application code.

To use this mode of the application, simply supply a `url` parameter to the index page. The application will try to load the contents of the referenced URL as an [ADIF file][adif]. If the loading succeeds, the QSO records from the file will be shown on the map. 

When using this variant of the application, the `Select file...` and `Reset` are disabled and you are only able to load a single [ADIF file][adif] URL.

You should consider forking the repository if you intend on using this long-term. That way you can change the map tile *access token* to your own token making sure it works for you long-term. If you don't fork and use your own, you run the risk of what I have here running out of quota and not working at all for you.

# Customization

## Map Tiles

As noted above the default map provider is [OpenStreetMap][osm]. The `mapTiles` variable in `leaflet-map.js` is thus set to `openstreetmap`. To use [MapBox](http://mapbox.com), change this variable to `mapbox` and set the `mapAccessToken` to a proper [API key from MapBox](https://www.mapbox.com/studio/account/tokens/).

## Map Markers 

If you want to use a different marker icon, take a look in `leaflet-map.js` at the function `createMarker()`. There is a brief bit of commented out code that will make a small blue marker from an icon in the `icons` directory.

# Mentions

I wanted to thank the [Linux in the Ham Shack](http://lhspodcast.info) podcast folks, who picked up on my pushing to [GitHub](https://github.com) and mentioned the project in their [Party Like it's 1499](http://lhspodcast.info/2018/10/lhs-episode-251-party-like-its-1499/comment-page-1/#comment-689046) episode. As an ex-scoutmaster for a Boy Scout troop, I think it would be an excellent idea to use QSO Mapper to show your [Jamboree on the Air](https://www.scouting.org/jota/) contacts!

  [adif]: http://adif.org
  [osm]: https://www.openstreetmap.org
  [leaflet]: https://leafletjs.com
  [gmaps]: https://maps.google.com
