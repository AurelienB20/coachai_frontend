package com.aurelien2707.coachai_frontend

import com.facebook.react.bridge.ReactApplicationContext
import com.mrousavy.camera.frameprocessor.FrameProcessorPluginRegistry

object PosePluginInstaller {
    fun install(reactContext: ReactApplicationContext) {
        FrameProcessorPluginRegistry.addPlugin("detectPoseFromFrame", PoseDetectionPlugin(reactContext))
    }
}