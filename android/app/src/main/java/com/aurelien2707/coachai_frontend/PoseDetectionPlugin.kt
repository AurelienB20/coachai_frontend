package com.aurelien2707.coachai_frontend

import android.graphics.Bitmap
import android.os.SystemClock
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
//import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerOptions
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker.PoseLandmarkerOptions
import com.mrousavy.camera.frameprocessor.Frame
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin

class PoseDetectionPlugin(private val reactContext: ReactApplicationContext) :
    FrameProcessorPlugin("detectPoseFromFrame") {

    companion object {
        private var poseLandmarker: PoseLandmarker? = null

        fun initializePoseLandmarker(context: ReactApplicationContext) {
            if (poseLandmarker == null) {
                try {
                    val baseOptions = BaseOptions.builder()
                        .setModelAssetPath("pose_landmarker_lite.task")
                        .build()

                    val options = PoseLandmarkerOptions.builder()
                        .setBaseOptions(baseOptions)
                        .setRunningMode(RunningMode.VIDEO)
                        .build()

                    poseLandmarker = PoseLandmarker.createFromOptions(context.applicationContext, options)
                    Log.i("PoseDetectionPlugin", "PoseLandmarker initialized successfully.")
                } catch (e: Exception) {
                    Log.e("PoseDetectionPlugin", "Error initializing PoseLandmarker", e)
                }
            }
        }
    }

    override fun callback(frame: Frame, params: Map<String, Any>?): Any? {
        try {
            if (poseLandmarker == null) {
                Log.w("PoseDetectionPlugin", "PoseLandmarker not initialized.")
                return null
            }

            val bitmap: Bitmap = frame.toBitmap()
            val mpImage = BitmapImageBuilder(bitmap).build()
            val timestamp = SystemClock.uptimeMillis()

            val result = poseLandmarker!!.detectForVideo(mpImage, timestamp)

            val builder = StringBuilder()
            result.landmarks()?.forEachIndexed { personIdx, landmarks: List<NormalizedLandmark> ->
                landmarks.forEachIndexed { index, landmark ->
                    builder.append("<Normalized Landmark index=$index x=${landmark.x()} y=${landmark.y()} z=${landmark.z()}>\n")
                }
            }

            return builder.toString()
        } catch (e: Exception) {
            Log.e("PoseDetectionPlugin", "Error during pose detection", e)
            return null
        }
    }
}
