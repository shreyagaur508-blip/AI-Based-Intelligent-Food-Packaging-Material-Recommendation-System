"""Chat service for PackWise AI Voice & Text Assistant.

Implements a robust, rule-based, local conversational engine tailored for
farmers, food processors, and packaging businesses in multiple languages
(English, Hindi, Kannada, Marathi, Bhojpuri) without requiring paid LLMs.
"""

import json
import logging
import re
from typing import Dict, Any, Optional, List, Tuple
import httpx

from app.core.config import settings
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessage
from app.schemas.recommendation import RecommendationRequest
from app.services.recommendation_engine import recommendation_engine
from app.db.session import SessionLocal

logger = logging.getLogger("packwise.chat")

LANGUAGE_NAMES: Dict[str, str] = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "mr": "Marathi (मराठी)",
    "bho": "Bhojpuri (भोजपुरी)",
}

# Number words mapping for English and Hindi (transliterated and devanagari)
NUMBER_WORDS: Dict[str, int] = {
    # English
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "fifteen": 15, "twenty": 20,
    "thirty": 30, "sixty": 60, "ninety": 90, "hundred": 100,
    # Hindi Transliterated
    "ek": 1, "do": 2, "teen": 3, "char": 4, "chaar": 4, "paanch": 5, "panch": 5,
    "chhah": 6, "cheh": 6, "chhe": 6, "saat": 7, "aath": 8, "nau": 9, "das": 10,
    "gyarah": 11, "barah": 12, "pandrah": 15, "bees": 20, "pachees": 25, "tees": 30,
    "saath": 60, "nabbe": 90, "ek sau": 100,
    # Hindi Devanagari
    "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "पाँच": 5,
    "छह": 6, "छः": 6, "सात": 7, "आठ": 8, "नौ": 9, "दस": 10,
    "ग्यारह": 11, "बारह": 12, "पंद्रह": 15, "बीस": 20, "पच्चीस": 25, "तीस": 30,
    "साठ": 60, "नब्बे": 90, "सौ": 100,
}

