package com.aurelien2707.coachai_frontend

import android.graphics.BitmapFactory
import com.facebook.react.bridge.*
import android.graphics.YuvImage
import android.graphics.ImageFormat
import android.graphics.Rect

import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker.PoseLandmarkerOptions
//import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerOptions
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import android.util.Base64
import java.io.ByteArrayOutputStream

class PoseModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    private val context = reactContext
    override fun getName() = "PoseModule"
    /*@ReactMethod
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

            val result = landmarker.detect(mpImage)

            val builder = StringBuilder()
            result.landmarks()?.forEachIndexed { _, landmarks: List<NormalizedLandmark> ->
                landmarks.forEachIndexed { index, landmark ->
                    builder.append("<Normalized Landmark index=$index x=${landmark.x()} y=${landmark.y()} z=${landmark.z()}>\n")
                }
            }

            promise.resolve(builder.toString())

        } catch (e: Exception) {
            promise.reject("POSE_ERROR", e.message, e)
        }
    }*/

    @ReactMethod
    fun detectPoseFromBase64(base64Image: String, promise: Promise) {
        try {
            // Décoder l'image base64 en bitmap
            val imageBytes: ByteArray = Base64.decode(base64Image, Base64.DEFAULT)
            val bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
            val mpImage = BitmapImageBuilder(bitmap).build()

            // Configuration du modèle
            val baseOptions = BaseOptions.builder()
                .setModelAssetPath("pose_landmarker_lite.task")
                .build()

            val options = PoseLandmarkerOptions.builder()
                .setBaseOptions(baseOptions)
                .setRunningMode(RunningMode.IMAGE)
                .build()

            val landmarker = PoseLandmarker.createFromOptions(context, options)

            // Exécution de la détection
            val result = landmarker.detect(mpImage)

            val builder = StringBuilder()
            result.landmarks()?.forEachIndexed { _, landmarks: List<NormalizedLandmark> ->
                landmarks.forEachIndexed { index, landmark ->
                    builder.append("<Normalized Landmark index=$index x=${landmark.x()} y=${landmark.y()} z=${landmark.z()}>\n")
                }
            }

            promise.resolve(builder.toString())

        } catch (e: Exception) {
            promise.reject("POSE_ERROR", e.message, e)
        }
    }
}