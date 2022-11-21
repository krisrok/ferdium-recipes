const _path = _interopRequireDefault(require('path'));
var _defaultIconSignature = "";

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _getIconSignature(str) {
	return str.substr(str.length - 5);
}

module.exports = (Ferdium, settings) => {
  const getMessages = () => {
    let directCount = 0;
    const directCountPerServer = document.querySelectorAll(
      '[class*="lowerBadge-"] [class*="numberBadge-"]',
    );

    for (const directCountBadge of directCountPerServer) {
      directCount += Ferdium.safeParseInt(directCountBadge.textContent);
    }

    const indirectCountPerServer = document.querySelectorAll(
      '[class*="modeUnread-"]',
    ).length;

  // watch if current icon is not the default one anymore: changed to badge? 
	if(_defaultIconSignature != "" && _getIconSignature(document.querySelector("link[rel~='icon']").href) != _defaultIconSignature) {
		directCount++;
	}
	
    Ferdium.setBadge(directCount, indirectCountPerServer);
  };

  Ferdium.loop(getMessages);

  Ferdium.injectCSS(_path.default.join(__dirname, 'service.css'));
  
  // observe icon change, save "signature" when it first changes to a base64 representation
	var icon = document.querySelector("link[rel~='icon']");
  MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	var observer = new MutationObserver(function(mutations, observer) {
		// fired when a mutation occurs
		console.log(mutations, observer);
		var icon = document.querySelector("link[rel~='icon']");
		if(icon.href.endsWith(".ico"))
			return;
		
    var iconSignature = _getIconSignature(icon.href);
    _defaultIconSignature = _getIconSignature(icon.href);
	  observer.disconnect();
	});

	// define what element should be observed by the observer
	// and what types of mutations trigger the callback
	observer.observe(document.querySelector("link[rel~='icon']"), {
	  subtree: true,
	  attributes: true
	});

  // TODO: See how this can be moved into the main ferdium app and sent as an ipc message for opening with a new window or same Ferdium recipe's webview based on user's preferences
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="http"]');
    const button = event.target.closest('button[title^="http"]');

    if (link || button) {
      const url = link ? link.getAttribute('href') : button.getAttribute('title');
      const skipDomains = [/^https:\/\/discordapp\.com\/channels\//i, /^https:\/\/discord\.com\/channels\//i];

      let stayInsideDiscord;
      skipDomains.every(skipDomain => {
        stayInsideDiscord = skipDomain.test(url);
        return !stayInsideDiscord;
      });

      if (!Ferdium.isImage(link) && !stayInsideDiscord) {
        event.preventDefault();
        event.stopPropagation();

        if (settings.trapLinkClicks === true) {
          window.location.href = url;
        } else {
          Ferdium.openNewWindow(url);
        }
      }
    }
  }, true);
};
