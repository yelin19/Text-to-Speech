import { useCallback, useState } from "react";
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { LOCAL_APP_BASE_URL, LOCAL_APP_HTML } from "./local-app-shell";

export default function App() {
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const retry = useCallback(() => {
    setHasError(false);
    setLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  if (Platform.OS === "web") {
    return (
      <View style={styles.messageScreen}>
        <Text style={styles.logo}>SayIt</Text>
        <Text style={styles.title}>SayIt APK</Text>
        <Text style={styles.message}>SayIt ကို APK ထဲတွင် ပါဝင်သော အက်ပ်ဖြင့် ဖွင့်ပေးပါမည်။</Text>
        <Pressable style={styles.button} onPress={() => Linking.openURL("https://huggingface.co/yelin201875/Yelinvoice")}>
          <Text style={styles.buttonText}>Voice model အကြောင်း</Text>
        </Pressable>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.messageScreen}>
        <Text style={styles.logo}>SayIt</Text>
        <Text style={styles.title}>ဖွင့်မရပါ</Text>
        <Text style={styles.message}>APK ထဲရှိ အက်ပ်ဖိုင်များ ဖွင့်မရပါ။ APK ကို ပြန်တင်သွင်းပြီး ထပ်ကြိုးစားပါ။</Text>
        <Pressable style={styles.button} onPress={retry}>
          <Text style={styles.buttonText}>ထပ်ကြိုးစားပါ</Text>
        </Pressable>
        <Pressable style={styles.linkButton} onPress={() => Linking.openURL("https://huggingface.co/yelin201875/Yelinvoice")}>
          <Text style={styles.linkText}>အသံမော်ဒယ်၏ ရင်းမြစ်</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {loading ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <View style={styles.loadingBadge}>
            <ActivityIndicator color="#f2b544" />
            <Text style={styles.loadingText}>SagaPyaw ဖွင့်နေသည်…</Text>
          </View>
        </View>
      ) : null}
      <WebView
        key={reloadKey}
        source={{ html: LOCAL_APP_HTML, baseUrl: LOCAL_APP_BASE_URL }}
        style={styles.webview}
        originWhitelist={["https://*"]}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        onLoadStart={() => {
          setLoading(true);
          setHasError(false);
        }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setHasError(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1115" },
  webview: { flex: 1, backgroundColor: "#0f1115" },
  loadingOverlay: { ...StyleSheet.absoluteFill, zIndex: 2, alignItems: "center", justifyContent: "center", backgroundColor: "#0f1115" },
  loadingBadge: { minWidth: 190, paddingHorizontal: 20, paddingVertical: 18, borderRadius: 16, backgroundColor: "#171a21", borderWidth: 1, borderColor: "#262b35", alignItems: "center", gap: 10 },
  loadingText: { color: "#e6e9ef", fontSize: 14 },
  messageScreen: { flex: 1, backgroundColor: "#0f1115", alignItems: "center", justifyContent: "center", padding: 24 },
  logo: { color: "#f2b544", fontSize: 32, fontWeight: "800", marginBottom: 18 },
  title: { color: "#e6e9ef", fontSize: 21, fontWeight: "700", marginBottom: 10 },
  message: { color: "#8b93a3", textAlign: "center", lineHeight: 24, marginBottom: 22 },
  button: { width: "100%", maxWidth: 340, minHeight: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#123047", borderWidth: 1, borderColor: "#23577a" },
  buttonText: { color: "#7cc4ff", fontSize: 16, fontWeight: "700" },
  linkButton: { padding: 14 },
  linkText: { color: "#8b93a3", fontSize: 14 },
});
