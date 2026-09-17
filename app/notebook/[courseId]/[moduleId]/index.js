import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import SafeScreen from '../../../../components/SafeScreen';
import { allCoursesContext } from '../../../../context/context';
import { PRACTICE_PROGRAMS } from '../../../../assets/data/programs';
import { CustomAlert } from '../../../../components/shared/GlobalAlert';

function ProgramCell({ program }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(program.solutionCode);
    setCopied(true);
    CustomAlert.alert("Copied!", "Solution code copied to clipboard.", [{ text: "OK" }]);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.cellContainer}>
      {/* Header */}
      <View style={styles.cellHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cellTitle}>{program.title}</Text>
          <View style={styles.tagsContainer}>
            <View style={[styles.badge, program.difficulty === 'Easy' ? styles.badgeEasy : program.difficulty === 'Medium' ? styles.badgeMedium : styles.badgeHard]}>
              <Text style={styles.badgeText}>{program.difficulty}</Text>
            </View>
            <Text style={styles.categoryText}>{program.category}</Text>
          </View>
        </View>
      </View>

      {/* Code Block */}
      <View style={styles.codeWrapper}>
        <View style={styles.codeHeader}>
          <Text style={styles.codeLanguage}>Solution</Text>
          <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
            <Ionicons name={copied ? "checkmark" : "copy-outline"} size={14} color={copied ? "#10B981" : "#6B7280"} />
            <Text style={[styles.copyText, copied && { color: '#10B981' }]}>
              {copied ? "Copied" : "Copy"}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.codeScroll} horizontal showsHorizontalScrollIndicator={false}>
          <Text style={styles.codeText}>{program.solutionCode}</Text>
        </ScrollView>
      </View>
    </View>
  );
}

export default function NotebookProgramsList() {
  const router = useRouter();
  const { courseId, moduleId } = useLocalSearchParams();
  const { allCourses } = useContext(allCoursesContext);

  const course = allCourses.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.moduleId === moduleId);
  
  const programs = PRACTICE_PROGRAMS.filter(
    p => p.courseId === courseId && p.moduleId === moduleId
  );

  if (!course || !module) {
    return (
      <SafeScreen>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#132F94" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Not Found</Text>
          <View style={{ width: 24 }} />
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
        <Text style={styles.headerTitle} numberOfLines={1}>{module.title} Programs</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {programs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No programs available for this module yet.</Text>
          </View>
        ) : (
          programs.map((program) => (
            <ProgramCell key={program.id} program={program} />
          ))
        )}
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
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    fontFamily: 'nunito',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  cellContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cellHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cellTitle: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeEasy: { backgroundColor: '#D1FAE5' },
  badgeMedium: { backgroundColor: '#FEF3C7' },
  badgeHard: { backgroundColor: '#FEE2E2' },
  badgeText: {
    fontSize: 12,
    fontFamily: 'nunito-bold',
    color: '#374151',
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'nunito',
    color: '#6B7280',
  },
  codeWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  codeLanguage: {
    fontSize: 12,
    fontFamily: 'nunito-bold',
    color: '#4B5563',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  copyText: {
    fontSize: 12,
    fontFamily: 'nunito-bold',
    color: '#6B7280',
  },
  codeScroll: {
    maxHeight: 400,
  },
  codeText: {
    padding: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#1F2937',
  }
});
