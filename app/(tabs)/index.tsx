import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useNavigation } from '@react-navigation/native';

export default function TabOneScreen() {
  const navigation = useNavigation();

  const goToPoseAnalyser = () => navigation.navigate('pose-analyser' as never);
  const goToDashboard = () => navigation.navigate('dashboard' as never);
  const goToMuscleChoice = () => navigation.navigate('muscleChoice' as never);
  const goToStartWorkout = () => navigation.navigate('startWorkout' as never);
  const goTestPoseModule = () => navigation.navigate('testPoseModule' as never);
  const goTestPoseModule2 = () => navigation.navigate('testPoseModule2' as never);
  const goToUserInfo = () => navigation.navigate('userInfo' as never);
  const goToPushUpCount = () => navigation.navigate('pushUpCount' as never);
  const goToSeance = () => navigation.navigate('seance' as never);
  const goToTest = () => navigation.navigate('test' as never);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <TouchableOpacity style={styles.menuItem} onPress={goToPoseAnalyser}>
          <Text style={styles.menuItemText}>Pose Analyser</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={goToTest}>
          <Text style={styles.menuItemText}>test react-native-mediapipe</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={goToDashboard}>
          <Text style={styles.menuItemText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={goToMuscleChoice}>
          <Text style={styles.menuItemText}>Muscle Choice</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={goToStartWorkout}>
          <Text style={styles.menuItemText}>Start Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={goToUserInfo}>
          <Text style={styles.menuItemText}>User Info</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={goTestPoseModule}>
          <Text style={styles.menuItemText}>Test Pose Module</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={goTestPoseModule2}>
          <Text style={styles.menuItemText}>Test Pose Module 2</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={goToPushUpCount}>
          <Text style={styles.menuItemText}>Push Up Count</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={goToSeance}>
          <Text style={styles.menuItemText}>Séance</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    //backgroundColor: 'red',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    alignSelf: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  menuItem: {
    backgroundColor: '#E0E0E0',
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
  },
});
