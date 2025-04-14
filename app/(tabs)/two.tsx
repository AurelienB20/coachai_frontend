import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { 
  ExpoSpeechRecognitionModule, 
  useSpeechRecognitionEvent 
} from 'expo-speech-recognition';

const VoiceRecognitionScreen = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Gestion des évènements vocaux
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const result = event.results?.[0]?.transcript;
    if (result) {
      setText(result);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Erreur:', event.error, event.message);
    Alert.alert('Erreur', 'Un problème est survenu pendant la reconnaissance vocale.');
    setIsListening(false);
  });

  const startListening = async () => {
    setText('');
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission refusée', 'Le micro est nécessaire.');
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: 'fr-FR',
      interimResults: true, // Texte en temps réel
    });
  };

  const stopListening = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parlez, je vous écoute...</Text>
      
      <ScrollView style={styles.textContainer}>
        <Text style={styles.text}>{text || '...'}</Text>
      </ScrollView>

      <Button
        title={isListening ? 'Stop' : 'Start'}
        onPress={isListening ? stopListening : startListening}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  textContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
  },
});

export default VoiceRecognitionScreen;
