var searchbarPlugins = require('searchbar/searchbarPlugins.js')

function showPlaceSuggestions (text, input, event, container) {
  // use the current tab's url for history suggestions, or the previous tab if the current tab is empty
  var url = tabs.get(tabs.getSelected()).url

  if (!url || url === 'about:blank') {
    var previousTab = tabs.getAtIndex(tabs.getIndex(tabs.getSelected()) - 1)
    if (previousTab) {
      url = previousTab.url
    }
  }

  bookmarks.getPlaceSuggestions(url, function (results) {
    empty(container)

    var tabList = tabs.get().map(function (tab) {
      return tab.url
    })

    results = results.filter(function (item) {
      return tabList.indexOf(item.url) === -1
    })

    results.slice(0, 4).forEach(function (result) {
      var item = createSearchbarItem({
        title: urlParser.prettyURL(result.url),
        secondaryText: getRealTitle(result.title),
        url: result.url,
        delete: function () {
          bookmarks.deleteHistory(result.url)
        }
      })

      container.appendChild(item)
    })
  })
}

searchbarPlugins.register('placeSuggestions', {
  index: 1,
  trigger: function (text) {
    return !text
  },
  showResults: showPlaceSuggestions
})

// when we get keywords data from the page, we show those results in the searchbar

webviews.bindIPC('keywordsData', function (webview, tabId, arguements) {
  var data = arguements[0]

  var itemsCt = 0
  var itemsShown = []

  var container = searchbarPlugins.getContainer('searchSuggestions')

  data.entities.forEach(function (item, index) {
    // ignore one-word items, they're usually useless
    if (!/\s/g.test(item.trim())) {
      return
    }

    if (itemsCt >= 5 || itemsShown.indexOf(item.trim()) !== -1) {
      return
    }

    var div = createSearchbarItem({
      icon: 'fa-search',
      title: item,
      url: item,
      classList: ['iadata-onfocus']
    })

    container.appendChild(div)

    itemsCt++
    itemsShown.push(item.trim())
  })
})