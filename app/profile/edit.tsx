// ShareBite — Edit Profile Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    organizationName: (user as any)?.organizationName ?? '',
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    updateUser({ name: form.name, email: form.email });
    setSaving(false);
    Alert.alert('Saved', 'Your profile has been updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Avatar name={user?.name ?? 'U'} size={80} />
            <TouchableOpacity style={[styles.changePhoto, { backgroundColor: Colors.primaryAlpha10 }]}>
              <Ionicons name="camera" size={14} color={Colors.primary} />
              <Text style={[styles.changePhotoText, { color: Colors.primary }]}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
              leftIcon={<Ionicons name="person-outline" size={18} color={theme.colors.textTertiary} />}
              required
            />
            {(user as any)?.organizationName !== undefined && (
              <Input
                label="Organization Name"
                value={form.organizationName}
                onChangeText={v => setForm(f => ({ ...f, organizationName: v }))}
                leftIcon={<Ionicons name="business-outline" size={18} color={theme.colors.textTertiary} />}
              />
            )}
            <Input
              label="Email Address"
              value={form.email}
              onChangeText={v => setForm(f => ({ ...f, email: v }))}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={18} color={theme.colors.textTertiary} />}
            />
            <Input
              label="Phone Number"
              value={form.phone}
              onChangeText={v => setForm(f => ({ ...f, phone: v }))}
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="call-outline" size={18} color={theme.colors.textTertiary} />}
            />
            <Button
              label="Save Changes"
              onPress={handleSave}
              variant="primary"
              size="xl"
              isLoading={saving}
            />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: {
    flex: 1,
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.xl,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  changePhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  changePhotoText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
  },
  form: { paddingHorizontal: Spacing.xl, gap: 0 },
});
