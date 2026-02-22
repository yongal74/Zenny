import React, { useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/api";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

export default function ChatScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: "Hey! I'm Maumie, your emotional companion 😊\nHow's your day going? Feel free to share anything." },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: inputText.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      let convId = conversationId;
      if (!convId) {
        const createRes = await fetch(getApiUrl("/api/conversations"), {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Chat", mode: "chat" }),
        });
        const conv = await createRes.json();
        convId = conv.id;
        setConversationId(convId);
      }

      const res = await fetch(getApiUrl(`/api/conversations/${convId}/messages`), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMsg.content }),
      });

      const assistantId = (Date.now() + 1).toString();
      let assistantContent = "";
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const text = decoder.decode(value, { stream: true });
            const lines = text.split("\n").filter((l) => l.startsWith("data: "));
            for (const line of lines) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  assistantContent += data.content;
                  setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: assistantContent } : m));
                }
              } catch {}
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 2).toString(), role: "assistant", content: "Sorry, the connection seems unstable. Could you try again?" }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, conversationId]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.messageBubble, isUser ? [styles.userBubble, { backgroundColor: colors.tint }] : [styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }]]}>
        {!isUser && <Text style={styles.charAvatar}>☁️</Text>}
        <Text style={[styles.messageText, { color: isUser ? "#1B2A4A" : colors.text }]}>{item.content || (isLoading ? "..." : "")}</Text>
      </View>
    );
  };

  const suggestions = ["I'm feeling complicated today", "Something good happened", "I'm stressed out"];

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={90}>
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chat with Maumie</Text>
      </View>

      <FlatList ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" />

      {messages.length <= 1 && (
        <View style={styles.suggestionsRow}>
          {suggestions.map((s) => (
            <TouchableOpacity key={s} style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setInputText(s)}>
              <Text style={[styles.suggestionText, { color: colors.tint }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border, paddingBottom: Platform.OS === "web" ? 34 : Math.max(insets.bottom, 8) }]}>
        <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          value={inputText} onChangeText={setInputText}
          onSubmitEditing={sendMessage} multiline maxLength={500} />
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.tint : colors.border }]}
          onPress={sendMessage} disabled={!inputText.trim() || isLoading}>
          {isLoading ? <ActivityIndicator size="small" color="#1B2A4A" /> : <Ionicons name="arrow-up" size={20} color="#1B2A4A" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  messageList: { paddingHorizontal: 16, paddingBottom: 8 },
  messageBubble: { maxWidth: "80%", padding: 14, borderRadius: 18, marginVertical: 4 },
  userBubble: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  assistantBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 4, borderWidth: 1, flexDirection: "row", gap: 8, alignItems: "flex-start" },
  charAvatar: { fontSize: 20 },
  messageText: { fontSize: 15, lineHeight: 22, flex: 1 },
  suggestionsRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  suggestionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  suggestionText: { fontSize: 13 },
  inputContainer: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12, paddingTop: 8, borderTopWidth: 1, gap: 8 },
  input: { flex: 1, minHeight: 40, maxHeight: 100, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginBottom: 1 },
});
