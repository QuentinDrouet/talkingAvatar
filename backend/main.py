from flask import Flask, request, send_file, jsonify
import whisper
from flask_cors import CORS
from llama_cpp import Llama
import edge_tts
import asyncio
import time

app = Flask(__name__)
CORS(app)

whisper_model = whisper.load_model("small")

MODEL_PATH = "models/llama-2-7b.Q4_K_M.gguf"


async def generate_speech(text, output_path="translated_audio.mp3"):
    start = time.time()
    communicate = edge_tts.Communicate(text, "fr-FR-DeniseNeural")
    await communicate.save(output_path)
    print(f"TTS: {time.time() - start:.2f}s")

llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=512,
    n_batch=1024,
    n_gpu_layers=-1,
    f16_kv=True
)

DANCE_COMMANDS = [
    "bonjour danse", "bonjour, danse", "bonjour danse.", "bonjour, danse.",
    "bonjour donce", "bonjour, donce", "bonjour donce.", "bonjour, dense.",
    "bonjour dense", "bonjour, dense", "bonjour dense.", "bonjour, dense.",
    "danse", "danse.", "donce", "dense"
]

STOP_DANCE_COMMANDS = [
    "arrête de danser", "arrête de dancer.", "arrête de doncer", "arrête de denser.",
    "stop danse", "stop dance.", "stop donce", "stop dense.",
]


@app.route("/translate", methods=["POST"])
def chat_with_audio():
    total_start = time.time()
    whisper_time = time.time()

    if "audio" not in request.files:
        return {"error": "Aucun fichier audio reçu"}, 400

    audio_file = request.files["audio"]
    audio_path = "temp_audio.wav"
    audio_file.save(audio_path)

    result = whisper_model.transcribe(
        audio_path,
        language="fr",
        task="transcribe",
        fp16=True
    )

    transcribed_text = result["text"].lower().strip()

    print(f"Whisper: {time.time() - whisper_time:.2f}s")

    if any(command in transcribed_text for command in STOP_DANCE_COMMANDS):
        return jsonify({"action": "stop_dance"})

    if any(command in transcribed_text for command in DANCE_COMMANDS):
        return jsonify({"action": "dance"})

    try:
        start = time.time()
        print(f"Question: {transcribed_text}")

        prompt = f"### Tu es Elise, une femme de 26 ans, française. Question: {transcribed_text}\n### Réponse: "

        output = llm(
            prompt,
            max_tokens=250,
            temperature=0.2,
            top_p=0.9,
            top_k=10,
            repeat_penalty=1.3,
            echo=False,
            stop=["###", "Question:", "Réponse:"]
        )

        bot_response = output["choices"][0]["text"].strip()
        print(f"LLM: {time.time() - start:.2f}s | Réponse: \"{bot_response}\"")

    except Exception as e:
        app.logger.error(f"Erreur: {str(e)}")
        bot_response = "Désolé, je ne peux pas traiter votre demande pour le moment."

    print(f"Réponse: {bot_response}")

    asyncio.run(generate_speech(bot_response, "translated_audio.mp3"))
    print(f"Total: {time.time() - total_start:.2f}s")

    return send_file("translated_audio.mp3", as_attachment=True, mimetype="audio/mpeg")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5174)
