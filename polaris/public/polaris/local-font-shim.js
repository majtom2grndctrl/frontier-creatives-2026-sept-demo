/**
 * Offline shim for the Polaris web components bundle.
 *
 * polaris-1.js unconditionally does:
 *   const l = document.createElement("link");
 *   l.rel = "stylesheet";
 *   l.href = "https://cdn.shopify.com/static/fonts/inter/v4/styles.css";
 *   l.crossOrigin = "";
 *   document.head.appendChild(l);
 *
 * There is no configuration hook for that URL, so we intercept the single
 * appendChild call and repoint it at the self-hosted copy in /fonts/inter/.
 * The vendored bundle itself is left byte-identical to what the CDN served.
 *
 * Must be loaded BEFORE polaris-1.js.
 */
(function () {
  var CDN_FONT_CSS = "https://cdn.shopify.com/static/fonts/inter/v4/styles.css";
  var LOCAL_FONT_CSS = "/fonts/inter/styles.css";
  var head = document.head;
  var original = head.appendChild;

  head.appendChild = function (node) {
    if (
      node &&
      node.tagName === "LINK" &&
      node.getAttribute("href") === CDN_FONT_CSS
    ) {
      node.setAttribute("href", LOCAL_FONT_CSS);
      node.removeAttribute("crossorigin");
      head.appendChild = original; // one-shot: restore native behaviour
    }
    return original.call(this, node);
  };
})();
