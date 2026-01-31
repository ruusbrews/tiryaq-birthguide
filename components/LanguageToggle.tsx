import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useLanguage } from '../context/LanguageContext';

export const LanguageToggle: React.FC = () => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <TouchableOpacity
            onPress={toggleLanguage}
            activeOpacity={0.7}
            style={styles.container}
        >
            <Surface style={styles.surface} elevation={2}>
                <View style={styles.toggleRow}>
                    <Text
                        style={[
                            styles.langText,
                            language === 'ar' ? styles.activeLang : styles.inactiveLang
                        ]}
                    >
                        عربي
                    </Text>
                    <View style={styles.divider} />
                    <Text
                        style={[
                            styles.langText,
                            language === 'en' ? styles.activeLang : styles.inactiveLang
                        ]}
                    >
                        EN
                    </Text>
                </View>
            </Surface>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        // Layout managed by parent row in ScreenContainer
        marginRight: 8, // Space between language and voice toggle
    },
    surface: {
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    langText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    activeLang: {
        color: '#45AC8B',
    },
    inactiveLang: {
        color: '#999999',
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: '#DDDDDD',
        marginHorizontal: 8,
    },
});
