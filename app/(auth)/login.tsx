// ShareBite — Login Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BotanicalSprig, HandDrawnSeparator } from '../../components/ui/BotanicalDetails';
import { FontFamily, FontSize } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { UserRole } from '../../types';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ role?: string }>();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    (params.role as UserRole) ?? 'donor',
  );
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!phone.trim()) errs.phone = 'Phone number is required';
    if (!password.trim()) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login(phone, password, selectedRole);
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backBtn, { borderColor: theme.colors.border }]}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.brandBlock}>
              <View style={[styles.brandCircle, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                <BotanicalSprig size={30} color={Colors.primary} />
              </View>
              <View style={styles.brandName}>
                <Text style={[styles.brandShare, { color: Colors.primary }]}>Share</Text>
                <Text style={[styles.brandBite, { color: Colors.accent }]}>Bite</Text>
              </View>
            </View>

            <Text style={[styles.heading, { color: theme.colors.text }]}>Welcome back</Text>
            <Text style={[styles.subheading, { color: theme.colors.textSecondary }]}>
              Sign in to continue your food journey.
            </Text>
            <HandDrawnSeparator />
          </View>

          {/* ── Form ── */}
          <View style={styles.form}>
            {/* Role selector */}
            <Text style={[styles.roleLabel, { color: theme.colors.textTertiary }]}>SIGNING IN AS</Text>
            <View style={styles.roleRow}>
              {(['donor', 'ngo'] as UserRole[]).map(role => (
                <TouchableOpacity
                  key={role}
                  onPress={() => setSelectedRole(role)}
                  style={[
                    styles.roleChip,
                    {
                      backgroundColor: selectedRole === role ? Colors.primary : 'transparent',
                      borderColor: selectedRole === role ? Colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[
                    styles.roleChipText,
                    { color: selectedRole === role ? Colors.textInverse : theme.colors.textSecondary },
                  ]}>
                    {role === 'donor' ? 'Food Donor' : 'NGO / Shelter'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Phone Number"
              placeholder="e.g. 9876543210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={errors.phone}
              required
              leftIcon={<Ionicons name="call-outline" size={16} color={theme.colors.textTertiary} />}
            />

            <Input
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={errors.password}
              required
              leftIcon={<Ionicons name="lock-closed-outline" size={16} color={theme.colors.textTertiary} />}
              rightIcon={
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={16}
                  color={theme.colors.textTertiary}
                />
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity style={styles.forgotPwd}>
              <Text style={[styles.forgotText, { color: Colors.primary }]}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={{ height: Spacing.base }} />

            <Button
              label="Log In"
              onPress={handleLogin}
              variant="primary"
              size="lg"
              isLoading={isLoading}
            />

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.divider }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textTertiary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.divider }]} />
            </View>

            <Button
              label="Log In with OTP"
              onPress={() => router.push({ pathname: '/(auth)/otp', params: { phone } })}
              variant="outline"
              size="md"
              icon={<Ionicons name="phone-portrait-outline" size={16} color={Colors.primary} />}
            />

            <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.signupLink}>
              <Text style={[styles.signupText, { color: theme.colors.textSecondary }]}>
                New to ShareBite?{' '}
                <Text style={{ color: Colors.primary, fontFamily: FontFamily.outfitSemiBold }}>
                  Create Account
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Demo Info */}
            <View style={[styles.demoInfo, { backgroundColor: Colors.primaryAlpha08, borderColor: theme.colors.border }]}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.primary} />
              <Text style={[styles.demoText, { color: Colors.primary }]}>
                Demo: Any phone + password works. Select your role above.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: Spacing['3xl'] },

  // Header
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.xs, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  brandBlock: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  brandCircle: {
    width: 52, height: 52, borderRadius: 26, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  brandName: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  brandShare: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['3xl'],
    letterSpacing: 0.3,
  },
  brandBite: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['3xl'],
    letterSpacing: 0.3,
  },
  heading: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['3xl'],
    letterSpacing: 0.2,
    marginBottom: Spacing.xs,
  },
  subheading: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },

  // Form
  form: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  roleLabel: {
    fontSize: 9, fontFamily: FontFamily.outfitBold, letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.xs,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleChipText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
  },
  forgotPwd: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    paddingVertical: 4,
  },
  forgotText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.xs + 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.base,
  },
  dividerLine: { flex: 1, height: 0.5 },
  dividerText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    fontStyle: 'italic',
  },
  signupLink: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
  },
  signupText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
  },
  demoInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.xs,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  demoText: {
    flex: 1,
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs + 1,
    lineHeight: (FontSize.xs + 1) * 1.5,
  },
});
