package com.reactnativemediapipe.posedetection

import com.google.mediapipe.framework.image.MediaImageBuilder
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin


//class PoseDetectionFrameProcessorPlugin() : FrameProcessorPlugin() {

class PoseDetectionFrameProcessorPlugin(
    private val appContext: Context
) : FrameProcessorPlugin("poseDetection") {

  companion object {
    private const val TAG = "PoseDetectionFrameProcessorPlugin"
  }

  override fun callback(frame: Frame, params: MutableMap<String, Any>?): Any? {
    

    val mpImage = MediaImageBuilder(frame.image).build()
    
    return true
  }
}
