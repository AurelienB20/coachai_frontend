import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed'; // ou remplacer par View/Text classiques

const mockNextSessions = [
  { id: '1', date: '30 avril 2025', muscle: 'Jambes' },
  { id: '2', date: '2 mai 2025', muscle: 'Dos' },
];

const mockProgress = {
  totalSessions: 18,
  activeDays: 12,
};

const mockObjectives = [
  { id: '1', title: 'Renforcement des épaules' },
  { id: '2', title: 'Perte de masse grasse' },
  { id: '3', title: 'Améliorer l’endurance' },
];

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tableau de bord</Text>

      {/* Section Séances */}
      <Text style={styles.sectionTitle}> Prochaines séances</Text>
      {mockNextSessions.map(session => (
        <View key={session.id} style={styles.card}>
          <Text style={styles.cardText}>Date : {session.date}</Text>
          <Text style={styles.cardText}>Muscle : {session.muscle}</Text>
        </View>
      ))}

      {/* Section Progression */}
      <Text style={styles.sectionTitle}> Progression</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>Séances complétées : {mockProgress.totalSessions}</Text>
        <Text style={styles.cardText}>Jours actifs : {mockProgress.activeDays}</Text>
      </View>

      {/* Section Objectifs */}
      <Text style={styles.sectionTitle}> Objectifs en cours</Text>
      {mockObjectives.map(obj => (
        <View key={obj.id} style={styles.card}>
          <Text style={styles.cardText}>{obj.title}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#000',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#007BFF',
  },

  card: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  cardText: {
    fontSize: 16,
    color: '#333',
  },
});
