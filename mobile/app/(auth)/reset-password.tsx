import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    ImageBackground,
    Platform,
    View,
    ScrollView,
    KeyboardAvoidingView
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';

import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { authApi } from '../../constants/api/index';
import { useAppFonts } from '../../hooks/useFonts';
import { useAuth } from '../../hooks/useAuth';

export default function ResetPassword() {
    const { token: tokenParam } = useLocalSearchParams();
    const { logout } = useAuth();
    const [token, setToken] = useState<string>('');
    const fontsLoaded = useAppFonts();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | undefined>(undefined);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (tokenParam) setToken(tokenParam as string);
    }, [tokenParam]);

    const inputBorderColor = successMessage ? '#4CAF50' : error ? 'red' : undefined;

    const handleSubmit = async () => {
        setError(undefined);
        setSuccessMessage(null);

        if (!password || !confirmPassword) {
            setError('Ambos campos son obligatorios');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (!token) {
            setError('Token inválido');
            return;
        }

        try {
            setLoading(true);
            await authApi.updatePassword({ token, newPassword: password });

            setSuccessMessage('Contraseña actualizada correctamente');

            // Wait a bit to show success message, then logout
            // The logout function will force a stack reset and default to Login
            setTimeout(async () => {
                await logout();
            }, 1500);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (!fontsLoaded) return null;

    return (
        <ImageBackground
            source={require('../../assets/images/auth-01.jpg')}
            style={styles.background}
            resizeMode="cover"
        >
            <BlurView intensity={40} tint="dark" style={styles.blur} />

            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
                    style={{ width: '100%' }}
                >
                    <View style={styles.card}>
                        <Text style={styles.title}>Actualizar contraseña</Text>

                        <Input
                            placeholder="Nueva contraseña"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            error={error}
                            borderColor={inputBorderColor}
                        />

                        <Input
                            placeholder="Confirmar contraseña"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            error={error}
                            borderColor={inputBorderColor}
                        />

                        {successMessage && (
                            <Text style={styles.success}>{successMessage}</Text>
                        )}

                        <Button
                            title={loading ? 'Actualizando...' : 'Actualizar'}
                            onPress={handleSubmit}
                            disabled={loading}
                        />
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    blur: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.73)',
        padding: 22,
        borderRadius: 20,
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'Nunito-Bold',
    },
    success: {
        marginBottom: 12,
        fontSize: 14,
        fontWeight: '500',
        color: '#4CAF50',
    },
});
