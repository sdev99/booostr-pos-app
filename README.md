# 🚀 Booostr POS App

A cross-platform mobile application built with **React Native** and **Expo**.  
This project supports both **Android** and **iOS**, and uses **EAS Build** for production-ready builds.

---

## 📱 Features
- ⚡ Built with React Native & Expo SDK
- 📦 EAS Build support
- 🔐 Authentication (Google / Apple / Facebook optional)
- 🎨 Modern UI & smooth navigation
- 📊 API integration ready

---

## 🛠️ Installation

### Prerequisites
- Node.js (>= 18.x recommended)
- Expo CLI
- Yarn or npm

### Clone the repository
```sh
git clone https://github.com/aakash110121/booostr-pos-app.git
cd booostr-pos-app

### Android Issue Fix Steps if you removed android folder and prebuild it

1. Create .npmrc file in project root folder and put content
legacy-peer-deps=true

2. In file android/app/proguard-rules.pro file add this content 
# Ignore Java Beans annotations not present on Android
-dontwarn java.beans.**

# Ignore SLF4J bindings missing on Android
-dontwarn org.slf4j.impl.**

3. In android/app/build.gradle file under packagingOptions add this content

resources {
    excludes += [
        "org/bouncycastle/pqc/crypto/picnic/lowmc*.properties",
        "org/bouncycastle/x509/CertPathReviewerMessages*.properties"
    ]
}






