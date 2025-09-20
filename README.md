# Rduan NewsQuizzer (AI based Language Quiz Generator)

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/Rduanchen/RduanNewsQuizzer)]

![Build & Release](https://github.com/Rduanchen/RduanNewsQuizzer/actions/workflows/release.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

**Rduan NewsQuizzer** is a desktop application designed for language learners. It leverages the power of AI to transform real-time news articles, AI-generated text, or your own content into personalized language quizzes. The goal is to make language learning more engaging, contextual, and relevant to daily life.

---

### ✨ Core Features

- **Multiple Content Sources:**
  - **Online News:** Integrates with [NewsAPI](https://newsapi.org/) to fetch real-time headlines from around the world.
  - **AI-Generated Articles:** Dynamically generates articles based on your chosen difficulty (CEFR level) and topic.
  - **Custom Content:** Paste your own text to create a quiz from any material you want.

- **AI-Powered Quiz Generation:**
  - Connects to various AI backends, including **OpenAI** or a locally running **LM Studio**.
  - Automatically generates multiple-choice questions, fill-in-the-blanks, and other question styles based on the article's content.

- **Highly Customizable Settings:**
  - Freely configure your AI source, API keys, and preferred models.
  - Adjust the number of questions, quiz style, and difficulty.

- **Elegant & User-Friendly Interface:**
  - A modern interface built with Vuetify 3.
  - Supports one-click switching between **Light and Dark themes**.
  - Built-in **multi-language support** (English/Traditional Chinese).

- **Cross-Platform:**
  - Developed with Electron to run natively on both Windows and macOS.

---

### 🚀 Installation

#### 🧑‍🎓 For Users

You don't need to do anything complicated. Just download the latest version for your operating system.

1.  Go to the project's [**Releases Page**](https://github.com/Rduanchen/RduanNewsQuizzer/releases).
2.  Find the latest release (usually at the top of the page).
3.  Download the appropriate file:
    - For **Windows**: Download the `.exe` or installer.
    - For **macOS**: Download the `.dmg` file.
4.  Once downloaded, double-click the file and follow the on-screen instructions to install.

#### 🧑‍💻 For Developers

If you want to contribute, modify the code, or build the app yourself, follow these steps.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Rduanchen/RduanNewsQuizzer.git
    cd RduanNewsQuizzer
    ```

2.  **Install dependencies:**
    This project uses `npm` as its package manager.

    ```bash
    npm install
    ```

3.  **Run in development mode:**
    This command starts a development server with Hot-Reload.

    ```bash
    npm run dev
    ```

4.  **Package the application:**
    If you want to build the installer files yourself, run one of the following commands:

    ```bash
    # To package for Windows
    npm run build:win

    # To package for macOS
    npm run build:mac
    ```

    The packaged files will be available in the `dist/` directory.

---

### 🛠️ Technology Stack

- **Framework:** [Electron](https://www.electronjs.org/)
- **Frontend:** [Vue 3](https://vuejs.org/) (with Composition API) + [Vite](https://vitejs.dev/)
- **UI Library:** [Vuetify 3](https://vuetifyjs.com/)
- **Internationalization (i18n):** [Vue I18n](https://vue-i18n.intlify.dev/)
- **Routing:** [Vue Router](https://router.vuejs.org/)

---

### ❤️ Contributing

Contributions of any kind are welcome! If you find a bug, have a feature suggestion, or want to improve the code, please feel free to open an [Issue](https://github.com/Rduanchen/RduanNewsQuizzer/issues) or submit a [Pull Request](https://github.com/Rduanchen/RduanNewsQuizzer/pulls).

---

### 📄 License

This project is licensed under the [MIT License](LICENSE).
