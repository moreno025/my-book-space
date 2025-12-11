import { useFonts } from 'expo-font';

export function useAppFonts() {
    const [fontsLoaded] = useFonts({
        'PlaywrightNorge-Regular': require('../assets/fonts/PlaywriteNO-Regular.ttf'),
        'PlaywrightNorge-Light': require('../assets/fonts/PlaywriteNO-Light.ttf'),
    });

    return fontsLoaded;
}
