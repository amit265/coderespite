import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import SafeScreen from '../../../../components/SafeScreen';
import { allCoursesContext } from '../../../../context/context';
import { PRACTICE_PROGRAMS } from '../../../../assets/data/programs';
import { CustomAlert } from '../../../../components/shared/GlobalAlert';

// Custom basic syntax highlighter for React Native
const highlightCode = (code) => {
  if (!code) return null;
  
  // Very basic regex to match tokens
  const keywordRegex = /\b(const|let|var|function|return|if|else|for|while|import|from|export|default|class|new|async|await|try|catch)\b/g;
  const stringRegex = /(['"`])(.*?)\1/g;
  const commentRegex = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
  const numberRegex = /\b(\d+)\b/g;

  // Split code into tokens (this is a simplified approach, a real tokenizer is much more complex)
  // We'll just apply basic colors. A simple way is to match all types and split the string.
  // To avoid overlapping matches, we'll use a combined regex.
  const tokenRegex = /(\/\/.*|\/\*[\s\S]*?\*\/)|(['"`][\s\S]*?['"`])|\b(const|let|var|function|return|if|else|for|while|import|from|export|default|class|new|async|await|try|catch)\b|\b(\d+)\b/g;

  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(code)) !== null) {
    const textBefore = code.slice(lastIndex, match.index);
    if (textBefore) {
      elements.push(<Text key={`text_${lastIndex}`} style={{ color: '#E5E7EB' }}>{textBefore}</Text>);
    }

    let color = '#E5E7EB'; // default
    if (match[1]) {
      // Comment
      color = '#6B7280';
    } else if (match[2]) {
      // String
      color = '#A7F3D0';
    } else if (match[3]) {
      // Keyword
      color = '#F472B6';
    } else if (match[4]) {
      // Number
      color = '#FBBF24';
    }

    elements.push(<Text key={`token_${match.index}`} style={{ color }}>{match[0]}</Text>);
    lastIndex = tokenRegex.lastIndex;
  }

  const textAfter = code.slice(lastIndex);
  if (textAfter) {
    elements.push(<Text key={`text_${lastIndex}`} style={{ color: '#E5E7EB' }}>{textAfter}</Text>);
  }

  return <Text style={styles.codeText}>{elements}</Text>;
};

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
          {highlightCode(program.solutionCode)}
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
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2D2D2D',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  codeLanguage: {
    fontSize: 12,
    fontFamily: 'nunito-bold',
    color: '#9CA3AF',
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
    color: '#9CA3AF',
  },
  codeScroll: {
    maxHeight: 400,
  },
  codeText: {
    padding: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#E5E7EB',
  }
});
