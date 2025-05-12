import { useEffect, useState } from 'react';
import { NativeModules, View, Text, ScrollView } from 'react-native';

const { PoseModule } = NativeModules;

export default function App() {
  const [landmarksData, setLandmarksData] = useState<any>([]); // Stocker les landmarks
  const [log, setLog] = useState<string>(''); // Stocker les logs

  useEffect(() => {
    PoseModule.startPoseDetection()
      .then((result: any) => {
        console.log('[Native Result]', result); // Affiche les résultats dans la console
        
        // Si result contient des landmarks, formatez les données
        const parsedLandmarks = result.map((landmark: any, index: number) => {
          return {
            id: index,
            x: landmark.x,
            y: landmark.y,
            z: landmark.z,
            visibility: landmark.visibility,
            presence: landmark.presence,
          };
        });

        // Mettre à jour les landmarks et le log
        setLandmarksData(parsedLandmarks);
        setLog(`[Native Result] Poses trouvées: ${result.length}`); // Afficher le nombre de poses détectées
      })
      .catch((err: any) => {
        const errorMessage = `[Native Error] ${err}`;
        console.error(errorMessage); // Log côté console
        setLog(errorMessage); // Affiche l'erreur sur l'écran
      });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>PoseModule Test</Text>
      <Text>{log}</Text> {/* Affiche les logs à l'écran */}
      
      {/* Afficher les landmarks dans un ScrollView */}
      <ScrollView style={{ marginTop: 20 }}>
        {landmarksData.map((landmark: any) => (
          <Text key={landmark.id}>
            Landmark {landmark.id}: x = {landmark.x}, y = {landmark.y}, z = {landmark.z}, 
            visibility = {landmark.visibility}, presence = {landmark.presence}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}
