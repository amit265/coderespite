import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "../../services/storage";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import colors from "../../constants/colors";
import { getGroqApiKey } from "../../services/groqService";
import { allCoursesContext, userDetailsContext, aiCreditsContext } from "../../context/context";
import { deductAiCredit } from "../../services/aiCreditsService";
import AiCreditsModal from "../../components/AiCreditsModal";
import PageTransition from "../../components/PageTransition";
import { CustomAlert } from "../../components/shared/GlobalAlert";

// 5-tier model fallback chain — same as destya-fitness-app
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "qwen/qwen3.6-27b",
  "groq/compound",
];
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// Cross-platform clipboard helper
// - Web: uses navigator.clipboard (no native module needed)
// - Native: opens the OS share sheet which includes a "Copy" action
const copyToClipboard = async (text) => {
  if (Platform.OS === "web") {
    await navigator.clipboard.writeText(text);
  } else {
    await Share.share({ message: text });
  }
};

// How many messages to display at once in the FlatList
const PAGE_SIZE = 40;


export default function MeowgrammerChat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { allCourses } = useContext(allCoursesContext);
  const { userData } = useContext(userDetailsContext);

  // allMessages = full history kept in memory (for API context window)
  // displayMessages = paginated slice shown in the FlatList
  const allMessagesRef = useRef([]);
  const [displayMessages, setDisplayMessages] = useState([]);
  const [pageStart, setPageStart] = useState(0);   // index into allMessages for current page top
  const [hasEarlier, setHasEarlier] = useState(false);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null); // tracks which message was just copied
  const flatListRef = useRef(null);

  const { credits, refreshCredits } = useContext(aiCreditsContext);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // ─── Build dynamic system prompt from app courses ──────────────────────────
  const buildSystemPrompt = useCallback(() => {
    const courseList = (allCourses || [])
      .filter((c) => !c.id?.startsWith("AI_ROADMAP"))
      .map((c) => {
        const modules = (c.modules || []).map((m) => `  • ${m.title}`).join("\n");
        return `📘 **${c.title}**\n${modules}`;
      })
      .join("\n\n");

    return `You are "Meowgrammer" 🐾, a friendly, patient developer AI coding coach who loves cats.
Your goal is to help users learn programming using the CodeRespite app.

## CodeRespite App Content
The app has the following courses and modules that users can study:

${courseList || "Courses are still loading..."}

When a user asks about a topic that is covered by one of these courses, proactively mention that they can find it in the app. For example:
> 🐾 *Psst — you can practice this in the app! Check out the **React Native** course → **State Management and Hooks** module.*

## Rules
1. Explain coding concepts using simple, humorous cat-themed analogies.
2. Use cat emojis and sound effects organically (*purr*, *meow*, *hiss* for bugs).
3. Provide clean code snippets in markdown code blocks when helpful.
4. Keep answers concise and easy to read.
5. Whenever relevant, reference specific courses or modules from the app list above by name.
6. If the user asks off-topic questions (unrelated to coding/learning), politely redirect them with a cat joke.`;
  }, [allCourses]);

  // ─── Pagination helpers ────────────────────────────────────────────────────
  const applyPage = useCallback((allMsgs, start) => {
    const slice = allMsgs.slice(start);
    setDisplayMessages(slice);
    setHasEarlier(start > 0);
  }, []);

  // ─── Load chat history from AsyncStorage ──────────────────────────────────
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem("@meowgrammer_chat_history");
        if (stored) {
          const parsed = JSON.parse(stored);
          allMessagesRef.current = parsed;
          // Show only the last PAGE_SIZE messages initially
          const start = Math.max(0, parsed.length - PAGE_SIZE);
          setPageStart(start);
          applyPage(parsed, start);
        } else {
          const welcomeMsg = {
            id: "welcome",
            role: "assistant",
            content: "Meow! 🐾 I am your **Meowgrammer** coding coach! Ask me any programming question or paste your code here, and let's learn together! *purr*",
            timestamp: Date.now(),
          };
          allMessagesRef.current = [welcomeMsg];
          setDisplayMessages([welcomeMsg]);
          setHasEarlier(false);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    loadChatHistory();
  }, [applyPage]);

  const saveChatHistory = useCallback(async (msgs) => {
    try {
      await AsyncStorage.setItem("@meowgrammer_chat_history", JSON.stringify(msgs));
    } catch (err) {
      console.error("Failed to save chat history:", err);
    }
  }, []);

  // ─── Load earlier messages (pagination) ───────────────────────────────────
  const handleLoadEarlier = useCallback(async () => {
    if (loadingEarlier || !hasEarlier) return;
    setLoadingEarlier(true);
    const newStart = Math.max(0, pageStart - PAGE_SIZE);
    setPageStart(newStart);
    applyPage(allMessagesRef.current, newStart);
    setLoadingEarlier(false);
  }, [loadingEarlier, hasEarlier, pageStart, applyPage]);

  // ─── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    // Check Freemium Limits
    const ok = await deductAiCredit();
    if (!ok) {
      setShowCreditsModal(true);
      return;
    }
    if (refreshCredits) await refreshCredits();

    const userMsg = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const allUpdated = [...allMessagesRef.current, userMsg];
    allMessagesRef.current = allUpdated;
    // Always show the very latest page when user sends
    const newStart = Math.max(0, allUpdated.length - PAGE_SIZE);
    setPageStart(newStart);
    applyPage(allUpdated, newStart);
    setInputText("");
    saveChatHistory(allUpdated);
    setLoading(true);

    try {
      const apiKey = await getGroqApiKey();
      if (!apiKey) throw new Error("No API Key configured");

      // Send last 12 messages as context to keep tokens low
      const apiMessages = [
        { role: "system", content: buildSystemPrompt() },
        ...allUpdated.slice(-12).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      let replyContent = null;
      let lastError = null;

      for (const model of GROQ_MODELS) {
        try {
          const response = await fetch(GROQ_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: apiMessages,
              temperature: 0.7,
            }),
          });

          if (!response.ok) throw new Error(`HTTP ${response.status} from model ${model}`);

          const data = await response.json();
          const content = data.choices[0]?.message?.content?.trim();
          if (content) {
            replyContent = content;
            break; // success — stop trying fallbacks
          }
          throw new Error("Empty response from model: " + model);
        } catch (err) {
          console.warn(`[Chat] Model "${model}" failed, trying next... Error:`, err.message || err);
          lastError = err;
        }
      }

      if (!replyContent) throw lastError || new Error("All models failed");

      const assistantMsg = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: replyContent,
        timestamp: Date.now(),
      };

      const finalAll = [...allUpdated, assistantMsg];
      allMessagesRef.current = finalAll;
      const finalStart = Math.max(0, finalAll.length - PAGE_SIZE);
      setPageStart(finalStart);
      applyPage(finalAll, finalStart);
      saveChatHistory(finalAll);
    } catch (error) {
      CustomAlert.alert(
        "Chat Connection Issue",
        "Meowgrammer could not connect. Please verify your connection or set up a free Groq API Key in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Configure Key", onPress: () => router.push("/settings/aiSetup") },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Clear history ─────────────────────────────────────────────────────────
  const handleClear = () => {
    CustomAlert.alert(
      "Clear Chat History",
      "Are you sure you want to delete all messages?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            const welcomeMsg = {
              id: "welcome",
              role: "assistant",
              content: "Meow! 🐾 I am your **Meowgrammer** coding coach! Ask me any programming question or paste your code here, and let's learn together! *purr*",
              timestamp: Date.now(),
            };
            allMessagesRef.current = [welcomeMsg];
            setDisplayMessages([welcomeMsg]);
            setHasEarlier(false);
            setPageStart(0);
            await AsyncStorage.removeItem("@meowgrammer_chat_history");
          },
        },
      ]
    );
  };

  // ─── Copy handler ──────────────────────────────────────────────────────────
  const handleCopy = useCallback(async (id, content) => {
    try {
      await copyToClipboard(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      CustomAlert.alert("Copy failed", "Could not copy to clipboard.");
    }
  }, []);

  // ─── Report handler ────────────────────────────────────────────────────────
  const handleReport = useCallback((id) => {
    CustomAlert.alert(
      "Report Response",
      "Why are you reporting this response?",
      [
        { text: "Inaccurate / Misleading", onPress: () => submitReport(id, "inaccurate") },
        { text: "Inappropriate Content",   onPress: () => submitReport(id, "inappropriate") },
        { text: "Off-Topic",               onPress: () => submitReport(id, "off_topic") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }, []);

  const submitReport = (id, reason) => {
    // TODO: send report to backend / Firestore
    console.log("[Report] messageId:", id, "reason:", reason);
    CustomAlert.alert(
      "Thank you 🐾",
      "Your report has been submitted. We review all reports to keep Meowgrammer safe and accurate."
    );
  };

  const renderItem = ({ item }) => {
    const isUser = item.role === "user";
    const wasCopied = copiedId === item.id;
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={{ fontSize: 16 }}>🐾</Text>
          </View>
        )}
        <View style={styles.bubbleCol}>
          <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
            {isUser ? (
              <Text style={styles.userText}>{item.content}</Text>
            ) : (
              <Markdown
                style={markdownStyles}
                rules={{
                  fence: (node, children, parent, styles) => (
                    <View
                      key={node.key}
                      style={{
                        backgroundColor: "#1E0D47",
                        borderRadius: 10,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        marginVertical: 8,
                        borderWidth: 1,
                        borderColor: "#8B5CF6",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
                          fontSize: 13,
                          color: "#C4B5FD",
                          lineHeight: 20,
                        }}
                        selectable
                      >
                        {node.content}
                      </Text>
                    </View>
                  ),
                }}
              >
                {item.content}
              </Markdown>
            )}
          </View>

          {/* Action row — only for AI responses */}
          {!isUser && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => handleCopy(item.id, item.content)}
                style={styles.actionBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={wasCopied ? "checkmark-done-outline" : "copy-outline"}
                  size={15}
                  color={wasCopied ? "#10B981" : "#9CA3AF"}
                />
              </TouchableOpacity>

              <View style={styles.actionDivider} />

              <TouchableOpacity
                onPress={() => handleReport(item.id)}
                style={styles.actionBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="flag-outline" size={15} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
    <AiCreditsModal visible={showCreditsModal} onClose={() => setShowCreditsModal(false)} onCreditsAdded={refreshCredits} />
    <PageTransition>
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={15} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>🐾 Q&A Tutor</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F5F3FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            <Ionicons name="flash" size={12} color="#8B5CF6" />
            <Text style={{ fontFamily: 'nunito-bold', fontSize: 13, color: '#8B5CF6' }}>{credits}</Text>
          </View>
          <Pressable onPress={handleClear} hitSlop={15} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      {/* Messages — flex:1 so it fills available space and input stays at bottom */}
      <FlatList
        ref={flatListRef}
        data={displayMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // ─── Performance tuning ────────────────────────────────────────────
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
        // ─── Scroll to bottom when new messages arrive ─────────────────────
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        // ─── "Load Earlier" header ─────────────────────────────────────────
        ListHeaderComponent={
          hasEarlier ? (
            <TouchableOpacity
              onPress={handleLoadEarlier}
              style={styles.loadEarlierBtn}
              disabled={loadingEarlier}
            >
              {loadingEarlier ? (
                <ActivityIndicator size="small" color="#8B5CF6" />
              ) : (
                <Text style={styles.loadEarlierText}>⬆ Load earlier messages</Text>
              )}
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Typing indicator */}
      {loading && (
        <View style={styles.loadingBubbleRow}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 16 }}>🐾</Text>
          </View>
          <View style={[styles.bubble, styles.assistantBubble, styles.loadingBubble]}>
            <ActivityIndicator size="small" color="#8B5CF6" />
          </View>
        </View>
      )}

      {/* Input panel — stays pinned just above the keyboard */}
      <View style={styles.inputWrapper}>
        {/* Row: text field + send button */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask a coding question... meow!"
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
            maxLength={1000}
            returnKeyType="default"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
            disabled={!inputText.trim() || loading}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* AI Disclaimer */}
        <Text style={[styles.disclaimer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          🤖 Meowgrammer uses AI and may make mistakes. Do not rely on it for critical decisions.
        </Text>
      </View>
    </KeyboardAvoidingView>
    </PageTransition>
    </>
  );
}

// Markdown styles for AI (assistant) message bubbles
const markdownStyles = {
  body: {
    fontSize: 14,
    fontFamily: "nunito",
    color: "#1F2937",
    lineHeight: 21,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 6,
  },
  strong: {
    fontFamily: "nunito-bold",
    color: "#1F2937",
  },
  em: {
    fontStyle: "italic",
    color: "#4B5563",
  },
  // Inline code — e.g. `useState`
  code_inline: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 13,
    backgroundColor: "#EDE9FE",
    color: "#6D28D9",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  // Fenced code blocks — ``` js ... ```
  fence: {
    backgroundColor: "#1E0D47",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },
  code_block: {
    backgroundColor: "#1E0D47",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#8B5CF6",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontSize: 13,
    color: "#A78BFA",
    lineHeight: 20,
  },
  // List items
  bullet_list: {
    marginLeft: 4,
    marginBottom: 4,
  },
  ordered_list: {
    marginLeft: 4,
    marginBottom: 4,
  },
  list_item: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet_list_icon: {
    color: "#8B5CF6",
    fontSize: 14,
    marginRight: 6,
    lineHeight: 21,
  },
  ordered_list_icon: {
    color: "#8B5CF6",
    fontSize: 14,
    fontFamily: "nunito-bold",
    marginRight: 6,
    lineHeight: 21,
  },
  // Headings
  heading1: {
    fontSize: 18,
    fontFamily: "nunito-bold",
    color: "#1F2937",
    marginBottom: 6,
    marginTop: 4,
  },
  heading2: {
    fontSize: 16,
    fontFamily: "nunito-bold",
    color: "#1F2937",
    marginBottom: 4,
    marginTop: 2,
  },
  heading3: {
    fontSize: 15,
    fontFamily: "nunito-bold",
    color: "#374151",
    marginBottom: 4,
    marginTop: 2,
  },
  // Blockquote
  blockquote: {
    backgroundColor: "#F5F3FF",
    borderLeftWidth: 3,
    borderLeftColor: "#8B5CF6",
    paddingLeft: 10,
    paddingVertical: 4,
    marginVertical: 4,
    borderRadius: 4,
  },
  // Horizontal rule
  hr: {
    borderColor: "#E9D5FF",
    marginVertical: 8,
  },
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#CBE7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "nunito-bold",
    color: "#1F2937",
  },
  clearButton: {
    padding: 4,
  },
  loadEarlierBtn: {
    alignSelf: "center",
    marginVertical: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#F5F3FF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    minWidth: 80,
    alignItems: "center",
  },
  loadEarlierText: {
    color: "#7C3AED",
    fontSize: 13,
    fontFamily: "nunito-bold",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 4,
    maxWidth: "92%",
    alignItems: "flex-start",
  },
  userRow: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  assistantRow: {
    alignSelf: "flex-start",
    flexDirection: "column",
  },
  // Column that holds the bubble + action row stacked vertically
  bubbleCol: {
    flexShrink: 1,
    flexDirection: "column",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
    paddingLeft: 4,
    gap: 2,
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F5F3FF",
  },
  actionDivider: {
    width: 1,
    height: 14,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "100%",
  },
  userBubble: {
    backgroundColor: "#8B5CF6",
    borderBottomRightRadius: 4,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  assistantBubble: {
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E9D5FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    fontFamily: "nunito",
    lineHeight: 21,
  },
  userText: {
    color: "white",
  },
  assistantText: {
    color: "#1F2937",
  },
  loadingBubbleRow: {
    flexDirection: "column",
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: "flex-start",
  },
  loadingBubble: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 56,
    paddingVertical: 12,
  },
  inputWrapper: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E9D5FF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
  },
  disclaimer: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: "nunito",
    color: "#9CA3AF",
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "nunito",
    color: "#1F2937",
    backgroundColor: "#F5F3FF",
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    maxHeight: 120,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 0,
  },
  sendButtonDisabled: {
    backgroundColor: "#C4B5FD",
    shadowOpacity: 0,
    elevation: 0,
  },
});
