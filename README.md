# QSO Mapper

Show Amatuer Radio QSOs on an interactive map and table.

There are two basic ways this web application is designed to be used:

1. Uploading local [ADIF files][adif] from a web browser for local display (default).
2. Using the URL parameter to load a web-accessible [ADIF file][adif] and possibly share your QSOs and map.

Both ways require you to get your own *access token* for the map provider you choose to use. The default map provider is [OpenStreetMap][osm] which is *open* but prefers you get map tiles from a third-party like [MapBox](http://mapbox.com).

# Uploading Local ADIF File(s)

This method is inteded to be used to view a log of contacts (QSOs) that you have on your computer in [ADIF format][adif]. The application works in this mode by default.

    [QSO Mapper Example][https://stephenhouser.com/qso-mapper]

By using `Select file...` at the top-right of the application window you can upload a local [ADIF file][adif]. The QSOs in the file will be loaded and shown on the interactive map as markers or Maidenhead (grid square) Locators. The `Reset` button will clear the markers so you can load a different file. You can load multiple files, just don't click `Reset` between each load and the new QSOs will be added to the current ones.

When using the application this way, the map is not directly sharable with others. To share the map you could send your [ADIF file][adif] to someone else and they would upload and view the same way. However, a better way to share your QOS map is to use the second method below and not this one.

# Using a URL to ADIF File(s)

This method allows you to show and share a log of your contacts. You upload your [ADIF file][adif] to a website and then others can see the QSOs mapped directly, without uploading anything.

    [N1SH QSOs Example][https://stephenhouser.com/qso-mapper?url=sample/short.adi]

The application loads a web-accessible [ADIF file][adif] and displays it on the map. The file could be on another server or in the same location (or same repository) as the application code.

To use this mode of the application, simply supply a `url` parameter to the index page. The application will try to load the contents of the referenced URL as an [ADIF file][adif]. If the loading succeeds, the QSO records from the file will be shown on the map. 

When using this variant of the application, the `Select file...` and `Reset` are disabled and you are only able to load a single [ADIF file][adif] URL.

  [adif]: http://http://adif.org
  [osm]: https://www.openstreetmap.org