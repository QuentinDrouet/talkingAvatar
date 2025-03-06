# 🗣️ TalkingAvatar

TalkingAvatar est une application qui permet d'interagir avec un avatar 3D en temps réel grâce à la reconnaissance vocale et l'IA.

---

## 📁 Structure du projet
```
talkingAvatar/
│── backend/        # Serveur Flask pour la reconnaissance vocale et l'IA
│   ├── main.py     # Code du backend
│   ├── models/     # Dossier où ajouter le modèle Llama 2 (à télécharger)
│   ├── requirements.txt  # Dépendances Python
│── frontend/       # Interface utilisateur React + Three.js
│   ├── src/        # Code du frontend
│   ├── package.json  # Dépendances Node.js
│── .gitignore      # Exclusion des fichiers inutiles
│── README.md       # Documentation du projet
```

---

## 🚀 **Installation & Lancement**

### 🛠️ **1. Prérequis**
Avant de commencer, assurez-vous d'avoir installé :
- **Python 3.8 ou supérieur** 
- **Node.js (avec npm ou yarn)** ([Télécharger Node.js](https://nodejs.org/))

---

### 🔧 **2. Installation et lancement du Backend**
1. **Aller dans le dossier `backend/` :**
   ```sh
   cd backend
   ```

2. **Créer un environnement virtuel (optionnel mais recommandé) :**
   ```sh
   python -m venv venv
   source venv/bin/activate  # Sur macOS/Linux
   venv\Scripts\activate      # Sur Windows
   ```

3. **Installer les dépendances Python :**
   ```sh
   pip install -r requirements.txt
   ```

4. **Télécharger et ajouter le modèle Llama 2 :**
   - Télécharge le modèle **Llama 2 GGUF** (ex: `llama-2-7b.Q4_K_M.gguf`) ([Télécharger le modèle](https://huggingface.co/TheBloke/Llama-2-7B-GGUF/))
   - Place le fichier dans le dossier **backend/models/**

5. **Lancer le serveur Flask :**
   ```sh
   python main.py
   ```

Le backend s'exécute sur **http://0.0.0.0:5174**.

---

### 🎨 **3. Installation et lancement du Frontend**
1. **Aller dans le dossier `frontend/` :**
   ```sh
   cd frontend
   ```

2. **Installer les dépendances Node.js :**
   ```sh
   npm install
   ```

3. **Lancer l'application :**
   ```sh
   npm run dev
   ```

L'interface sera accessible à **http://localhost:5173** ou selon l'URL indiquée dans le terminal.

---

## 🛠 **Utilisation**
1. Démarrez le **backend**.
2. Lancez le **frontend**.
3. L'application vous permet d'envoyer un enregistrement vocal, qui sera :
   - Transcrit avec **Whisper**.
   - Analysé par **Llama 2** pour générer une réponse.
   - Converti en audio avec **Edge-TTS**.
4. L'avatar 3D réagit en fonction de la réponse.
5. Essayer avec "Bonjour danse" et "Arrête de danser"

---

## 📌 **Détails techniques**
- **Backend :** Flask, Whisper, Llama 2, Edge-TTS
- **Frontend :** React, Three.js, Vite
- **Modèle d'IA :** Llama 2 GGUF

---

## 💡 **Auteurs**
- **Quentin Drouet**
- **Romain Malaterre**
- **Edgar Lecomte**

---

🚀 **Prêt à utiliser TalkingAvatar ? Lancez l'application et profitez de l'expérience vocale interactive !** 🎙️🧑‍🚀

