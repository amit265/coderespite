import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SafeScreen from '../../../../components/SafeScreen';
import { allCoursesContext } from '../../../../context/context';
import { PRACTICE_PROGRAMS } from '../../../../assets/data/programs';
import { EmojiText } from '../../../../constants/constants';

export default function PracticeProgramsList() {
  const router = useRouter();
  const { courseId, moduleId } = useLocalSearchParams();
  const { allCourses } = useContext(allCoursesContext);

  const course = allCourses.find(c => c.id === courseId);
  const moduleInfo = course?.modules.find(m => m.moduleId === moduleId);
  
  const programs = PRACTICE_PROGRAMS.filter(
    p => p.courseId === courseId && p.moduleId === moduleId
  );

  if (!moduleInfo) {
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
          <Text style={styles.emptyStateText}>Module not found.</Text>
        </View>
      </SafeScreen>
    );
  }

  const handleProgramPress = (program) => {
    router.push({
      pathname: '/playground',
      params: { programId: program.id }
    });
  };

  const renderDifficulty = (difficulty) => {
    let color = '#28a745'; // Easy
    if (difficulty === 'Medium') color = '#FFA500';
    if (difficulty === 'Hard') color = '#E53935';

    return (
      <View style={[styles.badge, { backgroundColor: color + '20' }]}>
        <Text style={[styles.badgeText, { color }]}>{difficulty}</Text>
      </View>
    );
  };

  return (
    <SafeScreen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#132F94" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{moduleInfo.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <EmojiText style={styles.subtitle}>
          {programs.length > 0 
            ? "Choose a challenge to test your skills! 💻" 
            : "More practice programs coming soon! 🚧"}
        </EmojiText>

        {programs.map((program) => (
          <TouchableOpacity 
            key={program.id} 
            style={styles.card}
            onPress={() => handleProgramPress(program)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{program.title}</Text>
              {renderDifficulty(program.difficulty)}
            </View>
            <View style={styles.tagsContainer}>
              {program.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <View style={styles.actionRow}>
              <Text style={styles.actionText}>Solve in Playground</Text>
              <Ionicons name="code-slash" size={16} color="#132F94" />
            </View>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'quicksand-bold',
    color: '#1F2937',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'nunito-bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'nunito',
    color: '#4B5563',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontFamily: 'nunito-bold',
    color: '#132F94',
  },
  emptyStateText: {
    fontSize: 15,
    fontFamily: 'nunito',
    color: '#9CA3AF',
  }
});
