// ShareBite — Profile Verification Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusChip } from '../../components/ui/StatusChip';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

export default function VerificationScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isNGO = user?.role === 'ngo';
  const [submitting, setSubmitting] = useState(false);
  const [regNumber, setRegNumber] = useState('');
  const [orgType, setOrgType] = useState('');

  const status = user?.verificationStatus ?? 'pending';

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    Alert.alert(
      'Verification Submitted',
      'Your documents have been submitted for review. We\'ll notify you within 24-48 hours.',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Verification</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor:
                status === 'verified' ? Colors.primaryAlpha10
                : status === 'under_review' ? Colors.accentAlpha10
                : status === 'rejected' ? 'rgba(229,57,53,0.08)'
                : Colors.yellowAlpha20,
            },
          ]}
        >
          <Text style={{ fontSize: 36 }}>
            {status === 'verified' ? '✅' : status === 'under_review' ? '🔍' : status === 'rejected' ? '❌' : '⏳'}
          </Text>
          <View style={{ flex: 1 }}>
            <StatusChip status={status} size="md" />
            <Text style={[styles.statusDesc, { color: theme.colors.textSecondary }]}>
              {status === 'verified' && 'Your organization is verified and trusted on ShareBite.'}
              {status === 'under_review' && 'Your documents are being reviewed. This usually takes 24-48 hours.'}
              {status === 'rejected' && 'Your verification was rejected. Please re-submit with correct documents.'}
              {status === 'pending' && 'Complete verification to build trust and unlock all features.'}
            </Text>
          </View>
        </View>

        {/* Why Verify */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Why Verify?</Text>
          {[
            { icon: 'shield-checkmark', text: 'Build trust with donors and partners' },
            { icon: 'star', text: 'Priority in food matching algorithm' },
            { icon: 'checkmark-circle', text: 'Show verified badge on your profile' },
            { icon: 'people', text: 'Access to larger donor network' },
          ].map(item => (
            <View key={item.text} style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: Colors.primaryAlpha10 }]}>
                <Ionicons name={item.icon as any} size={16} color={Colors.primary} />
              </View>
              <Text style={[styles.benefitText, { color: theme.colors.textSecondary }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Form */}
        {status !== 'verified' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {isNGO ? 'NGO Details' : 'Business Details'}
            </Text>

            <Input
              label={isNGO ? 'NGO Registration Number' : 'FSSAI License / Business Reg.'}
              placeholder={isNGO ? 'NGO/DL/2019/00421' : 'Enter license number'}
              value={regNumber}
              onChangeText={setRegNumber}
              leftIcon={<Ionicons name="document-text-outline" size={18} color={theme.colors.textTertiary} />}
            />
            <Input
              label={isNGO ? 'Organization Type' : 'Business Type'}
              placeholder={isNGO ? 'e.g. NGO, Shelter, Orphanage' : 'e.g. Restaurant, Caterer'}
              value={orgType}
              onChangeText={setOrgType}
              leftIcon={<Ionicons name="business-outline" size={18} color={theme.colors.textTertiary} />}
            />

            {/* Document upload area */}
            <TouchableOpacity
              style={[styles.uploadArea, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
            >
              <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
              <Text style={[styles.uploadTitle, { color: theme.colors.text }]}>
                Upload Registration Certificate
              </Text>
              <Text style={[styles.uploadSub, { color: theme.colors.textSecondary }]}>
                PDF or image, up to 5MB
              </Text>
            </TouchableOpacity>

            {/* Disclaimer */}
            <View style={[styles.disclaimer, { backgroundColor: Colors.yellowAlpha20 }]}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.yellow} />
              <Text style={[styles.disclaimerText, { color: theme.colors.textSecondary }]}>
                Documents are reviewed manually for safety purposes. This is a demo — no real verification is performed.
              </Text>
            </View>

            <View style={{ height: Spacing.base }} />
            <Button
              label="Submit for Verification"
              onPress={handleSubmit}
              variant="primary"
              size="xl"
              isLoading={submitting}
            />
          </View>
        )}
      </ScrollView>
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
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.xl,
    textAlign: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    margin: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
  },
  statusDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.lg,
    marginBottom: Spacing.base,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
    flex: 1,
  },
  uploadArea: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  uploadTitle: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.base,
  },
  uploadSub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
});
