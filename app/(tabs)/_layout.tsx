// ShareBite — Tabs Layout with Premium Custom Tab Bar

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

// Tab configurations — all use consistent Ionicons outline icons
const DONOR_TABS = [
  { name: 'home',     icon: 'home-outline',      label: 'Home'     },
  { name: 'discover', icon: 'map-outline',        label: 'Nearby'   },
  { name: 'activity', icon: 'list-outline',       label: 'Activity' },
  { name: 'impact',   icon: 'leaf-outline',       label: 'Impact'   },
  { name: 'profile',  icon: 'person-outline',     label: 'Profile'  },
];

const NGO_TABS = [
  { name: 'home',     icon: 'home-outline',       label: 'Home'     },
  { name: 'discover', icon: 'location-outline',   label: 'Nearby'   },
  { name: 'activity', icon: 'list-outline',       label: 'Activity' },
  { name: 'impact',   icon: 'leaf-outline',       label: 'Impact'   },
  { name: 'profile',  icon: 'person-outline',     label: 'Profile'  },
];

// Active icon variants (filled)
const ACTIVE_ICONS: Record<string, string> = {
  'home-outline':     'home',
  'map-outline':      'map',
  'list-outline':     'list',
  'leaf-outline':     'leaf',
  'person-outline':   'person',
  'location-outline': 'location',
};

function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const isNGO = user?.role === 'ngo';
  const tabs = isNGO ? NGO_TABS : DONOR_TABS;

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.colors.tabBar,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
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

        const activeColor = theme.colors.tabBarActive;
        const inactiveColor = theme.colors.tabBarInactive;
        const iconName = isFocused
          ? ACTIVE_ICONS[tabConfig?.icon ?? ''] ?? tabConfig?.icon
          : tabConfig?.icon;

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
                name={iconName as any}
                size={21}
                color={isFocused ? activeColor : inactiveColor}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? activeColor : inactiveColor,
                  fontFamily: isFocused
                    ? FontFamily.outfitSemiBold
                    : FontFamily.outfitRegular,
                },
              ]}
            >
              {tabConfig?.label}
            </Text>
            {/* Active indicator dot */}
            {isFocused && (
              <View
                style={[styles.activeDot, { backgroundColor: activeColor }]}
              />
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
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    position: 'relative',
    paddingTop: 2,
  },
  tabIconWrap: {
    width: 36,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.1,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
