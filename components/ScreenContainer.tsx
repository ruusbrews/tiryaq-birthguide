import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

import { voiceInputService } from '../services/VoiceInputService';
import { ListeningIndicator } from './ListeningIndicator';
import { VoiceToggle } from './VoiceToggle';

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
    const [isListening, setIsListening] = React.useState(voiceInputService.getIsListening());

    React.useEffect(() => {
        const unsubscribe = voiceInputService.subscribe(setIsListening);
        return () => { unsubscribe(); };
    }, []);

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
            <VoiceToggle />
            <ListeningIndicator visible={isListening} />
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
});
