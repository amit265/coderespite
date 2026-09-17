// app/interview/mock.js
// Mock Interview — AI asks 5 questions, user answers, AI gives feedback
import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView,
  Platform, Animated,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { aiCreditsContext } from '../../context/context';
import { deductAiCredit } from '../../services/aiCreditsService';
import { getGroqApiKey } from '../../services/groqService';
import AiCreditsModal from '../../components/AiCreditsModal';
import PageTransition from '../../components/PageTransition';
import { CustomAlert } from "../../components/shared/GlobalAlert";

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = [
  'qwen/qwen3.8-27b', 'qwen/qwen3.6-27b',
  'openai/gpt-oss-20b', 'groq/compound',
];
const TOTAL_QUESTIONS = 5;

const TOPICS = [
  'JavaScript Arrays & Objects', 'React Hooks & State', 'Async/Await & Promises',
  'Data Structures (Linked Lists, Trees)', 'Dynamic Programming', 'System Design Basics',
  'CSS Flexbox & Grid', 'REST APIs & HTTP', 'TypeScript Fundamentals', 'Python Basics',
];

// ── Stages ─────────────────────────────────────────────────────────────────────
const STAGE = { TOPIC: 'topic', INTERVIEW: 'interview', RESULTS: 'results' };

async function callGroq(apiKey, messages) {
  let lastErr;
  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 1200 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const content = data.choices[0]?.message?.content?.trim();
      if (content) return content;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('All models failed');
}

