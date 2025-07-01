import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { NativeModules } from 'react-native';
import { readFile } from 'react-native-fs';

const { PoseModule } = NativeModules;

const exerciseSpecs = [
  {
    name: 'push-up',
    duration: 30,
    spec: {
      angleGroups: [
        { points: [11, 13, 15], label: 'Left Elbow', validRange: { down: 60, up: 160 } },
        { points: [12, 14, 16], label: 'Right Elbow', validRange: { down: 60, up: 160 } },
      ],
    },
  },
  {
    name: 'squat',
    duration: 30,
    spec: {
      angleGroups: [
        { points: [23, 25, 27], label: 'Left Knee', validRange: { down: 70, up: 160 } },
        { points: [24, 26, 28], label: 'Right Knee', validRange: { down: 70, up: 160 } },
      ],
    },
  },
];

export default function App() {
  const [landmarksTextList, setLandmarksTextList] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [reps, setReps] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const frontDevice = useCameraDevice('front');
  const backDevice = useCameraDevice('back');

  const device = cameraType === 'back' ? backDevice : frontDevice;
  const cameraRef = useRef<Camera>(null);
  
  const currentSpec = exerciseSpecs[exerciseIndex];

  useEffect(() => {
    (async () => {
      const status = await requestPermission();
      console.log(`[Permission] Caméra: ${status}`);
    })();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (isResting) {
        setExerciseIndex((prev) => (prev + 1) % exerciseSpecs.length);
        setReps(0);
        setDirection(null);
      }
      setIsResting(!isResting);
      setTimeLeft(30);
    }

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isResting]);

  const calculateAngle = (A: any, B: any, C: any) => {
    const AB = { x: B.x - A.x, y: B.y - A.y };
    const CB = { x: B.x - C.x, y: B.y - C.y };
    const dot = AB.x * CB.x + AB.y * CB.y;
    const magAB = Math.hypot(AB.x, AB.y);
    const magCB = Math.hypot(CB.x, CB.y);
    return Math.acos(dot / (magAB * magCB)) * (180 / Math.PI);
  };

  const getLandmark = (matches: string[], index: number) => {
    const item = matches[index];
    return {
      x: parseFloat(item?.match(/x=([-\d.]+)/)?.[1] || '0'),
      y: parseFloat(item?.match(/y=([-\d.]+)/)?.[1] || '0'),
    };
  };

  const analyzeMovement = (matches: string[], spec: typeof currentSpec.spec) => {
    let total = 0;
    let count = 0;
    const debugText: string[] = [];

    for (const group of spec.angleGroups) {
      const [a, b, c] = group.points.map((i) => getLandmark(matches, i));
      const angle = calculateAngle(a, b, c);
      debugText.push(`${group.label}: ${angle.toFixed(1)}°`);
      total += angle;
      count++;
    }

    return { angleAvg: total / count, debugText };
  };

  useEffect(() => {
    let interval: any;

    if (isCameraReady && hasPermission && device && cameraRef.current && !isResting) {
      interval = setInterval(async () => {
        try {
          const photo = await cameraRef.current?.takePhoto({ flash: 'off' });
          if (photo?.path) {
            const base64 = await readFile(photo.path, 'base64');
            const matches = (await PoseModule.detectPoseFromBase64(base64)).match(/<Normalized Landmark.*?>/g) || [];

            const { angleAvg, debugText } = analyzeMovement(matches, currentSpec.spec);

            const movingDown = angleAvg < Math.min(...currentSpec.spec.angleGroups.map(g => g.validRange.down));
            const movingUp = angleAvg > Math.max(...currentSpec.spec.angleGroups.map(g => g.validRange.up));

            if (direction === 'up' && movingDown) setDirection('down');
            if (direction === 'down' && movingUp) {
              setDirection('up');
              setReps((r) => r + 1);
            }
            setLandmarksTextList((prev) => [...prev.slice(-10), ...debugText]);
          }
        } catch (e) {
          console.error('[Erreur] Capture ou analyse', e);
        }
      }, 300);
    }

    return () => clearInterval(interval);
  }, [isCameraReady, hasPermission, device, direction, isResting, exerciseIndex]);

  if (!hasPermission || !device) {
    return <Text style={{ marginTop: 40, textAlign: 'center' }}>⏳ Chargement caméra ou permission…</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {!isCameraReady && (
        <ActivityIndicator size="large" color="#007aff" style={{ marginTop: 20 }} />
      )}

      <TouchableOpacity
        onPress={() => setCameraType(prev => (prev === 'back' ? 'front' : 'back'))}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>🔄</Text>
      </TouchableOpacity>

      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={() => setIsCameraReady(true)}
      />

      <View style={styles.counterOverlay}>
        <Text style={styles.counterText}>{isResting ? 'Repos' : reps}</Text>
      </View>

      <View style={styles.overlay}>
        <Text style={styles.title}>
          {isResting ? '🛌 Repos' : `🏋️ ${currentSpec.name}`} — ⏱ {timeLeft}s
        </Text>
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
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
  },

  switchButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  
  switchText: {
    color: 'white',
    fontSize: 18,
  }
  
});
