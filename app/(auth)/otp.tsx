// ShareBite — OTP Verification Screen

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { FontFamily, FontSize } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { AuthService } from '../../services/auth';

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ phone: string; signup?: string }>();
  const phone = params.phone || '+91 XXXXX XXXXX';
  const isSignup = params.signup === '1';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      Alert.alert('Incomplete', 'Please enter all 6 digits.');
      return;
    }
    setIsVerifying(true);
    try {
      await AuthService.verifyOTP(phone, code);
      if (isSignup) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch {
      Alert.alert('Invalid OTP', 'The code entered is incorrect. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.primaryAlpha10 }]}>
            <Text style={{ fontSize: 48 }}>📱</Text>
          </View>
        </View>

        <Text style={[styles.heading, { color: theme.colors.text }]}>Verify Phone</Text>
        <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
          We sent a 6-digit code to{'\n'}
          <Text style={{ color: theme.colors.text, fontFamily: FontFamily.outfitSemiBold }}>
            {phone}
          </Text>
        </Text>

        {/* OTP boxes */}
        <View style={styles.otpRow}>
          {Array(OTP_LENGTH).fill(0).map((_, i) => (
            <TextInput
              key={i}
              ref={ref => { if (ref) inputRefs.current[i] = ref; }}
              value={otp[i]}
              onChangeText={v => handleOtpChange(v, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              onFocus={() => setFocusedIndex(i)}
              keyboardType="numeric"
              maxLength={1}
              style={[
                styles.otpBox,
                {
                  borderColor: focusedIndex === i ? Colors.primary : otp[i] ? Colors.primaryLight : theme.colors.border,
                  backgroundColor: otp[i] ? Colors.primaryAlpha10 : theme.colors.inputBg,
                  color: theme.colors.text,
                },
              ]}
              accessibilityLabel={`OTP digit ${i + 1}`}
            />
          ))}
        </View>

        {/* Demo hint */}
        <View style={[styles.hint, { backgroundColor: Colors.primaryAlpha10 }]}>
          <Text style={[styles.hintText, { color: Colors.primary }]}>
            💡 Demo: Enter any 6 digits
          </Text>
        </View>

        <View style={{ height: Spacing['2xl'] }} />

        <Button
          label="Verify & Continue"
          onPress={handleVerify}
          variant="primary"
          size="xl"
          isLoading={isVerifying}
        />

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={[styles.resendText, { color: theme.colors.textSecondary }]}>
            Didn't receive the code?{' '}
          </Text>
          {resendTimer > 0 ? (
            <Text style={[styles.resendTimer, { color: theme.colors.textTertiary }]}>
              Resend in {resendTimer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={() => setResendTimer(30)}>
              <Text style={[styles.resendLink, { color: Colors.primary }]}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontFamily: FontFamily.outfitBlack,
    fontSize: FontSize['3xl'],
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  sub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.6,
    marginBottom: Spacing['2xl'],
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: FontSize['2xl'],
    fontFamily: FontFamily.outfitBold,
  },
  hint: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignSelf: 'center',
  },
  hintText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  resendText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
  },
  resendTimer: {
    fontFamily: FontFamily.outfitMedium,
    fontSize: FontSize.base,
  },
  resendLink: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.base,
  },
});
