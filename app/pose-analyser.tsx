import { Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useEffect, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import { WebView } from 'react-native-webview';

export default function PoseAnalyzerScreen() {
  const cameraRef = useRef<Camera>(null);
  const webviewRef = useRef<any>(null);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const [htmlUri, setHtmlUri] = useState<string | null>(null);
  const [movementData, setMovementData] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const log = (message: string) => {
    console.log(message);
    setLogMessages(prev => [...prev.slice(-20), message]);
  };

  // Log permission status
  useEffect(() => {
    if (hasPermission) {
      log('[Permission] Caméra autorisée');
    } else {
      log('[Permission] Caméra NON autorisée');
    }
  }, [hasPermission]);

  // Log camera device availability
  useEffect(() => {
    if (device) {
      log(`[Camera] Appareil détecté: ${device.name}`);
    } else {
      log('[Camera] Aucun appareil détecté');
    }
  }, [device]);

  // Init HTML asset and permissions
  useEffect(() => {
    (async () => {
      log('[Init] Demande de permission...');
      await requestPermission();
      log('[Init] Chargement du fichier HTML...');
      const htmlAsset = Asset.fromModule(require('../assets/pose/index_2.html'));
      await htmlAsset.downloadAsync();
      log(`[Init] HTML téléchargé : ${htmlAsset.localUri}`);
      setHtmlUri(htmlAsset.localUri!);
    })();
  }, []);

  // Start camera capture loop
  useEffect(() => {
    let interval: any;

    if (hasPermission && device && cameraRef.current) {
      log('[Capture] Démarrage de la capture toutes les secondes...');
      interval = setInterval(async () => {
        try {
          if (!cameraRef.current) {
            log('[Capture] Référence caméra invalide.');
            return;
          }

          log('[Capture] Prise de photo...');
          const photo = await cameraRef.current.takePhoto();

          const imageBase64 = photo?.path && await toBase64(photo.path);
          if (imageBase64 && webviewRef.current) {
            log('[Capture] Image envoyée au WebView.');
            webviewRef.current.postMessage(imageBase64);
          } else {
            log('[Capture] Image ou WebView indisponible.');
          }
        } catch (err : any) {
          log(`[Erreur] Capture échouée: ${err.message}`);
        }
      }, 1000);
    } else {
      log('[Capture] Conditions non remplies pour la capture.');
    }

    return () => {
      log('[Cleanup] Arrêt de la capture.');
      clearInterval(interval);
    };
  }, [hasPermission, device]);

  // WebView message handling
  const handleMessage = (event: any) => {
    log(`[WebView] Message reçu: ${event.nativeEvent.data}`);
    setMovementData(event.nativeEvent.data);
  };

  if (!hasPermission || !device || !htmlUri) {
    log('[UI] Attente des conditions de démarrage...');
    return <Text>Chargement ou permission en attente…</Text>;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Pose Analyzer' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Analyseur de Mouvements</Text>

        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={true}
          photo={true}
        />

        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ uri: htmlUri }}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          onMessage={handleMessage}
          style={styles.webview}
        />

        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>Logs:</Text>
          {logMessages.map((msg, index) => (
            <Text key={index} style={styles.logText}>{msg}</Text>
          ))}
        </View>

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

// 🛠️ Helper pour convertir une image en base64
import { readFile } from 'react-native-fs';
const toBase64 = async (filePath: string): Promise<string> => {
  return await readFile(filePath, 'base64');
};

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
  camera: {
    height: 1,
    width: 1,
    opacity: 0,
    position: 'absolute',
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
  logContainer: {
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    maxHeight: 150,
  },
  logTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  logText: {
    color: '#ccc',
    fontSize: 12,
  },
});
