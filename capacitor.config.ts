import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hms.app',
  appName: 'Shree Medicare HMS',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: "http://192.168.1.104:5173",
    cleartext: true,
    androidScheme: 'http'
  }
};

export default config;