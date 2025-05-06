// src/native/BlazePoseModule.ts

import { NativeModules } from 'react-native';

const { BlazePoseModule } = NativeModules;

if (!BlazePoseModule) {
  throw new Error('Module natif BlazePoseModule introuvable');
}

export const detectPose = (base64Image: string): Promise<any> => {
  return BlazePoseModule.detectPose(base64Image);
};
