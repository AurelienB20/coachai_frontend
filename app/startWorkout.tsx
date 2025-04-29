import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed'; // ou View/Text classiques si pas avec Themed

const sessionInfo = {
  difficulty: 'Intermédiaire',
  muscleGroup: 'Pectoraux',
  duration: '45 min',
};

const exercises = [
  {
    id: '1',
    name: 'Pompes',
    sets: 4,
    reps: 12,
  },
  {
    id: '2',
    name: 'Développé couché',
    sets: 3,
    reps: 10,
  },
  {
    id: '3',
    name: 'Gainage',
    duration: '1 min',
  },
  {
    id: '4',
    name: 'Écarté couché haltères',
    sets: 3,
    reps: 15,
  },
];

export default function StartWorkoutScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏋️ Début de séance</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>Groupe musculaire : {sessionInfo.muscleGroup}</Text>
        <Text style={styles.infoText}>Difficulté : {sessionInfo.difficulty}</Text>
        <Text style={styles.infoText}>Durée estimée : {sessionInfo.duration}</Text>
      </View>

      <Text style={styles.sectionTitle}>Exercices</Text>
      {exercises.map((exercise) => (
        <View key={exercise.id} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          {exercise.sets && exercise.reps ? (
            <Text style={styles.exerciseDetail}>
              {exercise.sets} séries de {exercise.reps} reps
            </Text>
          ) : (
            <Text style={styles.exerciseDetail}>
              Durée : {exercise.duration}
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#000',
  },
  infoCard: {
    backgroundColor: '#F0F0F0',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#007BFF',
  },
  exerciseCard: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#007BFF',
  },
  
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },

  exerciseDetail: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
});
