package com.aurelien2707.coachai_frontend

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.*
import org.tensorflow.lite.Interpreter
import java.io.IOException
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel

class BlazePoseModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var interpreter: Interpreter? = null
  private val TAG = "BlazePoseModule"

  init {
    try {
      Log.d(TAG, "Chargement du modèle BlazePose...")
      interpreter = Interpreter(loadModelFile("pose_landmark_lite.tflite"))
      Log.d(TAG, "Modèle BlazePose chargé avec succès")
    } catch (e: Exception) {
      Log.e(TAG, "Erreur de chargement du modèle BlazePose", e)
    }
  }

  override fun getName(): String {
    return "BlazePoseModule"
  }

  private fun loadModelFile(modelName: String): MappedByteBuffer {
    val assetFileDescriptor = reactApplicationContext.assets.openFd(modelName)
    val inputStream = assetFileDescriptor.createInputStream()
    val fileChannel = inputStream.channel
    val startOffset = assetFileDescriptor.startOffset
    val declaredLength = assetFileDescriptor.declaredLength
    return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
  }

  @ReactMethod
  fun detectPose(base64Image: String, promise: Promise) {
    Log.d(TAG, "Image base64 reçue pour traitement")

    try {
      val decodedBytes = Base64.decode(base64Image, Base64.DEFAULT)
      val bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
      Log.d(TAG, "Image décodée : ${bitmap.width}x${bitmap.height}")

      val resizedBitmap = Bitmap.createScaledBitmap(bitmap, 256, 256, true)
      val inputBuffer = convertBitmapToByteBuffer(resizedBitmap)

      val output = Array(1) { FloatArray(39 * 3) } // 39 keypoints (x, y, score)

      interpreter?.run(inputBuffer, output)
      Log.d(TAG, "Inférence terminée")

      val resultArray = WritableNativeArray()
      for (i in 0 until 39) {
        val keypoint = WritableNativeMap()
        keypoint.putDouble("x", output[0][i * 3].toDouble())
        keypoint.putDouble("y", output[0][i * 3 + 1].toDouble())
        keypoint.putDouble("score", output[0][i * 3 + 2].toDouble())
        resultArray.pushMap(keypoint)
      }

      promise.resolve(resultArray)
      Log.d(TAG, "Résultats envoyés à React Native")

    } catch (e: Exception) {
      Log.e(TAG, "Erreur dans detectPose", e)
      promise.reject("POSE_ERROR", "Erreur lors du traitement de l'image", e)
    }
  }

  private fun convertBitmapToByteBuffer(bitmap: Bitmap): ByteBuffer {
    val buffer = ByteBuffer.allocateDirect(1 * 256 * 256 * 3 * 4) // float32
    buffer.order(ByteOrder.nativeOrder())

    val intValues = IntArray(256 * 256)
    bitmap.getPixels(intValues, 0, 256, 0, 0, 256, 256)

    var pixel = 0
    for (i in 0 until 256) {
      for (j in 0 until 256) {
        val value = intValues[pixel++]
        buffer.putFloat(((value shr 16) and 0xFF) / 255.0f)
        buffer.putFloat(((value shr 8) and 0xFF) / 255.0f)
        buffer.putFloat((value and 0xFF) / 255.0f)
      }
    }
    return buffer
  }
}
