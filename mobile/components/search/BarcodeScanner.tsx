import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { booksApi } from '../../constants/api';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import ScanResultSelection from './ScanResultSelection';
import { SaveBookModal } from '../book/SaveBookModal';
import { ReviewModal } from '../reviews/ReviewModal';
import { CreateListModal } from '../profile/CreateListModal';
import { useCreateReview } from '../../hooks/Review/useCreateReview';
import { useToast } from '../../context/ToastContext';

interface BarcodeScannerProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function BarcodeScanner({ isVisible, onClose }: BarcodeScannerProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scannedBook, setScannedBook] = useState<any>(null);
    const isProcessingRef = React.useRef(false);

    // Modals state
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showCreateListModal, setShowCreateListModal] = useState(false);

    const { showToast } = useToast();
    const { createReview, loading: submittingReview } = useCreateReview(scannedBook?.id || '');

    useEffect(() => {
        if (isVisible && !permission?.granted) {
            requestPermission();
        }
    }, [isVisible, permission?.granted, requestPermission]);

    const handleBarcodeScanned = async ({ data }: { data: string }) => {
        if (scanned || loading || isProcessingRef.current) return;

        isProcessingRef.current = true;
        setScanned(true);
        setLoading(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            // Verify if it looks like an ISBN (usually 10 or 13 digits)
            // But Google Books handles various barcode formats
            const res = await booksApi.getBookByIsbn(data, i18n.language);

            if (res.data) {
                setScannedBook(res.data);
                // We keep scanned/loading true to stop the camera
            }
        } catch (error: any) {
            console.error('Scan error:', error);
            // Don't reset scanned/loading immediately to prevent "burst" errors
            const message = error.response?.status === 404
                ? t('search.book_not_found')
                : t('search.scan_error');

            Alert.alert(t('common.error'), message, [
                {
                    text: 'OK',
                    onPress: () => {
                        isProcessingRef.current = false;
                        setScanned(false);
                    }
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Reset scanned state when modal becomes invisible
    useEffect(() => {
        if (!isVisible) {
            setScanned(false);
            setLoading(false);
            setScannedBook(null);
            isProcessingRef.current = false;
        }
    }, [isVisible]);

    const handleCreateReview = async (data: { rating: number; review: string }) => {
        try {
            await createReview(data);
            showToast(t('review.success'), 'success');
            setShowReviewModal(false);
            onClose();
            router.push(`/(app)/book/${scannedBook.id}`);
        } catch (error) {
            console.error("Create review error:", error);
            showToast(t('review.failed'), 'error');
        }
    };

    const handleReset = () => {
        setScannedBook(null);
        setScanned(false);
        setLoading(false);
        isProcessingRef.current = false;
    };

    if (!isVisible) return null;

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {!permission ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                ) : !permission.granted ? (
                    <View style={styles.center}>
                        <Text style={styles.text}>{t('search.camera_permission_required')}</Text>
                        <TouchableOpacity style={styles.button} onPress={requestPermission}>
                            <Text style={styles.buttonText}>{t('search.grant_permission')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
                        }}
                    >
                        <View style={styles.overlay}>
                            <BlurView intensity={30} style={styles.header}>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={30} color="#fff" />
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>{t('search.scan_barcode')}</Text>
                                <View style={{ width: 30 }} />
                            </BlurView>

                            <View style={styles.scanContainer}>
                                <View style={styles.scanFrame}>
                                    <View style={[styles.corner, styles.topLeft]} />
                                    <View style={[styles.corner, styles.topRight]} />
                                    <View style={[styles.corner, styles.bottomLeft]} />
                                    <View style={[styles.corner, styles.bottomRight]} />
                                    {loading && (
                                        <ActivityIndicator size="large" color="#3B82F6" />
                                    )}
                                </View>
                                <Text style={styles.hint}>{t('search.align_barcode')}</Text>
                            </View>

                            <View style={styles.footer} />
                        </View>
                    </CameraView>
                )}

                {scannedBook && (
                    <ScanResultSelection
                        book={scannedBook}
                        onAddToList={() => setShowSaveModal(true)}
                        onWriteReview={() => setShowReviewModal(true)}
                        onViewDetails={() => {
                            onClose();
                            router.push(`/(app)/book/${scannedBook.id}`);
                        }}
                        onCancel={handleReset}
                    />
                )}

                <SaveBookModal
                    visible={showSaveModal}
                    book={scannedBook}
                    onClose={() => setShowSaveModal(false)}
                    onSuccess={(listName) => {
                        showToast(t('common.saved_to', { list: listName }), 'success');
                        onClose(); // Close scanner
                        router.push('/(app)/(tabs)/profile'); // Navigate to Profile
                    }}
                    onCreateList={() => setShowCreateListModal(true)}
                />

                <ReviewModal
                    visible={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    onSubmit={handleCreateReview}
                    loading={submittingReview}
                />

                <CreateListModal
                    visible={showCreateListModal}
                    onClose={() => setShowCreateListModal(false)}
                    onSubmit={async () => {
                        // After creating, we just close and return to save modal
                        setShowCreateListModal(false);
                        setShowSaveModal(true);
                    }}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Nunito-Medium',
    },
    button: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Nunito-Bold',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Nunito-Bold',
    },
    closeButton: {
        padding: 5,
    },
    scanContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanFrame: {
        width: 280,
        height: 200,
        borderWidth: 0,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#3B82F6',
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 15,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 15,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 15,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 15,
    },
    hint: {
        color: '#fff',
        fontSize: 14,
        marginTop: 30,
        fontFamily: 'Nunito-Medium',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    footer: {
        height: 100,
    },
});
