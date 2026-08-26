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
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { ONBOARDING_SLIDES } from '../../services/mock-data';
import { FontFamily, FontSize } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { markOnboardingComplete } = useAuth();
  const { theme, isDark } = useTheme();
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
      {/* Skip */}
      {!isLast && (
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Skip</Text>
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
            {/* Decorative background blob */}
            <View style={[styles.blobContainer]}>
              <LinearGradient
                colors={isDark
                  ? [Colors.primaryAlpha10, Colors.accentAlpha10]
                  : [item.bgColor, '#FFFFFF']}
                style={styles.blob}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>

            {/* Content */}
            <View style={styles.slideContent}>
              {/* Logo / Brand mark */}
              {item.id === 1 && (
                <View style={styles.logoArea}>
                  <LinearGradient
                    colors={Colors.gradientPrimary}
                    style={styles.logoCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.logoEmoji}>🍃</Text>
                  </LinearGradient>
                  <View style={styles.brandRow}>
                    <Text style={[styles.brandName, { color: Colors.primary }]}>Share</Text>
                    <Text style={[styles.brandName, { color: Colors.accent }]}>Bite</Text>
                  </View>
                </View>
              )}

              <Text style={styles.slideEmoji}>{item.emoji}</Text>
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
                  { value: '247', label: 'NGOs' },
                  { value: '12', label: 'Cities' },
                ].map(stat => (
                  <View key={stat.label} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.statValue, { color: Colors.primary }]}>{stat.value}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />

      {/* Dots + CTA */}
      <View style={styles.footer}>
        {/* Dots */}
        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
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
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor: Colors.primary,
                  },
                ]}
              />
            );
          })}
        </View>

        <Button
          label={isLast ? 'Get Started →' : 'Continue'}
          onPress={handleNext}
          variant="primary"
          size="lg"
        />

        {isLast && (
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
            <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
              Already have an account?{' '}
              <Text style={{ color: Colors.primary, fontFamily: FontFamily.outfitSemiBold }}>
                Log In
              </Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: Spacing.xl,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipText: {
    fontFamily: FontFamily.outfitMedium,
    fontSize: FontSize.md,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  blobContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
  },
  blob: {
    flex: 1,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    zIndex: 1,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoEmoji: {
    fontSize: 36,
  },
  brandRow: {
    flexDirection: 'row',
  },
  brandName: {
    fontFamily: FontFamily.outfitBlack,
    fontSize: FontSize['4xl'],
    letterSpacing: -1,
  },
  slideEmoji: {
    fontSize: 72,
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  slideTitle: {
    fontFamily: FontFamily.outfitBlack,
    fontSize: FontSize['4xl'],
    textAlign: 'center',
    lineHeight: FontSize['4xl'] * 1.2,
    marginBottom: Spacing.base,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.lg,
    textAlign: 'center',
    lineHeight: FontSize.lg * 1.6,
    maxWidth: 300,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize['2xl'],
  },
  statLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'android' ? Spacing['2xl'] : Spacing.base,
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
    height: 8,
    borderRadius: Radius.full,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  loginText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
  },
});
