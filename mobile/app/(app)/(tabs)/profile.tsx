import { ScrollView, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../hooks/useAuth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    //const { lists, loading } = useUserLists();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header */}
                <ProfileHeader user={user} />

                {/* Create List */}


                {/* Lists 
                {loading ? (
                    <Text style={styles.loading}>Loading lists...</Text>
                ) : lists.length === 0 ? (
                    <Text style={styles.empty}>
                        You havent created any lists yet.
                    </Text>
                ) : (
                    lists.map(list => (
                        {/*<BookListCarousel
                            key={list._id}
                            title={list.title}
                            books={list.books}
                        />
                    ))
                )}*/}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0F19",
    },
    loading: {
        color: "#E5E7EB",
        padding: 20,
    },
    empty: {
        color: "#9CA3AF",
        padding: 20,
        fontSize: 16,
    },
});
