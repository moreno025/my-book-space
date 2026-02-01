import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@/utils/url';

interface ScanResultSelectionProps {
    book: any;
    onAddToList: () => void;
    onWriteReview: () => void;
    onViewDetails: () => void;
    onCancel: () => void;
}

export default function ScanResultSelection({
    book,
    onAddToList,
    onWriteReview,
    onViewDetails,
    onCancel
}: ScanResultSelectionProps) {
    const { t } = useTranslation();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, [fadeAnim, slideAnim]);

    const actions = [
        {
            id: 'add',
            title: t('search.add_to_list'),
            icon: 'plus-circle',
            color: '#10B981',
            onPress: onAddToList,
            isMCI: true
        },
        {
            id: 'review',
            title: t('search.write_review'),
            icon: 'star',
            color: '#F59E0B',
            onPress: onWriteReview,
            isMCI: false
        },
        {
            id: 'details',
            title: t('search.view_details'),
            icon: 'book-open-variant',
            color: '#3B82F6',
            onPress: onViewDetails,
            isMCI: true
        },
        {
            id: 'cancel',
            title: t('search.scan_again'),
            icon: 'camera-retake',
            color: '#6B7280',
            onPress: onCancel,
            isMCI: true
        }
    ];

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <BlurView intensity={90} tint="dark" style={styles.blurBackground}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Book Confirmation Card */}
                    <View style={styles.bookCard}>
                        <Image
                            source={{ uri: getImageUrl(book.coverUrl) || 'https://via.placeholder.com/150' }}
                            style={styles.cover}
                            resizeMode="cover"
                        />
                        <View style={styles.bookInfo}>
                            <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
                            <Text style={styles.author} numberOfLines={1}>{book.authors?.join(', ')}</Text>
                            {book.publishedYear && (
                                <Text style={styles.year}>{book.publishedYear}</Text>
                            )}
                        </View>
                    </View>

                    <Text style={styles.questionText}>{t('search.not_correct_book')}</Text>

                    {/* Glovo Style Menu */}
                    <View style={styles.menuGrid}>
                        {actions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={styles.menuItem}
                                onPress={action.onPress}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.bubble, { backgroundColor: action.color }]}>
                                    {action.isMCI ? (
                                        <MaterialCommunityIcons name={action.icon as any} size={32} color="#fff" />
                                    ) : (
                                        <Ionicons name={action.icon as any} size={32} color="#fff" />
                                    )}
                                </View>
                                <Text style={styles.menuLabel}>{action.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.footerCancel} onPress={onCancel}>
                        <Text style={styles.footerCancelText}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </BlurView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
    },
    blurBackground: {
        flex: 1,
        justifyContent: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: 80,
    },
    bookCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 24,
    },
    cover: {
        width: 100,
        height: 150,
        borderRadius: 12,
        backgroundColor: '#333',
    },
    bookInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Nunito-Bold',
        marginBottom: 4,
    },
    author: {
        color: '#ccc',
        fontSize: 16,
        fontFamily: 'Nunito-SemiBold',
        marginBottom: 8,
    },
    year: {
        color: '#999',
        fontSize: 14,
        fontFamily: 'Nunito-Medium',
    },
    questionText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontFamily: 'Nunito-Medium',
        textAlign: 'center',
        marginBottom: 32,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    menuItem: {
        width: '45%',
        alignItems: 'center',
        marginBottom: 32,
    },
    bubble: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
        marginBottom: 12,
    },
    menuLabel: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Nunito-Bold',
        textAlign: 'center',
    },
    footerCancel: {
        marginTop: 20,
        padding: 16,
        alignItems: 'center',
    },
    footerCancelText: {
        color: '#9CA3AF',
        fontSize: 16,
        fontFamily: 'Nunito-SemiBold',
    },
});
