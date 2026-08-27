// ShareBite — Welcome / Onboarding Screen

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { BotanicalSprig, WaxSeal } from '../../components/ui/BotanicalDetails';
import { ONBOARDING_SLIDES } from '../../services/mock-data';
import { FontFamily, FontSize } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { markOnboardingComplete } = useAuth();
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = async () => {
    await markOnboardingComplete();
    router.replace('/(auth)/role-selection');
  };

  const handleGetStarted = async () => {
    await markOnboardingComplete();
    router.replace('/(auth)/role-selection');
  };

  const isLast = currentIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} accessibilityLabel="Skip onboarding">
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>SKIP</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={item => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.slideContent}>
              {/* Brand — first slide */}
              {item.id === 1 && (
                <View style={styles.brandArea}>
                  <View style={[styles.brandEmblem, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                    <BotanicalSprig size={36} color={Colors.primary} />
                  </View>
                  <View style={styles.brandNameRow}>
                    <Text style={[styles.brandNamePart, { color: Colors.primary }]}>Share</Text>
                    <Text style={[styles.brandNamePart, { color: Colors.accent }]}>Bite</Text>
                  </View>
                </View>
              )}

              {/* Slide illustration area — warm oval */}
              {item.id !== 1 && (
                <View style={[styles.illustrationOval, { backgroundColor: Colors.surfaceVariant }]}>
                  <Text style={styles.slideEmoji}>{item.emoji}</Text>
                </View>
              )}

              {/* Text */}
              <View style={styles.textBlock}>
                {/* Small label */}
                <Text style={styles.slideLabel}>
                  {item.id === 1 ? 'WELCOME TO' : `CHAPTER ${item.id}`}
                </Text>
                <Text style={[styles.slideTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.slideSubtitle, { color: theme.colors.textSecondary }]}>
                  {item.subtitle}
                </Text>
              </View>

              {/* Impact stats on last slide */}
              {item.id === 4 && (
                <View style={styles.statsRow}>
                  {[
                    { value: '1.2L+', label: 'Meals Saved' },
                    { value: '247',   label: 'NGO Partners' },
                    { value: '12',    label: 'Cities' },
                  ].map(stat => (
                    <View key={stat.label} style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                      <Text style={[styles.statValue, { color: Colors.primary }]}>{stat.value}</Text>
                      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{stat.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      />

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Platform.OS === 'android' ? Spacing['2xl'] : Spacing.base }]}>
        {/* Pagination dots */}
        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [5, 20, 5],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity, backgroundColor: Colors.primary },
                ]}
              />
            );
          })}
        </View>

        <Button
          label={isLast ? 'Get Started' : 'Continue'}
          onPress={handleNext}
          variant="primary"
          size="lg"
        />

        {isLast && (
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
            <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
              Already a member?{' '}
              <Text style={{ color: Colors.primary, fontFamily: FontFamily.outfitSemiBold }}>Log In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  skipBtn: {
    position: 'absolute',
    top: 56, right: Spacing.xl, zIndex: 10,
    paddingHorizontal: Spacing.sm, paddingVertical: 6,
  },
  skipText: {
    fontFamily: FontFamily.outfitBold,
    fontSize: 9,
    letterSpacing: 1,
  },

  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  slideContent: {
    alignItems: 'center',
    width: '100%',
    gap: Spacing.xl,
  },

  // Brand
  brandArea: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  brandEmblem: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandNameRow: { flexDirection: 'row' },
  brandNamePart: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['4xl'] + 4,
    letterSpacing: 0.5,
  },

  // Illustration oval
  illustrationOval: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideEmoji: {
    fontSize: 64,
  },

  // Text
  textBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
    maxWidth: 300,
  },
  slideLabel: {
    fontFamily: FontFamily.outfitBold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: Colors.primary,
  },
  slideTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['3xl'],
    textAlign: 'center',
    lineHeight: FontSize['3xl'] * 1.2,
    letterSpacing: 0.2,
  },
  slideSubtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: FontSize.base * 1.6,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 4,
  },
  statValue: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['2xl'],
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  dot: {
    height: 5,
    borderRadius: Radius.full,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  loginText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
  },
});
