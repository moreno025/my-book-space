import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

// hooks
import { useAuth } from "../../../hooks/useAuth";
import { useUserLists } from "../../../hooks/BookList/useUserList";
import { useAppFonts } from "../../../hooks/useFonts";

// components
import { ProfileHeader } from "@/components/profile/ProfileHeader";

import { BookListCarousel } from "@/components/profile/BookListCarousel";
import { CreateListModal } from "@/components/profile/CreateListModal";
import { AddBookToListModal } from "@/components/profile/AddBookToListModal";
import { bookListApi } from "../../../constants/api";

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const fontsLoaded = useAppFonts();
    const { lists, loading, error, refetch } = useUserLists({
        username: user?.username ?? "",
        enabled: !!user?.username,
    });
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [addBookModalVisible, setAddBookModalVisible] = useState(false);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            if (user?.username) {
                refetch();
            }
        }, [user?.username, refetch])
    );

    const handleCreateList = () => {
        setCreateModalVisible(true);
    };

    const handleCreateListSubmit = async (data: { title: string; description: string; isPublic: boolean }) => {
        await bookListApi.createBookList(data);
        refetch();
    };

    const handleOpenAddBook = (listId: string) => {
        setSelectedListId(listId);
        setAddBookModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}>
                {/* Header */}
                <ProfileHeader user={user} onAddList={handleCreateList} />

                {/* Lists */}
                {loading ? (
                    <View style={styles.centerSection}>
                        <Text style={styles.loading}>Loading lists...</Text>
                    </View>
                ) : lists.length === 0 ? (
                    <View style={styles.centerSection}>
                        <Text style={styles.empty}>
                            {"You haven't created any lists yet."}
                        </Text>
                    </View>
                ) : (
                    lists.map(list => (
                        <BookListCarousel
                            key={list._id}
                            listId={list._id}
                            title={list.title}
                            books={list.books}
                            onAddBook={() => handleOpenAddBook(list._id)}
                            onRefresh={refetch}
                        />
                    ))
                )}
            </ScrollView>

            <CreateListModal
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSubmit={handleCreateListSubmit}
            />

            <AddBookToListModal
                visible={addBookModalVisible}
                listId={selectedListId}
                onClose={() => {
                    setAddBookModalVisible(false);
                    setSelectedListId(null);
                }}
                onBookAdded={() => {
                    refetch();
                }}
            />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0F19",
    },
    centerSection: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loading: {
        color: "#E5E7EB",
        padding: 20,
        fontFamily: "Nunito-Bold"
    },
    empty: {
        color: "#9CA3AF",
        padding: 20,
        fontSize: 16,
    },
});
