import { useFonts } from 'expo-font';

export function useAppFonts() {
    const [fontsLoaded] = useFonts({
        'PlaywrightNorge-Regular': require('../assets/fonts/PlaywriteNO-Regular.ttf'),
        'PlaywrightNorge-Light': require('../assets/fonts/PlaywriteNO-Light.ttf'),
        'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
        'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
        'Nunito-SemiBold': require('../assets/fonts/Nunito-SemiBold.ttf'),
    });

    return fontsLoaded;
}
