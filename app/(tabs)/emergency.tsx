/**
 * Emergency Protocol Screen
 * 
 * Displays emergency protocols using the ProtocolViewer component
 * Handles all emergency types: hemorrhage, breech, resuscitation, etc.
 * 
 * CONSTRAINTS:
 * - Reuse ProtocolViewer for consistent emergency UX
 * - Load protocol based on emergency type
 * - Cannot be dismissed accidentally (handled by ProtocolViewer)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ProtocolViewer, { Protocol } from '../../components/ProtocolViewer';
import { getProtocolByType } from '../../data/protocols';
import decisionTreeService from '../../services/decisionTree';

const EmergencyScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Current protocol to display
    const [protocol, setProtocol] = useState<Protocol | null>(null);

    /**
     * Load protocol based on emergency type from params or decision tree
     */
    useEffect(() => {
        loadEmergencyProtocol();
    }, [params]);

    /**
     * Load the appropriate emergency protocol
     */
    const loadEmergencyProtocol = async () => {
        try {
            // Get emergency type from URL params or decision tree state
            let emergencyType = params.type as string;

            if (!emergencyType) {
                // Fallback: Get from decision tree state
                const laborState = await decisionTreeService.getCurrentState();
                emergencyType = laborState?.emergencyType || '';
            }

            if (!emergencyType) {
                Alert.alert(
                    'خطأ',
                    'لم يتم تحديد نوع الطوارئ',
                    [{ text: 'حسناً', onPress: () => router.back() }]
                );
                return;
            }

            // Load protocol data
            const protocolData = getProtocolByType(emergencyType);

            if (!protocolData) {
                Alert.alert(
                    'خطأ',
                    `لم يتم العثور على بروتوكول الطوارئ: ${emergencyType}`,
                    [{ text: 'حسناً', onPress: () => router.back() }]
                );
                return;
            }

            setProtocol(protocolData);
        } catch (error) {
            console.error('[Emergency] Failed to load protocol:', error);
            Alert.alert(
                'خطأ',
                'فشل تحميل بروتوكول الطوارئ',
                [{ text: 'حسناً', onPress: () => router.back() }]
            );
        }
    };

    /**
     * Handle protocol completion
     */
    const handleProtocolComplete = () => {
        Alert.alert(
            'تم إكمال البروتوكول',
            'لقد أكملت جميع خطوات بروتوكول الطوارئ. يرجى الانتظار حتى وصول المساعدة الطبية.',
            [
                {
                    text: 'حسناً',
                    onPress: async () => {
                        // Clear emergency state to prevent redirect loop
                        await decisionTreeService.clearEmergency();
                        // Return to guidance screen
                        router.replace('/guide');
                    },
                },
            ]
        );
    };

    /**
     * Handle protocol exit (user confirmed exit)
     */
    const handleProtocolExit = async () => {
        // User has confirmed exit from emergency protocol
        await decisionTreeService.clearEmergency();
        // Return to guidance screen
        router.replace('/guide');
    };

    // Show loading if no protocol yet
    if (!protocol) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>جاري تحميل بروتوكول الطوارئ...</Text>
            </View>
        );
    }

    return (
        <ProtocolViewer
            protocol={protocol}
            visible={protocol !== null}
            onComplete={handleProtocolComplete}
            onExit={handleProtocolExit}
        />
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
    },
});

export default EmergencyScreen;
