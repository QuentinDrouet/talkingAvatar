import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { useState, useRef, useEffect } from "react";

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [animation, setAnimation] = useState("Idle");
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const musicRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    if (!musicRef.current) {
      musicRef.current = new Audio("/audios/macarena.mp3");
      musicRef.current.loop = true;
    }

    const handleAudioEnd = () => {
      setIsPlaying(false);
      if (animation !== "Macarena Dance") {
        setAnimation("Idle");
      }
    };

    audioRef.current.addEventListener("ended", handleAudioEnd);

    if (animation === "Macarena Dance") {
      if (musicRef.current) {
        musicRef.current.play().catch(error => {
          console.error("Erreur lors de la lecture de la musique:", error);
        });
      }
    } else {
      if (musicRef.current && !musicRef.current.paused) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("ended", handleAudioEnd);
      }

      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }

      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
      }
    };
  }, [animation, isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = handleRecordingStop;

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Erreur lors de l'accès au microphone:", error);
      alert("Impossible d'accéder au microphone. Veuillez autoriser l'accès dans les paramètres de votre navigateur.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const handleRecordingStop = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('http://localhost:5174/translate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json();

        if (jsonResponse.action === "dance") {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          setIsPlaying(false);

          setAnimation("Macarena Dance");
          setIsProcessing(false);
          return;
        }
        else if (jsonResponse.action === "stop_dance") {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          setIsPlaying(false);

          setAnimation("Idle");
          setIsProcessing(false);
          return;
        }
      } else {
        const translatedAudioBlob = await response.blob();

        if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }

        const translatedAudioUrl = URL.createObjectURL(translatedAudioBlob);
        audioRef.current.src = translatedAudioUrl;

        playTranslatedAudio();
      }
    } catch (error) {
      console.error("Erreur lors du traitement de l'audio:", error);
      alert("Une erreur est survenue lors du traitement de l'audio. Veuillez réessayer.");
      setIsProcessing(false);
      setAnimation("Idle");
    }
  };

  const playTranslatedAudio = () => {
    if (audioRef.current && audioRef.current.src) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setAnimation("Talking");

      setTimeout(() => {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsProcessing(false);
          })
          .catch(error => {
            console.error("Erreur lors de la lecture de l'audio:", error);
            setIsProcessing(false);
            setAnimation("Idle");
          });
      }, 50);
    } else {
      setIsProcessing(false);
      setAnimation("Idle");
    }
  };

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

  return (
    <div className="app-container">
      <Canvas
        shadows
        camera={{ position: [0, 0, 9], fov: 35 }}
      >
        <Experience animationState={animation} />
      </Canvas>

      <button
        className={`action-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
        onClick={handleButtonClick}
        disabled={isProcessing}
      >
        {isRecording ? 'Arrêter l\'enregistrement' :
          isProcessing ? 'Je réfléchis...' : 'Demande moi quelque chose'}
      </button>

      {!isRecording && !isProcessing &&
        <p className="example">ex: Bonjour danse !</p>
      }
    </div>
  );
}

export default App;