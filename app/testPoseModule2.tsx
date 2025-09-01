import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from "react-native-vision-camera";
//import { useRunOnJS } from 'react-native-worklets-core'

import { runAtTargetFps } from "react-native-vision-camera";

export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");

  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    (async () => {
      if (!hasPermission) await requestPermission();
    })();
  }, [hasPermission]);

  useEffect(() => {
    const id = setInterval(() => {
      setFps(frameCount);
      setFrameCount(0);
    }, 1000);
    return () => clearInterval(id);
  }, [frameCount]);

  const onFrame = () => setFrameCount((c) => c + 1);

  //const frameProcessor = useFrameProcessor((frame) => {
  //  'worklet'
  //  runAtTargetFps(10, () => {
  //    'worklet'
  //    console.log(`${frame.timestamp}: ${frame.width}x${frame.height} ${frame.pixelFormat} Frame (${frame.orientation})`)
  //    
  //  })
  //}, [])
  const frameProcessor = useFrameProcessor((frame) => {
  'worklet'
  runAtTargetFps(10, () => {
    'worklet'
    
    console.log(`${frame.timestamp}: ${frame.width}x${frame.height}`)
  })
}, [])


  if (!device || !hasPermission) return <Text style={styles.msg}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      <View style={styles.overlay}>
        <Text style={styles.text}>FPS approx: {fps}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  overlay: {
    position: "absolute", top: 20, left: 12, padding: 10,
    backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 8,
  },
  text: { color: "white", fontSize: 16 },
  msg: { marginTop: 40, textAlign: "center", fontSize: 16 },
});


