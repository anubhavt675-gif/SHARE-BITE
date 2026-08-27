// ShareBite — EmptyState Component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';
import { Colors } from '../../constants/colors';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  // Keep emoji prop for backwards compatibility but we style it subtly
  emoji?: string;
}

export function EmptyState({ title, subtitle, actionLabel, onAction, emoji }: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      {/* Small editorial ornament */}
      <View style={[styles.ornament, { borderColor: theme.colors.border }]}>
        <View style={[styles.ornamentInner, { backgroundColor: Colors.primaryAlpha08 }]}>
          <Text style={styles.ornamentText}>
            {emoji ? emoji.slice(0, 1) : '·'}
          </Text>
        </View>
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="outline"
          size="sm"
          fullWidth={false}
          style={styles.btn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing['4xl'],
  },
  ornament: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  ornamentInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ornamentText: {
    fontSize: 20,
  },
  title: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.xl,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: FontSize.sm * 1.6,
    maxWidth: 280,
  },
  btn: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
});
