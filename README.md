# All-In-One Life Manager

**All-In-One** is a comprehensive personal management application built with **React Native** and **Expo**. It is designed to act as your secure, offline-first digital assistant for managing various aspects of your life, from finances to secrets.

## 🚀 Features

The application is modularized into key functional areas:

### 1. 🔐 Secrets Manager (Encrypted)
- **Zero-Knowledge Security**: All data is encrypted using AES (via `crypto-js`) with keys managed by `expo-secure-store`.
- **Functionality**: Store passwords, API keys, and secure notes.
- **Copy & Reveal**: Easy-to-use UI for copying passwords and toggling visibility.

### 2. 💰 Finance Management
- **Expense Tracker**: Log daily spends and categorize them.
- **Debts (Lending/Borrowing)**: Keep track of who owes you money and who you owe.
- **Analysis**: Visual breakdown of expenses (planned).

### 3. 📝 Notes
- **Rich Text Notes**: Create, edit, and pin notes.
- **Organization**: List view with quick actions.

### 4. 🧾 Bill Management (New!)
- **Receipt Capture**: Upload bills via Camera or Gallery (`expo-image-picker`).
- **Smart OCR**: Automatically extracts **Merchant Name** and **Total Amount** from receipts using **on-device Machine Learning** (`@react-native-ml-kit/text-recognition`).
- **Itemization**: Manually add or edit line items for each bill.

### 5. ☁️ Backup & Restore
- **Local Backup**: Export your entire database to a secure file.
- **Cloud Sync**: (In Progress) Integration with Google Drive for automated backups.

---

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev) (React Native)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Database**: `expo-sqlite` (Local, Offline-first)
- **Encryption**: `crypto-js` + `expo-secure-store`
- **OCR/ML**: `@react-native-ml-kit/text-recognition`
- **Language**: TypeScript

---

## 📥 Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd All-In-One
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```
    *Note: If you encounter peer dependency issues, try `npm install --legacy-peer-deps`.*

---

## 🏃‍♂️ Running the App

### Standard Development
To start the Metro bundler:
```bash
npm start
```

### ⚠️ Critical Note on Native Modules
This project uses **Native Modules** that are **NOT** supported in the standard "Expo Go" app available on the App Store/Play Store. Specifically:
- **OCR (ML Kit)**: Required for Bill scanning.
- **Secure Store**: Required for encryption keys.

To test these features, you must use a **Development Build** or an **APK/IPA**.

---

## 🏗 Building the App (APK)

Since we use native code, we use **EAS Build** to create the application binary.

### Quick Build Steps
1.  **Install EAS CLI**:
    ```bash
    npm install -g eas-cli
    ```
2.  **Login**:
    ```bash
    eas login
    ```
3.  **Build Android APK**:
    ```bash
    eas build -p android --profile preview
    ```

For detailed build instructions, please read:
👉 **[HOW_TO_BUILD_APK.md](./HOW_TO_BUILD_APK.md)**

---

## 📂 Project Structure

```
/app                # Expo Router screens (File-based routing)
  /_layout.tsx      # Root layout (Providers, Splash Screen)
  /index.tsx        # Home Screen (Dashboard)
  /bills/           # Bill Management Module
  /finance/         # Finance Module
  /notes/           # Notes Module
  /secrets/         # Secrets Module

/src
  /constants        # Colors, Theme settings
  /db               # SQLite Schema & Initialization
  /services         # Backup, Encryption logic
```

---

## 🤝 Contributing

1.  Create a feature branch.
2.  Commit your changes.
3.  Open a Pull Request.

---
*Built with ❤️ by Shivam*
