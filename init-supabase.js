// Shared Supabase Initialization Script
window.supabasePromise = (async () => {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    if (config.supabaseUrl && config.supabaseKey) {
      const client = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
      window.supabaseClient = client;
      return client;
    }
  } catch (e) {
    console.error("Failed to initialize Supabase:", e);
  }
  return null;
})();
