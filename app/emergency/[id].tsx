import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { ProtocolViewer } from '../../components/ProtocolViewer';
import { EMERGENCY_PROTOCOLS } from '../../data/protocols';
import { ScreenContainer } from '../../components/ScreenContainer';
import { VoiceButton } from '../../components/VoiceButton';

export default function EmergencyProtocolScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const protocol = EMERGENCY_PROTOCOLS[id as string];

    if (!protocol) {
        return (
            <ScreenContainer>
                <Text>Protocol not found: {id}</Text>
                <VoiceButton text="عودة" onPress={() => router.back()} />
            </ScreenContainer>
        );
    }

    return <ProtocolViewer protocol={protocol} />;
}
