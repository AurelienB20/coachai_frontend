import React, { useState } from 'react';
import { View, Button, ScrollView, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { detectPose } from '.././src/native/BlazePoseModule';

export default function App() {
  const [result, setResult] = useState<any[]>([]);
  const [log, setLog] = useState<string>('App prête.\n');

  const appendLog = (text: string) => {
    setLog(prev => prev + text + '\n');
  };

  const pickImage = async () => {
    appendLog('Demande de permission...');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      appendLog('Permission refusée.');
      return;
    }

    appendLog('Ouverture de la galerie...');
    const picked = await ImagePicker.launchImageLibraryAsync({ base64: true });

    if (!picked.canceled && 'base64' in picked && picked.base64) {
    const base64Image : any = picked.base64;
    appendLog('Image sélectionnée. Envoi pour détection...');

    try {
        const pose = await detectPose(base64Image);
        setResult(pose);
        appendLog('Résultat BlazePose reçu :');
        appendLog(JSON.stringify(pose, null, 2));
    } catch (e: any) {
        appendLog('Erreur lors de la détection : ' + e.message);
        console.error(e);
    }
    } else {
    appendLog('Sélection annulée ou image invalide.');
    }
    appendLog('Image sélectionnée. Envoi pour détection...');

    
  };

  return (
    <View style={styles.container}>
      <Button title="Choisir une image" onPress={pickImage} />
      <ScrollView style={styles.logContainer}>
        <Text style={styles.logText}>{log}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  logContainer: {
    marginTop: 20,
    width: '100%',
    maxHeight: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
