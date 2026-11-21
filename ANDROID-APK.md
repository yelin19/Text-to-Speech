# SayIt Android APK

The `android/` project packages the SayIt interface, pronunciation dictionary, and JavaScript runtime inside the APK. The manual GitHub Actions workflow builds the root app, creates a single inline HTML/JavaScript shell (including the ONNX Runtime WebAssembly runtime), then runs the Expo EAS Android build. A separately deployed SagaPyaw website is not required.

Voice-model weights are intentionally not bundled to keep the APK smaller. The selected Burmese voice is downloaded from [Yelinvoice](https://huggingface.co/yelin201875/Yelinvoice) the first time it is used, then cached on the device when supported. Internet access is therefore required for the first model download; the UI and pronunciation dictionary are included in the APK.

To build, open **GitHub → Actions → Build SayIt Android APK → Run workflow**. The workflow reads the repository secret `EXPO_TOKEN`, builds an installable internal APK, downloads it, and uploads it as the `SayIt-Android-APK` artifact.
