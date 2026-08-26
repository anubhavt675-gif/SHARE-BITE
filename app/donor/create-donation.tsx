// ShareBite — Create Donation (Multi-Step Flow)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { DonationsService } from '../../services/donations';
import { FOOD_CATEGORIES } from '../../services/mock-data';
import { CreateDonationForm, FoodCategory, PackagingType } from '../../types';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Spacing, Radius, Shadow } from '../../constants/spacing';

const TOTAL_STEPS = 5;

const PACKAGING_OPTIONS: { key: PackagingType; label: string; emoji: string }[] = [
  { key: 'container', label: 'Container', emoji: '🥡' },
  { key: 'box', label: 'Box', emoji: '📦' },
  { key: 'bag', label: 'Bag', emoji: '🛍️' },
  { key: 'wrapped', label: 'Wrapped', emoji: '🎁' },
  { key: 'open', label: 'Open', emoji: '🍽️' },
];

const INITIAL_FORM: CreateDonationForm = {
  category: null,
  name: '',
  imageUri: null,
  quantity: 1,
  servings: 10,
  isVegetarian: true,
  preparedAt: new Date(),
  expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
  packagingType: 'container',
  location: null,
  notes: '',
  isSafeConfirmed: false,
  description: '',
};

function StepIndicator({ current, total }: { current: number; total: number }) {
  const { theme } = useTheme();
  return (
    <View style={styles.stepIndicator}>
      {Array(total).fill(0).map((_, i) => (
        <View
          key={i}
          style={[
            styles.stepDot,
            {
              backgroundColor:
                i < current ? Colors.primary : i === current ? Colors.primary : theme.colors.border,
              width: i === current ? 24 : 8,
              opacity: i > current ? 0.3 : 1,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function CreateDonationScreen() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateDonationForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const updateForm = (updates: Partial<CreateDonationForm>) =>
    setForm(f => ({ ...f, ...updates }));

  const handleNext = () => {
    if (step === 0 && !form.category) {
      Alert.alert('Select Category', 'Please select a food category to continue.');
      return;
    }
    if (step === 1 && !form.name.trim()) {
      Alert.alert('Food Name', 'Please enter the food name.');
      return;
    }
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
    else router.back();
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      updateForm({ imageUri: result.assets[0].uri });
    }
  };

  const handleCameraCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      updateForm({ imageUri: result.assets[0].uri });
    }
  };

  const handleSubmit = async () => {
    if (!form.isSafeConfirmed) {
      Alert.alert('Safety Check', 'Please confirm the food is safe to donate.');
      return;
    }
    if (!form.location) {
      updateForm({
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          address: '45, Karol Bagh Market',
          city: 'New Delhi',
          pincode: '110005',
        },
      });
    }
    setSubmitting(true);
    try {
      await DonationsService.createDonation(user?.id ?? '', {
        ...form,
        location: form.location ?? {
          latitude: 28.6139,
          longitude: 77.2090,
          address: '45, Karol Bagh',
          city: 'New Delhi',
        },
      });
      router.replace('/donor/donation-success');
    } catch {
      Alert.alert('Error', 'Failed to create donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      // Step 0: Category
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              What food are you sharing?
            </Text>
            <Text style={[styles.stepSub, { color: theme.colors.textSecondary }]}>
              Choose the category that best describes the food
            </Text>
            <View style={styles.categoryGrid}>
              {FOOD_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => updateForm({ category: cat.key })}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor:
                        form.category === cat.key ? `${cat.color}18` : theme.colors.card,
                      borderColor:
                        form.category === cat.key ? cat.color : theme.colors.border,
                      borderWidth: form.category === cat.key ? 2 : 1,
                      ...(isDark ? Shadow.dark : Shadow.sm),
                    },
                  ]}
                >
                  <Text style={{ fontSize: 32 }}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: form.category === cat.key ? cat.color : theme.colors.text },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      // Step 1: Photo + Details
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Add a photo
            </Text>
            <Text style={[styles.stepSub, { color: theme.colors.textSecondary }]}>
              A photo helps NGOs identify the food quickly
            </Text>

            {/* Image upload */}
            {form.imageUri ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: form.imageUri }} style={styles.previewImage} />
                <TouchableOpacity
                  onPress={() => updateForm({ imageUri: null })}
                  style={styles.removeImage}
                >
                  <Ionicons name="close-circle" size={28} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageUploadArea}>
                <TouchableOpacity
                  onPress={handlePickImage}
                  style={[styles.uploadBtn, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
                >
                  <Ionicons name="images-outline" size={28} color={Colors.primary} />
                  <Text style={[styles.uploadText, { color: theme.colors.text }]}>Choose from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCameraCapture}
                  style={[styles.uploadBtn, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
                >
                  <Ionicons name="camera-outline" size={28} color={Colors.accent} />
                  <Text style={[styles.uploadText, { color: theme.colors.text }]}>Take a Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      // Step 2: Food Details
      case 2:
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Food details</Text>
              <Text style={[styles.stepSub, { color: theme.colors.textSecondary }]}>
                Help NGOs understand what you're sharing
              </Text>

              <Input
                label="Food Name"
                placeholder="e.g. Veg Biryani, Dal & Roti"
                value={form.name}
                onChangeText={v => updateForm({ name: v })}
                required
              />
              <Input
                label="Description (optional)"
                placeholder="Brief description of the food"
                value={form.description}
                onChangeText={v => updateForm({ description: v })}
                multiline
                numberOfLines={2}
              />

              <View style={styles.quantityRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Quantity (kg/litres)</Text>
                  <View style={styles.counter}>
                    <TouchableOpacity
                      onPress={() => updateForm({ quantity: Math.max(1, form.quantity - 1) })}
                      style={[styles.counterBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                    >
                      <Ionicons name="remove" size={18} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.counterVal, { color: theme.colors.text }]}>{form.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateForm({ quantity: form.quantity + 1 })}
                      style={[styles.counterBtn, { backgroundColor: Colors.primaryAlpha10 }]}
                    >
                      <Ionicons name="add" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>No. of Servings</Text>
                  <View style={styles.counter}>
                    <TouchableOpacity
                      onPress={() => updateForm({ servings: Math.max(1, form.servings - 5) })}
                      style={[styles.counterBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                    >
                      <Ionicons name="remove" size={18} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.counterVal, { color: theme.colors.text }]}>{form.servings}</Text>
                    <TouchableOpacity
                      onPress={() => updateForm({ servings: form.servings + 5 })}
                      style={[styles.counterBtn, { backgroundColor: Colors.primaryAlpha10 }]}
                    >
                      <Ionicons name="add" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Veg toggle */}
              <View style={[styles.vegToggle, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text, marginBottom: 0 }]}>
                  {form.isVegetarian ? '🟢 Vegetarian' : '🔴 Non-Vegetarian'}
                </Text>
                <Switch
                  value={form.isVegetarian}
                  onValueChange={v => updateForm({ isVegetarian: v })}
                  trackColor={{ false: Colors.error, true: Colors.primaryLight }}
                  thumbColor={form.isVegetarian ? Colors.primary : '#f44336'}
                />
              </View>

              {/* Packaging */}
              <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Packaging Type</Text>
              <FlatList
                data={PACKAGING_OPTIONS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={p => p.key}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => updateForm({ packagingType: item.key })}
                    style={[
                      styles.packagingOption,
                      {
                        backgroundColor:
                          form.packagingType === item.key ? Colors.primaryAlpha20 : theme.colors.surfaceVariant,
                        borderColor:
                          form.packagingType === item.key ? Colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                    <Text
                      style={[
                        styles.packagingLabel,
                        {
                          color:
                            form.packagingType === item.key
                              ? Colors.primary
                              : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ gap: Spacing.sm }}
              />
            </View>
          </KeyboardAvoidingView>
        );

      // Step 3: Location & Time
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Pickup location</Text>
            <Text style={[styles.stepSub, { color: theme.colors.textSecondary }]}>
              Where can the NGO pick up this food?
            </Text>

            <TouchableOpacity
              onPress={() =>
                updateForm({
                  location: {
                    latitude: 28.6139,
                    longitude: 77.2090,
                    address: '45, Karol Bagh Market',
                    city: 'New Delhi',
                    pincode: '110005',
                  },
                })
              }
              style={[
                styles.locationBtn,
                {
                  backgroundColor: form.location ? Colors.primaryAlpha10 : theme.colors.surfaceVariant,
                  borderColor: form.location ? Colors.primary : theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name={form.location ? 'location-sharp' : 'location-outline'}
                size={24}
                color={form.location ? Colors.primary : theme.colors.textTertiary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.locationBtnTitle,
                    { color: form.location ? Colors.primary : theme.colors.text },
                  ]}
                >
                  {form.location ? form.location.address : 'Use Current Location'}
                </Text>
                {form.location && (
                  <Text style={[styles.locationBtnSub, { color: theme.colors.textSecondary }]}>
                    {form.location.city}
                  </Text>
                )}
              </View>
              {form.location && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <View style={[styles.infoBox, { backgroundColor: Colors.primaryAlpha10 }]}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
              <Text style={[styles.infoText, { color: Colors.primary }]}>
                For demo: Tapping above sets location to Karol Bagh, New Delhi
              </Text>
            </View>

            <Input
              label="Additional Notes (optional)"
              placeholder="e.g. Ring the doorbell, ask for Rahul"
              value={form.notes}
              onChangeText={v => updateForm({ notes: v })}
              multiline
              numberOfLines={3}
            />
          </View>
        );

      // Step 4: Review + Safety
      case 4:
        const cat = FOOD_CATEGORIES.find(c => c.key === form.category);
        const expiresIn = Math.round(
          (form.expiresAt.getTime() - Date.now()) / 3600000 * 10,
        ) / 10;
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Review & Confirm</Text>
            <Text style={[styles.stepSub, { color: theme.colors.textSecondary }]}>
              Verify the details before sharing
            </Text>

            {/* Summary Card */}
            <Card style={[isDark ? Shadow.dark : Shadow.md]} padding={Spacing.lg}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryEmoji}>{cat?.emoji ?? '🍽️'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>{form.name || 'Food Name'}</Text>
                  <Text style={[styles.summarySub, { color: theme.colors.textSecondary }]}>
                    {cat?.label ?? 'Food'} • {form.isVegetarian ? '🟢 Veg' : '🔴 Non-Veg'}
                  </Text>
                </View>
              </View>

              <View style={[styles.summaryDivider, { backgroundColor: theme.colors.divider }]} />

              <View style={styles.summaryDetails}>
                {[
                  { label: 'Quantity', value: `${form.quantity} kg` },
                  { label: 'Servings', value: `~${form.servings} people` },
                  { label: 'Packaging', value: form.packagingType },
                  {
                    label: 'Pickup from',
                    value: form.location?.address ?? 'Location not set',
                  },
                  { label: 'Safe for', value: `${expiresIn}h from now` },
                ].map(item => (
                  <View key={item.label} style={styles.summaryItem}>
                    <Text style={[styles.summaryItemLabel, { color: theme.colors.textSecondary }]}>
                      {item.label}
                    </Text>
                    <Text
                      style={[styles.summaryItemValue, { color: theme.colors.text }]}
                      numberOfLines={1}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>

              {form.servings > 0 && (
                <View style={[styles.impactPreview, { backgroundColor: Colors.primaryAlpha10 }]}>
                  <Text style={[styles.impactPreviewText, { color: Colors.primary }]}>
                    🌱 Your food can become <Text style={{ fontFamily: FontFamily.outfitBold }}>{form.servings} meals</Text> today
                  </Text>
                </View>
              )}
            </Card>

            {/* Safety Confirmation */}
            <TouchableOpacity
              onPress={() => updateForm({ isSafeConfirmed: !form.isSafeConfirmed })}
              style={[
                styles.safetyCheck,
                {
                  backgroundColor: form.isSafeConfirmed ? Colors.primaryAlpha10 : theme.colors.surfaceVariant,
                  borderColor: form.isSafeConfirmed ? Colors.primary : theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.safetyCheckbox,
                  {
                    backgroundColor: form.isSafeConfirmed ? Colors.primary : 'transparent',
                    borderColor: form.isSafeConfirmed ? Colors.primary : theme.colors.border,
                  },
                ]}
              >
                {form.isSafeConfirmed && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.safetyTitle, { color: theme.colors.text }]}>
                  🛡️ Food Safety Confirmation
                </Text>
                <Text style={[styles.safetySub, { color: theme.colors.textSecondary }]}>
                  I confirm this food is safe for consumption and has been stored appropriately.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  const stepLabels = ['Category', 'Photo', 'Details', 'Location', 'Review'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Share Food — Step {step + 1} of {TOTAL_STEPS}
          </Text>
          <Text style={[styles.headerSub, { color: theme.colors.textSecondary }]}>
            {stepLabels[step]}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Step Indicator */}
      <StepIndicator current={step} total={TOTAL_STEPS} />

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}

        <View style={styles.navBtns}>
          {step < TOTAL_STEPS - 1 ? (
            <Button label="Continue →" onPress={handleNext} variant="primary" size="xl" />
          ) : (
            <Button
              label="Share Food 🌱"
              onPress={handleSubmit}
              variant="primary"
              size="xl"
              isLoading={submitting}
              disabled={!form.isSafeConfirmed}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
  },
  headerSub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    marginTop: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingVertical: Spacing.sm,
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },
  stepContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  stepTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize['3xl'] - 2,
    marginBottom: Spacing.xs,
    color: Colors.textPrimary,
  },
  stepSub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: FontSize.sm * 1.4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
  },
  categoryLabel: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.xs,
  },
  imageUploadArea: {
    gap: Spacing.sm,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  uploadText: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
  },
  imagePreview: {
    position: 'relative',
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: Radius.sm,
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.base,
  },
  fieldLabel: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterVal: {
    fontFamily: FontFamily.outfitBold,
    fontSize: FontSize.lg,
    minWidth: 32,
    textAlign: 'center',
  },
  vegToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  packagingOption: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 4,
    minWidth: 72,
  },
  packagingLabel: {
    fontFamily: FontFamily.outfitMedium,
    fontSize: FontSize.xs - 1,
    textTransform: 'uppercase',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginBottom: Spacing.base,
  },
  locationBtnTitle: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.base,
  },
  locationBtnSub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: Spacing.base,
  },
  infoText: {
    flex: 1,
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  summaryEmoji: { fontSize: 40 },
  summaryTitle: {
    fontFamily: FontFamily.serifDisplay,
    fontSize: FontSize.lg,
  },
  summarySub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  summaryDivider: { height: 1, marginBottom: Spacing.base },
  summaryDetails: { gap: Spacing.sm },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    flex: 1,
  },
  summaryItemValue: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.sm,
    flex: 1.5,
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  impactPreview: {
    marginTop: Spacing.base,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  impactPreviewText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs + 1,
    textAlign: 'center',
  },
  safetyCheck: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.base,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginTop: Spacing.base,
  },
  safetyCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  safetyTitle: {
    fontFamily: FontFamily.outfitSemiBold,
    fontSize: FontSize.base,
    marginBottom: 4,
  },
  safetySub: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.4,
  },
  navBtns: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
});
