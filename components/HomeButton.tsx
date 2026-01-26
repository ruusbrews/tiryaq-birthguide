import React from 'react';
import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

export const HomeButton: React.FC = () => {
    const router = useRouter();

    const handlePress = () => {
        router.dismissAll();
    };

    return (
        <IconButton
            icon="home"
            size={28}
            iconColor="#E57373"
            style={styles.button}
            onPress={handlePress}
        />
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        elevation: 4,
    },
});
