package com.aurelien2707.coachai_frontend

import android.graphics.BitmapFactory
import com.facebook.react.bridge.*
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult
//import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker.PoseLandmarkerOptions
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerOptions
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions

class PoseModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    private val context = reactContext
    override fun getName() = "PoseModule"
    @ReactMethod
    fun startPoseDetection(promise: Promise) {
        try {
            val assetManager = context.assets
            // Charge l’image depuis les assets
            val inputStream = assetManager.open("pose_test.jpg")
            val bitmap = BitmapFactory.decodeStream(inputStream)
            val mpImage = BitmapImageBuilder(bitmap).build()

            // Configure le modèle
            val baseOptions = BaseOptions.builder()
                .setModelAssetPath("pose_landmarker_lite.task")
                .build()

            val options = PoseLandmarkerOptions.builder()
                .setBaseOptions(baseOptions)
                .setRunningMode(RunningMode.IMAGE)
                .build()

            val landmarker = PoseLandmarker.createFromOptions(context, options)

            // Exécution de la détection
            val result: PoseLandmarkerResult = landmarker.detect(mpImage)

            // Tu peux parser result.landmarks() si tu veux
            val posesDetected = result.landmarks().size

            promise.resolve("Détection réussie. Poses trouvées : $posesDetected")

        } catch (e: Exception) {
            promise.reject("POSE_ERROR", e.message, e)
        }
    }

}