import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Daivam Manushya Roopena',
  slug: 'daivam-manushya-roopena',
  version: '0.0.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  android: {
    package: 'org.daivam.dmr',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  // ADR-0001: Android 14+ only.
  plugins: [['expo-build-properties', { android: { minSdkVersion: 34 } }]],
};

export default config;
