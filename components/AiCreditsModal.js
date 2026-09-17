import React, { useContext, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiCreditsContext } from '../context/context';
import { showRewardedAd } from '../services/AdManager';
import { addCreditsFromAd } from '../services/aiCreditsService';

export default function AiCreditsModal({ visible, onClose, onCreditsAdded }) {
  const { credits, refreshCredits } = useContext(aiCreditsContext);
  const [loading, setLoading] = useState(false);

  const handleWatchAd = () => {
    setLoading(true);
    showRewardedAd(
      async () => {
        // On reward earned
        const newCount = await addCreditsFromAd();
        await refreshCredits();
        setLoading(false);
        if (onCreditsAdded) onCreditsAdded(newCount);
        onClose();
      },
      () => {
        // On ad closed (without reward)
        setLoading(false);
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="flash" size={40} color="#F59E0B" />
          </View>

          <Text style={styles.title}>Out of AI Credits!</Text>
          <Text style={styles.subtitle}>
            You&apos;ve used all your AI credits for today. Watch a short ad to get{' '}
            <Text style={styles.highlight}>+3 credits</Text> instantly!
          </Text>

          {/* Credit counter */}
          <View style={styles.creditRow}>
            <Ionicons name="sparkles" size={16} color="#8B5CF6" />
            <Text style={styles.creditText}>
              Current credits:{' '}
              <Text style={styles.creditCount}>{credits}</Text> / 10
            </Text>
          </View>

          {/* Watch Ad Button */}
          <TouchableOpacity
            style={styles.watchAdBtn}
            onPress={handleWatchAd}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="play-circle" size={20} color="white" />
                <Text style={styles.watchAdText}>Watch Ad for +3 Credits</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Reset note */}
          <Text style={styles.resetNote}>
            ⏰ Credits automatically reset to 5 every day.
          </Text>

          {/* Dismiss */}
          <TouchableOpacity onPress={onClose} style={styles.dismissBtn}>
            <Text style={styles.dismissText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'quicksand-bold',
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'nunito',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  highlight: {
    fontFamily: 'nunito-bold',
    color: '#8B5CF6',
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
  },
  creditText: {
    fontFamily: 'nunito',
    fontSize: 14,
    color: '#4B5563',
  },
  creditCount: {
    fontFamily: 'nunito-bold',
    color: '#8B5CF6',
  },
  watchAdBtn: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  watchAdText: {
    color: 'white',
    fontFamily: 'quicksand-bold',
    fontSize: 16,
  },
  resetNote: {
    fontSize: 12,
    fontFamily: 'nunito',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  dismissBtn: {
    padding: 8,
  },
  dismissText: {
    fontFamily: 'nunito-semiBold',
    color: '#9CA3AF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
