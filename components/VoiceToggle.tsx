import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { voiceService } from '../services/VoiceService';

export const VoiceToggle: React.FC = () => {
    const [isMuted, setIsMuted] = useState(voiceService.getIsMuted());

    const toggleMute = async () => {
        const newState = !isMuted;
        setIsMuted(newState);
        await voiceService.setMuted(newState);
    };

    return (
        <View style={styles.container}>
            <IconButton
                icon={isMuted ? "volume-off" : "volume-high"}
                iconColor={isMuted ? "#999" : "#45AC8B"}
                size={30}
                onPress={toggleMute}
                style={styles.button}
                accessibilityLabel={isMuted ? "Unmute voice" : "Mute voice"}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
    },
    button: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 25,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
});
