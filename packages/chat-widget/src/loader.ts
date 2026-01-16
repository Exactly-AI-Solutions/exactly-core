/**
 * Exactly Chat Widget Loader
 * Lightweight script (~2KB) that loads the full widget bundle
 */
(function () {
  const script = document.currentScript as HTMLScriptElement;
  if (!script) {
    console.error('[ExactlyChat] Could not find current script');
    return;
  }

  const tenantId = script.getAttribute('data-tenant-id');
  const apiUrl = script.getAttribute('data-api-url') || 'https://api.exactly.ai';

  if (!tenantId) {
    console.error('[ExactlyChat] Missing required attribute: data-tenant-id');
    return;
  }

  // Determine base URL from script src
  const scriptSrc = script.src;
  const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));

  // Load the full widget bundle
  const widgetScript = document.createElement('script');
  widgetScript.src = `${baseUrl}/chat-widget.umd.js`;
  widgetScript.onload = () => {
    // @ts-expect-error - global from UMD bundle
    if (window.ExactlyChat && typeof window.ExactlyChat.init === 'function') {
      // @ts-expect-error - global from UMD bundle
      window.ExactlyChat.init({ tenantId, apiUrl });
    } else {
      console.error('[ExactlyChat] Widget bundle loaded but init function not found');
    }
  };
  widgetScript.onerror = () => {
    console.error('[ExactlyChat] Failed to load widget bundle');
  };

  document.head.appendChild(widgetScript);
})();
