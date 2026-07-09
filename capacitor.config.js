const config = {
  appId: "com.livingrenewal.counselling",
  appName: "Living Renewal",

  // Server mode — loads your live Vercel site inside the native app.
  // This means no static export needed, all API routes work perfectly,
  // and the app always shows the latest content.
  //
  // Replace the URL below with your actual Vercel deployment URL.
  server: {
    url: "https://counselling-app-alpha.vercel.app/",  // ← replace with your real Vercel URL
    cleartext: false,                     // keeps HTTPS enforced
  },

  // webDir is still required by Capacitor even in server mode
  webDir: "out",

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#F8F4EF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: "#2C5F8A",
      style: "LIGHT",
    },
  },
};

module.exports = config;