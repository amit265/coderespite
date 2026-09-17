import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getAdFreeRemainingMs, activateAdFree } from "../services/adFreeService";
import { addCreditsFromAd } from "../services/aiCreditsService";
import { adConfigContext } from "../context/context";
import { useContext } from "react";
import { CustomAlert } from "./shared/GlobalAlert";

export default function PowerUps({ credits, refreshCredits }) {
  const [remainingMs, setRemainingMs] = useState(0);
  const [adFreeLoading, setAdFreeLoading] = useState(false);
  const [aiCreditLoading, setAiCreditLoading] = useState(false);
  const { isRewardedLoaded, showRewardedAd } = useContext(adConfigContext) || {};

  useEffect(() => {
    const check = async () => {
      const ms = await getAdFreeRemainingMs();
      setRemainingMs(ms);
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms) => {
    if (ms <= 0) return null;
    const totalSeconds = Math.ceil(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWatchAdFree = () => {
    CustomAlert.alert(
      "Go Ad-Free",
      "Watch a short video ad to enjoy 15 minutes of uninterrupted learning without any ads. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Watch", 
          onPress: () => {
            setAdFreeLoading(true);
            showRewardedAd(
              async () => {
                await activateAdFree();
                const ms = await getAdFreeRemainingMs();
                setRemainingMs(ms);
                setAdFreeLoading(false);
              },
              () => setAdFreeLoading(false)
            );
          }
        }
      ]
    );
  };

  const handleWatchAiCredits = () => {
    CustomAlert.alert(
      "Get AI Credits",
      "Watch a short video ad to earn 10 AI Credits. You can hold up to 100 credits at once. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Watch", 
          onPress: () => {
            setAiCreditLoading(true);
            showRewardedAd(
              async () => {
                await addCreditsFromAd();
                if (refreshCredits) await refreshCredits();
                setAiCreditLoading(false);
              },
              () => setAiCreditLoading(false)
            );
          }
        }
      ]
    );
  };

  const isAdFreeActive = remainingMs > 0;
  const timeLeft = formatTime(remainingMs);

  return (
    <View style={{ marginBottom: 16 }}>
      
      {/* Ad-Free Banner */}
      <View style={{
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: isAdFreeActive ? '#10B98130' : '#E5E7EB',
        backgroundColor: isAdFreeActive ? '#ECFDF5' : '#F9FAFB',
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
      }}>
        <View style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: isAdFreeActive ? '#D1FAE5' : '#F3F4F6',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name={isAdFreeActive ? "shield-checkmark" : "shield-outline"} size={22} color={isAdFreeActive ? "#10B981" : "#9CA3AF"} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'quicksand-bold', fontSize: 14, color: isAdFreeActive ? '#065F46' : '#1F2937' }}>
            {isAdFreeActive ? `Ad-Free: ${timeLeft} left ✅` : 'Go Ad-Free for 15 min'}
          </Text>
          <Text style={{ fontFamily: 'nunito', fontSize: 12, color: '#6B7280' }}>
            {isAdFreeActive ? 'All ads paused. Enjoy!' : `Watch an ad for uninterrupted learning`}
          </Text>
        </View>
        {!isAdFreeActive && (
          <TouchableOpacity
            onPress={handleWatchAdFree}
            disabled={adFreeLoading || !isRewardedLoaded}
            style={{
              backgroundColor: !isRewardedLoaded ? '#9CA3AF' : '#132F94',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 64,
            }}
          >
            {adFreeLoading || !isRewardedLoaded
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={{ color: 'white', fontFamily: 'nunito-bold', fontSize: 12 }}>Watch Ad</Text>
            }
          </TouchableOpacity>
        )}
      </View>

      {/* AI Credits Banner */}
      <View style={{
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
        <View style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: '#EDE9FE',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="flash" size={22} color="#8B5CF6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'quicksand-bold', fontSize: 14, color: '#1F2937' }}>
            Need more AI Credits?
          </Text>
          <Text style={{ fontFamily: 'nunito', fontSize: 12, color: '#6B7280' }}>
            Watch an ad to get +10 AI credits
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleWatchAiCredits}
          disabled={aiCreditLoading || !isRewardedLoaded}
          style={{
            backgroundColor: !isRewardedLoaded ? '#C4B5FD' : '#8B5CF6',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 64,
          }}
        >
          {aiCreditLoading || !isRewardedLoaded
            ? <ActivityIndicator size="small" color="white" />
            : <Text style={{ color: 'white', fontFamily: 'nunito-bold', fontSize: 12 }}>Watch Ad</Text>
          }
        </TouchableOpacity>
      </View>

    </View>
  );
}
