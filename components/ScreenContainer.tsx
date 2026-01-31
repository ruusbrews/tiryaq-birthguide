import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

import { voiceInputService } from '../services/VoiceInputService';
import { ListeningIndicator } from './ListeningIndicator';
import { VoiceToggle } from './VoiceToggle';
import { LanguageToggle } from './LanguageToggle';

interface ScreenContainerProps {
    children: React.ReactNode;
    style?: any;
    scrollable?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
    children,
    style,
    scrollable = true
}) => {
    const theme = useTheme();

    const Content = (
        <View style={[styles.content, style]}>
            {children}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {scrollable ? (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {Content}
                </ScrollView>
            ) : (
                Content
            )}
            <View style={styles.topRightControls}>
                <LanguageToggle />
                <VoiceToggle />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    topRightControls: {
        position: 'absolute',
        top: 20,
        right: 15,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1000,
    },
});
