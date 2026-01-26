import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { voiceService } from '../services/VoiceService';

interface DangerButtonProps {
    text: string;
    onPress: () => void;
    style?: any;
}

export const DangerButton: React.FC<DangerButtonProps> = ({ text, onPress, style }) => {
    const handlePress = () => {
        voiceService.speak(text);
        onPress();
    };

    return (
        <Button
            mode="contained"
            onPress={handlePress}
            style={[styles.button, style]}
            labelStyle={styles.label}
            buttonColor="#D32F2F" // Strong red
            textColor="white"
            icon="alert-circle"
        >
            {text}
        </Button>
    );
};

const styles = StyleSheet.create({
    button: {
        marginVertical: 16,
        borderRadius: 12,
        elevation: 4,
        paddingVertical: 4,
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
    }
});
