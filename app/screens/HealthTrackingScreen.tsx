import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';

export default function HealthTrackingScreen() {
    const router = useRouter();

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>تسجيل الصحة</Text>
            </View>

            <View style={styles.content}>
                <Text variant="bodyLarge" style={styles.text}>
                    هذه الميزة قيد التطوير
                </Text>
            </View>

            <Button
                mode="contained"
                onPress={() => router.back()}
                style={styles.backButton}
            >
                العودة
            </Button>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginVertical: 40,
    },
    title: {
        fontWeight: 'bold',
        color: '#45AC8B',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        textAlign: 'center',
        color: '#666',
    },
    backButton: {
        marginTop: 'auto',
        marginBottom: 20,
    },
});
