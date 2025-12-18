import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "search_history";
const MAX_ITEMS = 5;

export async function getSearchHistory(): Promise<string[]> {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
}

export async function saveSearch(term: string) {
    const history = await getSearchHistory();

    const updated = [
        term,
        ...history.filter((h) => h !== term),
    ].slice(0, MAX_ITEMS);

    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}
