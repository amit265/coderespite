import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SafeScreen from '../../components/SafeScreen';
import { allCoursesContext } from '../../context/context';
import { EmojiText } from '../../constants/constants';

export default function PracticeCourses() {
  const router = useRouter();
  const { allCourses } = useContext(allCoursesContext);

  return (
    <SafeScreen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#132F94" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice Programs</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <EmojiText style={styles.subtitle}>
          Select a course to start practicing! 🚀
        </EmojiText>

        {allCourses.map((course) => (
          <TouchableOpacity 
            key={course.id} 
            style={styles.card}
            onPress={() => router.push(`/programs/${course.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{course.title}</Text>
              <Text style={styles.cardSubtitle}>{course.modules.length} Modules</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
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
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: 'quicksand-bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'nunito',
    color: '#6B7280',
  }
});