export default function MockInterview() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { credits, refreshCredits } = useContext(aiCreditsContext);
  const scrollRef = useRef(null);

  const [stage, setStage] = useState(STAGE.TOPIC);

  // Prevent back navigation during active interview
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (stage !== STAGE.INTERVIEW) {
        return;
      }

      e.preventDefault();

      CustomAlert.alert(
        'Quit Interview?',
        'Your progress will be lost. Are you sure you want to leave?',
        [
          { text: 'Cancel', onPress: () => {} },
          {
            text: 'Leave',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, stage]);
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [questions, setQuestions] = useState([]);  // [{question, userAnswer, feedback}]
  const [currentQ, setCurrentQ] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [results, setResults] = useState(null);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (stage === STAGE.INTERVIEW) {
      Animated.timing(progressAnim, {
        toValue: (currentQ + 1) / TOTAL_QUESTIONS,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [currentQ, stage]);

  // ── Start: generate all 5 questions at once ────────────────────────────────
  const handleStart = async () => {
    const finalTopic = topic || customTopic.trim();
    if (!finalTopic) {
      CustomAlert.alert('Pick a topic', 'Please select a topic or type your own.');
      return;
    }

    // Deduct 1 credit for the whole session
    const ok = await deductAiCredit();
    if (!ok) { setShowCreditsModal(true); return; }
    await refreshCredits();

    setLoading(true);
    try {
      const apiKey = await getGroqApiKey();
      const content = await callGroq(apiKey, [
        {
          role: 'system',
          content: `You are a strict but fair technical interviewer. Generate exactly ${TOTAL_QUESTIONS} interview questions about "${finalTopic}". 
Format your response as a JSON array of strings, nothing else. Example:
["Q1 text here", "Q2 text here", "Q3 text here", "Q4 text here", "Q5 text here"]`,
        },
        { role: 'user', content: `Give me ${TOTAL_QUESTIONS} interview questions on: ${finalTopic}` },
      ]);

      // Parse the JSON array of questions
      const match = content.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('Could not parse questions');
      const qs = JSON.parse(match[0]);
      if (!Array.isArray(qs) || qs.length === 0) throw new Error('Empty questions');

      setQuestions(qs.slice(0, TOTAL_QUESTIONS).map((q) => ({ question: q, userAnswer: '', feedback: '' })));
      setCurrentQ(0);
      setStage(STAGE.INTERVIEW);
    } catch (err) {
      CustomAlert.alert('Error', 'Could not generate questions. Check your Groq API key in Settings.');
    } finally {
      setLoading(false);
    }
  };

  // ── Submit answer and get feedback for this question ───────────────────────
  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      CustomAlert.alert('Write an answer', 'Please type your answer before submitting.');
      return;
    }

    const updatedQs = [...questions];
    updatedQs[currentQ].userAnswer = answerText.trim();

    setLoading(true);
    try {
      const apiKey = await getGroqApiKey();
      const feedback = await callGroq(apiKey, [
        {
          role: 'system',
          content: `You are a technical interviewer giving concise, constructive feedback on a candidate's answer.
Be encouraging but honest. Keep feedback under 150 words. 
Format: Start with a score like "Score: 7/10" on its own line, then 2-3 sentences of feedback.`,
        },
        {
          role: 'user',
          content: `Question: ${updatedQs[currentQ].question}\n\nCandidate Answer: ${updatedQs[currentQ].userAnswer}`,
        },
      ]);

      updatedQs[currentQ].feedback = feedback;
      setQuestions(updatedQs);
      setAnswerText('');

      if (currentQ + 1 < updatedQs.length) {
        setCurrentQ((prev) => prev + 1);
        setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
      } else {
        // All done — generate overall summary
        await generateSummary(updatedQs, apiKey);
      }
    } catch (err) {
      CustomAlert.alert('Error', 'Could not get feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Final summary ──────────────────────────────────────────────────────────
  const generateSummary = async (allQs, apiKey) => {
    try {
      const qa = allQs.map((q, i) =>
        `Q${i + 1}: ${q.question}\nAnswer: ${q.userAnswer}\nFeedback: ${q.feedback}`
      ).join('\n\n');

      const summary = await callGroq(apiKey, [
        {
          role: 'system',
          content: 'You are a career coach. Summarize a mock interview session in 3-4 sentences. Give an overall score out of 10, 1-2 strengths, and 1 key area to improve. Be encouraging.',
        },
        { role: 'user', content: `Interview session:\n\n${qa}` },
      ]);

      setResults({ questions: allQs, summary });
      setStage(STAGE.RESULTS);
    } catch (_) {
      setResults({ questions: allQs, summary: 'Interview complete! Review your answers and feedback above.' });
      setStage(STAGE.RESULTS);
    }
  };

  // ── Render: Topic Selection ────────────────────────────────────────────────
  if (stage === STAGE.TOPIC) {
    return (
      <>
        <AiCreditsModal visible={showCreditsModal} onClose={() => setShowCreditsModal(false)} onCreditsAdded={refreshCredits} />
        <PageTransition>
          <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#CBE7F7' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
              <TouchableOpacity onPress={() => router.back()} hitSlop={14} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>🎤 Mock Interview</Text>
              <View style={styles.creditPill}>
                <Ionicons name="flash" size={12} color="#8B5CF6" />
                <Text style={styles.creditPillText}>{credits}</Text>
              </View>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>Choose a topic:</Text>
              <View style={{ gap: 8, marginBottom: 20 }}>
                {TOPICS.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTopic(t === topic ? '' : t)}
                    style={[styles.topicChip, topic === t && styles.topicChipActive]}
                  >
                    <Text style={[styles.topicChipText, topic === t && styles.topicChipTextActive]}>{t}</Text>
                    {topic === t && <Ionicons name="checkmark-circle" size={18} color="#132F94" />}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionLabel, { marginBottom: 8 }]}>Or type your own:</Text>
              <TextInput
                style={styles.customInput}
                placeholder="e.g. Binary Search, Node.js, Docker..."
                placeholderTextColor="#9CA3AF"
                value={customTopic}
                onChangeText={(t) => { setCustomTopic(t); setTopic(''); }}
              />

              <TouchableOpacity
                style={[styles.startBtn, (loading) && { opacity: 0.6 }]}
                onPress={handleStart}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator size="small" color="white" />
                  : <>
                    <Ionicons name="mic" size={20} color="white" />
                    <Text style={styles.startBtnText}>Start Interview (1 credit)</Text>
                  </>
                }
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </PageTransition>
      </>
    );
  }

  // ── Render: Interview Q&A ─────────────────────────────────────────────────
  if (stage === STAGE.INTERVIEW) {
    const current = questions[currentQ];
    const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

    return (
      <PageTransition>
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#CBE7F7' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => CustomAlert.alert('Quit Interview?', 'Your progress will be lost.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Quit', style: 'destructive', onPress: () => router.back() },
            ])} hitSlop={14} style={styles.backBtn}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Question {currentQ + 1} / {TOTAL_QUESTIONS}</Text>
            <View style={styles.creditPill}>
              <Ionicons name="flash" size={12} color="#8B5CF6" />
              <Text style={styles.creditPillText}>{credits}</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" ref={scrollRef} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
            {/* Question card */}
            <View style={styles.questionCard}>
              <View style={styles.questionBadge}>
                <Text style={styles.questionBadgeText}>Q{currentQ + 1}</Text>
              </View>
              <Text style={styles.questionText}>{current?.question}</Text>
            </View>

            {/* Previous Q feedbacks */}
            {questions.slice(0, currentQ).map((q, i) => q.feedback ? (
              <View key={i} style={styles.feedbackCard}>
                <Text style={styles.feedbackQLabel}>Q{i + 1} Feedback</Text>
                <Markdown style={mdStyles}>{q.feedback}</Markdown>
              </View>
            ) : null)}

            {/* Answer input */}
            <Text style={styles.answerLabel}>Your Answer:</Text>
            <TextInput
              style={styles.answerInput}
              placeholder="Type your answer here..."
              placeholderTextColor="#9CA3AF"
              value={answerText}
              onChangeText={setAnswerText}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleSubmitAnswer}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator size="small" color="white" />
                : <>
                  <Text style={styles.submitBtnText}>
                    {currentQ + 1 < TOTAL_QUESTIONS ? 'Submit & Next →' : 'Submit & See Results 🏁'}
                  </Text>
                </>
              }
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </PageTransition>
    );
  }

  // ── Render: Results ────────────────────────────────────────────────────────
  if (stage === STAGE.RESULTS && results) {
    return (
      <PageTransition>
        <View style={{ flex: 1, backgroundColor: '#CBE7F7' }}>
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <View style={{ width: 32 }} />
            <Text style={styles.headerTitle}>🏁 Results</Text>
            <TouchableOpacity onPress={() => router.back()} hitSlop={14}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
            {/* Summary card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Overall Summary</Text>
              <Markdown style={mdStyles}>{results.summary}</Markdown>
            </View>

            {/* Per-question breakdown */}
            {results.questions.map((q, i) => (
              <View key={i} style={styles.resultCard}>
                <Text style={styles.resultQLabel}>Q{i + 1}: {q.question}</Text>
                <View style={styles.resultDivider} />
                <Text style={styles.resultAnswerLabel}>Your Answer:</Text>
                <Text style={styles.resultAnswer}>{q.userAnswer}</Text>
                <View style={[styles.resultDivider, { marginTop: 8 }]} />
                <Text style={styles.resultFeedbackLabel}>Feedback:</Text>
                <Markdown style={mdStyles}>{q.feedback}</Markdown>
              </View>
            ))}

            <TouchableOpacity style={styles.retryBtn} onPress={() => { setStage(STAGE.TOPIC); setTopic(''); setCustomTopic(''); setQuestions([]); }}>
              <Ionicons name="refresh" size={18} color="white" />
              <Text style={styles.retryBtnText}>Try Another Topic</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </PageTransition>
    );
  }

  return null;
}

