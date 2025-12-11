import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    BACKEND_URL: process.env.EXPO_BACKEND_URL,
  },
  plugins: [
    "expo-font"
  ]
});