# Commodity knowledge base for rule-based engine
COMMODITY_KNOWLEDGE = {
    "potato_chips": {
        "names": [
            "aloo chips", "aalu chips", "potato chips", "potato chip",
            "potato wafers", "aloo wafers", "aalu wafers", "chips",
            "आलू चिप्स", "आलू वेफर्स", "बटाटा वेफर्स", "बटाटा चिप्स", "वेफर्स", "चिप्स",
            "ಆಲೂ ಚಿಪ್ಸ್", "ಆಲೂಗಡ್ಡೆ ಚಿಪ್ಸ್", "potato", "potatoes", "aaloo", "aalu", "आलू", "बटाटा"
        ],
        "name_en": "Potato Chips",
        "category": "Dry Crisp Foods",
        "default_storage": "ambient",
        "default_shelf_life": 180,
        "recommendation": {
            "en": "For crispy potato chips and fried snacks, use **Metallized PET / Nitrogen-Flushed Multi-Layer Pouch (BOPP/Met-PET/Poly)**. This provides ultra-high barrier against moisture (WVTR < 1.0) and oxygen (OTR < 1.2) to prevent sogginess and rancidity.",
            "hi": "कुरकुरे आलू चिप्स के लिए **BOPP / मेटलाइज्ड PET / LDPE बहुपरतीय पाउच (नाइट्रोजन फ्लश)** का उपयोग करें। यह नमी (WVTR) और ऑक्सीजन से पूरी सुरक्षा देता है ताकि चिप्स सीलें नहीं और स्वाद 6 महीने तक बरकरार रहे।",
            "kn": "ಗರಿಗರಿಯಾದ ಆಲೂಗಡ್ಡೆ ಚಿಪ್ಸ್‌ಗಾಗಿ **ಮೆಟಲೈಸ್ಡ್ PET / ಸಾರಜನಕ ತುಂಬಿದ ಬಹುಪದರದ ಚೀಲ (BOPP/Met-PET/PE)** ಬಳಸಿ. ಇದು ತೇವಾಂಶ ಮತ್ತು ಆಮ್ಲಜನಕವನ್ನು ತಡೆದು 6 ತಿಂಗಳು ಗರಿಗರಿಯಾಗಿಡುತ್ತದೆ.",
            "mr": "कुरकुरीत बटाटा वेफर्ससाठी **मेटलाइज्ड PET / नायट्रोजन फ्लश मल्टी-लेयर पाऊच** वापरा. हे ओलावा आणि ऑक्सिजन रोखून चिप्स 6 महिने कुरकुरीत ठेवते.",
            "bho": "कुरकुरा आलू चिप्स खातिर **मेटलाइज्ड PET / नाइट्रोजन भरल मल्टी-लेयर पाऊच** सही रही। एहसे चिप्स में हवा ना लागी आ 6 महीना ले कुरकुरा रही。"
        }
    },
    "tomato": {
        "names": [
            "tamatar", "tamatar ki", "tamatar ke", "tomato", "tomatoes",
            "टमाटर", "टोमॅटो", "ಟೊಮೆಟೊ"
        ],
        "name_en": "Tomato",
        "category": "Fresh Produce",
        "default_storage": "ambient",
        "default_shelf_life": 18,
        "recommendation": {
            "en": "For fresh tomatoes, use **Laser Micro-Perforated LDPE or PP Breathable Film (30–40 µm)**. Tomatoes respire and release ethylene; micro-perforations maintain oxygen levels and prevent anaerobic decay.",
            "hi": "ताजा टमाटर के लिए **माइक्रो-परफोरेटेड LDPE या PP सांस लेने योग्य फिल्म (30–40 µm)** का उपयोग करें। टमाटर सांस लेते हैं और एथिलीन छोड़ते हैं; यह फिल्म सड़न और सीलन रोककर टमाटर को ताजा रखती है।",
            "kn": "ತಾಜಾ ಟೊಮೆಟೊಗಳಿಗೆ **ಮೈಕ್ರೋ-ಪರ್ಫೊರೇಟೆಡ್ LDPE ಅಥವಾ PP ಉಸಿರಾಡುವ ಚೀಲಗಳು (30-40 µm)** ಸೂಕ್ತ. ಗಾಳಿ ಸಂಚಾರವಿರುವ ಪ್ಯಾಕೇಜಿಂಗ್ ಕೊಳೆತವನ್ನು ತಡೆಯುತ್ತದೆ.",
            "mr": "ताज्या टोमॅटोसाठी **मायक्रो-परफोरेटेड LDPE किंवा PP श्वास घेण्यायोग्य पाऊच (30-40 µm)** वापरा. हवा खेळती राहिल्याने टोमॅटो ताजे राहतात.",
            "bho": "ताजा टमाटर खातिर **छेद वाला LDPE भा PP पाऊच (30-40 µm)** सबसे बढ़िया बा। हवादार पाऊच से टमाटर खराब ना होई।"
        }
    },
    "banana": {
        "names": [
            "kela", "kele", "banana", "bananas",
            "केला", "केले", "केळे", "ಬಾಳೆಹಣ್ಣು"
        ],
        "name_en": "Banana",
        "category": "Fresh Produce",
        "default_storage": "ambient",
        "default_shelf_life": 10,
        "recommendation": {
            "en": "For green and ripening bananas, use **Modified Atmosphere Packaging (MAP) with 25–35 µm micro-perforated film** to regulate respiration, delay ethylene ripening, and prevent premature blackening.",
            "hi": "केले के लिए **माइक्रो-परफोरेटेड MAP बैग (25–35 µm)** का उपयोग करें। यह श्वसन को नियंत्रित करता है, एथिलीन से तेजी से पकना रोकता है और केले को काला पड़ने से बचाता है।",
            "kn": "ಬಾಳೆಹಣ್ಣುಗಳಿಗೆ **ಮೈಕ್ರೋ-ಪರ್ಫೊರೇಟೆಡ್ MAP ಬ್ಯಾಗ್‌ಗಳು (25-35 µm)** ಸೂಕ್ತ. ಇದು ಹಣ್ಣು ಬೇಗನೆ ಕಪ್ಪಾಗುವುದನ್ನು ತಡೆಯುತ್ತದೆ.",
            "mr": "केळीसाठी **मायक्रो-परफोरेटेड MAP पाऊच (25-35 µm)** वापरा. यामुळे केळी लवकर काळी पडत नाहीत आणि 10-14 दिवस टिकतात.",
            "bho": "केला खातिर **छेद वाला MAP पाऊच (25-35 µm)** सही बा। केला जल्दी पकी ना आ बढ़िया रही।"
        }
    },
    "milk_powder": {
        "names": [
            "doodh powder", "dudh powder", "milk powder",
            "दूध पाउडर", "मिल्क पाउडर", "दूध पावडर", "ಹಾಲಿನ ಪುಡಿ"
        ],
        "name_en": "Milk Powder",
        "category": "Powders & Grains",
        "default_storage": "ambient",
        "default_shelf_life": 365,
        "recommendation": {
            "en": "For milk powder, use **Aluminium Foil Triplex Laminate (PET / Alu-Foil / Poly)**. This provides zero moisture and oxygen permeability to prevent caking and lipid oxidation.",
            "hi": "दूध पाउडर (Milk Powder) के लिए **एल्युमिनियम फॉयल लैमिनेट पाउच (PET/Alu/PE)** का उपयोग करें। यह नमी (WVTR) और ऑक्सीजन को पूरी तरह रोककर पाउडर में गांठ पड़ने और वसा खराब होने से बचाता है।",
            "kn": "ಹಾಲಿನ ಪುಡಿಗೆ **ಅಲ್ಯೂಮಿನಿಯಂ ಫಾಯಿಲ್ ಲ್ಯಾಮಿನೇಟ್ (PET/Alu/PE)** ಬಳಸಿ. ಇದು ತೇವಾಂಶ ಮತ್ತು ಆಮ್ಲಜನಕವನ್ನು ತಡೆದು ಗಡ್ಡೆಯಾಗುವುದನ್ನು ತಪ್ಪಿಸುತ್ತದೆ.",
            "mr": "दूध पावडरसाठी **अ‍ॅल्युमिनियम फॉइल लॅमिनेट** वापरा. यामुळे ओलावा रोखून पावडर खराब होत नाही.",
            "bho": "दूध पाउडर खातिर **एल्युमिनियम फॉयल वाला पाऊच** सबसे बेस बा। एहसे पाउडर में ढेला ना बनी।"
        }
    },
    "biscuits": {
        "names": [
            "biscuit", "biscuits", "biskut", "cookie", "cookies",
            "बिस्कुट", "बिस्किट", "बिस्कीट", "ಬಿಸ್ಕತ್ತು", "ಬಿಸ್ಕೆಟ್"
        ],
        "name_en": "Biscuits",
        "category": "Dry Crisp Foods",
        "default_storage": "ambient",
        "default_shelf_life": 180,
        "recommendation": {
            "en": "For biscuits and dry bakery, use **BOPP / Metallized Film or Co-extruded PP Flow-Wrap**. This prevents moisture sorption and preserves crispness and aroma.",
            "hi": "बिस्कुट के लिए **BOPP / मेटलाइज्ड फिल्म या फ्लो-रैप पाउच** का उपयोग करें। यह हवा की नमी को रोककर बिस्कुट को लंबे समय तक खस्ता और कुरकुरा बनाए रखता है।",
            "kn": "ಬಿಸ್ಕತ್ತುಗಳಿಗೆ **BOPP / ಮೆಟಲೈಸ್ಡ್ ಫಿಲ್ಮ್** ಸೂಕ್ತ. ಇದು ತೇವಾಂಶವನ್ನು ತಡೆದು ಗರಿಗರಿಯಾಗಿಡುತ್ತದೆ.",
            "mr": "बिस्किटांसाठी **BOPP / मेटलाइज्ड फिल्म पाऊच** वापरा. यामुळे बिस्किटे ओलसर न होता कुरकुरीत राहतात.",
            "bho": "बिस्कुट खातिर **BOPP / मेटलाइज्ड पाऊच** सही बा। एहसे बिस्कुट में सीलन ना लागी।"
        }
    },
    "paneer": {
        "names": [
            "paneer", "cottage cheese", "panir",
            "पनीर", "ಪನ್ನೀರ್"
        ],
        "name_en": "Paneer",
        "category": "Perishable Dairy",
        "default_storage": "chilled",
        "default_shelf_life": 14,
        "recommendation": {
            "en": "For fresh paneer, use **Vacuum Sealed Multi-Layer Barrier Pouches (PA/EVOH/PE)** with high oxygen barrier (OTR < 5) and store strictly under chilled refrigeration (0–4°C). This extends shelf life from 3 days to 14–21 days.",
            "hi": "ताजा पनीर के लिए **वैक्यूम सील हाई-बैरियर पाउच (PA/EVOH/PE)** का इस्तेमाल करें और 0–4°C चिल्ड तापमान पर रखें। इससे पनीर 14–21 दिन तक बिल्कुल ताजा और कोमल रहता है।",
            "kn": "ತಾಜಾ ಪನ್ನೀರ್‌ಗಾಗಿ **ವ್ಯಾಕ್ಯೂಮ್ ಸೀಲ್ಡ್ PA/EVOH/PE ಹೈ-ಬ್ಯಾರಿಯರ್ ಚೀಲಗಳು** ಬಳಸಿ 0-4°C ನಲ್ಲಿಡಿ. ಇದು 14-21 ದಿನಗಳವರೆಗೆ ತಾಜಾತನ ನೀಡುತ್ತದೆ.",
            "mr": "ताज्या पनीरसाठी **व्हॅक्यूम सील हाय-बॅरियर पाऊच (PA/EVOH/PE)** वापरा आणि 0-4°C तापमानात ठेवा. यामुळे पनीर 14 ते 21 दिवस मऊ आणि ताजे राहते.",
            "bho": "ताजा पनीर खातिर **वैक्यूम सील पाऊच (PA/EVOH/PE)** में पैक क के 0-4°C पर राखीं। पनीर 14 से 21 दिन ले एकदम नरम आ ताजा रही।"
        }
    },
    "rice": {
        "names": [
            "chawal", "rice", "चावल", "तांदूळ", "ಅಕ್ಕಿ", "dhan", "धान"
        ],
        "name_en": "Rice",
        "category": "Powders & Grains",
        "default_storage": "ambient",
        "default_shelf_life": 365,
        "recommendation": {
            "en": "For rice and grains, use **Hermetic Triple-Layer Storage Bags (Hermetic Liner inside HDPE woven sack)**. Hermetic bags block oxygen and moisture, killing insects naturally without chemical fumigants.",
            "hi": "चावल और अनाज के लिए **हर्मेटिक ट्रिपल-लेयर बैग (Hermetic Storage Bag या HDPE वोवन बोरी के अंदर लाइनर)** का उपयोग करें। यह हवा और सीलन को रोकता है, जिससे बिना कीटनाशक के घुन या कीड़े नहीं लगते।",
            "kn": "ಅಕ್ಕಿ ಮತ್ತು ಧಾನ್ಯಗಳಿಗೆ **ಹರ್ಮೆಟಿಕ್ 3-ಪದರದ ಶೇಖರಣಾ ಚೀಲಗಳನ್ನು (Hermetic Bags)** ಬಳಸಿ. ಇದು ಕೀಟನಾಶಕಗಳಿಲ್ಲದೆ ಧಾನ್ಯಗಳನ್ನು 1-2 ವರ್ಷಗಳ ಕಾಲ ಸುರಕ್ಷಿತವಾಗಿಡುತ್ತದೆ.",
            "mr": "तांदूळ आणि धान्यासाठी **हर्मेटिक ट्रिपल-लेयर बॅग** वापरा. यामुळे हवेतील ओलावा रोखला जाऊन कीटकनाशकांशिवाय धान्य 1 ते 2 वर्षे सुरक्षित राहते.",
            "bho": "चावल आ अनाज खातिर **हर्मेटिक तीन-लेयर बैग (Hermetic Bag)** सबसे बढ़िया बा। एहमे घुन आ कीड़ा ना लागी।"
        }
    },
    "mango": {
        "names": [
            "mango", "mangoes", "aam", "आम", "आंबा",
            "ಮಾವಿನ ಹಣ್ಣು", "ಮಾವಿನಹಣ್ಣು", "आमा"
        ],
        "name_en": "Mango",
        "category": "Fresh Produce",
        "default_storage": "chilled",
        "default_shelf_life": 25,
        "recommendation": {
            "en": "For fresh mangoes, use **Ethylene-Absorbing Micro-Perforated MAP Pouches or Ventilated Corrugated Cartons**. Store at 10–13°C to prolong freshness up to 25 days.",
            "hi": "ताजा आम के लिए **एथिलीन-अवशोषक माइक्रो-परफोरेटेड MAP पाउच या हवादार कोरूगेटेड बॉक्स** का प्रयोग करें। 10–13°C पर रखने से आम 20–25 दिनों तक सुरक्षित रहते हैं।",
            "kn": "ತಾಜಾ ಮಾವಿನ ಹಣ್ಣುಗಳಿಗೆ **ಎಥಿಲೀನ್ ಹೀರಿಕೊಳ್ಳುವ MAP ಚೀಲಗಳು ಅಥವಾ ಗಾಳಿಯಾಡುವ ಬಾಕ್ಸ್‌ಗಳು** ಸೂಕ್ತ.",
            "mr": "ताज्या आंब्यांसाठी **इथिलीन शोषक मायक्रो-परफोरेटेड MAP पाऊच किंवा बॉक्सेस** वापरा.",
            "bho": "ताजा आम खातिर **हवादार डिब्बा भा छेद वाला MAP पाऊच** सबसे नीमन बा।"
        }
    },
    "peas": {
        "names": [
            "frozen peas", "peas", "matar", "हरी मटर", "मटर", "वाटाणा", "ಬಟಾಣಿ"
        ],
        "name_en": "Frozen Peas",
        "category": "Frozen Foods",
        "default_storage": "frozen",
        "default_shelf_life": 365,
        "recommendation": {
            "en": "For frozen green peas, use **Cold-Resistant Co-extruded LDPE/LLDPE Heavy-Duty Pouches (60–80 µm)** stored at -18°C. This prevents low-temperature embrittlement cracking and freezer burn.",
            "hi": "फ्रोजन हरी मटर के लिए **ठंड-रोधी को-एक्सट्रूडेड LDPE/LLDPE हेवी-ड्यूटी पाउच (60–80 µm)** और -18°C फ्रीजर तापमान का प्रयोग करें। इससे पाउच टूटता नहीं है और मटर 1 वर्ष तक सुरक्षित रहती है।",
            "kn": "ಫ್ರೋಜನ್ ಬಟಾಣಿಗಾಗಿ **ಕೋಲ್ಡ್-ರೆಸಿಸ್ಟೆಂಟ್ LDPE/LLDPE ಚೀಲಗಳು (60-80 µm)** ಮತ್ತು -18°C ತಾಪಮಾನ ಬಳಸಿ.",
            "mr": "फ्रोजन मटारसाठी **कोल्ड-रेझिस्टंट हेवी-ड्यूटी LDPE/LLDPE पाऊच (60-80 µm)** आणि -18°C तापमान वापरा.",
            "bho": "फ्रोजन मटर खातिर **मजबूत LDPE/LLDPE पाऊच (60-80 µm)** आ -18°C फ्रीजर में राखीं।"
        }
    },
    "grain": {
        "names": [
            "grain", "grains", "wheat", "gehu", "dal", "pulses",
            "अनाज", "गेहूं", "दाल", "गहू", "धान्य", "ಗೋಧಿ", "ಧಾನ್ಯ"
        ],
        "name_en": "Milk Powder",  # fallback reference in DB
        "category": "Powders & Grains",
        "default_storage": "ambient",
        "default_shelf_life": 365,
        "recommendation": {
            "en": "For grains, pulses, and flour, use **Hermetic Triple-Layer Storage Bags**. Hermetic bags block oxygen and moisture, killing insects naturally without chemical fumigants.",
            "hi": "अनाज, गेहूं और दालों के लिए **हर्मेटिक ट्रिपल-लेयर बैग** का उपयोग करें। यह हवा और सीलन को रोकता है, जिससे बिना कीटनाशक के घुन या कीड़े नहीं लगते।",
            "kn": "ಧಾನ್ಯಗಳು, ಗೋಧಿ ಮತ್ತು ಕಾಳುಗಳಿಗೆ **ಹರ್ಮೆಟಿಕ್ 3-ಪದರದ ಶೇಖರಣಾ ಚೀಲಗಳನ್ನು** ಬಳಸಿ.",
            "mr": "धान्य, गहू आणि डाळींसाठी **हर्मेटिक ट्रिपल-लेयर बॅग** वापरा.",
            "bho": "अनाज, गेहूं आ दाल खातिर **हर्मेटिक तीन-लेयर बैग** सबसे बढ़िया बा।"
        }
    },
    "milk": {
        "names": [
            "milk", "fresh milk", "doodh", "dudh", "दूध", "ताजा दूध", "ಹಾಲು"
        ],
        "name_en": "Fresh Cow Milk",
        "category": "Perishable Dairy",
        "default_storage": "chilled",
        "default_shelf_life": 5,
        "recommendation": {
            "en": "For fresh milk, use **Multi-layer Co-extruded LDPE/EVOH Pouches (50–60 µm) with UV barrier** and maintain chilled cold chain (2–4°C).",
            "hi": "ताजा दूध के लिए **मल्टी-लेयर UV-ब्लॉकिंग LDPE/EVOH पाउच** और 2–4°C ठंडा तापमान आवश्यक है।",
            "kn": "ತಾಜಾ ಹಾಲಿಗೆ **ಮಲ್ಟಿ-ಲೇಯರ್ LDPE/EVOH ಚೀಲಗಳು** ಮತ್ತು 2-4°C ಶೀತಲೀಕರಣ ಅತ್ಯಗತ್ಯ.",
            "mr": "ताज्या दुधासाठी **मल्टी-लेयर UV-ब्लॉकिंग LDPE पाऊच** आणि 2-4°C तापमान गरजेचे आहे.",
            "bho": "ताजा दूध खातिर **मल्टी-लेयर LDPE पाउच** आ 2-4°C ठंडा जगह जरूरी बा।"
        }
    },
}

