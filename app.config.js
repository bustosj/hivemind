module.exports = {
  name: "HiveMind",
  slug: "hivemind",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  newArchEnabled: false,
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0f0d08"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0f0d08"
    },
    package: "com.hivemind.app",
    permissions: [
      "RECEIVE_BOOT_COMPLETED",
      "SCHEDULE_EXACT_ALARM",
      "READ_CALENDAR",
      "WRITE_CALENDAR"
    ]
  },
  ios: {
    bundleIdentifier: "com.hivemind.app",
    supportsTablet: false,
    infoPlist: {
      NSCalendarsUsageDescription: "HiveMind syncs reminders to your calendar."
    }
  },
  plugins: [
    "expo-router",
    "expo-font",
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: "#f5c842"
      }
    ],
    [
      "expo-calendar",
      {
        calendarPermission: "Allow HiveMind to sync events to your calendar."
      }
    ]
  ],
  scheme: "hivemind",
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "9d148fba-1565-4d38-967f-80f18ce489e1"
    }
  }
};
