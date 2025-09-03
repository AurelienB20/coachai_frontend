import React, { useCallback, useEffect, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native"
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera"
import { usePoseDetection, RunningMode } from "react-native-mediapipe"

export default function App() {
  const [landmarksTextList, setLandmarksTextList] = useState<string[]>([])
  const [isCameraReady, setIsCameraReady] = useState(false)

  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice("back")

  // Demande permission caméra
  useEffect(() => {
    ;(async () => {
      const status = await requestPermission()
      console.log(`[Permission] Caméra: ${status}`)
    })()
  }, [])

  // Callback résultats MediaPipe
  const onResults = useCallback((result: any, viewCoordinator: any) => {
    console.log("Pose landmarks:", result)

    // Exemple simple : afficher nombre de poses et premier landmark
    if (result?.landmarks?.length > 0) {
      const firstPose = result.landmarks[0]
      const formatted = firstPose
        .map(
          (lm: any, i: number) =>
            `(${i}) x:${lm.x.toFixed(2)} y:${lm.y.toFixed(2)}`
        )
        .slice(0, 5) // seulement 5 points pour l’exemple
      setLandmarksTextList(formatted)
    }
  }, [])

  const onError = useCallback((error: any) => {
    console.error("Pose detection error:", error)
  }, [])

  // Hook MediaPipe Pose
  const poseDetection = usePoseDetection(
    { onResults, onError },
    RunningMode.LIVE_STREAM,
    "pose_landmarker_lite.task", // modèle MediaPipe (à mettre dans assets natifs)
    {
      numPoses: 1,
      delegate: 1, // 0 = CPU, 1 = GPU
    }
  )

  if (!hasPermission || !device) {
    return (
      <Text style={{ marginTop: 40, textAlign: "center" }}>
        Chargement caméra ou permission…
      </Text>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {!isCameraReady && (
        <ActivityIndicator size="large" color="#007aff" style={{ marginTop: 20 }} />
      )}

      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        pixelFormat="rgb"
        frameProcessor={poseDetection.frameProcessor} // 👈 on utilise celui de usePoseDetection
        onLayout={poseDetection.cameraViewLayoutChangeHandler}
        onInitialized={() => {
          console.log("[Camera] Caméra initialisée !")
          setIsCameraReady(true)
        }}
      />

      <View style={styles.overlay}>
        <Text style={styles.title}>Résultats de pose :</Text>
        <ScrollView style={{ maxHeight: 150 }}>
          {landmarksTextList.map((line, index) => (
            <Text key={index} style={styles.textLine}>
              {index + 1}. {line}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  textLine: {
    fontSize: 12,
    color: "white",
  },
})
