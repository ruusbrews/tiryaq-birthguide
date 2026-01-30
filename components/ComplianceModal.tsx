import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, IconButton, Surface } from 'react-native-paper';

export type DisclaimerType = 'home' | 'health_consent' | 'emergency_notice' | 'emergency_birth_info';

interface ComplianceModalProps {
    visible: boolean;
    type: DisclaimerType;
    onDismiss: () => void;
    onAgree?: () => void;
}

const DISCLAIMERS = {
    home: {
        title: 'معلومات هامة',
        content: `هذا التطبيق مصمم لتوفير إرشادات صحية ومشاركة اختيارية للمعلومات لدعم خدمات صحة الأم في حالات الأزمات.\n\nالتطبيق لا يقدم رعاية طبية، ولا يتخذ قرارات طبية، ولا يغني عن التواصل مع العاملين الصحيين أو خدمات الطوارئ أو الدعم المجتمعي الموثوق.\n\nأي معلومات تختار مشاركتها تُستخدم فقط لمساعدة السلطات الصحية والشركاء الإنسانيين على فهم الاحتياجات وتخطيط الخدمات.\n\nمشاركة المعلومات لا تضمن أن عاملاً صحياً سيتصل بك أو يزورك.\n\nيمكنك استخدام إرشادات الطوارئ في التطبيق حتى لو اخترت عدم مشاركة أي بيانات.\n\nمن خلال الاستمرار في استخدام هذا التطبيق، فإنك تقر بأن الوصول إلى الشبكة وتسليم الرسائل والاستجابات من أطراف ثالثة قد يكون محدوداً أو غير متاح بسبب الوضع الحالي.`,
        mode: 'info' as const
    },
    health_consent: {
        title: 'الموافقة على إرسال المعلومات الصحية عبر SMS',
        content: `يرجى القراءة بعناية قبل الإرسال\n\nأنتِ على وشك إرسال معلومات صحية مختارة عبر رسالة نصية قصيرة (SMS) لدعم تخطيط صحة الأم.\n\nما الذي سيتم إرساله:\n- معلومات عامة عن الحمل والصحة (مثل الفئة العمرية، مرحلة الحمل، عوامل الخطر، والمحافظة)\n- لن يتم تضمين الاسم الكامل، العنوان الدقيق، أو موقع GPS\n\nمن قد يستلمها:\n- وزارة الصحة وشركاء الصحة الإنسانيون الموثوق بهم (مثل خدمات الصحة التابعة للأمم المتحدة أو المنظمات غير الحكومية) المشاركون في تخطيط صحة الأم\n\nمخاطر هامة:\n- رسائل SMS ليست مشفرة\n- قد يتم الاطلاع على رسائل SMS من قبل مشغلي شبكات الهاتف المحمول أو الآخرين الذين لديهم وصول إلى الشبكة\n- قد يتأخر التسليم أو يفشل بسبب انقطاع الشبكة\n\nكيفية استخدام معلوماتك:\n- للمساعدة في تخطيط وتخصيص الموارد الصحية (على سبيل المثال، العيادات، القابلات، أو الفرق المتنقلة)\n- للتوثيق رفيع المستوى لاحتياجات صحة الأم\n- ليس للتسويق، أو إنفاذ القانون، أو لأغراض غير صحية\n\nما الذي لا يعنيه هذا:\n- إرسال هذه المعلومات لا يضمن أن أحداً سيتصل بك أو يزورك\n- هذا ليس نظام تنبيه للطوارئ\n- يجب عليكِ الاستمرار في طلب المساعدة من خلال أي قنوات طوارئ أو قنوات مجتمعية متاحة إذا كنتِ في خطر\n\nخيارك:\n- إرسال هذه المعلومات تطوعي\n- يمكنكِ الاستمرار في استخدام التطبيق حتى لو اخترتِ عدم الإرسال\n- يمكنكِ التوقف عن استخدام هذه الميزة في أي وقت`,
        mode: 'consent' as const
    },
    emergency_notice: {
        title: 'تنبيه رسالة الطوارئ',
        content: `سيتم إرسال هذه الرسالة عبر SMS لطلب المساعدة أو مشاركة معلومات عاجلة.\n\n- رسائل SMS ليست مشفرة والتسليم غير مضمون\n- إرسال هذه الرسالة لا يضمن وصول المساعدة\n- استخدم جميع خيارات الطوارئ المتاحة إذا كان ذلك ممكناً\n\nهل تريد إرسال هذه الرسالة الآن؟`,
        mode: 'consent' as const
    },
    emergency_birth_info: {
        title: 'تنويه معلومات الولادة الطارئة',
        content: `يرجى القراءة قبل المتابعة\n\nتوفر هذه الميزة معلومات طارئة وإرشادات خطوة بخطوة للولادة عندما لا تتوفر المساعدة الطبية المهنية على الفور.\n\nالإرشادات ليست نصيحة طبية ولا تحل محل الطبيب أو القابلة أو الرعاية الطارئة.\n\nتستند المعلومات إلى مصادر معترف بها دولياً (بما في ذلك إرشادات منظمة الصحة العالمية) ومكيفة لحالات الطوارئ.\n\nتعتمد النتائج على العديد من العوامل؛ واتباع هذه الإرشادات لا يمكن أن يضمن السلامة لكِ أو لطفلكِ.\n\nاطلبي المساعدة الطبية المهنية في أقرب وقت ممكن، حتى لو بدت الولادة تسير بشكل طبيعي.\n\nهذه الميزة مخصصة فقط لدعمكِ في حالة الطوارئ، وليس لتشخيص أو علاج أو اتخاذ قرارات طبية.`,
        mode: 'consent' as const
    }
};

