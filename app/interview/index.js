// app/interview/index.js
// Mode selection screen — Mock Interview vs Q&A Tutor
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageTransition from '../../components/PageTransition';

const ModeCard = ({ icon, title, subtitle, bullets, color, bg, onPress, delay }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 6, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }, { scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
        activeOpacity={1}
        style={[styles.card, { borderLeftColor: color }]}
      >
        {/* Icon + title row */}
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: bg }]}>
            <Ionicons name={icon} size={32} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color }]}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color={color} />
        </View>

        {/* Bullets */}
        <View style={{ gap: 6, marginTop: 14 }}>
          {bullets.map((b, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <Ionicons name="checkmark-circle" size={16} color={color} style={{ marginTop: 1 }} />
              <Text style={styles.bullet}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Credit cost badge */}
        <View style={[styles.creditBadge, { backgroundColor: bg }]}>
          <Ionicons name="flash" size={12} color={color} />
          <Text style={[styles.creditText, { color }]}>{title === 'Mock Interview' ? '1 credit per session' : '1 credit per message'}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function InterviewIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const titleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(titleFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <PageTransition>
      <ScrollView 
        style={[styles.root, { paddingTop: insets.top + 8 }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Back + header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.heroSection, { opacity: titleFade }]}>
          <Text style={styles.heroEmoji}>🎤</Text>
          <Text style={styles.heroTitle}>Interview Practice</Text>
          <Text style={styles.heroSubtitle}>
            Get job-ready. Choose your mode and practice with Meowgrammer AI.
          </Text>
        </Animated.View>

        <View style={styles.cards}>
          <ModeCard
            icon="mic"
            title="Mock Interview"
            subtitle="AI acts as your interviewer"
            color="#132F94"
            bg="#EEF2FF"
            delay={100}
            bullets={[
              'Pick a topic (Arrays, React, System Design…)',
              'AI asks 5 real interview questions',
              'You answer each one by typing',
              'Get a score + detailed feedback at the end',
            ]}
            onPress={() => router.push('/interview/mock')}
          />

          <ModeCard
            icon="chatbubbles"
            title="Q&A Tutor"
            subtitle="Ask anything, get expert answers"
            color="#8B5CF6"
            bg="#F5F3FF"
            delay={220}
            bullets={[
              'Ask any coding or tech question',
              'Get clear, concise AI explanations',
              'See code examples with syntax highlighting',
              'Persistent chat history across sessions',
            ]}
            onPress={() => router.push('/interview/tutor')}
          />
        </View>

        {/* Info note */}
        <Text style={[styles.note, { paddingBottom: insets.bottom + 16 }]}>
          🔋 AI credits reset to 20 daily. Watch an ad in Profile for +10 bonus credits.
        </Text>
      </ScrollView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#CBE7F7' },
  header: { paddingHorizontal: 16, paddingBottom: 4 },
  backBtn: { padding: 6, alignSelf: 'flex-start' },
  heroSection: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 28 },
  heroEmoji: { fontSize: 52, marginBottom: 10 },
  heroTitle: { fontFamily: 'quicksand-bold', fontSize: 28, color: '#1F2937', textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { fontFamily: 'nunito', fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  cards: { paddingHorizontal: 20, gap: 14 },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: {
    width: 60, height: 60, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontFamily: 'quicksand-bold', fontSize: 19, marginBottom: 2 },
  cardSubtitle: { fontFamily: 'nunito', fontSize: 13, color: '#6B7280' },
  bullet: { fontFamily: 'nunito', fontSize: 14, color: '#374151', flex: 1, lineHeight: 20 },
  creditBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5, marginTop: 14,
  },
  creditText: { fontFamily: 'nunito-bold', fontSize: 12 },
  note: {
    textAlign: 'center', fontFamily: 'nunito', fontSize: 12,
    color: '#9CA3AF', paddingHorizontal: 24, marginTop: 20,
    lineHeight: 18,
  },
});