const mdStyles = {
  body: { fontSize: 14, fontFamily: 'nunito', color: '#374151', lineHeight: 20 },
  strong: { fontFamily: 'nunito-bold', color: '#1F2937' },
  code_inline: { fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontSize: 13, backgroundColor: '#EDE9FE', color: '#6D28D9', borderRadius: 4, paddingHorizontal: 4 },
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#CBE7F7' },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: 'quicksand-bold', fontSize: 17, color: '#1F2937' },
  creditPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F5F3FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  creditPillText: { fontFamily: 'nunito-bold', fontSize: 13, color: '#8B5CF6' },
  progressTrack: { height: 5, backgroundColor: '#E9D5FF', marginHorizontal: 16, borderRadius: 4, marginBottom: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#132F94', borderRadius: 4 },
  sectionLabel: { fontFamily: 'quicksand-bold', fontSize: 16, color: '#1F2937', marginBottom: 12 },
  topicChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#E5E7EB' },
  topicChipActive: { borderColor: '#132F94', backgroundColor: '#EEF2FF' },
  topicChipText: { fontFamily: 'nunito', fontSize: 14, color: '#4B5563' },
  topicChipTextActive: { fontFamily: 'nunito-bold', color: '#132F94' },
  customInput: { backgroundColor: 'white', borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 12, fontFamily: 'nunito', fontSize: 14, color: '#1F2937', marginBottom: 24 },
  startBtn: { backgroundColor: '#132F94', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#132F94', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  startBtnText: { fontFamily: 'quicksand-bold', fontSize: 16, color: 'white' },
  questionCard: { backgroundColor: '#132F94', borderRadius: 20, padding: 20, marginBottom: 16 },
  questionBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  questionBadgeText: { fontFamily: 'nunito-bold', fontSize: 12, color: 'white' },
  questionText: { fontFamily: 'quicksand-bold', fontSize: 17, color: 'white', lineHeight: 24 },
  feedbackCard: { backgroundColor: '#ECFDF5', borderRadius: 14, padding: 14, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#10B981' },
  feedbackQLabel: { fontFamily: 'nunito-bold', fontSize: 13, color: '#065F46', marginBottom: 6 },
  answerLabel: { fontFamily: 'quicksand-bold', fontSize: 15, color: '#1F2937', marginBottom: 8 },
  answerInput: { backgroundColor: 'white', borderRadius: 14, borderWidth: 1.5, borderColor: '#DDD6FE', padding: 14, fontFamily: 'nunito', fontSize: 14, color: '#1F2937', minHeight: 140, marginBottom: 16 },
  submitBtn: { backgroundColor: '#132F94', borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#132F94', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  submitBtnText: { fontFamily: 'quicksand-bold', fontSize: 16, color: 'white' },
  summaryCard: { backgroundColor: '#132F94', borderRadius: 20, padding: 20, marginBottom: 16 },
  summaryTitle: { fontFamily: 'quicksand-bold', fontSize: 18, color: 'white', marginBottom: 10 },
  resultCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#8B5CF6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  resultQLabel: { fontFamily: 'quicksand-bold', fontSize: 14, color: '#1F2937', marginBottom: 8, lineHeight: 20 },
  resultDivider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 8 },
  resultAnswerLabel: { fontFamily: 'nunito-bold', fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  resultAnswer: { fontFamily: 'nunito', fontSize: 14, color: '#4B5563', lineHeight: 20 },
  resultFeedbackLabel: { fontFamily: 'nunito-bold', fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  retryBtn: { backgroundColor: '#132F94', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8 },
  retryBtnText: { fontFamily: 'quicksand-bold', fontSize: 16, color: 'white' },
});
