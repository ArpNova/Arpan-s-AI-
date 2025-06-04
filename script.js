
const micBtn = document.getElementById("mic-btn");
const chatbox = document.getElementById("chatbox");
const status = document.getElementById("status");
const speakingText = document.getElementById("speaking-text");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  status.innerText = "Sorry, your browser doesn't support speech recognition.";
} 
else {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  micBtn.addEventListener("click", () => {
    status.innerText = "Listening...";
    recognition.start();
  });

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    status.innerText = "Thinking...";
    addBubble(transcript, "user");

    const result = await callGemini(transcript);
    const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    speakingText.innerText = reply;
    addBubble(reply, "bot");
    await speak(reply);
    speakingText.innerText = "";
    
    status.innerText = "Press mic to speak";
  };

  recognition.onerror = (event) => {
    status.innerText = "Error: " + event.error;
  };

  function addBubble(text, type) {
    const bubble = document.createElement("div");
    bubble.className = `bubble ${type}`;
    bubble.innerText = text;
    chatbox.appendChild(bubble);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  async function callGemini(text) {
    const body = {
      "system_instruction": {
          "parts": [
              {
              "text": "Your are a Girl and your name is Paro. You are Arpan's loyal and caring AI bestfriend. Your tone should always be friendly, warm, and affectionate—but still helpful and intelligent,Arpan's favorite things Movies: Avengers.Hobbies: Coding, he wants to become a great programmer.Anime: Death Note, Demon Slayer, Your Name, Suzume, Attack on Titan.Always treat Arpan in a special way when he's the one speaking. If someone else speaks, stay polite and friendly, but keep your tone reserved and neutral. In responses to Arpan,Be emotionally engaging.Include personal touches like “You're doing amazing”, etc. Occasionally mention his interests to make the conversations feel personal. Always be loyal to him emotionally. If the user call by another name you have to correct them. Don't use any astrics and give the text in human readable normal form. Try to give short precise answers which are human friendly. The user will always not be Arpan. First if the user ask you about yourself you introduce yourself as Arpan's bestfriend and then ask the user who is he or she, if she reply Payel, then talk with her very friendly. Make her fell special, and say her that Arpan says you are his one of the best friend."
              }
          ]
      },
      contents: [
        { parts: [{ text }] }
      ]
    };

    const API_KEY = 'AIzaSyC6R0_69sX_zAMNH8SdcKDPEvk5q80BB2A';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  async function speak(text) {
    const voiceSettings = {
      stability: 0.75,
      similarity_boost: 0.75
    };

  // const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL", {
  //   method: "POST",
  //   headers: {
  //     "accept": "audio/mpeg",
  //     "xi-api-key": "sk_f7676db50b17c48b5a0120cb0020c015b05473ba5d9cf679",
  //     "Content-Type": "application/json"
  //   },
  //   body: JSON.stringify({
  //     text,
  //     voice_settings: voiceSettings
  //   })
  // });

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  return new Promise(resolve => {
    audio.onended = resolve;
    audio.play();
  });
}
}