// Auth 화면들
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '../../constants/colors';
import type { AuthStackParamList } from '../../navigation/RootNavigator';

type AuthNavProp = StackNavigationProp<AuthStackParamList>;

export function SplashScreen() {
    const navigation = useNavigation<AuthNavProp>();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Login');
        }, 2000);
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>✿</Text>
            <Text style={styles.appName}>Zenny</Text>
            <Text style={styles.tagline}>Your Zen Companion</Text>
        </View>
    );
}

export function LoginScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>✿</Text>
            <Text style={styles.title}>Sign In</Text>
        </View>
    );
}

export function OnboardingScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choose Your Character</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
    logo: { fontSize: 64, marginBottom: 12, color: '#C4B5FD' }, // 보라색으로 배경과 대비
    appName: { fontSize: 36, color: COLORS.text, marginBottom: 4, fontWeight: '700' },
    tagline: { fontSize: 14, color: COLORS.text2 },
    title: { fontSize: 24, color: COLORS.text, fontWeight: '600' },
});
