// ShareBite — Signup Screen

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
import { HandDrawnSeparator } from '../../components/ui/BotanicalDetails';
import { FontFamily, FontSize } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { UserRole } from '../../types';

export default function SignupScreen() {
  const { signup, isLoading } = useAuth();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ role?: string }>();
  const role = (params.role as UserRole) ?? 'donor';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    organizationName: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);

  const isNGO = role === 'ngo';

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (isNGO && !form.organizationName.trim()) errs.org = 'Organization name is required';
    if (!form.password || form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (!agreed) errs.terms = 'Please accept the terms to continue';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    try {
      await signup({
        name: form.name,
        phone: form.phone,
        email: form.email,
        role,
        organizationName: form.organizationName,
        password: form.password,
      });
      router.push({ pathname: '/(auth)/otp', params: { phone: form.phone, signup: '1' } });
    } catch (err) {
      Alert.alert('Signup Failed', 'Something went wrong. Please try again.');
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

            <Text style={[styles.heading, { color: theme.colors.text }]}>Create Account</Text>

            {/* Role badge */}
            <View style={[
              styles.roleBadge,
              {
                backgroundColor: isNGO ? Colors.accentAlpha10 : Colors.primaryAlpha08,
                borderColor: isNGO ? Colors.accent : Colors.primary,
              },
            ]}>
              <Ionicons
                name={isNGO ? 'shield-checkmark-outline' : 'restaurant-outline'}
                size={12}
                color={isNGO ? Colors.accent : Colors.primary}
              />
              <Text style={[styles.roleText, { color: isNGO ? Colors.accent : Colors.primary }]}>
                {isNGO ? 'NGO / Organization' : 'Food Donor'}
              </Text>
            </View>

            <Text style={[styles.subheading, { color: theme.colors.textSecondary }]}>
              Join the community of food rescuers.
            </Text>
            <HandDrawnSeparator />
          </View>

          {/* ── Form ── */}
          <View style={styles.form}>
            <Input
              label={isNGO ? 'Contact Person Name' : 'Full Name'}
              placeholder={isNGO ? 'Your name' : 'Enter your full name'}
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
              error={errors.name}
              required
              leftIcon={<Ionicons name="person-outline" size={16} color={theme.colors.textTertiary} />}
            />

            {isNGO && (
              <Input
                label="Organization Name"
                placeholder="GreenHope Foundation"
                value={form.organizationName}
                onChangeText={v => setForm(f => ({ ...f, organizationName: v }))}
                error={errors.org}
                required
                leftIcon={<Ionicons name="business-outline" size={16} color={theme.colors.textTertiary} />}
              />
            )}

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChangeText={v => setForm(f => ({ ...f, phone: v }))}
              keyboardType="phone-pad"
              error={errors.phone}
              required
              leftIcon={<Ionicons name="call-outline" size={16} color={theme.colors.textTertiary} />}
            />

            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={form.email}
              onChangeText={v => setForm(f => ({ ...f, email: v }))}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
              leftIcon={<Ionicons name="mail-outline" size={16} color={theme.colors.textTertiary} />}
            />

            <Input
              label="Password"
              placeholder="Create a strong password"
              value={form.password}
              onChangeText={v => setForm(f => ({ ...f, password: v }))}
              secureTextEntry={!showPassword}
              error={errors.password}
              required
              hint="Minimum 6 characters"
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

            {/* Terms checkbox */}
            <TouchableOpacity
              onPress={() => setAgreed(!agreed)}
              style={styles.termsRow}
              activeOpacity={0.8}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreed }}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: agreed ? Colors.primary : 'transparent',
                    borderColor: agreed ? Colors.primary : theme.colors.border,
                  },
                ]}
              >
                {agreed && <Ionicons name="checkmark" size={11} color={Colors.textInverse} />}
              </View>
              <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
                I agree to the{' '}
                <Text style={{ color: Colors.primary }}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={{ color: Colors.primary }}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && (
              <Text style={styles.errorText}>{errors.terms}</Text>
            )}

            <View style={{ height: Spacing.base }} />

            <Button
              label="Create Account"
              onPress={handleSignup}
              variant="primary"
              size="lg"
              isLoading={isLoading}
            />

            <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
              <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                Already a member?{' '}
                <Text style={{ color: Colors.primary, fontFamily: FontFamily.outfitSemiBold }}>
                  Log In
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: Spacing['3xl'] },

  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.xs, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heading: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['3xl'],
    letterSpacing: 0.2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: Radius.xs,
  },
  roleText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  subheading: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },

  form: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  checkbox: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  termsText: {
    flex: 1,
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  errorText: {
    color: Colors.error,
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    marginBottom: Spacing.sm,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
  },
  loginText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
  },
});
