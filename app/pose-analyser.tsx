import { Stack } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useEffect, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import { WebView } from 'react-native-webview';
import { readFile } from 'react-native-fs';

export default function PoseAnalyzerScreen() {
  const cameraRef = useRef<Camera>(null);
  const webviewRef = useRef<any>(null);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const [htmlUri, setHtmlUri] = useState<string | null>(null);
  const [movementData, setMovementData] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [lastPhotoBase64, setLastPhotoBase64] = useState<string | null>(null); // 👈 ajouté
  const [isCameraReady, setIsCameraReady] = useState(false); // Nouvel état pour savoir si la caméra est prête

  const log = (message: string) => {
    console.log(message);
    setLogMessages(prev => [...prev.slice(-20), message]);
  };

  useEffect(() => {
    if (hasPermission) {
      log('[Permission] Caméra autorisée');
    } else {
      log('[Permission] Caméra NON autorisée');
    }
  }, [hasPermission]);

  useEffect(() => {
    if (device) {
      log(`[Camera] Appareil détecté: ${device.name}`);
    } else {
      log('[Camera] Aucun appareil détecté');
    }
  }, [device]);

  useEffect(() => {
    (async () => {
      log('[Init] Demande de permission...');
      await requestPermission();
      log('[Init] Chargement du fichier HTML...');
      const htmlAsset = Asset.fromModule(require('../assets/pose/index.html'));
      await htmlAsset.downloadAsync();
      log(`[Init] HTML téléchargé : ${htmlAsset.localUri}`);
      setHtmlUri(htmlAsset.localUri!);
    })();
  }, []);

  useEffect(() => {
    let interval: any;

    if (hasPermission && device && isCameraReady) { // Nous vérifions ici si la caméra est prête
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
          if (imageBase64) {
            setLastPhotoBase64(imageBase64); // 👈 on stocke la dernière image
            if (webviewRef.current) {
              log('[Capture] Image envoyée au WebView.');
              webviewRef.current.postMessage(imageBase64);
            } else {
              log('[Capture] WebView non disponible.');
            }
          } else {
            log('[Capture] Image non disponible.');
          }
        } catch (err: any) {
          log(`[Erreur] Capture échouée: ${err.message}`);
        }
      }, 1000);
    } else {
      log('[Capture] Conditions non remplies pour la capture.');
      log(`${hasPermission}`);
      log(`${device}`);
      log(`${isCameraReady}`);
    }

    return () => {
      log('[Cleanup] Arrêt de la capture.');
      clearInterval(interval);
    };
  }, [hasPermission, device, isCameraReady]); // L'effet dépend maintenant de la caméra prête

  const handleMessage = (event: any) => {
    console.log(1)
    try {
      const raw = event.nativeEvent.data;
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        const summary = `👤 ${data.length} points reçus (ex: ${data[0]?.x?.toFixed(2)}, ${data[0]?.y?.toFixed(2)})`;
        log(`[Pose] ${summary}`);
        setMovementData(summary);
      } else {
        log(`[WebView] Données non reconnues`);
      }

      if (data.status === "annotated_image") {
        log(`[WebView] Image annotée reçue`);
        setLastPhotoBase64(data.imageBase64.replace(/^data:image\/jpeg;base64,/, ""));
      }
    } catch (e : any) {
      log(`[Erreur] Parsing message: ${e.message}`);
    }
  };

  if (!hasPermission || !device || !htmlUri) {
    return <Text>Chargement ou permission en attente…</Text>;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Pose Analyd' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Analyseur de Mouvements</Text>

        {!isCameraReady && ( // Affiche un indicateur de chargement tant que la caméra n'est pas prête
          <ActivityIndicator size="large" color="#0000ff" />
        )}

        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={true}
          photo={true}
          onInitialized={() => {
            log("Caméra initialisée !");
            setIsCameraReady(true); // Une fois la caméra initialisée, on met à jour l'état
          }}
        />

        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ uri: htmlUri }}
          javaScriptEnabled={true}  // Active JavaScript
          domStorageEnabled={true}  // Active le stockage local
          allowFileAccess={true}    // Autorise l'accès aux fichiers locaux
          //onMessage={handleMessage}
          onMessage={(event) => console.log("[React Native] Message reçu:", event.nativeEvent.data)}  // Log pour recevoir les messages
          onLoad={() => console.log('WebView a bien été chargé')}
          onLoadEnd={() => console.log('Le fichier HTML est entièrement chargé')}
          style={styles.webview}
        />

        {lastPhotoBase64 && (
          <View style={styles.previewContainer}>
            <Text style={styles.resultText}>Dernière image capturée :</Text>
           
          </View>
        )}

        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>Logs:</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
            {logMessages.map((msg, index) => (
              <Text key={index} style={styles.logText}>{msg}</Text>
            ))}
          </ScrollView>
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
    height: 100,
    width: 100,
    opacity: 0,
    position: 'absolute',
    backgroundColor : "red"
  },
  webview: {
    flex: 1,
    
    borderRadius: 10,
    overflow: 'hidden',
  },
  previewContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 300,
    resizeMode: 'cover',
    borderRadius: 10,
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
