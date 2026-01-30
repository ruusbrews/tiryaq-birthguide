import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ListeningIndicatorProps {
    visible: boolean;
    transcribing?: boolean;
    transcription?: string;
    style?: any;
}

export const ListeningIndicator: React.FC<ListeningIndicatorProps> = ({ visible, transcribing, transcription, style }) => {
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

    if (!visible && !transcribing && !transcription) return null;

    return (
        <View style={[styles.wrapper, style]}>
            <Surface style={styles.container} elevation={2}>
                <View style={styles.content}>
                    {(visible || transcribing) && (
                        <Animated.View style={[styles.micCircle, { transform: [{ scale: pulseAnim }], backgroundColor: transcribing ? '#45AC8B' : '#E57373' }]}>
                            {transcribing ? (
                                <MaterialCommunityIcons name="cached" size={20} color="#FFF" />
                            ) : (
                                <MaterialCommunityIcons name="microphone" size={20} color="#FFF" />
                            )}
                        </Animated.View>
                    )}
                    <View style={styles.textContainer}>
                        {transcription ? (
                            <Text variant="bodyLarge" style={styles.transcriptionText}>{transcription}</Text>
                        ) : transcribing ? (
                            <Text variant="bodyMedium" style={styles.transcribingText}>جاري المعالجة...</Text>
                        ) : (
                            <Text variant="bodyMedium" style={styles.listeningText}>جاري الاستماع...</Text>
                        )}
                    </View>
                </View>
            </Surface>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
    },
    container: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.9)',
        width: '85%',
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    content: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
    },
    micCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E57373',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    textContainer: {
        flexShrink: 1,
    },
    listeningText: {
        color: '#E57373',
        fontWeight: '500',
        textAlign: 'right',
    },
    transcribingText: {
        color: '#45AC8B',
        fontWeight: '500',
        textAlign: 'right',
    },
    transcriptionText: {
        color: '#45AC8B',
        fontWeight: 'bold',
        textAlign: 'right',
    },
});
