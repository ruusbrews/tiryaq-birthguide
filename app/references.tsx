import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../components/ScreenContainer';
import { VoiceButton } from '../components/VoiceButton';

export default function ReferencesScreen() {
    const router = useRouter();

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.title}>المراجع الطبية</Text>
                <Text variant="titleMedium" style={styles.subtitle}>Medical References</Text>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.intro}>
                        يستند هذا التطبيق إلى بروتوكولات منظمة الصحة العالمية (WHO) للولادة في حالات الطوارئ.
                    </Text>
                    <Text style={styles.introEn}>
                        This app is based on WHO protocols for emergency childbirth.
                    </Text>

                    <Divider style={styles.divider} />

                    <List.Item
                        title="WHO Emergency Obstetric Care"
                        description="Protocol 3A: Managing PPH"
                        left={props => <List.Icon {...props} icon="book-outline" />}
                    />
                    <List.Item
                        title="WHO Pregnancy & Childbirth"
                        description="Integrated Management of Pregnancy and Childbirth (IMPAC)"
                        left={props => <List.Icon {...props} icon="book-outline" />}
                    />
                    <List.Item
                        title="UNFPA Emergency Kits"
                        description="Basic Emergency Obstetric Care"
                        left={props => <List.Icon {...props} icon="medical-bag" />}
                    />
                </Card.Content>
            </Card>

            <View style={styles.spacer} />

            <VoiceButton
                text="عودة"
                onPress={() => router.back()}
                mode="outlined"
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontWeight: 'bold',
        color: '#E57373',
        marginBottom: 4,
    },
    subtitle: {
        color: '#666',
    },
    card: {
        backgroundColor: '#FFF',
        marginBottom: 20,
    },
    intro: {
        textAlign: 'right',
        fontSize: 16,
        marginBottom: 8,
        lineHeight: 24,
    },
    introEn: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    divider: {
        marginVertical: 12,
    },
    spacer: {
        flex: 1,
    },
});
