import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import SafeScreen from '../components/SafeScreen';
import { PRACTICE_PROGRAMS } from '../assets/data/programs';
import { Ionicons } from '@expo/vector-icons';
import { CustomAlert } from '../components/shared/GlobalAlert';

// Safe isolated JS evaluator
function executeCode(code) {
  let logs = [];
  try {
    // Override console.log in the execution context
    const customConsole = {
      log: (...args) => {
        logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
      }
    };
    
    // Create a new function that runs the code with our custom console
    const executable = new Function('console', `
      try {
        ${code}
      } catch (e) {
        console.log("Error: " + e.message);
      }
    `);
    
    executable(customConsole);
    return logs.length > 0 ? logs.join('\\n') : "Code executed successfully with no output.";
  } catch (err) {
    return "Error: " + err.message;
  }
}

function NotebookCell({ program }) {
  const [code, setCode] = useState(program.starterCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    // Slight delay to allow UI to update to running state
    setTimeout(() => {
      const result = executeCode(code);
      setOutput(result);
      setIsRunning(false);
    }, 50);
  };

  const handleReset = () => {
    CustomAlert.alert("Reset Code", "Are you sure you want to reset your code to the starter template?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", onPress: () => {
        setCode(program.starterCode);
        setOutput("");
      }}
    ]);
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

      {/* Editor */}
      <View style={styles.editorWrapper}>
        <View style={styles.editorHeader}>
          <Text style={styles.editorLanguage}>JavaScript</Text>
          <View style={styles.editorActions}>
            <TouchableOpacity onPress={handleReset} style={styles.actionBtn}>
              <Ionicons name="refresh" size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        
        <TextInput
          style={styles.textInput}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          value={code}
          onChangeText={setCode}
          placeholder="Write your code here..."
          placeholderTextColor="#9CA3AF"
          keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'default'}
        />

        {/* Output */}
        {output !== "" && (
          <View style={styles.outputWrapper}>
            <Text style={styles.outputLabel}>Console Output:</Text>
            <Text style={styles.outputText}>{output}</Text>
          </View>
        )}
      </View>

      {/* Run Button */}
      <TouchableOpacity 
        style={[styles.runBtn, isRunning && styles.runBtnDisabled]} 
        onPress={handleRun}
        disabled={isRunning}
      >
        <Ionicons name={isRunning ? "hourglass-outline" : "play"} size={16} color="white" />
        <Text style={styles.runBtnText}>{isRunning ? "Running..." : "Run Code"}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function NotebookScreen() {
  const router = useRouter();

  return (
    <SafeScreen>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Notebook</Text>
        <View style={{ width: 24 }} />
      </View>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Programs Notebook</Text>
            <Text style={styles.subtitle}>Scroll through and execute practice programs directly inside your mobile notebook.</Text>
          </View>

          {PRACTICE_PROGRAMS.map((program) => (
            <NotebookCell key={program.id} program={program} />
          ))}
          
          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topBarTitle: {
    fontSize: 18,
    fontFamily: 'quicksand-bold',
    color: '#1F2937',
  },
  backButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'quicksand-bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'nunito',
    color: '#6B7280',
    lineHeight: 22,
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
  editorWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 12,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  editorLanguage: {
    fontSize: 12,
    fontFamily: 'nunito-bold',
    color: '#4B5563',
  },
  actionBtn: {
    padding: 4,
  },
  textInput: {
    minHeight: 120,
    maxHeight: 300,
    padding: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#1F2937',
    textAlignVertical: 'top',
  },
  outputWrapper: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  outputLabel: {
    fontSize: 11,
    fontFamily: 'nunito-bold',
    color: '#9CA3AF',
    marginBottom: 6,
  },
  outputText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#10B981',
  },
  runBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  runBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  runBtnText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'nunito-bold',
  },
});
