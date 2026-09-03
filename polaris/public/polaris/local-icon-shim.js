/**
 * Offline shim for <s-icon> in the Polaris web components bundle.
 *
 * polaris-1.js builds an icon-name -> URL map at module scope:
 *   Pi[name] = "https://cdn.shopify.com/shopifycloud/admin-ui-foundations/icons/" + hash + ".svg"
 *   bn[name] = "https://cdn.shopify.com/shopifycloud/admin-ui-foundations/internal-only/" + hash + ".svg"
 * and <s-icon> lazily loads each one, once, on first render:
 *   const t = gn[name];
 *   if (!t.startsWith("https://cdn.shopify.com/shopifycloud/admin-ui-foundations/"))
 *     throw Error("Invalid icon URL: " + t);
 *   const i = await fetch(t, { cache: "force-cache" });
 *   ...content-type must start with "image/svg+xml"...
 *
 * Those maps are module-local consts, and the bundle *asserts* the CDN prefix
 * before fetching, so the URL cannot be repointed the way local-font-shim.js
 * repoints the font <link>. The fetch call is the only reachable seam.
 *
 * So: wrap fetch and rewrite exactly that one URL prefix to the vendored copy
 * in /polaris/admin-ui-foundations/ (same directory layout as the CDN, so the
 * rewrite is a plain prefix swap). Every other request -- same-origin, other
 * hosts, other cdn.shopify.com paths -- is passed through to the native fetch
 * untouched, with the original arguments.
 *
 * Unlike the font shim this cannot be one-shot: icons load lazily and
 * individually for the life of the page, so the wrapper stays installed.
 *
 * Must be loaded BEFORE polaris-1.js.
 */
(function () {
  var CDN_PREFIX = "https://cdn.shopify.com/shopifycloud/admin-ui-foundations/";
  var LOCAL_PREFIX = "/polaris/admin-ui-foundations/";
  var original = window.fetch;

  window.fetch = function (input, init) {
    // Only strings reach here from <s-icon>; anything else is not ours.
    if (typeof input === "string" && input.startsWith(CDN_PREFIX)) {
      return original.call(
        this,
        LOCAL_PREFIX + input.slice(CDN_PREFIX.length),
        init,
      );
    }
    return original.apply(this, arguments);
  };
})();
