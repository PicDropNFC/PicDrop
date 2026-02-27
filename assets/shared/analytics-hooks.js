window.PicDropAnalytics = {
  emit(eventName, payload = {}) {
    const detail = { eventName, ...payload, timestamp: Date.now() };
    window.dispatchEvent(new CustomEvent("picdrop:analytics", { detail }));
    if (window.__PICDROP_DEBUG__) {
      console.info("[PicDrop analytics]", detail);
    }
  }
};
