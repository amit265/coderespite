import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { showRewardedAd } from '../services/AdManager';
import { activateAdFree, getAdFreeRemainingMs } from '../services/adFreeService';
import { addCreditsFromAd } from '../services/aiCreditsService';
import { aiCreditsContext } from '../context/context';
import PageTransition from '../components/PageTransition';
import SafeScreen from '../components/SafeScreen';

export default function AdFreeScreen() {
  const router = useRouter();
  const { credits, refreshCredits } = useContext(aiCreditsContext);
  const [loading, setLoading] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);

  // Poll remaining time every second
  useEffect(() => {
    const checkTimer = async () => {
      const ms = await getAdFreeRemainingMs();
      setRemainingMs(ms);
    };
    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms) => {
    if (ms <= 0) return null;
    const totalSeconds = Math.ceil(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWatchAd = () => {
    setLoading(true);
    showRewardedAd(
      async () => {
        // Reward earned: give ad-free time AND +3 AI credits
        await activateAdFree();
        await addCreditsFromAd();
        await refreshCredits();
        const ms = await getAdFreeRemainingMs();
        setRemainingMs(ms);
        setLoading(false);
      },
      () => {
        // Ad closed without reward
        setLoading(false);
      }
    );
  };

  const timeLeft = formatTime(remainingMs);
  const isActive = remainingMs > 0;

  return (
    <PageTransition>
      <SafeScreen>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#132F94" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Go Ad-Free</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.container}>
          {/* Status Card */}
          <View style={[styles.statusCard, isActive && styles.statusCardActive]}>
            <Ionicons
              name={isActive ? "shield-checkmark" : "shield-outline"}
              size={56}
              color={isActive ? "#10B981" : "#D1D5DB"}
            />
            {isActive ? (
              <>
                <Text style={styles.activeTitle}>Ad-Free Active! 🎉</Text>
                <Text style={styles.timerText}>{timeLeft} remaining</Text>
                <Text style={styles.statusSubtitle}>
                  Enjoy an uninterrupted experience. All ads are paused.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.inactiveTitle}>No Active Session</Text>
                <Text style={styles.statusSubtitle}>
                  Watch a short ad to enjoy 15 minutes of uninterrupted learning!
                </Text>
              </>
            )}
          </View>

          {/* Benefits */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>What you get:</Text>
            <Benefit icon="ban" text="No interstitial ads for 15 minutes" />
            <Benefit icon="phone-portrait-outline" text="No app-open ads when switching apps" />
            <Benefit icon="sparkles" text="+3 AI Credits (bonus!)" />
          </View>

          {/* Current Credits */}
          <View style={styles.creditsRow}>
            <Ionicons name="flash" size={18} color="#8B5CF6" />
            <Text style={styles.creditsText}>
              AI Credits: <Text style={styles.creditsCount}>{credits}</Text> / 10
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.watchAdBtn, isActive && styles.watchAdBtnDisabled]}
            onPress={handleWatchAd}
            disabled={loading || isActive}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="play-circle" size={22} color="white" />
                <Text style={styles.watchAdText}>
                  {isActive ? 'Session Already Active' : 'Watch Ad - Get 15 Min Free'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            A short rewarded video ad will play. You must watch it to completion to earn the reward.
          </Text>
        </View>
      </SafeScreen>
    </PageTransition>
  );
}

const Benefit = ({ icon, text }) => (
  <View style={styles.benefitRow}>
    <Ionicons name={icon} size={20} color="#10B981" />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#CBE7F7',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backBtn: { padding: 5 },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'quicksand-bold',
    color: '#132F94',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  statusCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  statusCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  activeTitle: {
    fontSize: 22,
    fontFamily: 'quicksand-bold',
    color: '#10B981',
    marginTop: 12,
    marginBottom: 4,
  },
  timerText: {
    fontSize: 36,
    fontFamily: 'quicksand-bold',
    color: '#065F46',
    marginBottom: 8,
  },
  inactiveTitle: {
    fontSize: 20,
    fontFamily: 'quicksand-bold',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 14,
    fontFamily: 'nunito',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  benefitsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  benefitsTitle: {
    fontSize: 16,
    fontFamily: 'quicksand-bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'nunito',
    color: '#4B5563',
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  creditsText: {
    fontFamily: 'nunito',
    fontSize: 14,
    color: '#4B5563',
  },
  creditsCount: {
    fontFamily: 'nunito-bold',
    color: '#8B5CF6',
  },
  watchAdBtn: {
    backgroundColor: '#132F94',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#132F94',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  watchAdBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  watchAdText: {
    color: 'white',
    fontFamily: 'quicksand-bold',
    fontSize: 16,
  },
  note: {
    fontSize: 12,
    fontFamily: 'nunito',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
