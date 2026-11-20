# SayIt Android APK

The `android/` folder is an Expo WebView wrapper around the deployed SagaPyaw app. It keeps the model online and loads the Burmese voice files from the SagaPyaw web app, whose model source is [Yelinvoice](https://huggingface.co/yelin201875/Yelinvoice).

The repository workflow `.github/workflows/build-android-apk.yml` is manual by design. In GitHub, open **Actions → Build SayIt Android APK → Run workflow**. The workflow reads the repository secret named `EXPO_TOKEN`, runs an EAS internal Android build, downloads the resulting APK, and uploads it as the `SayIt-Android-APK` artifact.

The generated artifact is an installable debug/internal APK. The first launch requires Internet access because the voice model is not bundled into the APK.
