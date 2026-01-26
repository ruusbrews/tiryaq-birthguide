import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ListeningIndicatorProps {
    visible: boolean;
}

export const ListeningIndicator: React.FC<ListeningIndicatorProps> = ({ visible }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [visible, pulseAnim]);

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <Surface style={styles.container} elevation={4}>
                <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                    <MaterialCommunityIcons name="microphone" size={32} color="#FFF" />
                </Animated.View>
                <Text style={styles.text}>جاري الاستماع...</Text>
            </Surface>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
    },
    pulseCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E57373',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E57373',
    },
});
