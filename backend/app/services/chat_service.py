"""Chat service for PackWise AI Voice & Text Assistant.

Integrates with LLM providers (Gemini, OpenAI, Groq) with intelligent multilingual fallback
specifically tailored for Indian farmers, agribusinesses, and small food processors.
"""

import json
import logging
import re
from typing import Dict, Any, Optional, List, Tuple
import httpx

from app.core.config import settings
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessage

logger = logging.getLogger("packwise.chat")

LANGUAGE_NAMES: Dict[str, str] = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "mr": "Marathi (मराठी)",
    "bho": "Bhojpuri (भोजपुरी)",
}

# Commodity knowledge base for fallback engine
COMMODITY_KNOWLEDGE = {
    "tomato": {
        "names": ["tomato", "tomatoes", "tamatar", "टमाटर", "टोमॅटो", "ಟೊಮೆಟೊ", "टमाटर"],
        "name_en": "Tomato",
        "category": "Fresh Produce",
        "default_storage": "ambient",
        "default_shelf_life": 18,
        "recommendation": {
            "en": "For fresh tomatoes, use **Laser Micro-Perforated LDPE or PP Breathable Film (30–40 µm)**. Tomatoes breathe and release ethylene; sealed pouches without gas permeability will cause anaerobic decay. Keep in well-ventilated ambient or 12°C cool storage.",
            "hi": "ताजा टमाटर के लिए **माइक्रो-परफोरेटेड LDPE या PP सांस लेने योग्य फिल्म (30–40 µm)** का उपयोग करें। टमाटर सांस लेते हैं और एथिलीन गैस छोड़ते हैं; पूरी तरह बंद थैली में वे जल्दी सड़ जाएंगे। इन्हें हवादार जगह या 12°C पर रखें।",
            "kn": "ತಾಜಾ ಟೊಮೆಟೊಗಳಿಗೆ **ಮೈಕ್ರೋ-ಪರ್ಫೊರೇಟೆಡ್ LDPE ಅಥವಾ PP ಉಸಿರಾಡುವ ಚೀಲಗಳು (30-40 µm)** ಸೂಕ್ತ. ಟೊಮೆಟೊಗಳು ಉಸಿರಾಡುವುದರಿಂದ ಗಾಳಿ ಸಂಚಾರವಿರುವ ಪ್ಯಾಕೇಜಿಂಗ್ ಕೊಳೆತವನ್ನು ತಡೆಯುತ್ತದೆ.",
            "mr": "ताज्या टोमॅटोसाठी **मायक्रो-परफोरेटेड LDPE किंवा PP श्वास घेण्यायोग्य पाऊच (30-40 µm)** वापरा. टोमॅटो श्वसन करतात, त्यामुळे हवा खेळती राहणाऱ्या पाऊचमुळे ते 15-20 दिवस ताजे राहतात.",
            "bho": "ताजा टमाटर खातिर **छेद वाला LDPE भा PP पाऊच (30-40 µm)** सबसे बढ़िया बा। टमाटर सांस लेवेला, एहसे हवादार पाऊच से टमाटर 15-20 दिन ले एकदम ताजा रही।"
        }
    },
    "potato": {
        "names": ["potato", "potatoes", "aaloo", "aalu", "आलू", "बटाटा", "ಆಲೂಗಡ್ಡೆ", "आलू"],
        "name_en": "Potato Chips",
        "category": "Dry Crisp Foods",
        "default_storage": "ambient",
        "default_shelf_life": 180,
        "recommendation": {
            "en": "For crispy potato chips and fried snacks, use **Metallized PET / Nitrogen-Flushed Multi-Layer Pouch (BOPP/Met-PET/Poly)**. This provides ultra-high barrier against moisture (WVTR < 1.0) and oxygen to prevent crispness loss and rancidity.",
            "hi": "कुरकुरे आलू चिप्स और नमकीन के लिए **मेटलाइज्ड PET / नाइट्रोजन फ्लश बहुपरतीय पाउच (BOPP/Met-PET/LDPE)** का उपयोग करें। यह नमी (WVTR) और ऑक्सीजन से पूरी सुरक्षा देता है ताकि चिप्स सीलें नहीं और स्वाद 6 महीने तक बरकरार रहे।",
            "kn": "ಗರಿಗರಿಯಾದ ಆಲೂಗಡ್ಡೆ ಚಿಪ್ಸ್‌ಗಾಗಿ **ಮೆಟಲೈಸ್ಡ್ PET / ಸಾರಜನಕ ತುಂಬಿದ ಬಹುಪದರದ ಚೀಲ (BOPP/Met-PET/PE)** ಬಳಸಿ. ಇದು ತೇವಾಂಶ ಮತ್ತು ಆಮ್ಲಜನಕವನ್ನು ತಡೆದು 6 ತಿಂಗಳು ಗರಿಗರಿಯಾಗಿಡುತ್ತದೆ.",
            "mr": "कुरकुरीत बटाटा वेफर्स आणि नमकीनसाठी **मेटलाइज्ड PET / नायट्रोजन फ्लश मल्टी-लेयर पाऊच** वापरा. हे ओलावा आणि ऑक्सिजन रोखून चिप्स 6 महिने कुरकुरीत ठेवते.",
            "bho": "कुरकुरा आलू चिप्स आ नमकीन खातिर **मेटलाइज्ड PET / नाइट्रोजन भरल मल्टी-लेयर पाऊच** सही रही। एहसे चिप्स में हवा ना लागी आ 6 महीना ले कुरकुरा रही।"
        }
    },
    "mango": {
        "names": ["mango", "mangoes", "aam", "आम", "आंबा", "ಮಾವಿನ ಹಣ್ಣು", "ಮಾವಿನಹಣ್ಣು", "आमा"],
        "name_en": "Mango",
        "category": "Fresh Produce",
        "default_storage": "chilled",
        "default_shelf_life": 25,
        "recommendation": {
            "en": "For fresh mangoes and fruit export, use **Ethylene-Absorbing Micro-Perforated MAP Pouches or CFB Ventilated Cartons with Foam Sleeves**. Store at 10–13°C to prevent chilling injury while prolonging freshness up to 25 days.",
            "hi": "ताजा आम और फलों के लिए **एथिलीन-अवशोषक माइक्रो-परफोरेटेड MAP पाउच या हवादार कोरूगेटेड बॉक्स** का प्रयोग करें। 10–13°C पर रखने से आम 20–25 दिनों तक सुरक्षित और मीठे बने रहते हैं।",
            "kn": "ತಾಜಾ ಮಾವಿನ ಹಣ್ಣುಗಳಿಗೆ **ಎಥಿಲೀನ್ ಹೀರಿಕೊಳ್ಳುವ MAP ಚೀಲಗಳು ಅಥವಾ ಗಾಳಿಯಾಡುವ ಬಾಕ್ಸ್‌ಗಳು** ಸೂಕ್ತ. 10-13°C ತಾಪಮಾನದಲ್ಲಿ 25 ದಿನಗಳವರೆಗೆ ತಾಜಾತನ ಕಾಪಾಡಿಕೊಳ್ಳಬಹುದು.",
            "mr": "ताज्या आंब्यांसाठी **इथिलीन शोषक मायक्रो-परफोरेटेड MAP पाऊच किंवा हवा खेळती राहणारे बॉक्सेस** वापरा. 10-13°C तापमानावर आंबे 25 दिवस टिकतात.",
            "bho": "ताजा आम खातिर **हवादार कोरूगेटेड डिब्बा भा छेद वाला MAP पाऊच** सबसे नीमन बा। 10-13°C पर रखला से आम 20-25 दिन ले खराब ना होई।"
        }
    },
    "milk": {
        "names": ["milk", "doodh", "dudh", "दूध", "दूध", "ಹಾಲು", "दूध"],
        "name_en": "Milk Powder",
        "category": "Perishable Dairy",
        "default_storage": "chilled",
        "default_shelf_life": 5,
        "recommendation": {
            "en": "For fresh milk, use **Multi-layer Co-extruded LDPE/EVOH Pouches (50–60 µm) with UV barrier** and maintain chilled cold chain (2–4°C). For milk powder, use **Aluminium Foil Laminate (PET/Alu/PE)** to avoid lipid oxidation.",
            "hi": "ताजा दूध के लिए **मल्टी-लेयर UV-ब्लॉकिंग LDPE/EVOH पाउच** और 2–4°C ठंडा तापमान आवश्यक है। यदि दूध पाउडर है, तो **एल्युमिनियम फॉयल लैमिनेट (PET/Alu/PE)** पाउच लें ताकि वसा खराब न हो।",
            "kn": "ತಾಜಾ ಹಾಲಿಗೆ **ಮಲ್ಟಿ-ಲೇಯರ್ LDPE/EVOH ಚೀಲಗಳು** ಮತ್ತು 2-4°C ಶೀತಲೀಕರಣ ಅತ್ಯಗತ್ಯ. ಹಾಲಿನ ಪುಡಿಗೆ **ಅಲ್ಯೂಮಿನಿಯಂ ಫಾಯಿಲ್ ಲ್ಯಾಮಿನೇಟ್** ಬಳಸಿ.",
            "mr": "ताज्या दुधासाठी **मल्टी-लेयर UV-ब्लॉकिंग LDPE पाऊच** आणि 2-4°C तापमान गरजेचे आहे. दूध पावडरसाठी **अ‍ॅल्युमिनियम फॉइल लॅमिनेट** वापरा.",
            "bho": "ताजा दूध खातिर **मल्टी-लेयर LDPE पाउच** आ 2-4°C ठंडा जगह जरूरी बा। दूध पाउडर खातिर **एल्युमिनियम फॉयल वाला पाऊच** सबसे बेस रही।"
        }
    },
    "paneer": {
        "names": ["paneer", "cottage cheese", "पनीर", "ಪನ್ನೀರ್", "पनीर"],
        "name_en": "Paneer",
        "category": "Perishable Dairy",
        "default_storage": "chilled",
        "default_shelf_life": 14,
        "recommendation": {
            "en": "For fresh paneer, use **Vacuum Sealed Multi-Layer Barrier Pouches (PA/EVOH/PE)** with high oxygen barrier (OTR < 5) and store strictly under chilled refrigeration (0–4°C). This extends shelf life from 3 days to 14–21 days.",
            "hi": "ताजा पनीर के लिए **वैक्यूम सील हाई-बैरियर पाउच (PA/PE या EVOH)** का इस्तेमाल करें और 0–4°C चिल्ड तापमान पर रखें। इससे पनीर 3 दिन के बजाय 14–21 दिन तक बिल्कुल ताजा और कोमल रहता है।",
            "kn": "ತಾಜಾ ಪನ್ನೀರ್‌ಗಾಗಿ **ವ್ಯಾಕ್ಯೂಮ್ ಸೀಲ್ಡ್ PA/PE ಅಥವಾ EVOH ಹೈ-ಬ್ಯಾರಿಯರ್ ಚೀಲಗಳು** ಬಳಸಿ 0-4°C ನಲ್ಲಿಡಿ. ಇದು 14-21 ದಿನಗಳವರೆಗೆ ತಾಜಾತನ ನೀಡುತ್ತದೆ.",
            "mr": "ताज्या पनीरसाठी **व्हॅक्यूम सील हाय-बॅरियर पाऊच (PA/PE)** वापरा आणि 0-4°C तापमानात ठेवा. यामुळे पनीर 14 ते 21 दिवस मऊ आणि ताजे राहते.",
            "bho": "ताजा पनीर खातिर **वैक्यूम सील पाऊच (PA/PE)** में पैक क के 0-4°C पर राखीं। पनीर 14 से 21 दिन ले एकदम नरम आ ताजा रही।"
        }
    },
    "grain": {
        "names": ["grain", "grains", "wheat", "rice", "gehu", "chawal", "dhan", "dal", "pulses", "अनाज", "गेहूं", "चावल", "दाल", "धान", "ಧಾನ್ಯ", "ಗೋಧಿ", "ಅಕ್ಕಿ", "गहू", "तांदूळ"],
        "name_en": "Milk Powder",  # maps closest to dry powders/grains
        "category": "Powders & Grains",
        "default_storage": "ambient",
        "default_shelf_life": 365,
        "recommendation": {
            "en": "For grains, pulses, and flour, use **Hermetic Triple-Layer Storage Bags (GrainPro/Hermetic Liner inside HDPE woven sack)**. Hermetic bags block oxygen and moisture, killing insects naturally without chemical fumigants and preserving grain for 1–2 years.",
            "hi": "अनाज, गेहूं, चावल और दालों के लिए **हर्मेटिक ट्रिपल-लेयर बैग (Hermetic Storage Bag या HDPE वोवन बोरी के अंदर लाइनर)** का उपयोग करें। यह हवा और सीलन को रोकता है, जिससे बिना कीटनाशक के 1 से 2 साल तक घुन या कीड़े नहीं लगते।",
            "kn": "ಧಾನ್ಯಗಳು, ಗೋಧಿ ಮತ್ತು ಕಾಳುಗಳಿಗೆ **ಹರ್ಮೆಟಿಕ್ 3-ಪದರದ ಶೇಖರಣಾ ಚೀಲಗಳನ್ನು (Hermetic Bags)** ಬಳಸಿ. ಇದು ಕೀಟನಾಶಕಗಳಿಲ್ಲದೆ ಧಾನ್ಯಗಳನ್ನು 1-2 ವರ್ಷಗಳ ಕಾಲ ಸುರಕ್ಷಿತವಾಗಿಡುತ್ತದೆ.",
            "mr": "धान्य, गहू, तांदूळ आणि डाळींसाठी **हर्मेटिक ट्रिपल-लेयर बॅग** वापरा. यामुळे हवेतील ओलावा रोखला जाऊन कीटकनाशकांशिवाय धान्य 1 ते 2 वर्षे सुरक्षित राहते.",
            "bho": "अनाज, गेहूं आ दाल खातिर **हर्मेटिक तीन-लेयर बैग (Hermetic Bag)** सबसे बढ़िया बा। एहमे घुन आ कीड़ा ना लागी आ अनाज 1-2 साल ले सुरक्षित रही।"
        }
    },
    "banana": {
        "names": ["banana", "bananas", "kela", "केला", "केळे", "ಬಾಳೆಹಣ್ಣು", "केला"],
        "name_en": "Banana",
        "category": "Fresh Produce",
        "default_storage": "ambient",
        "default_shelf_life": 10,
        "recommendation": {
            "en": "For green and ripening bananas, use **Modified Atmosphere Packaging (MAP) with 25–35 µm micro-perforated film** or polyethylene liners with potassium permanganate ethylene absorbers at 13–15°C.",
            "hi": "केले के लिए **माइक्रो-परफोरेटेड MAP बैग (25–35 µm)** या एथिलीन अवशोषक युक्त पॉली बैग का उपयोग 13–15°C पर करें। इससे केले का पकना धीमा होता है और शेल्फ-लाइफ 10–14 दिन बढ़ जाती है।",
            "kn": "ಬಾಳೆಹಣ್ಣುಗಳಿಗೆ **ಮೈಕ್ರೋ-ಪರ್ಫೊರೇಟೆಡ್ MAP ಬ್ಯಾಗ್‌ಗಳು (25-35 µm)** ಸೂಕ್ತ. 13-15°C ನಲ್ಲಿಡುವ ಮೂಲಕ 10-14 ದಿನಗಳವರೆಗೆ ತಾಜಾತನ ಕಾಪಾಡಬಹುದು.",
            "mr": "केळीसाठी **मायक्रो-परफोरेटेड MAP पाऊच** वापरा. 13-15°C तापमानावर ठेवल्यास केळी लवकर काळी पडत नाहीत आणि 10-14 दिवस टिकतात.",
            "bho": "केला खातिर **छेद वाला MAP पाऊच (25-35 µm)** 13-15°C पर राखीं। केला जल्दी पकी ना आ 10-14 दिन ले बढ़िया रही।"
        }
    },
    "peas": {
        "names": ["frozen peas", "peas", "matar", "मटर", "वाटाणा", "ಬಟಾಣಿ", "मटर"],
        "name_en": "Frozen Peas",
        "category": "Frozen Foods",
        "default_storage": "frozen",
        "default_shelf_life": 365,
        "recommendation": {
            "en": "For frozen green peas, use **Cold-Resistant Co-extruded LDPE/LLDPE Heavy-Duty Pouches (60–80 µm)** stored at -18°C. This prevents low-temperature embrittlement cracking and freezer burn.",
            "hi": "फ्रोजन हरी मटर के लिए **ठंड-रोधी को-एक्सट्रूडेड LDPE/LLDPE हेवी-ड्यूटी पाउच (60–80 µm)** और -18°C फ्रीजर तापमान का प्रयोग करें। इससे पाउच टूटता नहीं है और मटर का स्वाद 1 वर्ष तक सुरक्षित रहता है।",
            "kn": "ಫ್ರೋಜನ್ ಬಟಾಣಿಗಾಗಿ **ಕೋಲ್ಡ್-ರೆಸಿಸ್ಟೆಂಟ್ LDPE/LLDPE ಚೀಲಗಳು (60-80 µm)** ಮತ್ತು -18°C ತಾಪಮಾನ ಬಳಸಿ.",
            "mr": "फ्रोजन मटारसाठी **कोल्ड-रेझिस्टंट हेवी-ड्यूटी LDPE/LLDPE पाऊच (60-80 µm)** आणि -18°C तापमान वापरा.",
            "bho": "फ्रोजन मटर खातिर **मजबूत LDPE/LLDPE पाऊच (60-80 µm)** आ -18°C फ्रीजर में राखीं। 1 साल ले मटर फ्रेश रही।"
        }
    },
}


