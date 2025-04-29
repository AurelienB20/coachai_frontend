import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';
import { WebView } from 'react-native-webview';
import { Camera } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Asset } from 'expo-asset';

export default function PoseAnalyzerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [htmlUri, setHtmlUri] = useState<string | null>(null);
  const [movementData, setMovementData] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);
  const webviewRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      const htmlAsset = Asset.fromModule(require('../assets/pose/index_2.html'));
      await htmlAsset.downloadAsync();
      setHtmlUri(htmlAsset.localUri!);
    })();
  }, []);

  useEffect(() => {
    let interval: any;

    if (hasPermission) {
      interval = setInterval(async () => {
        if (cameraRef.current && webviewRef.current) {
          try {
            const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
            const imageBase64 = photo.base64;

            if (imageBase64) {
              webviewRef.current.postMessage(imageBase64);
              console.log('[Camera] Frame envoyée au WebView');
            }
          } catch (err) {
            console.error('Erreur capture frame:', err);
          }
        }
      }, 1000); // capture toutes les secondes
    }

    return () => clearInterval(interval);
  }, [hasPermission]);

  const handleMessage = (event: any) => {
    console.log('Message reçu du WebView:', event.nativeEvent.data);
    setMovementData(event.nativeEvent.data);
  };

  if (hasPermission === null || !htmlUri) {
    return <Text>Chargement...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Accès caméra refusé</Text>;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Pose Analyzer' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Analyseur de Mouvements</Text>

        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={Camera.Constants.Type.front}
        />

        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ uri: htmlUri }}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          onMessage={handleMessage}
          style={styles.webview}
          onLoadStart={() => console.log('Début du chargement du WebView')}
          onLoadEnd={() => console.log('Fin du chargement du WebView')}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('Erreur WebView:', nativeEvent);
          }}
        />

        {movementData && (
          <View style={styles.result}>
            <Text style={styles.resultText}>Dernier mouvement :</Text>
            <Text>{movementData}</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 50, 
    paddingHorizontal: 10 
  },

  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    textAlign: 'center' 
  },

  camera: { 
    height: 1, // invisible mais active
    width: 1, 
    opacity: 0,
    position: 'absolute'
  },

  webview: { 
    flex: 1, 
    borderRadius: 10, 
    overflow: 'hidden' 
  },

  result: { 
    padding: 10, 
    backgroundColor: '#eee', 
    borderRadius: 8, 
    marginTop: 10 
  },

  resultText: { 
    fontWeight: '600', 
    marginBottom: 5 
  },
});
