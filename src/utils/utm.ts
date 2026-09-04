export function captureUtmParameters(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    let hasUtm = false;
    const storedUtm: Record<string, string> = {};

    utmKeys.forEach((key) => {
      const val = params.get(key);
      if (val) {
        storedUtm[key] = val;
        hasUtm = true;
      }
    });

    if (hasUtm) {
      sessionStorage.setItem('kaamzo_utm', JSON.stringify(storedUtm));
    }
  } catch (e) {
    console.warn('Failed to capture UTM parameters:', e);
  }
}

export function getStoredUtm(): Record<string, string> {
  try {
    const stored = sessionStorage.getItem('kaamzo_utm');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}
