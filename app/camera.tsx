import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { voiceService } from '../services/VoiceService';

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [analyzing, setAnalyzing] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const router = useRouter();

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>نحتاج إذن الكاميرا لفحص النزيف</Text>
                <Button mode="contained" onPress={requestPermission}>منح الإذن</Button>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                setAnalyzing(true);
                voiceService.speak("جاري تحليل الصورة...");

                // Take picture (simulated analysis for prototype)
                await cameraRef.current.takePictureAsync();

                // Simulate processing delay
                setTimeout(() => {
                    setAnalyzing(false);
                    analyzeResult();
                }, 2000);
            } catch (error) {
                console.error(error);
                setAnalyzing(false);
            }
        }
    };

    const analyzeResult = () => {
        // Mock Logic: Randomly determine severity for demo purposes
        // In real app, this would analyze pixel color data
        const isSevere = Math.random() > 0.5;

        if (isSevere) {
            voiceService.speak("خطر. النزيف يبدو شديداً. تفعيل بروتوكول النزيف.");
            Alert.alert(
                "نتيجة التحليل: خطر / Danger",
                "النزيف يبدو شديداً (Heavy Bleeding Detected)",
                [
                    {
                        text: "تفعيل البروتوكول",
                        onPress: () => router.replace('/emergency/hemorrhage')
                    }
                ]
            );
        } else {
            voiceService.speak("النزيف يبدو متوسطاً. راقبي الوضع.");
            Alert.alert(
                "نتيجة التحليل: متوسط / Moderate",
                "النزيف يبدو تحت السيطرة. راقبي الوضع.",
                [
                    { text: "حسناً", onPress: () => router.back() }
                ]
            );
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} ref={cameraRef} facing="back">
                <View style={styles.overlay}>
                    <View style={styles.guideBox}>
                        <Text style={styles.guideText}>ضعي مكان النزيف داخل المربع</Text>
                    </View>
                </View>

                <View style={styles.controls}>
                    {analyzing ? (
                        <ActivityIndicator size="large" color="#fff" />
                    ) : (
                        <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>
                    )}
                </View>
            </CameraView>

            <Button
                mode="contained"
                onPress={() => router.back()}
                style={styles.backBtn}
            >
                إلغاء
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
        fontSize: 18,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    guideBox: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#FF5252',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    guideText: {
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        fontSize: 16,
    },
    controls: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
    },
    captureBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    backBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    }
});
