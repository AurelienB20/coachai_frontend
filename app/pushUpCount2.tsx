import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { NativeModules } from 'react-native';

const { PoseModule } = NativeModules;

export default function App() {
  const [landmarksTextList, setLandmarksTextList] = useState<string[]>([]);
  const [pushUpCount, setPushUpCount] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const lastProcessedTime = useRef<number>(0);
  const stabilityBuffer = useRef<number[]>([]);

  const STABILITY_FRAMES = 3;

  const calculateAngle = (A: any, B: any, C: any) => {
    const AB = { x: B.x - A.x, y: B.y - A.y };
    const CB = { x: B.x - C.x, y: B.y - C.y };
    const dot = AB.x * CB.x + AB.y * CB.y;
    const magAB = Math.hypot(AB.x, AB.y);
    const magCB = Math.hypot(CB.x, CB.y);
    const angle = Math.acos(dot / (magAB * magCB));
    return angle * (180 / Math.PI);
  };

  const getLandmark = (matches: string[], index: number) => {
    const item = matches[index];
    return {
      x: parseFloat(item?.match(/x=([-\d.]+)/)?.[1] || '0'),
      y: parseFloat(item?.match(/y=([-\d.]+)/)?.[1] || '0'),
    };
  };

  const analyzeMovement = (matches: string[]) => {
    const left = [11, 13, 15].map(i => getLandmark(matches, i));
    const right = [12, 14, 16].map(i => getLandmark(matches, i));
    const leftAngle = calculateAngle(left[0], left[1], left[2]);
    const rightAngle = calculateAngle(right[0], right[1], right[2]);
    const angleAvg = (leftAngle + rightAngle) / 2;

    const debugText = [
      `Left Elbow: ${leftAngle.toFixed(1)}°`,
      `Right Elbow: ${rightAngle.toFixed(1)}°`,
      `Avg: ${angleAvg.toFixed(1)}°`,
    ];

    if (angleAvg < 60) {
      if (direction === 'up') {
        setDirection('down');
        stabilityBuffer.current = [1];
      } else if (direction === 'down') {
        stabilityBuffer.current.push(1);
      }
    } else if (angleAvg > 160) {
      if (direction === 'down' && stabilityBuffer.current.length >= STABILITY_FRAMES) {
        setDirection('up');
        setPushUpCount(prev => prev + 1);
      }
      stabilityBuffer.current = [];
    }

    setLandmarksTextList(prev => [...prev.slice(-10), ...debugText]);
  };

  const processFrame = async (frameData: any) => {
    try {
      const result = await PoseModule.detectPoseFromFrame(frameData);
      const matches = result.match(/<Normalized Landmark.*?>/g) || [];
      analyzeMovement(matches);
    } catch (e: any) {
      console.error('[PoseModule] Failed:', e.message);
    }
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    const now = Date.now();
    if (now - lastProcessedTime.current < 100) return;
    lastProcessedTime.current = now;

    // 👇 Appel direct au module natif côté Android/iOS
    runOnJS(processFrame)(frame);
  }, []);

  useEffect(() => {
    requestPermission();
  }, []);

  if (!hasPermission || !device) {
    return <Text style={{ marginTop: 40, textAlign: 'center' }}>⏳ Chargement caméra ou permission…</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />

      <View style={styles.counterOverlay}>
        <Text style={styles.counterText}>{pushUpCount}</Text>
      </View>

      <View style={styles.overlay}>
        <Text style={styles.title}>💪 Pompes détectées : {pushUpCount}</Text>
        <ScrollView style={{ maxHeight: 150 }}>
          {landmarksTextList.map((line, index) => (
            <Text key={index} style={styles.textLine}>{index + 1}. {line}</Text>
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
