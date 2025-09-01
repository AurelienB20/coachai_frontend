package com.reactnativemediapipe.posedetection

import com.google.mediapipe.framework.image.MediaImageBuilder
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.reactnativemediapipe.shared.imageOrientation

class PoseDetectionFrameProcessorPlugin() : FrameProcessorPlugin() {

  companion object {
    private const val TAG = "PoseDetectionFrameProcessorPlugin"
  }

  override fun callback(frame: Frame, params: MutableMap<String, Any>?): Any? {
    val detectorHandle = (params?.get("detectorHandle") as? Double) ?: return false
    val detector = PoseDetectorMap.detectorMap[detectorHandle.toInt()] ?: return false
    val orientation = params["orientation"] as String
    val mappedOrientation = imageOrientation(orientation)
    mappedOrientation ?: return false

    val mpImage = MediaImageBuilder(frame.image).build()
    return true
  }
}
