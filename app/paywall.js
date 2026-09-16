import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getOfferings, purchasePackage, restorePurchases } from '../services/purchasesService';
import PageTransition from '../components/PageTransition';

export default function Paywall() {
  const router = useRouter();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchOfferings = async () => {
      const packs = await getOfferings();
      setPackages(packs);
      setLoading(false);
    };
    fetchOfferings();
  }, []);

  const handlePurchase = async (pack) => {
    setPurchasing(true);
    const success = await purchasePackage(pack);
    setPurchasing(false);
    if (success) {
      Alert.alert("Success!", "Welcome to CodeRespite Pro! 🎉", [
        { text: "Awesome", onPress: () => router.back() }
      ]);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const success = await restorePurchases();
    setPurchasing(false);
    if (success) {
      Alert.alert("Restored", "Your purchases have been restored.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } else {
      Alert.alert("Failed", "Could not restore purchases or no active subscriptions found.");
    }
  };

  return (
    <PageTransition>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#4B5563" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>CodeRespite <Text style={styles.proText}>Pro</Text></Text>
          <Text style={styles.subtitle}>Unlock your full coding potential</Text>

          <View style={styles.benefits}>
            <Benefit icon="rocket" text="Ad-free experience" />
            <Benefit icon="chatbubbles" text="Unlimited AI Chat with Meowgrammer" />
            <Benefit icon="snow" text="Unlimited Streak Freezes" />
            <Benefit icon="shield-checkmark" text="Exclusive Pro Badge" />
          </View>

          <View style={styles.packagesContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#8B5CF6" />
            ) : packages.length === 0 ? (
              <Text style={styles.noPackagesText}>No subscriptions available right now.</Text>
            ) : (
              packages.map((pack) => (
                <TouchableOpacity
                  key={pack.identifier}
                  style={styles.packageCard}
                  onPress={() => handlePurchase(pack)}
                  disabled={purchasing}
                >
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageTitle}>{pack.product.title}</Text>
                    <Text style={styles.packageDesc}>{pack.product.description}</Text>
                  </View>
                  <Text style={styles.packagePrice}>{pack.product.priceString}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          {purchasing && <ActivityIndicator size="small" color="#8B5CF6" style={{ marginTop: 20 }} />}

          <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn} disabled={purchasing}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </PageTransition>
  );
}

const Benefit = ({ icon, text }) => (
  <View style={styles.benefitRow}>
    <Ionicons name={icon} size={24} color="#10B981" />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    padding: 16,
    alignItems: 'flex-end',
  },
  closeBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'nunito-bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  proText: {
    color: '#8B5CF6',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'nunito',
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  benefits: {
    width: '100%',
    marginBottom: 40,
    gap: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    fontFamily: 'nunito-semiBold',
    color: '#374151',
  },
  packagesContainer: {
    width: '100%',
    gap: 16,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DDD6FE',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  packageDesc: {
    fontSize: 13,
    fontFamily: 'nunito',
    color: '#6B7280',
  },
  packagePrice: {
    fontSize: 20,
    fontFamily: 'nunito-bold',
    color: '#8B5CF6',
  },
  noPackagesText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontFamily: 'nunito',
  },
  restoreBtn: {
    marginTop: 24,
    padding: 12,
  },
  restoreText: {
    color: '#9CA3AF',
    fontFamily: 'nunito-semiBold',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
