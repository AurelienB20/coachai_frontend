package com.aurelien2707.coachai_frontend

import android.graphics.*
import android.media.Image
import android.util.Log
import android.graphics.YuvImage
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.BitmapFactory
import com.facebook.react.bridge.*
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker.PoseLandmarkerOptions
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import java.io.ByteArrayOutputStream

class PoseFrameProcessorPlugin : FrameProcessorPlugin("poseDetection") {
    private lateinit var poseLandmarker: PoseLandmarker

    override fun callback(frame: Frame, params: ReadableMap?): Any? {
        val image = frame.image as? Image ?: return null

        if (!::poseLandmarker.isInitialized) {
            val baseOptions = BaseOptions.builder()
                .setModelAssetPath("pose_landmarker_lite.task")
                .build()

            val options = PoseLandmarkerOptions.builder()
                .setBaseOptions(baseOptions)
                .setRunningMode(RunningMode.VIDEO)
                .build()

            poseLandmarker = PoseLandmarker.createFromOptions(frame.context, options)
        }

        val bitmap = imageToBitmap(image)
        val mpImage = BitmapImageBuilder(bitmap).build()

        val result = poseLandmarker.detectForVideo(mpImage, System.currentTimeMillis())

        /*val landmarks = result.landmarks()?.map { pose ->
            pose.map { landmark ->
                mapOf(
                    "x" to landmark.x(),
                    "y" to landmark.y(),
                    "z" to landmark.z()
                )
            }
        }
        return landmarks*/

        val builder = StringBuilder()
            result.landmarks()?.forEachIndexed { _, landmarks: List<NormalizedLandmark> ->
                landmarks.forEachIndexed { index, landmark ->
                    builder.append("<Normalized Landmark index=$index x=${landmark.x()} y=${landmark.y()} z=${landmark.z()}>\n")
                }
            }

        return builder.toString()
    }

    private fun imageToBitmap(image: Image): Bitmap {
        val yBuffer = image.planes[0].buffer
        val uBuffer = image.planes[1].buffer
        val vBuffer = image.planes[2].buffer

        val ySize = yBuffer.remaining()
        val uSize = uBuffer.remaining()
        val vSize = vBuffer.remaining()

        val nv21 = ByteArray(ySize + uSize + vSize)

        yBuffer.get(nv21, 0, ySize)
        vBuffer.get(nv21, ySize, vSize)
        uBuffer.get(nv21, ySize + vSize, uSize)

        val yuvImage = YuvImage(nv21, ImageFormat.NV21, image.width, image.height, null)
        val out = ByteArrayOutputStream()
        yuvImage.compressToJpeg(Rect(0, 0, image.width, image.height), 100, out)

        val jpegBytes = out.toByteArray()
        return BitmapFactory.decodeByteArray(jpegBytes, 0, jpegBytes.size)
    }
}
