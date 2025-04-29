import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { View } from '@/components/Themed'; // ou View classique si tu veux

import { useState } from 'react';

export default function UserInfoScreen() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = () => {
    alert(`Âge : ${age} ans\nPoids : ${weight} kg`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vos Informations</Text>

      <TextInput
        style={styles.input}
        placeholder="Âge"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <TextInput
        style={styles.input}
        placeholder="Poids (kg)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Valider</Text>
      </TouchableOpacity>

      <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fond blanc
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000', // Texte noir
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#FFF',
    fontSize: 16,
    color: '#000', // Texte noir
  },
  button: {
    width: '100%',
    backgroundColor: '#007BFF', // Bleu électrique
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
