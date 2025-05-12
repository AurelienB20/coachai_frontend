import { useEffect, useState } from 'react';
import { NativeModules, View, Text, ScrollView } from 'react-native';

const { PoseModule } = NativeModules;

export default function App() {
  const [rawResult, setRawResult] = useState<string>('');
  const [landmarksTextList, setLandmarksTextList] = useState<string[]>([]);

  useEffect(() => {
    PoseModule.startPoseDetection()
      .then((result: any) => {
        console.log('[Native Result RAW]', result);
        setRawResult(result);

        // ESSAI 1 — brut : afficher la chaîne complète
        const fullString = String(result);

        // ESSAI 2 — extraire les objets <Normalized Landmark ...> individuellement
        const matches = fullString.match(/<Normalized Landmark.*?>/g) || [];

        // ESSAI 3 — transformer en objets simples avec regex (x, y, z, visibility, presence)
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

        // Met à jour l’état pour affichage
        setLandmarksTextList(parsed);

      })
      .catch((err: any) => {
        console.error('[Native Error]', err);
        setRawResult('Erreur: ' + err?.message || JSON.stringify(err));
      });
  }, []);

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 60 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Détection de poses :
      </Text>

      {/* Essai brut */}
      <Text style={{ fontSize: 14, marginBottom: 10 }}>
        [Raw Output]: {rawResult.slice(0, 500)}...
      </Text>

      {/* Essai structuré */}
      <ScrollView>
        {landmarksTextList.map((line, index) => (
          <Text key={index} style={{ fontSize: 12, marginBottom: 4 }}>
            {index + 1}. {line}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}