class ChatService:
    """Service to handle Voice and Text chat interactions for PackWise AI."""

    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.groq_key = settings.GROQ_API_KEY
        self.model_name = settings.LLM_MODEL

    async def process_chat(self, request: ChatRequest) -> ChatResponse:
        """Process an incoming user message and return AI advice + suggested form parameters."""
        user_lang = (request.language or "hi").lower()
        if user_lang not in LANGUAGE_NAMES:
            user_lang = "en"

        # 1. Attempt with configured LLM provider (Gemini / OpenAI / Groq)
        if self.gemini_key:
            try:
                response = await self._call_gemini(request, user_lang)
                if response:
                    return response
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back: {e}")

        if self.openai_key or self.groq_key:
            try:
                response = await self._call_openai_compatible(request, user_lang)
                if response:
                    return response
            except Exception as e:
                logger.warning(f"OpenAI/Groq API call failed, falling back: {e}")

        # 2. Seamless Smart Multilingual Fallback Engine
        return self._generate_fallback_response(request, user_lang)

    async def _call_gemini(self, request: ChatRequest, user_lang: str) -> Optional[ChatResponse]:
        """Query Google Gemini API using direct HTTP request."""
        lang_name = LANGUAGE_NAMES.get(user_lang, "Hindi")
        system_instruction = (
            f"You are PackWise AI, a friendly expert packaging assistant for farmers and small food processors.\n"
            f"Help them choose packaging materials by asking simple questions and giving clear advice.\n"
            f"Speak in simple, natural {lang_name}. Avoid complex technical jargon unless the user asks.\n"
            f"When enough info is collected, suggest 1–2 packaging options in simple words with practical reasons.\n"
            f"If the user mentions commodity, storage type (ambient/chilled/frozen), or shelf life in days, note them clearly.\n"
            f"IMPORTANT: Format your final response strictly as a JSON object with this structure:\n"
            f'{{\n  "reply": "Your friendly conversational response in {lang_name}",\n'
            f'  "suggested_form_values": {{\n'
            f'    "commodity_name": "Commodity Name in English or null",\n'
            f'    "category": "Fresh Produce / Dry Crisp Foods / Perishable Dairy / Powders & Grains / Frozen Foods or null",\n'
            f'    "storage_type": "ambient" or "chilled" or "frozen" or null,\n'
            f'    "desired_shelf_life_days": 15 or null\n'
            f'  }}\n}}'
        )

        # Build message contents
        contents = []
        for msg in (request.history or [])[-6:]:
            role = "user" if msg.role == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.content}]})

        contents.append({"role": "user", "parts": [{"text": request.message}]})

        # Gemini 1.5 / 2.5 endpoint
        model = self.model_name if "gemini" in self.model_name else "gemini-1.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_key}"

        payload = {
            "contents": contents,
            "systemInstruction": {"parts": [{"text": system_instruction}]},
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.4,
                "maxOutputTokens": 800,
            }
        }

        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text_content = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_content)
                return ChatResponse(
                    reply=parsed.get("reply", text_content),
                    language=user_lang,
                    suggested_form_values=parsed.get("suggested_form_values") or self._extract_parameters(request.message),
                    is_fallback=False,
                )
            else:
                logger.error(f"Gemini API returned status {resp.status_code}: {resp.text}")
                return None

    async def _call_openai_compatible(self, request: ChatRequest, user_lang: str) -> Optional[ChatResponse]:
        """Query OpenAI or Groq API."""
        is_groq = bool(self.groq_key and not self.openai_key)
        api_key = self.groq_key if is_groq else self.openai_key
        base_url = "https://api.groq.com/openai/v1" if is_groq else "https://api.openai.com/v1"
        model = "llama-3.1-70b-versatile" if is_groq else (self.model_name if "gpt" in self.model_name else "gpt-4o-mini")

        lang_name = LANGUAGE_NAMES.get(user_lang, "Hindi")
        system_instruction = (
            f"You are PackWise AI, a friendly assistant for farmers and small food processors. "
            f"Help them choose packaging materials by asking simple questions and giving clear advice. "
            f"Speak in simple {lang_name}. Avoid technical jargon unless the user asks. "
            f"When enough info is collected, suggest 1–2 packaging options in simple words. "
            f"Return JSON strictly with format: "
            f'{{"reply": "...", "suggested_form_values": {{"commodity_name": "...", "storage_type": "...", "desired_shelf_life_days": 180}}}}'
        )

        messages = [{"role": "system", "content": system_instruction}]
        for msg in (request.history or [])[-6:]:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": request.message})

        payload = {
            "model": model,
            "messages": messages,
            "response_format": {"type": "json_object"},
            "temperature": 0.4,
            "max_tokens": 800,
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(f"{base_url}/chat/completions", json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["choices"][0]["message"]["content"]
                parsed = json.loads(raw_text)
                return ChatResponse(
                    reply=parsed.get("reply", raw_text),
                    language=user_lang,
                    suggested_form_values=parsed.get("suggested_form_values") or self._extract_parameters(request.message),
                    is_fallback=False,
                )
            else:
                logger.error(f"OpenAI/Groq returned status {resp.status_code}: {resp.text}")
                return None

    def _generate_fallback_response(self, request: ChatRequest, user_lang: str) -> ChatResponse:
        """Rule-based intelligent domain assistant for offline/demo operation."""
        msg = request.message.lower().strip()
        extracted = self._extract_parameters(request.message)

        # 1. Match commodity in knowledge base
        matched_item = None
        for key, data in COMMODITY_KNOWLEDGE.items():
            for alias in data["names"]:
                if alias in msg:
                    matched_item = (key, data)
                    break
            if matched_item:
                break

        if matched_item:
            key, item = matched_item
            rec_text = item["recommendation"].get(user_lang, item["recommendation"]["en"])
            
            # Add context for form values
            form_vals = {
                "commodity_name": item["name_en"],
                "category": item["category"],
                "storage_type": extracted.get("storage_type") or item["default_storage"],
                "desired_shelf_life_days": extracted.get("desired_shelf_life_days") or item["default_shelf_life"],
                "sustainability_preference": "medium",
            }

            # Localized closing note
            closings = {
                "en": "\n\n💡 *I have prepared these parameters for you. Click 'Use this info in form' below to run a full barrier physics calculation.*",
                "hi": "\n\n💡 *मैंने आपके उत्पाद की जानकारी नोट कर ली है। संपूर्ण बैरियर विश्लेषण और रिपोर्ट देखने के लिए नीचे दिए गए 'फॉर्म में यह जानकारी भरें' बटन पर क्लिक करें।*",
                "kn": "\n\n💡 *ನಾನು ಈ ಮಾಹಿತಿಯನ್ನು ನಮೂದಿಸಿದ್ದೇನೆ. ಸಂಪೂರ್ಣ ವರದಿಗಾಗಿ ಕೆಳಗಿನ 'ಫಾರ್ಮ್‌ನಲ್ಲಿ ಈ ಮಾಹಿತಿ ಬಳಸಿ' ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.*",
                "mr": "\n\n💡 *मी ही माहिती नोंदवून घेतली आहे. संपूर्ण तांत्रिक अहवाल पाहण्यासाठी खालील 'फॉर्ममध्ये ही माहिती वापरा' बटणावर क्लिक करा.*",
                "bho": "\n\n💡 *हम ई जानकारी नोट क लेले बानी। पूरा रिपोर्ट देखे खातिर नीचे 'फॉर्म में ई जानकारी भरीं' बटन दबाईं।*"
            }

            reply_text = rec_text + closings.get(user_lang, closings["en"])

            return ChatResponse(
                reply=reply_text,
                language=user_lang,
                suggested_form_values=form_vals,
                is_fallback=True,
            )

        # 2. General greetings or common queries
        greetings_hi = ["नमस्ते", "प्रणाम", "हेलो", "हाय", "जय किसान", "राम राम", "नमस्कार"]
        if any(g in msg for g in ["hello", "hi", "hey", "help", "namaste", "pranam"]) or any(g in msg for g in greetings_hi):
            greetings_responses = {
                "en": "Hello! I am your PackWise AI Assistant. Tell me what food product or crop you want to package (e.g., tomatoes, potatoes, grains, milk, snacks, mangoes), and how long you need to store it. You can speak or type!",
                "hi": "नमस्ते! मैं आपका PackWise AI सहायक हूँ। मुझे बताएं कि आप किस खाद्य उत्पाद या फसल (जैसे टमाटर, आलू चिप्स, अनाज, दूध, आम या पनीर) की पैकेजिंग करना चाहते हैं और कितने दिन रखना चाहते हैं। आप बोलकर या लिखकर पूछ सकते हैं!",
                "kn": "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ PackWise AI ಸಹಾಯಕ. ನೀವು ಯಾವ ಆಹಾರ ಪದಾರ್ಥವನ್ನು (ಟೊಮೆಟೊ, ಚಿಪ್ಸ್, ಹಾಲು, ಧಾನ್ಯ, ಮಾವು) ಪ್ಯಾಕ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ ಮತ್ತು ಎಷ್ಟು ದಿನ ಸಂಗ್ರಹಿಸಬೇಕು ಎಂದು ತಿಳಿಸಿ. ನೀವು ಮಾತನಾಡಬಹುದು ಅಥವಾ ಟೈಪ್ ಮಾಡಬಹುದು!",
                "mr": "नमस्कार! मी आपला PackWise AI सहाय्यक आहे. आपण कोणते अन्न किंवा पीक (उदा. टोमॅटो, बटाटा वेफर्स, धान्य, दूध, आंबा, पनीर) पॅक करू इच्छिता आणि किती दिवस साठवायचे आहे ते सांगा. आपण बोलू किंवा टाईप करू शकता!",
                "bho": "प्रणाम! हम राउर PackWise AI सहायक बानी। रउवा कवनो फसल भा अनाज (जइसे टमाटर, चिप्स, दूध, आम, दाल) के पैकिंग करे के बा त बताईं। रउवा बोल के भा लिख के पूछ सकेनी!"
            }
            return ChatResponse(
                reply=greetings_responses.get(user_lang, greetings_responses["en"]),
                language=user_lang,
                suggested_form_values=None,
                is_fallback=True,
            )

        # 3. Default informative fallback asking for details
        fallback_queries = {
            "en": "I understand you are asking about food packaging. Could you please specify:\n1. The name of the food item (e.g. Tomatoes, Potato Chips, Grains, Milk Powder)?\n2. Storage conditions (Ambient room temp, Cold storage / Chilled, or Frozen)?\n3. Desired shelf life in days?\n\nOnce you tell me, I'll recommend the ideal barrier film and thickness!",
            "hi": "मैं समझ गया कि आप पैकेजिंग के बारे में पूछ रहे हैं। कृपया मुझे थोड़ा और बताएं:\n1. उत्पाद का नाम (जैसे टमाटर, चिप्स, अनाज, दूध, पनीर, दाल)?\n2. भंडारण का तापमान (सामान्य कमरे का तापमान, कोल्ड स्टोरेज/चिल्ड, या फ्रोजन)?\n3. कितने दिन सुरक्षित रखना चाहते हैं?\n\nबताते ही मैं आपको सबसे उपयुक्त और किफायती पैकेजिंग सामग्री बताऊंगा!",
            "kn": "ಆಹಾರ ಪ್ಯಾಕೇಜಿಂಗ್ ಕುರಿತು ತಿಳಿಸಲು ದಯವಿಟ್ಟು ಈ ವಿವರಗಳನ್ನು ನೀಡಿ:\n1. ಆಹಾರದ ಹೆಸರು (ಉದಾ. ಟೊಮೆಟೊ, ಧಾನ್ಯ, ಹಾಲು, ಚಿಪ್ಸ್)?\n2. ಶೇಖರಣಾ ವಿಧಾನ (ಸಾಮಾನ್ಯ ಉಷ್ಣತೆ, ಕೋಲ್ಡ್ ಸ್ಟೋರೇಜ್, ಅಥವಾ ಫ್ರೋಜನ್)?\n3. ಎಷ್ಟು ದಿನ ಇಡಲು ಬಯಸುತ್ತೀರಿ?",
            "mr": "अन्न पॅकेजिंगसाठी कृपया खालील माहिती द्या:\n1. पिकाचे किंवा अन्नाचे नाव (उदा. टोमॅटो, वेफर्स, धान्य, दूध, पनीर)?\n2. साठवणूक पद्धत (सामान्य तापमान, कोल्ड स्टोरेज, किंवा फ्रोझन)?\n3. किती दिवस टिकवायचे आहे?\n\nमी आपल्याला योग्य आणि फायदेशीर पॅकिंग सुचवेन!",
            "bho": "पैकेजिंग खातिर तनी ई बात बताईं:\n1. खाद्य पदार्थ के नाम (जइसे टमाटर, आलू चिप्स, अनाज, दूध)?\n2. रखे के जगह (साधारण कमरा, कोल्ड स्टोरेज, भा फ्रीजर)?\n3. केतना दिन सुरक्षित रखे के बा?\n\nहम रउवा खातिर सबसे बढ़िया पैकेजिंग बता देब!"
        }

        return ChatResponse(
            reply=fallback_queries.get(user_lang, fallback_queries["en"]),
            language=user_lang,
            suggested_form_values=extracted if extracted else None,
            is_fallback=True,
        )

    def _extract_parameters(self, text: str) -> Dict[str, Any]:
        """Extract commodity, storage type, and shelf life days from natural language text."""
        result: Dict[str, Any] = {}
        t_lower = text.lower()

        # Commodity matching
        for key, data in COMMODITY_KNOWLEDGE.items():
            for alias in data["names"]:
                if alias in t_lower:
                    result["commodity_name"] = data["name_en"]
                    result["category"] = data["category"]
                    if "default_storage" in data and "storage_type" not in result:
                        result["storage_type"] = data["default_storage"]
                    break
            if "commodity_name" in result:
                break

        # Storage type extraction
        if any(k in t_lower for k in ["chilled", "cold storage", "refrigerator", "fridge", "चिल्ड", "कोल्ड स्टोरेज", "फ्रिज", "ತಂಪು"]):
            result["storage_type"] = "chilled"
        elif any(k in t_lower for k in ["frozen", "freezer", "डीप फ्रीजर", "फ्रीजर", "ಫ್ರೋಜನ್"]):
            result["storage_type"] = "frozen"
        elif any(k in t_lower for k in ["ambient", "room temperature", "normal", "कमरे का तापमान", "सामान्य", "ಸಾಮಾನ್ಯ"]):
            result["storage_type"] = "ambient"

        # Shelf life extraction (e.g. "15 days", "15 din", "15 दिनों", "6 months", "1 year")
        days_match = re.search(r"(\d+)\s*(?:days?|din|dino|दिन|ದಿನ|दिवस)", t_lower)
        if days_match:
            try:
                result["desired_shelf_life_days"] = int(days_match.group(1))
            except ValueError:
                pass
        else:
            months_match = re.search(r"(\d+)\s*(?:months?|mahine|महीने|ತಿಂಗಳು|महिने)", t_lower)
            if months_match:
                try:
                    result["desired_shelf_life_days"] = int(months_match.group(1)) * 30
                except ValueError:
                    pass
            else:
                years_match = re.search(r"(\d+)\s*(?:years?|saal|साल|ವರ್ಷ|वर्ष)", t_lower)
                if years_match:
                    try:
                        result["desired_shelf_life_days"] = int(years_match.group(1)) * 365
                    except ValueError:
                        pass

        return result


# Singleton instance
chat_service = ChatService()
