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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FontFamily, FontSize } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { UserRole } from '../../types';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const { theme, isDark } = useTheme();
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <LinearGradient
            colors={isDark ? [Colors.surfaceDark ?? '#1A2E1F', Colors.backgroundDark ?? '#0F1A14'] : Colors.gradientCard}
            style={styles.headerBg}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.brandRow}>
              <LinearGradient
                colors={Colors.gradientPrimary}
                style={styles.logoCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={{ fontSize: 22 }}>🍃</Text>
              </LinearGradient>
              <View>
                <Text style={[styles.brandName, { color: theme.colors.text }]}>
                  <Text style={{ color: Colors.primary }}>Share</Text>
                  <Text style={{ color: Colors.accent }}>Bite</Text>
                </Text>
                <Text style={[styles.welcomeBack, { color: theme.colors.textSecondary }]}>
                  Welcome back!
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Form */}
          <View style={styles.form}>
            {/* Role Toggle */}
            <View style={[styles.roleToggle, { backgroundColor: theme.colors.surfaceVariant }]}>
              {(['donor', 'ngo'] as UserRole[]).map(role => (
                <TouchableOpacity
                  key={role}
                  onPress={() => setSelectedRole(role)}
                  style={[
                    styles.roleTab,
                    selectedRole === role && {
                      backgroundColor: theme.colors.surface,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleTabText,
                      {
                        color:
                          selectedRole === role
                            ? Colors.primary
                            : theme.colors.textSecondary,
                        fontFamily:
                          selectedRole === role
                            ? FontFamily.outfitSemiBold
                            : FontFamily.outfitRegular,
                      },
                    ]}
                  >
                    {role === 'donor' ? '🍛 Food Donor' : '🤝 NGO / Shelter'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={errors.phone}
              required
              leftIcon={<Ionicons name="call-outline" size={18} color={theme.colors.textTertiary} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={errors.password}
              required
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.colors.textTertiary} />}
              rightIcon={
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.colors.textTertiary}
                />
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity style={styles.forgotPwd}>
              <Text style={[styles.forgotText, { color: Colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <View style={{ height: Spacing.base }} />

            <Button
              label="Log In"
              onPress={handleLogin}
              variant="primary"
              size="xl"
              isLoading={isLoading}
            />

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textTertiary }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            </View>

            <Button
              label="Log In with OTP"
              onPress={() => router.push({ pathname: '/(auth)/otp', params: { phone } })}
              variant="outline"
              size="lg"
              icon={<Ionicons name="phone-portrait-outline" size={18} color={Colors.primary} />}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/signup')}
              style={styles.signupLink}
            >
              <Text style={[styles.signupText, { color: theme.colors.textSecondary }]}>
                New to ShareBite?{' '}
                <Text style={{ color: Colors.primary, fontFamily: FontFamily.outfitSemiBold }}>
                  Create Account
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Demo info */}
            <View style={[styles.demoInfo, { backgroundColor: Colors.primaryAlpha10 }]}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
              <Text style={[styles.demoText, { color: Colors.primary }]}>
                Demo: Any phone + password works. Select Donor or NGO role.
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
  headerBg: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing['2xl'],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: FontFamily.outfitBlack,
    fontSize: FontSize['3xl'],
    letterSpacing: -0.5,
  },
  welcomeBack: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
    marginTop: 2,
  },
  form: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
  },
  roleToggle: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  roleTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  roleTabText: {
    fontSize: FontSize.sm,
  },
  forgotPwd: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.xs,
  },
  forgotText: {
    fontFamily: FontFamily.outfitMedium,
    fontSize: FontSize.base,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.base,
  },
  divider: { flex: 1, height: 1 },
  dividerText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
  },
  signupLink: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
  },
  signupText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
  },
  demoInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.base,
  },
  demoText: {
    flex: 1,
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
});
