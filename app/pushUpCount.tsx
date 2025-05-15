import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { NativeModules } from 'react-native';
import { readFile } from 'react-native-fs';

const { PoseModule } = NativeModules;

export default function App() {
  const [landmarksTextList, setLandmarksTextList] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [frameLogs, setFrameLogs] = useState<string[]>([]);
  const [pushUpCount, setPushUpCount] = useState(0);
  const [lastY, setLastY] = useState<number | null>(null);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

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

  useEffect(() => {
    let interval: any;

    if (isCameraReady && hasPermission && device && cameraRef.current) {
      interval = setInterval(async () => {
        try {
          const photo = await cameraRef.current?.takePhoto({ flash: 'off' });

          if (photo?.path) {
            const base64 = await readFile(photo.path, 'base64');
            const preview = base64.slice(0, 100) + '...';
            setFrameLogs(prev => [...prev.slice(-10), preview]);

            PoseModule.detectPoseFromBase64(base64)
              .then((result: string) => {
                console.log('[Pose] Résultat:', result);

                console.time("Pose Parsing Time");

                const fullString = String(result);
                const matches = fullString.match(/<Normalized Landmark.*?>/g) || [];

                // Détection des pompes basée sur le nez (landmark 0)
                const nose = matches[0]; // Nez
                const y = nose?.match(/y=([-\d.]+)/)?.[1];

                if (y) {
                  const yValue = parseFloat(y);
                  const delta = 0.03;

                  if (lastY !== null) {
                    if (direction === 'up' && yValue - lastY > delta) {
                      setDirection('down');
                    }

                    if (direction === 'down' && lastY - yValue > delta) {
                      setDirection('up');
                      setPushUpCount(prev => prev + 1);
                      console.log('[Push-Up] +1');
                    }
                  }

                  setLastY(yValue);
                }

                // Affichage des landmarks (optionnel)
                const parsed = matches.map((item) => {
                  const values = {
                    x: item.match(/x=([-\d.]+)/)?.[1],
                    y: item.match(/y=([-\d.]+)/)?.[1],
                    z: item.match(/z=([-\d.]+)/)?.[1],
                    visibility: item.match(/visibility= Optional\[([-\d.]+)\]/)?.[1],
                    presence: item.match(/presence=Optional\[([-\d.]+)\]/)?.[1],
                  };
                  return `x: ${values.x}, y: ${values.y}, z: ${values.z}, vis: ${values.visibility}, pres: ${values.presence}`;
                });

                console.timeEnd("Pose Parsing Time");
                setLandmarksTextList(prev => [...prev.slice(-10), ...parsed]);
              })
              .catch((error: any) => {
                console.error('[Pose] Erreur:', error.message);
                setLandmarksTextList(prev => [...prev.slice(-10), 'Erreur: ' + error.message]);
              });
          }
        } catch (e: any) {
          console.error('[Erreur] Capture échouée', e.message);
        }
      }, 200); // 5 FPS
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
        <View style={styles.counterOverlay}>
            <Text style={styles.counterText}>{pushUpCount}</Text>
        </View>

      <View style={styles.overlay}>
        <Text style={styles.title}>💪 Pompes détectées : {pushUpCount}</Text>
        <ScrollView style={{ maxHeight: 150 }}>
          {landmarksTextList.map((line, index) => (
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  textLine: {
    fontSize: 12,
    color: 'white',
  },

  counterOverlay: {
    position: 'absolute',
    top: 20,
    
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  counterText: {
    fontSize: 96,
    fontWeight: 'bold',
    color: 'white',
  },
});