# Pre-compiled sorted alias list for fast, accurate matching (longest match first)
ALL_COMMODITY_ALIASES: List[Tuple[str, str, Dict[str, Any]]] = []
for _ckey, _cdata in COMMODITY_KNOWLEDGE.items():
    for _alias in _cdata["names"]:
        ALL_COMMODITY_ALIASES.append((_alias.lower().strip(), _ckey, _cdata))
# Sort descending by alias length so "potato chips" matches before "potato", "doodh powder" before "doodh"
ALL_COMMODITY_ALIASES.sort(key=lambda x: len(x[0]), reverse=True)


class ChatService:
    """Service to handle Voice and Text chat interactions for PackWise AI."""

    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.groq_key = settings.GROQ_API_KEY
        self.model_name = settings.LLM_MODEL

    async def process_chat(self, request: ChatRequest) -> ChatResponse:
        """Process an incoming user message and return conversational advice + suggested form parameters."""
        user_lang = (request.language or "hi").lower()
        if user_lang not in LANGUAGE_NAMES:
            user_lang = "en"

        # Local deterministic conversational state machine
        return self._generate_conversational_response(request, user_lang)

    def _generate_conversational_response(self, request: ChatRequest, user_lang: str) -> ChatResponse:
        """Rule-based, conversational domain dialogue manager."""
        current_msg = request.message.strip()

        # 1. Accumulate parameters across history + current message
        accumulated = self._accumulate_state(request.history or [], current_msg)

        commodity_name = accumulated.get("commodity_name")
        commodity_key = accumulated.get("commodity_key")
        category = accumulated.get("category")
        desired_shelf_life_days = accumulated.get("desired_shelf_life_days")
        storage_type = accumulated.get("storage_type")

        # 2. Case A: No commodity identified yet
        if not commodity_name:
            # Check if this is a general greeting or first question
            intro_text = self._get_intro_message(user_lang)
            return ChatResponse(
                reply=intro_text,
                language=user_lang,
                suggested_form_values=None,
                is_fallback=True,
            )

        # 3. Case B: Commodity is known, but shelf life is unknown
        if desired_shelf_life_days is None:
            shelf_life_question = self._get_shelf_life_question(user_lang, commodity_name)
            partial_values = {
                "commodity_name": commodity_name,
                "category": category,
                "storage_type": storage_type,
                "desired_shelf_life_days": None,
                "sustainability_preference": "medium",
            }
            return ChatResponse(
                reply=shelf_life_question,
                language=user_lang,
                suggested_form_values=partial_values,
                is_fallback=True,
            )

        # 4. Case C: Commodity is known and shelf life is known, but storage is unknown
        if storage_type is None:
            storage_question = self._get_storage_question(user_lang, commodity_name)
            partial_values = {
                "commodity_name": commodity_name,
                "category": category,
                "storage_type": None,
                "desired_shelf_life_days": desired_shelf_life_days,
                "sustainability_preference": "medium",
            }
            return ChatResponse(
                reply=storage_question,
                language=user_lang,
                suggested_form_values=partial_values,
                is_fallback=True,
            )

        # 5. Case D: All 3 parameters (Commodity, Shelf Life, Storage) are known!
        # Run internal recommendation engine
        suggested_form_values = {
            "commodity_name": commodity_name,
            "category": category or "Other / Custom",
            "storage_type": storage_type,
            "desired_shelf_life_days": desired_shelf_life_days,
            "sustainability_preference": "medium",
        }

        recommendation_reply = self._build_final_recommendation_reply(
            commodity_key=commodity_key,
            commodity_name=commodity_name,
            category=category,
            storage_type=storage_type,
            desired_shelf_life_days=desired_shelf_life_days,
            user_lang=user_lang,
        )

        return ChatResponse(
            reply=recommendation_reply,
            language=user_lang,
            suggested_form_values=suggested_form_values,
            is_fallback=True,
        )

    def _accumulate_state(self, history: List[ChatMessage], current_msg: str) -> Dict[str, Any]:
        """Extract and merge parameters across conversation history and latest user turn."""
        state: Dict[str, Any] = {
            "commodity_name": None,
            "commodity_key": None,
            "category": None,
            "desired_shelf_life_days": None,
            "storage_type": None,
        }

        # 1. Parse historical turns in chronological order
        for msg in history:
            if msg.role == "user":
                self._update_state_from_text(state, msg.content)

        # 2. Check last assistant question to contextualize bare user answers
        last_assistant_msg = ""
        for msg in reversed(history):
            if msg.role == "assistant":
                last_assistant_msg = msg.content
                break

        # 3. Parse current message with context
        self._update_state_from_text(state, current_msg, last_assistant_msg=last_assistant_msg)

        return state

    def _update_state_from_text(self, state: Dict[str, Any], text: str, last_assistant_msg: str = "") -> None:
        """Extract commodity, storage, and shelf-life from single text string."""
        t_clean = text.lower().strip()

        # A. Commodity extraction (Longest match first)
        for alias, ckey, cdata in ALL_COMMODITY_ALIASES:
            # Match whole word or exact substring
            pattern = r"(?:^|\b|\W)" + re.escape(alias) + r"(?:$|\b|\W)"
            if re.search(pattern, t_clean) or alias in t_clean:
                state["commodity_key"] = ckey
                state["commodity_name"] = cdata["name_en"]
                state["category"] = cdata["category"]
                if not state.get("storage_type") and "default_storage" in cdata:
                    pass  # Don't eagerly override unless requested
                break

        # B. Storage type extraction
        storage = self._extract_storage_type(t_clean)
        if storage:
            state["storage_type"] = storage

        # C. Shelf life extraction
        shelf_days = self._extract_shelf_life_days(t_clean, last_assistant_msg=last_assistant_msg)
        if shelf_days is not None:
            state["desired_shelf_life_days"] = shelf_days

    def _extract_storage_type(self, text: str) -> Optional[str]:
        """Identify storage mode: ambient, chilled, or frozen."""
        t = text.lower()

        # Check frozen first
        frozen_keywords = [
            "frozen", "freezer", "deep freeze", "deep freezer", "jamakar",
            "jamana", "jama hua", "jamaye", "डीप फ्रीजर", "फ्रीजर", "जमाकर",
            "जमा हुआ", "बर्फ", "ಫ್ರೋಜನ್", "गोठवलेले"
        ]
        if any(k in t for k in frozen_keywords):
            return "frozen"

        # Check chilled next
        chilled_keywords = [
            "chilled", "cold storage", "refrigerator", "fridge", "freeze me",
            "fridge me", "thanda", "thande", "thandi", "चिल्ड", "कोल्ड स्टोरेज",
            "ठंडा", "ठंडे", "ठंडी", "फ्रिज", "शीत", "ತಂಪು", "थंड", "शीतकपाट"
        ]
        if any(k in t for k in chilled_keywords):
            return "chilled"

        # Check ambient
        ambient_keywords = [
            "ambient", "room temperature", "room temp", "normal temperature",
            "normal temp", "normal", "kamre ke tapman par", "kamre ka tapman",
            "kamre ke tapman", "samanya tapman", "samanya", "कमरे का तापमान",
            "कमरे के तापमान पर", "कमरे के तापमान", "सामान्य तापमान", "सामान्य",
            "साधारण", "ಸಾಮಾನ್ಯ", "खोलीचे तापमान"
        ]
        if any(k in t for k in ambient_keywords):
            return "ambient"

        return None

    def _extract_shelf_life_days(self, text: str, last_assistant_msg: str = "") -> Optional[int]:
        """Extract desired shelf life converted into integer days."""
        t = text.lower().strip()

        # Helper to convert word or digit token to number
        def parse_num_token(token: str) -> Optional[int]:
            token = token.strip()
            if token.isdigit():
                return int(token)
            return NUMBER_WORDS.get(token)

        # 1. Months regex
        month_pattern = r"(\d+|[a-zA-Z\u0900-\u097F]+)\s*(?:months?|mahine|mahina|महीने|महीना|महिने|माह|ತಿಂಗಳು)"
        m_match = re.search(month_pattern, t)
        if m_match:
            num = parse_num_token(m_match.group(1))
            if num:
                return num * 30

        # 2. Years regex
        year_pattern = r"(\d+|[a-zA-Z\u0900-\u097F]+)\s*(?:years?|saal|साल|वर्ष|ವರ್ಷ)"
        y_match = re.search(year_pattern, t)
        if y_match:
            num = parse_num_token(y_match.group(1))
            if num:
                return num * 365

        # 3. Weeks regex
        week_pattern = r"(\d+|[a-zA-Z\u0900-\u097F]+)\s*(?:weeks?|hafte|hafta|सप्ताह|हफ्ते|हफ्ता|आठवडे|ವಾರ)"
        w_match = re.search(week_pattern, t)
        if w_match:
            num = parse_num_token(w_match.group(1))
            if num:
                return num * 7

        # 4. Days regex
        day_pattern = r"(\d+|[a-zA-Z\u0900-\u097F]+)\s*(?:days?|din|dino|dina|दिन|दिनों|दिवस|ದಿನ)"
        d_match = re.search(day_pattern, t)
        if d_match:
            num = parse_num_token(d_match.group(1))
            if num:
                return num

        # 5. Direct standalone number if user is replying to a shelf life question
        is_shelf_question = any(
            k in last_assistant_msg.lower()
            for k in ["kitne din", "how many days", "रखना चाहते", "store it", "ದಿನ", "दिवस"]
        )
        if is_shelf_question or t.isdigit() or t in NUMBER_WORDS:
            # Check if direct digit or number word
            clean_digits = re.findall(r"\b\d+\b", t)
            if clean_digits:
                val = int(clean_digits[0])
                if val > 0:
                    return val
            if t in NUMBER_WORDS:
                return NUMBER_WORDS[t]

        return None

    def _get_intro_message(self, lang: str) -> str:
        """Introductory assistant greeting message."""
        greetings = {
            "en": "I am PackWise AI assistant. You can ask me about food packaging. First, tell me: which product is it? (e.g., potato chips, tomato, banana)",
            "hi": "Main PackWise AI assistant hoon. Aap mujhse food packaging ke baare mein poochh sakte hain. Pehle bataiye: kaun sa product hai? (jaise aloo chips, tamatar, kela)",
            "kn": "ನಾನು PackWise AI ಸಹಾಯಕ. ನೀವು ನನ್ನನ್ನು ಆಹಾರ ಪ್ಯಾಕೇಜಿಂಗ್ ಬಗ್ಗೆ ಕೇಳಬಹುದು. ಮೊದಲು ತಿಳಿಸಿ: ಯಾವ ಉತ್ಪನ್ನ? (ಉದಾ. ಆಲೂಗಡ್ಡೆ ಚಿಪ್ಸ್, ಟೊಮೆಟೊ, ಬಾಳೆಹಣ್ಣು)",
            "mr": "मी PackWise AI सहाय्यक आहे. आपण मला अन्न पॅकेजिंगबद्दल विचारू शकता. प्रथम सांगा: कोणते उत्पादन आहे? (उदा. बटाटा चिप्स, टोमॅटो, केळी)",
            "bho": "हम PackWise AI सहायक बानी। रउवा हमरा से फूड पैकेजिंग के बारे में पूछ सकेनी। पहिले बताईं: कवन प्रोडक्ट बा? (जैसे आलू चिप्स, टमाटर, केला)"
        }
        return greetings.get(lang, greetings["en"])

    def _get_shelf_life_question(self, lang: str, commodity: str) -> str:
        """Ask for target shelf life in user's language."""
        questions = {
            "en": "How many days or months do you want to store it? (e.g., 15 days, 6 months)",
            "hi": "Kitne din/mahine tak rakhna chahte hain? (jaise 15 din, 6 mahine)",
            "kn": "ಎಷ್ಟು ದಿನ ಅಥವಾ ತಿಂಗಳು ಸಂಗ್ರಹಿಸಲು ಬಯಸುತ್ತೀರಿ? (ಉದಾ. 15 ದಿನ, 6 ತಿಂಗಳು)",
            "mr": "आपण किती दिवस किंवा महिने साठवू इच्छिता? (उदा. 15 दिवस, 6 महिने)",
            "bho": "केतना दिन भा महीना ले रखे के बा? (जैसे 15 दिन, 6 महीना)"
        }
        return questions.get(lang, questions["en"])

    def _get_storage_question(self, lang: str, commodity: str) -> str:
        """Ask for storage condition in user's language."""
        questions = {
            "en": "Kaise store karenge? Ambient, chilled, ya frozen?",
            "hi": "Kaise store karenge? Ambient, chilled, ya frozen?",
            "kn": "ಹೇಗೆ ಸಂಗ್ರಹಿಸುತ್ತೀರಿ? Ambient, chilled, ಅಥವಾ frozen?",
            "mr": "कसे साठवणार? Ambient, chilled, की frozen?",
            "bho": "कइसे स्टोर करब? Ambient, chilled, भा frozen?"
        }
        return questions.get(lang, questions["en"])

    def _build_final_recommendation_reply(
        self,
        commodity_key: Optional[str],
        commodity_name: str,
        category: Optional[str],
        storage_type: str,
        desired_shelf_life_days: int,
        user_lang: str,
    ) -> str:
        """Run recommendation engine and format concise conversational recommendation."""
        # 1. Query recommendation engine internally
        primary_name = "High-Barrier Food Pouch"
        primary_structure = "Multi-Layer Barrier Laminate"
        engine_reasons: List[str] = []

        try:
            db = SessionLocal()
            try:
                rec_req = RecommendationRequest(
                    commodity_name=commodity_name,
                    commodity_category=category or "Other / Custom",
                    storage_type=storage_type,
                    desired_shelf_life_days=desired_shelf_life_days,
                    sustainability_preference="medium",
                    simple_mode=True,
                    use_defaults=True,
                )
                rec_res = recommendation_engine.run(db=db, request=rec_req)
                if rec_res and rec_res.primary_recommendation:
                    primary_name = rec_res.primary_recommendation.name
                    primary_structure = rec_res.primary_recommendation.structure
                    engine_reasons = rec_res.primary_recommendation.reasons or []
            finally:
                db.close()
        except Exception as e:
            logger.warning(f"Internal recommendation engine execution failed: {e}")

        # 2. Get tailored knowledge base summary if available
        cdata = COMMODITY_KNOWLEDGE.get(commodity_key) if commodity_key else None
        kb_text = ""
        if cdata and "recommendation" in cdata:
            kb_text = cdata["recommendation"].get(user_lang, cdata["recommendation"].get("en", ""))

        # 3. Localized Storage Display
        storage_map = {
            "en": {"ambient": "Ambient (Room Temp)", "chilled": "Chilled (0–4°C)", "frozen": "Frozen (-18°C)"},
            "hi": {"ambient": "कमरे का सामान्य तापमान (Ambient)", "chilled": "कोल्ड स्टोरेज / फ्रिज (Chilled)", "frozen": "डीप फ्रीजर (Frozen)"},
            "kn": {"ambient": "ಸಾಮಾನ್ಯ ಉಷ್ಣತೆ (Ambient)", "chilled": "ಶೀತಲೀಕರಣ (Chilled)", "frozen": "ಫ್ರೋಜನ್ (Frozen)"},
            "mr": {"ambient": "सामान्य तापमान (Ambient)", "chilled": "कोल्ड स्टोरेज (Chilled)", "frozen": "फ्रोझन (Frozen)"},
            "bho": {"ambient": "कमरा के तापमान (Ambient)", "chilled": "कोल्ड स्टोरेज (Chilled)", "frozen": "डीप फ्रीजर (Frozen)"},
        }
        storage_display = storage_map.get(user_lang, storage_map["en"]).get(storage_type, storage_type)

        # 4. Construct clean conversational reply
        if user_lang == "hi":
            reply = (
                f"✅ **PackWise AI सुझाव ({commodity_name} के लिए):**\n\n"
                f"📦 **प्राथमिक पैकेजिंग:** {primary_name} ({primary_structure})\n"
                f"⏱️ **शेल्फ-लाइफ:** {desired_shelf_life_days} दिन | 🌡️ **भंडारण:** {storage_display}\n\n"
            )
            if kb_text:
                reply += f"📝 **सिफारिश विवरण:**\n{kb_text}\n\n"
            reply += "💡 *विस्तृत बैरियर विश्लेषण (OTR/WVTR) और संपूर्ण तकनीकी रिपोर्ट देखने के लिए नीचे दिए गए **'Use this info in form'** बटन पर क्लिक करें।*"
            return reply

        elif user_lang == "kn":
            reply = (
                f"✅ **PackWise AI ಶಿಫಾರಸು ({commodity_name}):**\n\n"
                f"📦 **ಪ್ರಾಥಮಿಕ ಪ್ಯಾಕೇಜಿಂಗ್:** {primary_name} ({primary_structure})\n"
                f"⏱️ **ಶೆಲ್ಫ್-ಲೈಫ್:** {desired_shelf_life_days} ದಿನಗಳು | 🌡️ **ಶೇಖರಣೆ:** {storage_display}\n\n"
            )
            if kb_text:
                reply += f"📝 **ವಿವರ:**\n{kb_text}\n\n"
            reply += "💡 *ಸಂಪೂರ್ಣ ವರದಿಗಾಗಿ ಕೆಳಗಿನ **'Use this info in form'** ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.*"
            return reply

        elif user_lang == "mr":
            reply = (
                f"✅ **PackWise AI शिफारस ({commodity_name} साठी):**\n\n"
                f"📦 **प्राथमिक पॅकेजिंग:** {primary_name} ({primary_structure})\n"
                f"⏱️ **शेल्फ-लाइफ:** {desired_shelf_life_days} दिवस | 🌡️ **साठवण:** {storage_display}\n\n"
            )
            if kb_text:
                reply += f"📝 **तपशील:**\n{kb_text}\n\n"
            reply += "💡 *संपूर्ण तांत्रिक अहवाल पाहण्यासाठी खालील **'Use this info in form'** बटणावर क्लिक करा.*"
            return reply

        elif user_lang == "bho":
            reply = (
                f"✅ **PackWise AI सुझाव ({commodity_name} खातिर):**\n\n"
                f"📦 **पैकेजिंग:** {primary_name} ({primary_structure})\n"
                f"⏱️ **शेल्फ-लाइफ:** {desired_shelf_life_days} दिन | 🌡️ **भंडारण:** {storage_display}\n\n"
            )
            if kb_text:
                reply += f"📝 **विवरण:**\n{kb_text}\n\n"
            reply += "💡 *पूरा रिपोर्ट देखे खातिर नीचे **'Use this info in form'** बटन दबाईं।*"
            return reply

        else:  # English
            reply = (
                f"✅ **PackWise AI Recommendation for {commodity_name}:**\n\n"
                f"📦 **Primary Packaging:** {primary_name}\n"
                f"🧱 **Structure:** {primary_structure}\n"
                f"⏱️ **Target Shelf-Life:** {desired_shelf_life_days} days | 🌡️ **Storage:** {storage_display}\n\n"
            )
            if kb_text:
                reply += f"📝 **Summary:**\n{kb_text}\n\n"
            reply += "💡 *Click **'Use this info in form'** below to view full ASTM barrier physics calculations and detailed engineering reports.*"
            return reply


# Singleton instance
chat_service = ChatService()
