import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { NativeModules } from 'react-native';
import { readFile } from 'react-native-fs';

const { PoseModule } = NativeModules;

const pushUpSpec = {
  name: 'push-up',
  angleGroups: [
    { points: [11, 13, 15], label: 'Left Elbow' },
    { points: [12, 14, 16], label: 'Right Elbow' },
  ],
  validRange: {
    down: 60,
    up: 160,
  },
};

const squatSpec = {
  name: 'squat',
  angleGroups: [
    {
      label: 'Left Knee',
      points: [23, 25, 27], // hanche, genou, cheville gauche
      validRange: { down: 70, up: 160 },
    },
    {
      label: 'Right Knee',
      points: [24, 26, 28], // hanche, genou, cheville droite
      validRange: { down: 70, up: 160 },
    },
    {
      label: 'Left Hip',
      points: [11, 23, 25], // épaule, hanche, genou gauche
      validRange: { down: 60, up: 170 },
    },
    {
      label: 'Right Hip',
      points: [12, 24, 26], // épaule, hanche, genou droite
      validRange: { down: 60, up: 170 },
    },
  ],
};

export default function App() {
  const [landmarksTextList, setLandmarksTextList] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [frameLogs, setFrameLogs] = useState<string[]>([]);
  const [pushUpCount, setPushUpCount] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const stabilityBuffer = useRef<number[]>([]);
  const STABILITY_FRAMES = 3; // minimum frames stables

  useEffect(() => {
    (async () => {
      const status = await requestPermission();
      console.log(`[Permission] Caméra: ${status}`);
    })();
  }, []);

  const calculateAngle = (A: any, B: any, C: any) => {
    const AB = { x: B.x - A.x, y: B.y - A.y };
    const CB = { x: B.x - C.x, y: B.y - C.y };
    const dot = AB.x * CB.x + AB.y * CB.y;
    const magAB = Math.hypot(AB.x, AB.y);
    const magCB = Math.hypot(CB.x, CB.y);
    const angle = Math.acos(dot / (magAB * magCB));
    return angle * (180 / Math.PI); // en degrés
  };

  const getLandmark = (matches: string[], index: number) => {
    const item = matches[index];
    return {
      x: parseFloat(item?.match(/x=([-\d.]+)/)?.[1] || '0'),
      y: parseFloat(item?.match(/y=([-\d.]+)/)?.[1] || '0'),
    };
  };

  const analyzeMovement = (
    matches: string[],
    spec: typeof pushUpSpec
  ): { angleAvg: number; debugText: string[] } => {
    const left = spec.angleGroups[0].points.map(index => getLandmark(matches, index));
    const right = spec.angleGroups[1].points.map(index => getLandmark(matches, index));
  
    const leftAngle = calculateAngle(left[0], left[1], left[2]);
    const rightAngle = calculateAngle(right[0], right[1], right[2]);
  
    const angleAvg = (leftAngle + rightAngle) / 2;
    const debugText = [
      `Left Elbow angle: ${leftAngle.toFixed(1)}°`,
      `Right Elbow angle: ${rightAngle.toFixed(1)}°`,
      `Average Elbow angle: ${angleAvg.toFixed(1)}°`,
    ];
  
    return { angleAvg, debugText };
  };

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
                const fullString = String(result);
                const matches = fullString.match(/<Normalized Landmark.*?>/g) || [];

                const { angleAvg, debugText } = analyzeMovement(matches, pushUpSpec);

                // ----------- Détection stable et fiable ----------
                if (angleAvg < pushUpSpec.validRange.down) {
                  if (direction === 'up') {
                    setDirection('down');
                    stabilityBuffer.current = [1]; // Démarre un nouveau cycle
                  } else if (direction === 'down') {
                    stabilityBuffer.current.push(1); // Continue la stabilité en bas
                  }
                } else if (angleAvg > pushUpSpec.validRange.up) {
                  if (direction === 'down' && stabilityBuffer.current.length >= STABILITY_FRAMES) {
                    setDirection('up');
                    setPushUpCount(prev => prev + 1);
                    console.log('[Push-Up] +1 | angle moyen:', angleAvg.toFixed(1));
                  }
                  stabilityBuffer.current = []; // Reset buffer quoi qu’il arrive
                }

                // --------------------------------------------------

                setLandmarksTextList(prev => [...prev.slice(-10), ...debugText]);
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
  }, [isCameraReady, hasPermission, device, direction]);

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
