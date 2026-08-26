// ShareBite — Tabs Layout with Custom Tab Bar

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Shadow } from '../../constants/spacing';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const isNGO = user?.role === 'ngo';

  const donorTabs = [
    { name: 'home', icon: 'home', label: 'Home' },
    { name: 'discover', icon: 'compass', label: 'Discover' },
    { name: 'activity', icon: 'list', label: 'Activity' },
    { name: 'impact', icon: 'leaf', label: 'Impact' },
    { name: 'profile', icon: 'person', label: 'Profile' },
  ];

  const ngoTabs = [
    { name: 'home', icon: 'home', label: 'Home' },
    { name: 'discover', icon: 'location', label: 'Nearby' },
    { name: 'activity', icon: 'list', label: 'Activity' },
    { name: 'impact', icon: 'leaf', label: 'Impact' },
    { name: 'profile', icon: 'person', label: 'Profile' },
  ];

  const tabs = isNGO ? ngoTabs : donorTabs;

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.colors.tabBar,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1.5,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const tabConfig = tabs.find(t => t.name === route.name) ?? tabs[index];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Central donate button for donor
        if (!isNGO && route.name === 'discover') {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate('donor/create-donation')}
              style={styles.centerBtn}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Donate Food"
            >
              <View style={[styles.centerCircle, { backgroundColor: theme.colors.surface, borderColor: Colors.primary }]}>
                <Ionicons name="add" size={24} color={Colors.primary} />
              </View>
              <Text style={[styles.centerLabel, { color: Colors.primary }]}>Donate</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={tabConfig?.label}
            accessibilityState={{ selected: isFocused }}
          >
            <View style={styles.tabIconWrap}>
              <Ionicons
                name={`${tabConfig?.icon}${isFocused ? '' : '-outline'}` as any}
                size={20}
                color={isFocused ? theme.colors.tabBarActive : theme.colors.tabBarInactive}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? theme.colors.tabBarActive : theme.colors.tabBarInactive,
                  fontFamily: isFocused ? FontFamily.outfitSemiBold : FontFamily.outfitRegular,
                },
              ]}
            >
              {tabConfig?.label}
            </Text>
            {isFocused && (
              <View style={[styles.activeDot, { backgroundColor: theme.colors.tabBarActive }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="impact" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    position: 'relative',
  },
  tabIconWrap: {
    width: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: FontSize.xs,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  centerBtn: {
    flex: 1,
    alignItems: 'center',
    marginTop: -16,
    gap: 3,
  },
  centerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  centerLabel: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.outfitSemiBold,
  },
});
