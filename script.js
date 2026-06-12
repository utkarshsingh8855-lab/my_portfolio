// ==========================================
// 1. CONFIGURATION & GLOBAL VARIABLES
// ==========================================
const GEMINI_KEY = "AIzaSyBSROwkYwyG0Dzz8-WKSzjak60XYz-fRNA"; 
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

// जेमिनी को उत्कर्ष का पर्सनल असिस्टेंट बनाने के लिए सख्त निर्देश
const SYSTEM_INSTRUCTION = `You are the exclusive personal AI Assistant of Utkarsh Singh. 
Utkarsh is a highly capable AI/ML Engineering student in his 4th semester (2nd year) at BP Mandal College of Engineering. 
His core tech stack includes Python, Scikit-Learn, Pandas, NumPy, FastAPI, Docker, and Librosa for audio signal processing. 
His notable projects are:
1. 'Smart Factory Predictive Audio-AI' (An Industry 4.0 acoustic anomaly detection system utilizing CNNs and Librosa, highly relevant for the German automotive sector like BMW/Mercedes).
2. 'GDPR-Compliant Local Privacy AI' (A decentralized edge architecture deploying offline Large Language Models via Ollama to secure enterprise medical and legal documentation).
3. 'Predictive Restaurant Analytics Pipeline' (An end-to-end machine learning solution using Random Forest Regressors with an 89% accuracy metric).
His professional objective is to secure an engineering role in Germany or Scotland based purely on his capabilities and proof of work. 
Answer all queries professionally, keeping responses concise (2-3 sentences max). Always emphasize Utkarsh's technical excellence and architectural mindset.`;

// ==========================================
// 2. CHAT WINDOW TOGGLE
// ==========================================
window.toggleChat = function() {
    const chat = document.getElementById('aiChat');
    if (chat) {
        chat.style.display = (chat.style.display === 'flex') ? 'none' : 'flex';
    }
}

// ==========================================
// 3. SEND MESSAGE TO AI (FIXED & OPTIMIZED)
// ==========================================
window.sendMessage = async function() {
    const input = document.getElementById('userInput');
    const body = document.getElementById('chatBody');
    const status = document.getElementById('aiStatus');
    
    if (!input || !body || !status) return;

    const userText = input.value.trim();
    if (!userText) return;

    // यूजर का मैसेज चैट बॉक्स में दिखाना
    body.innerHTML += `<div class="user-msg" style="text-align: right; margin: 8px 0; padding: 10px; bg-opacity: 10; background: rgba(20, 110, 245, 0.1); border-radius: 8px;">${userText}</div>`;
    input.value = "";
    body.scrollTop = body.scrollHeight;

    // स्टेटस बदलना
    status.innerText = "Typing...";

    try {
        // जेमिनी API को सिस्टम इंस्ट्रक्शन और यूजर टेक्स्ट के साथ कॉल करना
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: userText }] }
                ],
                systemInstruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                },
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("DEBUG DATA:", data);
            throw new Error(data.error ? data.error.message : "API Error");
        }

        if (data.candidates && data.candidates[0].content) {
            const aiRaw = data.candidates[0].content.parts[0].text;
            
            // marked.js से फॉर्मेटिंग चेक करना
            const aiFormatted = (typeof marked !== 'undefined') ? marked.parse(aiRaw) : aiRaw;
            
            body.innerHTML += `<div class="ai-msg" style="text-align: left; margin: 8px 0; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">${aiFormatted}</div>`;
            status.innerText = "Online";
        } else {
            throw new Error("No response received from the model.");
        }

    } catch (error) {
        console.error("AI Error:", error);
        status.innerText = "Offline";
        body.innerHTML += `<div class="ai-msg" style="color: #ef4444; text-align: left; margin: 8px 0; padding: 10px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">System Error: Unable to fetch AI response.</div>`;
    } finally {
        body.scrollTop = body.scrollHeight;
    }
}

// ==========================================
// 4. EVENT LISTENERS SETUP
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const inputField = document.getElementById('userInput');
    if (inputField) {
        inputField.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault(); // फॉर्म सबमिट होने से रोके
                sendMessage();
            }
        });
    }
});
