// app/(tabs)/practice.js
// Practice tab — Shows the Practice Programs course browser
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageTransition from '../../components/PageTransition';
import SafeScreen from '../../components/SafeScreen';
import { PRACTICE_PROGRAMS } from '../../assets/data/programs';

// Get all unique courseIds from programs
const getCourses = () => {
  const map = {};
  PRACTICE_PROGRAMS.forEach((p) => {
    if (!map[p.courseId]) {
      map[p.courseId] = { id: p.courseId, count: 0 };
    }
    map[p.courseId].count += 1;
  });
  return Object.values(map);
};

const COURSE_META = {
  javascript: { label: 'JavaScript', icon: 'logo-javascript', color: '#F59E0B', bg: '#FEF3C7' },
  dsa: { label: 'Data Structures & Algorithms', icon: 'git-network-outline', color: '#3B82F6', bg: '#EFF6FF' },
  reactjs: { label: 'React.js', icon: 'logo-react', color: '#06B6D4', bg: '#ECFEFF' },
  python: { label: 'Python', icon: 'logo-python', color: '#10B981', bg: '#ECFDF5' },
  typescript: { label: 'TypeScript', icon: 'code-slash', color: '#6366F1', bg: '#EEF2FF' },
  css: { label: 'CSS', icon: 'color-palette-outline', color: '#EC4899', bg: '#FDF2F8' },
  html: { label: 'HTML', icon: 'globe-outline', color: '#EF4444', bg: '#FEF2F2' },
};

const DIFF_COLOR = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' };

// ── Animated Course Card ──────────────────────────────────────────────────────
const CourseCard = ({ course, index, onPress }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const meta = COURSE_META[course.id] || { label: course.id, icon: 'code-slash', color: '#8B5CF6', bg: '#F5F3FF' };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, delay: index * 80, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 7, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }, { scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
        style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 18,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          shadowColor: meta.color,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 3,
          borderLeftWidth: 4,
          borderLeftColor: meta.color,
        }}
      >
        <View style={{
          width: 52, height: 52, borderRadius: 14,
          backgroundColor: meta.bg,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name={meta.icon} size={26} color={meta.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'quicksand-bold', fontSize: 16, color: '#1F2937', marginBottom: 2 }}>
            {meta.label}
          </Text>
          <Text style={{ fontFamily: 'nunito', fontSize: 13, color: '#6B7280' }}>
            {course.count} challenge{course.count !== 1 ? 's' : ''}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </Pressable>
    </Animated.View>
  );
};

export default function Practice() {
  const router = useRouter();
  const courses = getCourses();

  return (
    <PageTransition>
      <SafeScreen>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
          <Text style={{ fontFamily: 'quicksand-bold', fontSize: 26, color: '#1F2937', marginBottom: 4 }}>
            💻 Practice
          </Text>
          <Text style={{ fontFamily: 'nunito', fontSize: 14, color: '#6B7280' }}>
            Solve coding challenges. Build real intuition.
          </Text>
        </View>

        {/* Stats row */}
        <View style={{
          flexDirection: 'row', gap: 10,
          paddingHorizontal: 20, marginBottom: 16,
        }}>
          {[
            { label: 'Challenges', value: PRACTICE_PROGRAMS.length, color: '#3B82F6' },
            { label: 'Easy', value: PRACTICE_PROGRAMS.filter(p => p.difficulty === 'Easy').length, color: '#10B981' },
            { label: 'Medium', value: PRACTICE_PROGRAMS.filter(p => p.difficulty === 'Medium').length, color: '#F59E0B' },
            { label: 'Hard', value: PRACTICE_PROGRAMS.filter(p => p.difficulty === 'Hard').length, color: '#EF4444' },
          ].map((s) => (
            <View key={s.label} style={{
              flex: 1, backgroundColor: 'white', borderRadius: 12,
              padding: 10, alignItems: 'center',
              shadowColor: s.color, shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
            }}>
              <Text style={{ fontFamily: 'quicksand-bold', fontSize: 18, color: s.color }}>{s.value}</Text>
              <Text style={{ fontFamily: 'nunito', fontSize: 11, color: '#9CA3AF' }}>{s.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <Text style={{ fontFamily: 'quicksand-bold', fontSize: 18, color: '#1F2937', marginBottom: 12 }}>
            Pick a Language
          </Text>
          {courses.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              index={i}
              onPress={() => router.push(`/programs/${course.id}`)}
            />
          ))}
        </ScrollView>
      </SafeScreen>
    </PageTransition>
  );
}
