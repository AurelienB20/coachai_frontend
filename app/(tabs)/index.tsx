import { StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TabOneScreen() {

  const navigation = useNavigation()

  const goToPoseAnalyser = async () => {
    navigation.navigate('pose-analyser' as never);
  };

  const goToDashboard = async () => {
    navigation.navigate('dashboard' as never);
  };

  const goToMuscleChoice = async () => {
    navigation.navigate('muscleChoice' as never);
  };

  const goToStartWorkout = async () => {
    navigation.navigate('startWorkout' as never);
  };

  const goTestPoseModule = async () => {
    navigation.navigate('testPoseModule' as never);
  };

  const goToUserInfo = async () => {
    navigation.navigate('userInfo' as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
      <TouchableOpacity style={styles.menuItem} onPress={goToPoseAnalyser}>
        <View>
          <Text style={styles.menuItemText}>Pose Analyser</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={goToDashboard}>
        <View>
          <Text style={styles.menuItemText}>Dashboard</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={goToMuscleChoice}>
        <View >
          <Text style={styles.menuItemText}>Muscle Choice</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={goToStartWorkout}>
        <View>
          <Text style={styles.menuItemText}>Start Workout</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={goToUserInfo}>
        <View>
          <Text style={styles.menuItemText}>User Info</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={goTestPoseModule}>
        <View>
          <Text style={styles.menuItemText}>Test Pose Module</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },

  menuItem: {
    backgroundColor: '#E0E0E0',
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
  },
});
