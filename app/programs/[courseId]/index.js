import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SafeScreen from '../../../components/SafeScreen';
import { allCoursesContext } from '../../../context/context';
import { PRACTICE_PROGRAMS } from '../../../assets/data/programs';
import { EmojiText } from '../../../constants/constants';

export default function PracticeModules() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const { allCourses } = useContext(allCoursesContext);

  const course = allCourses.find(c => c.id === courseId);

  if (!course) {
    return (
      <SafeScreen>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#132F94" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyStateText}>Course not found.</Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#132F94" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{course.title} Modules</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <EmojiText style={styles.subtitle}>
          Select a topic to find practice challenges! 💡
        </EmojiText>

        {course.modules.map((module) => {
          // Count programs for this module
          const programCount = PRACTICE_PROGRAMS.filter(
            p => p.courseId === courseId && p.moduleId === module.moduleId
          ).length;

          return (
            <TouchableOpacity 
              key={module.moduleId} 
              style={styles.card}
              onPress={() => router.push(`/programs/${courseId}/${module.moduleId}`)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{module.title}</Text>
                <Text style={styles.cardSubtitle}>
                  {programCount} {programCount === 1 ? 'Program' : 'Programs'} available
                </Text>
              </View>
              {programCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{programCount}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeScreen>
  );
}

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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'quicksand-bold',
    color: '#132F94',
    flex: 1,
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'nunito',
    color: '#4B5563',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'quicksand-bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'nunito',
    color: '#6B7280',
  },
  badge: {
    backgroundColor: '#132F94',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'nunito-bold',
  },
  emptyStateText: {
    fontSize: 15,
    fontFamily: 'nunito',
    color: '#9CA3AF',
  }
});
