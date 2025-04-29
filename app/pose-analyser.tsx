import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { useState, useEffect } from 'react';

export default function PoseAnalyzerScreen() {
  const [htmlUri, setHtmlUri] = useState<string | null>(null);
  const [movementData, setMovementData] = useState<string | null>(null);

  // Charge le fichier HTML local au démarrage
  useEffect(() => {
    (async () => {
      const htmlAsset = Asset.fromModule(require('../assets/pose/pose.html'));
      await htmlAsset.downloadAsync();
      setHtmlUri(htmlAsset.localUri!);
    })();
  }, []);

  const handleMessage = (event: any) => {
    setMovementData(event.nativeEvent.data);
  };

  if (!htmlUri) {
    return <Text>Chargement...</Text>;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Pose Analyzer' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Analyseur de Mouvements</Text>
        <WebView
          originWhitelist={['*']}
          source={{ uri: htmlUri }}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          onMessage={handleMessage}
          style={styles.webview}
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
    paddingHorizontal: 10 
  },

  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    textAlign: 'center' 
  },

  webview: { 
    flex: 1, 
    borderRadius: 10, 
    overflow: 'hidden' 
  },

  result: { 
    padding: 10, 
    backgroundColor: '#eee', 
    borderRadius: 8, 
    marginTop: 10 
  },

  resultText: { 
    fontWeight: '600', 
    marginBottom: 5 
  },
});