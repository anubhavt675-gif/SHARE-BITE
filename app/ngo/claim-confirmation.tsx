// ShareBite — NGO Claim Confirmation Screen

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

export default function ClaimConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={{ fontSize: 64 }}>🤝</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Confirm Claim?</Text>
        <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
          You are about to claim this donation.{'\n'}Make sure you can arrange pickup promptly.
        </Text>
        <View style={styles.btns}>
          <Button
            label="Yes, Claim Food"
            onPress={() => id ? router.push(`/ngo/${id}` as any) : router.back()}
            variant="primary"
            size="xl"
          />
          <Button
            label="Cancel"
            onPress={() => router.back()}
            variant="outline"
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
    gap: Spacing.base,
  },
  title: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize['3xl'],
    textAlign: 'center',
  },
  sub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.6,
  },
  btns: { width: '100%', gap: Spacing.sm, marginTop: Spacing.base },
});
