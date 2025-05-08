import { useEffect } from 'react';
import { NativeModules, View, Text } from 'react-native';

const { PoseModule } = NativeModules;

export default function App() {
  useEffect(() => {
    PoseModule.startPoseDetection()
      .then((result : any) => {
        console.log('[Native Result]', result); // devrait logguer "Pose native started"
      })
      .catch((err : any) => {
        console.error('[Native Error]', err);
      });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>PoseModule Test</Text>
    </View>
  );
}