// ─────────────────────────────────────────
//  Tab Navigation Layout
// ─────────────────────────────────────────

import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Colors, Typography } from '../../src/theme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: focused ? 20 : 18, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor:  Colors.bg1,
          borderTopWidth:   0.5,
          borderTopColor:   Colors.border,
          paddingBottom:    8,
          paddingTop:       6,
          height:           60,
        },
        tabBarActiveTintColor:   Colors.accent,
        tabBarInactiveTintColor: Colors.text3,
        tabBarLabelStyle: {
          fontFamily: Typography.fonts.bodyMed,
          fontSize:   9,
          marginTop:  2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'calendar',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'lists',
          tabBarIcon: ({ focused }) => <TabIcon emoji="☑️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="streaks"
        options={{
          title: 'streaks',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🐝" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'us',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🍯" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
