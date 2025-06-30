import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { NativeModules } from 'react-native';
import { readFile } from 'react-native-fs';

const { PoseModule } = NativeModules;

export default function App() {
  const [rawResult, setRawResult] = useState<string>('');
  const [landmarksTextList, setLandmarksTextList] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [frameLogs, setFrameLogs] = useState<string[]>([]);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

  // 📸 Demande de permission caméra
  useEffect(() => {
    (async () => {
      const status = await requestPermission();
      console.log(`[Permission] Caméra: ${status}`);
    })();
  }, []);

  useEffect(() => {
    if (device) {
      console.log(`[Camera] Appareil détecté: ${device.name}`);
    } else {
      console.log('[Camera] Aucun appareil détecté');
    }
  }, [device]);

  // ✅ Capture automatique 2x/sec une fois la caméra prête
  useEffect(() => {
    let interval: any;

    if (isCameraReady && hasPermission && device && cameraRef.current) {
      interval = setInterval(async () => {
        try {
          const photo = await cameraRef.current?.takePhoto({
            //qualityPrioritization: 'speed', // optionnel
            flash: 'off',
          });

          if (photo?.path) {
            const base64 = await readFile(photo.path, 'base64');
            console.log('[Frame] Image capturée (base64)', base64.slice(0, 100) + '...');

            setFrameLogs(prev => [...prev.slice(-10), base64.slice(0, 100) + '...']);
          }
        } catch (e: any) {
          console.error('[Erreur] Capture échouée', e.message);
        }
      }, 500); // toutes les 500 ms (2 fps)
    }

    return () => clearInterval(interval);
  }, [isCameraReady, hasPermission, device]);

  if (!hasPermission || !device) {
    return <Text style={{ marginTop: 40, textAlign: 'center' }}>⏳ Chargement caméra ou permission…</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {!isCameraReady && (
        <ActivityIndicator size="large" color="#007aff" style={{ marginTop: 20 }} />
      )}

      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={() => {
          console.log('[Camera] Caméra initialisée !');
          setIsCameraReady(true);
        }}
      />

      <View style={styles.overlay}>
        <Text style={styles.title}>Images capturées :</Text>

        <ScrollView style={{ maxHeight: 150 }}>
          {frameLogs.map((line, index) => (
            <Text key={index} style={styles.textLine}>
              {index + 1}. {line}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  textLine: {
    fontSize: 12,
    color: 'white',
  },
});