export const ComplianceModal: React.FC<ComplianceModalProps> = ({ visible, type, onDismiss, onAgree }) => {
    const disclaimer = DISCLAIMERS[type];

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.modalContainer}
            >
                <Surface style={styles.surface} elevation={5}>
                    <View style={styles.header}>
                        {disclaimer.mode === 'info' && (
                            <IconButton
                                icon="close"
                                iconColor="#666"
                                size={24}
                                onPress={onDismiss}
                                style={styles.closeButton}
                            />
                        )}
                        <Text variant="titleLarge" style={styles.title}>
                            {disclaimer.title}
                        </Text>
                    </View>

                    <ScrollView
                        style={styles.contentScroll}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <Text style={styles.contentText}>
                            {disclaimer.content}
                        </Text>
                    </ScrollView>

                    {disclaimer.mode === 'consent' && (
                        <View style={styles.footer}>
                            <Button
                                mode="contained"
                                onPress={() => {
                                    if (onAgree) onAgree();
                                    onDismiss();
                                }}
                                style={styles.agreeButton}
                                icon={type === 'emergency_birth_info' ? 'play-circle' : 'check-circle'}
                                contentStyle={styles.buttonContent}
                            >
                                {type === 'emergency_birth_info' ? '▶️ متابعة' : 'أوافق - إرسال SMS'}
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={onDismiss}
                                style={styles.cancelButton}
                                icon={type === 'emergency_birth_info' ? 'arrow-left-circle' : 'close-circle'}
                                contentStyle={styles.buttonContent}
                                textColor="#D32F2F"
                            >
                                {type === 'emergency_birth_info' ? '⬅️ العودة' : 'إلغاء'}
                            </Button>
                        </View>
                    )}
                </Surface>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        padding: 20,
        justifyContent: 'center',
    },
    surface: {
        backgroundColor: 'white',
        borderRadius: 12,
        maxHeight: '90%',
        flexShrink: 1,
        width: '100%',
    },
    header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        justifyContent: 'space-between',
    },
    title: {
        fontWeight: 'bold',
        color: '#45AC8B',
        textAlign: 'right',
        flex: 1,
    },
    closeButton: {
        margin: 0,
    },
    contentScroll: {
        flexGrow: 0,
        flexShrink: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    contentText: {
        textAlign: 'right',
        lineHeight: 24,
        fontSize: 15,
        color: '#333',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    agreeButton: {
        backgroundColor: '#94E394',
        marginBottom: 8,
    },
    cancelButton: {
        borderColor: '#D32F2F',
    },
    buttonContent: {
        flexDirection: 'row-reverse',
        height: 48,
    },
});
