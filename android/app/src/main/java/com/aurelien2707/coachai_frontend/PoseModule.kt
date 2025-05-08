package com.aurelien2707.coachai_frontend

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class PoseModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "PoseModule"

    @ReactMethod
    fun startPoseDetection(promise: Promise) {
        // Init MediaPipe PoseLandmarker
        // Peut retourner un "started" ou envoyer les landmarks plus tard
        promise.resolve("Pose native started")
    }

    // Bonus : envoyer les résultats via events
}