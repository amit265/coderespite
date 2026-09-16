// app/settings/index.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, StyleSheet, Share, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageTransition from '../../components/PageTransition';
import SafeScreen from '../../components/SafeScreen';
import MoreApps from '../../components/MoreApps';
import { clearAllData, logAllAsyncStorage } from '../../services/userStorage';
import { uploadAllData } from '../../services/uploadData';
import { SHARE_MESSAGE, STORE_LINK } from '../../constants/constants';
import { logAnalyticsEvent } from '../../services/analyticsService';

import colors from '../../constants/colors';
import { adConfigContext } from '../../context/context';
import { useContext } from 'react';
import { CustomAlert } from "../../components/shared/GlobalAlert";

const SettingsItem = ({ icon, label, onPress, destructive, iconBg, delay }) => (
  <TouchableOpacity
    style={styles.item}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconWrap, { backgroundColor: iconBg || '#F3F4F6' }]}>
      <Ionicons name={icon} size={20} color={destructive ? '#EF4444' : '#4B5563'} />
    </View>
    <Text style={[styles.label, destructive && { color: '#EF4444' }]}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
  </TouchableOpacity>
);

const SettingsGroup = ({ title, children }) => (
  <View style={styles.group}>
    <Text style={styles.groupTitle}>{title}</Text>
    <View style={styles.groupContent}>
      {children}
    </View>
  </View>
);

export default function SettingsIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { adConfig, setAdConfig } = useContext(adConfigContext);
  
  // Dev mode and Ad toggle tap logic
  const [tapCount, setTapCount] = useState(0);
  const handleVersionTap = () => {
    setTapCount(prev => {
      const newCount = prev + 1;
      if (newCount === 10) {
        if (setAdConfig) {
          setAdConfig(prevConfig => {
            const newState = !prevConfig.showAds;
            return { ...prevConfig, showAds: newState };
          });
        }
        return 0; // reset
      }
      return newCount;
    });
  };

  const handleResetData = () => {
    CustomAlert.alert(
      "Reset Progress? ⚠️",
      "Are you absolutely sure? This will delete all your local progress, streaks, and stats. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset Everything", 
          style: "destructive", 
          onPress: async () => {
            await clearAllData();
            CustomAlert.alert("Data Cleared", "Please restart the app.");
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(SHARE_MESSAGE);
          CustomAlert.alert("Link Copied! 📋", "The share message has been copied to your clipboard!");
        } else {
          CustomAlert.alert("Share CodeRespite", SHARE_MESSAGE);
        }
        logAnalyticsEvent("invite_sent", { platform: "web" });
        return;
      }

      const result = await Share.share({
        message: SHARE_MESSAGE,
      });

      if (result.action === Share.sharedAction) {
        logAnalyticsEvent("invite_sent", { platform: Platform.OS });
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed.");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <SafeScreen>
      <View style={[styles.root, { paddingBottom: 0 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={15} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <SettingsGroup title="Artificial Intelligence">
            <SettingsItem 
              icon="hardware-chip" 
              label="AI Configuration (Groq)" 
              iconBg="#EEF2FF"
              onPress={() => router.push('/settings/aiSetup')} 
            />
          </SettingsGroup>

          <SettingsGroup title="Notifications">
             <SettingsItem 
              icon="notifications" 
              label="Enable Notifications" 
              iconBg="#FEF3C7"
              onPress={async () => {
                const { scheduleDailyReminder, scheduleStreakReminder } = require("../../services/notificationService");
                await scheduleDailyReminder();
                await scheduleStreakReminder();
                CustomAlert.alert("Notifications Enabled 🔔", "You'll now receive daily coding reminders!");
              }} 
            />
          </SettingsGroup>

          <SettingsGroup title="Support & About">
            <SettingsItem 
              icon="star" 
              label="Rate & Review" 
              iconBg="#FFFBEB"
              onPress={() => Linking.openURL(STORE_LINK)} 
            />
            <SettingsItem 
              icon="share-social" 
              label="Share with Friends" 
              iconBg="#ECFEFF"
              onPress={handleShare} 
            />
            <SettingsItem 
              icon="send" 
              label="Contact Us" 
              iconBg="#E0E7FF"
              onPress={() => {
                Linking.openURL("https://destyastudio.com/products/code-respite/support").catch((err) =>
                  CustomAlert.alert("Error", "Could not open support page.")
                );
              }} 
            />
            <SettingsItem 
              icon="shield-checkmark" 
              label="Privacy Policy" 
              iconBg="#D1FAE5"
              onPress={() => Linking.openURL("https://destyastudio.com/products/code-respite/privacy")} 
            />
          </SettingsGroup>

          <SettingsGroup title="Danger Zone">
            <SettingsItem 
              icon="trash" 
              label="Reset Progress" 
              iconBg="#FEF2F2"
              destructive 
              onPress={handleResetData} 
            />
          </SettingsGroup>

          {/* More Apps Section */}
          <MoreApps />

          {/* Version Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>CodeRespite</Text>
            <TouchableOpacity onPress={handleVersionTap} activeOpacity={1}>
              <Text style={styles.versionText}>Version 1.2.0 {tapCount > 5 ? '(Dev Mode)' : ''}</Text>
            </TouchableOpacity>
            <Text style={styles.footerCredits}>Made with ❤️ by Destya Studio</Text>
          </View>

        </ScrollView>
        
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.BACKGROUND },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 16, paddingBottom: 12, paddingTop: 10,
    backgroundColor: colors.BACKGROUND,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: 'quicksand-bold', fontSize: 19, color: '#1F2937' },
  scroll: { padding: 20, paddingBottom: 100 },
  group: { marginBottom: 24 },
  groupTitle: { 
    fontFamily: 'quicksand-bold', fontSize: 14, color: '#6B7280', 
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 
  },
  groupContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6'
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  label: { flex: 1, fontFamily: 'nunito-bold', fontSize: 16, color: '#374151' },
  footer: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  footerText: { fontFamily: 'quicksand-bold', fontSize: 16, color: '#374151' },
  versionText: { fontFamily: 'nunito', fontSize: 13, color: '#4B5563', marginTop: 2 },
  footerCredits: { fontFamily: 'nunito', fontSize: 12, color: '#4B5563', marginTop: 8 }
});
