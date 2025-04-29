import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { WebView } from 'react-native-webview';
import { useState } from 'react';

export default function PoseAnalyzerScreen() {
  const [movementData, setMovementData] = useState<string | null>(null);

  const handleMessage = (event: any) => {
    const data = event.nativeEvent.data;
    console.log("📦 Data from WebView:", data);
    setMovementData(data); // Affiche les mouvements ou scores reçus
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Pose Analyzer' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Analyseur de Mouvements</Text>
        <WebView
        source={{ uri: 'https://storage.googleapis.com/mediapipe-assets/pose_landmarker_lite/index.html' }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        />
        {movementData && (
          <View style={styles.result}>
            <Text style={styles.resultText}>Dernier mouvement :</Text>
            <Text>{movementData}</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  webview: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  result: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginTop: 10,
  },
  resultText: {
    fontWeight: '600',
    marginBottom: 5,
  },
});
