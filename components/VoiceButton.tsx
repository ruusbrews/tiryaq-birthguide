import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { voiceService } from '../services/VoiceService';

interface VoiceButtonProps {
    text: string;
    onPress: () => void;
    mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
    style?: any;
    labelStyle?: any;
    speakText?: string; // Optional text to speak if different from label
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
    text,
    onPress,
    mode = 'contained',
    style,
    labelStyle,
    speakText
}) => {
    const handlePress = () => {
        // Speak the text first (or concurrently)
        voiceService.speak(speakText || text);
        onPress();
    };

    return (
        <Button
            mode={mode}
            onPress={handlePress}
            style={[styles.button, style]}
            labelStyle={[styles.label, labelStyle]}
            contentStyle={styles.content}
        >
            {text}
        </Button>
    );
};

const styles = StyleSheet.create({
    button: {
        marginVertical: 8,
        borderRadius: 12,
        elevation: 2,
    },
    content: {
        height: 56, // Taller touch target
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
    }
});
