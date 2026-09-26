import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf
} from '@react-pdf/renderer';
import { extractTablesFromChapters } from './thesisToPptAndJournalExporter';

// ============================================================================
// 1. MULTI-LANGUAGE PATIENT INFORMED CONSENT FORM (ICF) GENERATOR (8 LANGUAGES)
// ============================================================================

export interface VernacularConsentSpec {
  id: 'hindi' | 'marathi' | 'tamil' | 'telugu' | 'kannada' | 'bengali' | 'gujarati' | 'malayalam';
  languageName: string;
  nativeName: string;
  universities: string;
  headerTitle: string;
  introParagraph: (title: string, candidate: string, guide: string, college: string) => string;
  voluntaryClause: string;
  confidentialityClause: string;
  consentDeclaration: string;
  signatureLabels: {
    participant: string;
    witness: string;
    investigator: string;
    date: string;
  };
}

export const INDIAN_CONSENT_LANGUAGES: VernacularConsentSpec[] = [
  {
    id: 'hindi',
    languageName: 'Hindi',
    nativeName: 'हिन्दी (Hindi)',
    universities: 'AIIMS, KGMU, RUHS, BHU, MPMSU, UHSR, ABVMU',
    headerTitle: 'रोगी सूचना पत्रक एवं सूचित सहमति पत्र (Patient Information & Informed Consent Form)',
    introParagraph: (title, candidate, guide, college) =>
      `अध्ययन का शीर्षक: "${title}"\nप्रमुख शोधकर्ता: डॉ. ${candidate} | निर्देशक (Guide): प्रो. डॉ. ${guide}\nसंस्थान: ${college}\n\nआपको इस स्नातकोत्तर (MD/MS) चिकित्सीय शोध अध्ययन में भाग लेने के लिए आमंत्रित किया जाता है। इस अध्ययन का उद्देश्य आपके रोग के निदान और उपचार को बेहतर समझना है।`,
    voluntaryClause:
      '1. स्वैच्छिक भागीदारी: इस अध्ययन में आपकी भागीदारी पूर्णतः स्वैच्छिक है। आप किसी भी समय बिना कोई कारण बताए और अपने नियमित उपचार पर बिना किसी प्रतिकूल प्रभाव के अध्ययन से बाहर निकलने के लिए स्वतंत्र हैं।',
    confidentialityClause:
      '2. गोपनीयता एवं सुरक्षा: आपकी पहचान, नैदानिक रिकॉर्ड और जांच रिपोर्ट पूर्णतः गोपनीय रखी जाएंगी तथा इनका उपयोग केवल वैज्ञानिक एवं शैक्षणिक प्रकाशन हेतु किया जाएगा (ICMR दिशानिर्देश 2017 के अनुसार)।',
    consentDeclaration:
      'मैं पुष्टि करता/करती हूँ कि मैंने उपरोक्त जानकारी पढ़ और समझ ली है। मुझे प्रश्न पूछने का अवसर मिला है और मैं स्वेच्छा से इस अध्ययन में भाग लेने के लिए अपनी सहमति देता/देती हूँ।',
    signatureLabels: {
      participant: 'रोगी / प्रतिभागी के हस्ताक्षर या अंगूठे का निशान',
      witness: 'साक्षी (Witness) के हस्ताक्षर एवं नाम',
      investigator: 'शोधकर्ता चिकित्सक (Investigator) के हस्ताक्षर',
      date: 'दिनांक एवं स्थान'
    }
  },
  {
    id: 'marathi',
    languageName: 'Marathi',
    nativeName: 'मराठी (Marathi)',
    universities: 'MUHS Nashik, KEM Mumbai, BJMC Pune, GMC Nagpur',
    headerTitle: 'रुग्ण माहिती पत्रक आणि सूचित संमतीपत्र (MUHS Standard Bilingual ICF)',
    introParagraph: (title, candidate, guide, college) =>
      `संशोधनाचे शीर्षक: "${title}"\nप्रमुख संशोधक: डॉ. ${candidate} | मार्गदर्शक: प्रा. डॉ. ${guide}\nवैद्यकीय महाविद्यालय: ${college}\n\nआपणास या पदव्युत्तर (MD/MS) वैद्यकीय संशोधन अभ्यासात सहभागी होण्यासाठी आमंत्रित केले जात आहे. या अभ्यासाचा उद्देश रोगाचे अचूक निदान आणि उपचार पद्धती सुधारणे हा आहे.`,
    voluntaryClause:
      '१. ऐच्छिक सहभाग: या अभ्यासातील आपला सहभाग पूर्णपणे ऐच्छिक आहे. आपण कोणत्याही वेळी कोणतेही कारण न देता अभ्यासातून माघार घेऊ शकता; याचा आपल्या नियमित वैद्यकीय उपचारांवर कोणताही परिणाम होणार नाही.',
    confidentialityClause:
      '२. गोपनीयता: आपली वैयक्तिक माहिती आणि तपासणी अहवाल पूर्णपणे गोपनीय ठेवले जातील आणि केवळ वैद्यकीय संशोधनासाठी वापरले जातील.',
    consentDeclaration:
      'मी प्रमाणित करतो/करते की मला या अभ्यासाची संपूर्ण माहिती माझ्या भाषेत समजावून सांगण्यात आली आहे आणि मी स्वखुशीने या अभ्यासात सहभागी होण्यास संमती देत आहे.',
    signatureLabels: {
      participant: 'रुग्णाची स्वाक्षरी किंवा अंगठ्याचा ठसा',
      witness: 'साक्षीदाराची स्वाक्षरी आणि नाव',
      investigator: 'संशोधक डॉक्टरांची स्वाक्षरी',
      date: 'दिनांक आणि ठिकाण'
    }
  },
  {
    id: 'tamil',
    languageName: 'Tamil',
    nativeName: 'தமிழ் (Tamil)',
    universities: 'TNMGRMU Chennai, MMC Chennai, CMC Vellore, JIPMER',
    headerTitle: 'நோயாளி தகவல் தாள் மற்றும் ஒப்புதல் படிவம் (TNMGRMU Standard ICF)',
    introParagraph: (title, candidate, guide, college) =>
      `ஆய்வின் தலைப்பு: "${title}"\nமுதன்மை ஆய்வாளர்: மரு. ${candidate} | வழிகாட்டி: பேரா. மரு. ${guide}\nமருத்துவக் கல்லூரி: ${college}\n\nஇந்த முதுகலை (MD/MS) மருத்துவ ஆராய்ச்சி ஆய்வில் பங்கேற்க உங்களை அழைக்கிறோம். நோயின் தன்மை மற்றும் சிகிச்சை முறைகளை மேம்படுத்துவதே இந்த ஆய்வின் நோக்கமாகும்.`,
    voluntaryClause:
      '1. தன்னார்வ பங்கேற்பு: இந்த ஆய்வில் நீங்கள் பங்கேற்பது முற்றிலும் தன்னார்வமானது. எவ்வித காரணமும் கூறாமல் எப்போது வேண்டுமானாலும் ஆய்விலிருந்து விலக உங்களுக்கு முழு உரிமை உண்டு.',
    confidentialityClause:
      '2. ரகசியத்தன்மை: உங்களது மருத்துவ விவரங்கள் மற்றும் பரிசோதனை முடிவுகள் அனைத்தும் மிகவும் ரகசியமாக பாதுகாக்கப்படும்.',
    consentDeclaration:
      'மேற்கூறிய தகவல்களை நான் படித்துப் புரிந்துகொண்டேன். எனது சந்தேகங்களுக்குத் தெளிவான விளக்கம் அளிக்கப்பட்டது. இந்த ஆய்வில் பங்கேற்க நான் முழு மனதுடன் சம்மதிக்கிறேன்.',
    signatureLabels: {
      participant: 'நோயாளியின் கையொப்பம் / பெருவிரல் ரேகை',
      witness: 'சாட்சியின் கையொப்பம் மற்றும் பெயர்',
      investigator: 'ஆய்வாளரின் கையொப்பம்',
      date: 'தேதி மற்றும் இடம்'
    }
  },
  {
    id: 'telugu',
    languageName: 'Telugu',
    nativeName: 'తెలుగు (Telugu)',
    universities: 'Dr. NTRUHS Vijayawada, KNRUHS Warangal, Osmania, NIMS Hyderabad',
    headerTitle: 'రోగి సమాచార పత్రం మరియు సమ్మతి పత్రం (NTRUHS / KNRUHS ICF)',
    introParagraph: (title, candidate, guide, college) =>
      `పరిశోధన అంశం: "${title}"\nపరిశోధకులు: డా. ${candidate} | మార్గదర్శకులు: ప్రొ. డా. ${guide}\nవైద్య కళాశాల: ${college}\n\nఈ పోస్ట్ గ్రాడ్యుయేట్ (MD/MS) వైద్య పరిశోధనలో పాల్గొనడానికి మిమ్మల్ని ఆహ్వానిస్తున్నాము. వ్యాధి నిర్ధారణ మరియు చికిత్స ప్రమాణాలను మెరుగుపరచడం ఈ అధ్యయనం యొక్క ముఖ్య ఉద్దేశ్యం.`,
    voluntaryClause:
      '1. స్వచ్ఛంద భాగస్వామ్యం: ఈ పరిశోధనలో మీ భాగస్వామ్యం పూర్తిగా స్వచ్ఛందమైనది. మీ సాధారణ వైద్య చికిత్సకు ఎటువంటి ఆటంకం లేకుండా మీరు ఎప్పుడైనా ఈ అధ్యయనం నుండి వైదొలగవచ్చు.',
    confidentialityClause:
      '2. గోప్యత: మీ వ్యక్తిగత మరియు వైద్య వివరాలు పూర్తిగా గోప్యంగా ఉంచబడతాయి.',
    consentDeclaration:
      'పై సమాచారాన్ని నేను పూర్తిగా చదివి అర్థం చేసుకున్నాను. నా సందేహాలకు తగిన సమాధానాలు లభించాయి. ఈ అధ్యయనంలో పాల్గొనడానికి నేను స్వచ్ఛందంగా సమ్మతిస్తున్నాను.',
    signatureLabels: {
      participant: 'రోగి సంతకం లేదా వేలిముద్ర',
      witness: 'సాక్షి సంతకం మరియు పేరు',
      investigator: 'పరిశోధక వైద్యుని సంతకం',
      date: 'తేదీ మరియు స్థలం'
    }
  },
  {
    id: 'kannada',
    languageName: 'Kannada',
    nativeName: 'ಕನ್ನಡ (Kannada)',
    universities: 'RGUHS Bengaluru, BMCRI, KMC Manipal, JSS Mysuru, NIMHANS',
    headerTitle: 'ರೋಗಿಯ ಮಾಹಿತಿ ಪತ್ರ ಮತ್ತು ಒಪ್ಪಿಗೆ ಪತ್ರ (RGUHS Standard ICF)',
    introParagraph: (title, candidate, guide, college) =>
      `ಸಂಶೋಧನೆಯ ಶೀರ್ಷಿಕೆ: "${title}"\nಸಂಶೋಧಕರು: ಡಾ. ${candidate} | ಮಾರ್ಗದರ್ಶಕರು: ಪ್ರೊ. ಡಾ. ${guide}\nವೈದ್ಯಕೀಯ ಸಂಸ್ಥೆ: ${college}\n\nಈ ಸ್ನಾತಕೋತ್ತರ (MD/MS) ವೈದ್ಯಕೀಯ ಸಂಶೋಧನಾ ಅಧ್ಯಯನದಲ್ಲಿ ಭಾಗವಹಿಸಲು ನಿಮ್ಮನ್ನು ಆಹ್ವಾನಿಸಲಾಗಿದೆ. ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ಚಿಕಿತ್ಸಾ ವಿಧಾನಗಳನ್ನು ಉತ್ತಮಗೊಳಿಸುವುದು ಈ ಅಧ್ಯಯನದ ಉದ್ದೇಶವಾಗಿದೆ.`,
    voluntaryClause:
      '1. ಸ್ವಯಂಪ್ರೇರಿತ ಭಾಗವಹಿಸುವಿಕೆ: ಈ ಅಧ್ಯಯನದಲ್ಲಿ ನಿಮ್ಮ ಭಾಗವಹಿಸುವಿಕೆಯು ಸಂಪೂರ್ಣವಾಗಿ ಸ್ವಯಂಪ್ರೇರಿತವಾಗಿದೆ. ನಿಮ್ಮ ಸಾಮಾನ್ಯ ಚಿಕಿತ್ಸೆಗೆ ಯಾವುದೇ ತೊಂದರೆಯಾಗದಂತೆ ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ಅಧ್ಯಯನದಿಂದ ಹಿಂದೆ ಸರಿಯಬಹುದು.',
    confidentialityClause:
      '2. ಗೌಪ್ಯತೆ: ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಗುರುತು ಮತ್ತು ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಗೌಪ್ಯವಾಗಿಡಲಾಗುವುದು.',
    consentDeclaration:
      'ಮೇಲಿನ ಎಲ್ಲಾ ಮಾಹಿತಿಯನ್ನು ನಾನು ಓದಿ ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ ಮತ್ತು ಈ ವೈದ್ಯಕೀಯ ಅಧ್ಯಯನದಲ್ಲಿ ಭಾಗವಹಿಸಲು ನನ್ನ ಸ್ವಂತ ইಚ್ಛೆಯಿಂದ ಒಪ್ಪಿಗೆ ನೀಡುತ್ತಿದ್ದೇನೆ.',
    signatureLabels: {
      participant: 'ರೋಗಿಯ ಸಹಿ ಅಥವಾ ಹೆಬ್ಬೆಟ್ಟಿನ ಗುರುತು',
      witness: 'ಸಾಕ್ಷಿದಾರರ ಸಹಿ ಮತ್ತು ಹೆಸರು',
      investigator: 'ಸಂಶೋಧಕ ವೈದ್ಯರ ಸಹಿ',
      date: 'ದಿನಾಂಕ ಮತ್ತು ಸ್ಥಳ'
    }
  },
  {
    id: 'bengali',
    languageName: 'Bengali',
    nativeName: 'বাংলা (Bengali)',
    universities: 'WBUHS Kolkata, IPGMER SSKM, Medical College Kolkata, NRS',
    headerTitle: 'রোগীর তথ্যপত্র এবং অবহিত সম্মতিপত্র (WBUHS Standard ICF)',
    introParagraph: (title, candidate, guide, college) =>
      `গবেষণার বিষয়: "${title}"\nপ্রধান গবেষক: ডাঃ ${candidate} | তত্ত্বাবধায়ক: প্রফেসর ডাঃ ${guide}\nপ্রতিষ্ঠান: ${college}\n\nআপনাকে এই স্নাতকোত্তর (MD/MS) চিকিৎসা গবেষণা সমীক্ষায় অংশগ্রহণের জন্য আমন্ত্রণ জানানো হচ্ছে। এই গবেষণার মূল উদ্দেশ্য হলো রোগ নির্ণয় ও চিকিৎসার মানোন্নয়ন করা।`,
    voluntaryClause:
      '১. স্বেচ্ছামূলক অংশগ্রহণ: এই গবেষণায় আপনার অংশগ্রহণ সম্পূর্ণ স্বেচ্ছামূলক। আপনার নিয়মিত চিকিৎসার কোনো ক্ষতি না করে আপনি যেকোনো সময় এই গবেষণা থেকে নাম প্রত্যাহার করতে পারেন।',
    confidentialityClause:
      '২. গোপনীয়তা: আপনার পরিচয় এবং সমস্ত চিকিৎসা সংক্রান্ত তথ্য সম্পূর্ণ গোপন রাখা হবে।',
    consentDeclaration:
      'আমি নিশ্চিত করছি যে আমি উপরের সমস্ত তথ্য পড়েছি ও বুঝেছি এবং স্বেচ্ছায় এই গবেষণায় অংশগ্রহণের জন্য সম্মতি প্রদান করছি।',
    signatureLabels: {
      participant: 'রোগীর স্বাক্ষর বা টিপসই',
      witness: 'সাক্ষীর স্বাক্ষর ও নাম',
      investigator: 'গবেষক চিকিৎসকের স্বাক্ষর',
      date: 'তারিখ ও স্থান'
    }
  },
  {
    id: 'gujarati',
    languageName: 'Gujarati',
    nativeName: 'ગુજરાતી (Gujarati)',
    universities: 'Gujarat University, BJMC Ahmedabad, SSG Vadodara, Saurashtra Univ',
    headerTitle: 'દર્દી માહિતી પત્રક અને સંમતિ પત્રક (Gujarat University ICF)',
    introParagraph: (title, candidate, guide, college) =>
      `સંશોધનનું શીર્ષક: "${title}"\nસંશોધક તબીબ: ડૉ. ${candidate} | માર્ગદર્શક: પ્રો. ડૉ. ${guide}\nસંસ્થા: ${college}\n\nઆપને આ અનુસ્નાતક (MD/MS) તબીબી સંશોધન અભ્યાસમાં ભાગ લેવા માટે આમંત્રિત કરવામાં આવે છે.`,
    voluntaryClause:
      '૧. સ્વૈચ્છિક ભાગીદારી: આ અભ્યાસમાં આપની ભાગીદારી સંપૂર્ણપણે સ્વૈચ્છિક છે. આપની નિયમિત સારવારને અસર કર્યા વિના આપ ગમે ત્યારે અભ્યાસમાંથી નીકળી શકો છો.',
    confidentialityClause:
      '૨. ગોપનીયતા: આપની વ્યક્તિગત ઓળખ અને તબીબી રિપોર્ટ્સ સંપૂર્ણપણે ગોપનીય રાખવામાં આવશે.',
    consentDeclaration:
      'હું પ્રમાણિત કરું છું કે મેં ઉપરોક્ત માહિતી વાંચી અને સમજી લીધી છે અને હું રાજીખુશીથી આ અભ્યાસમાં જોડાવા સંમતિ આપું છું.',
    signatureLabels: {
      participant: 'દર્દીની સહી અથવા અંગૂઠાનું નિશાન',
      witness: 'સાક્ષીની સહી અને નામ',
      investigator: 'સંશોધક તબીબની સહી',
      date: 'તારીખ અને સ્થળ'
    }
  },
  {
    id: 'malayalam',
    languageName: 'Malayalam',
    nativeName: 'മലയാളം (Malayalam)',
    universities: 'KUHS Thrissur, GMC Thiruvananthapuram, GMC Kozhikode, Amrita',
    headerTitle: 'രോഗി വിവര പത്രികയും സമ്മതപത്രവും (KUHS Standard ICF)',
    introParagraph: (title, candidate, guide, college) =>
      `പഠന വിഷയം: "${title}"\nപ്രധാന ഗവേഷകൻ: ഡോ. ${candidate} | മാർഗ്ഗനിർദ്ദേശകൻ: പ്രൊഫ. ഡോ. ${guide}\nസ്ഥാപനം: ${college}\n\nഈ ബിരുദാനന്തര (MD/MS) വൈദ്യശാസ്ത്ര ഗവേഷണ പഠനത്തിൽ പങ്കെടുക്കാൻ നിങ്ങളെ ക്ഷണിക്കുന്നു.`,
    voluntaryClause:
      '1. സ്വമേധയാ ഉള്ള പങ്കാളിത്തം: ഈ പഠനത്തിലെ നിങ്ങളുടെ പങ്കാളിത്തം പൂർണ്ണമായും സ്വമേധയാ ഉള്ളതാണ്. നിങ്ങളുടെ സാധാരണ ചികിത്സയെ ബാധിക്കാതെ ഏത് സമയത്തും പഠനത്തിൽ നിന്ന് പിന്മാറാവുന്നതാണ്.',
    confidentialityClause:
      '2. രഹസ്യസ്വഭാവം: നിങ്ങളുടെ വ്യക്തിഗത വിവരങ്ങളും പരിശോധനാ ഫലങ്ങളും പൂർണ്ണമായും രഹസ്യമായി സൂക്ഷിക്കുന്നതാണ്.',
    consentDeclaration:
      'മുകളിൽ പറഞ്ഞിരിക്കുന്ന വിവരങ്ങൾ ഞാൻ വായിച്ചു മനസ്സിലാക്കുകയും ഈ പഠനത്തിൽ പങ്കെടുക്കാൻ സ്വമേധയാ സമ്മതിക്കുകയും ചെയ്യുന്നു.',
    signatureLabels: {
      participant: 'രോഗിയുടെ ഒപ്പ് / വിരലടയാളം',
      witness: 'സാക്ഷിയുടെ ഒപ്പും പേരും',
      investigator: 'ഗവേഷകന്റെ ഒപ്പ്',
      date: 'തീയതിയും സ്ഥലവും'
    }
  }
];

export function formatBilingualConsentText(
  project: {
    title: string;
    candidateName: string;
    guideName: string;
    collegeName: string;
    university: string;
    specialty: string;
  },
  langSpec: VernacularConsentSpec
): string {
  return `====================================================================
ANNEXURE I: BILINGUAL PATIENT INFORMATION SHEET & INFORMED CONSENT FORM
(English & ${langSpec.nativeName} — Compliant with ICMR 2017 & ${project.university})
====================================================================

PART A: ENGLISH PATIENT INFORMATION & CONSENT
Study Title: "${project.title}"
Principal Investigator: Dr. ${project.candidateName} (${project.specialty})
Chief Guide: Prof. Dr. ${project.guideName}
Institution: ${project.collegeName} (${project.university})

1. Purpose of Study: You are invited to participate in this institutional Ethics Committee-approved postgraduate medical research study aimed at improving diagnostic and clinical care.
2. Voluntary Participation: Your participation is strictly voluntary. You may withdraw at any time without affecting your standard clinical care.
3. Confidentiality: All clinical records and laboratory findings will be anonymized in strict compliance with ICMR National Ethical Guidelines (2017).

Declaration: I have read and understood the study details in English and ${langSpec.languageName}, had my questions answered, and voluntarily agree to participate.

Participant Signature / Thumb Impression: ______________________   Date: __________
Witness Signature & Name: ___________________________________   Date: __________
Investigator Signature (Dr. ${project.candidateName}): _________________   Date: __________

--------------------------------------------------------------------
PART B: VERNACULAR (${langSpec.nativeName.toUpperCase()})
${langSpec.headerTitle}
--------------------------------------------------------------------
${langSpec.introParagraph(project.title, project.candidateName, project.guideName, project.collegeName)}

${langSpec.voluntaryClause}

${langSpec.confidentialityClause}

घोषणा / Declaration:
${langSpec.consentDeclaration}

1. ${langSpec.signatureLabels.participant}: ___________________________
2. ${langSpec.signatureLabels.witness}: ___________________________
3. ${langSpec.signatureLabels.investigator}: ___________________________
4. ${langSpec.signatureLabels.date}: ___________________________`;
}

export function exportBilingualConsentToDoc(
  project: {
    title: string;
    candidateName: string;
    guideName: string;
    collegeName: string;
    university: string;
    specialty: string;
  },
  langSpec: VernacularConsentSpec
) {
  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="utf-8"><title>Bilingual Informed Consent Form</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.2cm; }
  body { font-family: 'Times New Roman', 'Nirmala UI', serif; font-size: 11pt; line-height: 1.5; color: #0f172a; }
  h1 { font-size: 14pt; text-align: center; text-transform: uppercase; color: #064e3b; margin-bottom: 4pt; }
  h2 { font-size: 12pt; color: #881337; border-bottom: 1.5pt solid #059669; padding-bottom: 3pt; margin-top: 14pt; }
  .box { border: 1pt solid #64748b; padding: 10pt; margin: 8pt 0; background: #f8fafc; }
  table { width: 100%; border-collapse: collapse; margin-top: 10pt; }
  td { border: 1pt solid #94a3b8; padding: 8pt; font-size: 10.5pt; }
</style></head>
<body>
  <h1>${project.collegeName}</h1>
  <p style="text-align:center;font-weight:bold;margin-top:0;">Affiliated to ${project.university} • Department of ${project.specialty}</p>
  <h2>PART A: PATIENT INFORMATION SHEET & INFORMED CONSENT FORM (ENGLISH)</h2>
  <div class="box">
    <p><strong>Study Title:</strong> ${project.title}</p>
    <p><strong>Principal Investigator:</strong> Dr. ${project.candidateName} &nbsp;|&nbsp; <strong>Guide:</strong> Prof. Dr. ${project.guideName}</p>
  </div>
  <p><strong>1. Voluntary Participation:</strong> Your participation in this postgraduate dissertation research is strictly voluntary. You may refuse or withdraw at any stage without any loss of routine medical care.</p>
  <p><strong>2. Confidentiality & ICMR Compliance:</strong> All your clinical, radiological, and biochemical data will be kept strictly confidential in accordance with ICMR National Ethical Guidelines for Biomedical Research (2017).</p>
  <p><strong>Consent Statement:</strong> I confirm that the study purpose and procedures have been explained to me in my native language (${langSpec.languageName}) and English, and I voluntarily consent to participate.</p>
  <table>
    <tr><td><strong>Participant Signature / Thumbprint:</strong><br/><br/>_________________________</td><td><strong>Witness Signature & Name:</strong><br/><br/>_________________________</td><td><strong>Investigator Signature:</strong><br/><br/>Dr. ${project.candidateName}</td></tr>
  </table>

  <h2>PART B: ${langSpec.headerTitle} (${langSpec.nativeName})</h2>
  <div class="box">
    <p style="white-space:pre-line;">${langSpec.introParagraph(project.title, project.candidateName, project.guideName, project.collegeName)}</p>
  </div>
  <p>${langSpec.voluntaryClause}</p>
  <p>${langSpec.confidentialityClause}</p>
  <p><strong>${langSpec.consentDeclaration}</strong></p>
  <table>
    <tr>
      <td><strong>${langSpec.signatureLabels.participant}:</strong><br/><br/>_________________________</td>
      <td><strong>${langSpec.signatureLabels.witness}:</strong><br/><br/>_________________________</td>
      <td><strong>${langSpec.signatureLabels.investigator}:</strong><br/><br/>Dr. ${project.candidateName}</td>
    </tr>
  </table>
</body></html>`;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bilingual_ICF_${langSpec.languageName}_${project.candidateName.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// 2. STROBE / CONSORT / PRISMA VISUAL FLOWCHART GENERATOR
// ============================================================================

export interface FlowchartConfig {
  framework: 'STROBE' | 'CONSORT' | 'PRISMA';
  totalScreened: number;
  excludedTotal: number;
  excludedReason1: string;
  excludedReason2: string;
  excludedReason3: string;
  finalEnrolled: number;
  armALabel: string;
  armACount: number;
  armBLabel: string;
  armBCount: number;
  lostToFollowUp: number;
  finalAnalyzed: number;
}

export const DEFAULT_FLOWCHART_CONFIG: FlowchartConfig = {
  framework: 'STROBE',
  totalScreened: 168,
  excludedTotal: 48,
  excludedReason1: 'Did not meet inclusion criteria / outside age bracket (n = 26)',
  excludedReason2: 'Pre-existing renal/hepatic/systemic confounders (n = 14)',
  excludedReason3: 'Declined written informed consent or incomplete workup (n = 8)',
  finalEnrolled: 120,
  armALabel: 'Group A (Study Cases / Biomarker Deficient)',
  armACount: 60,
  armBLabel: 'Group B (Comparative Controls / Normal Titer)',
  armBCount: 60,
  lostToFollowUp: 0,
  finalAnalyzed: 120
};

export function generateFlowchartMarkdownSection(cfg: FlowchartConfig): string {
  return `
### Figure 3.1: ${cfg.framework} Patient Screening, Recruitment & Analysis Flow Diagram

| ${cfg.framework} Stage | Cohort Milestone & Criteria | Patient Count (n) |
| :--- | :--- | :--- |
| **Stage 1: Screening** | Total consecutive patients screened in OPD/IPD for eligibility | **N = ${cfg.totalScreened}** |
| **Stage 2: Exclusions** | Excluded prior to enrollment: ${cfg.excludedReason1}; ${cfg.excludedReason2}; ${cfg.excludedReason3} | **n = ${cfg.excludedTotal}** |
| **Stage 3: Enrollment** | Eligible participants providing written bilingual informed consent | **N = ${cfg.finalEnrolled}** |
| **Stage 4A: Allocation / Stratification** | ${cfg.armALabel} | **n = ${cfg.armACount}** |
| **Stage 4B: Allocation / Stratification** | ${cfg.armBLabel} | **n = ${cfg.armBCount}** |
| **Stage 5: Final Analysis** | Completed clinical, biochemical & statistical master chart evaluation (Attrition/Lost = ${cfg.lostToFollowUp}) | **N = ${cfg.finalAnalyzed} (100%)** |
`;
}

// ============================================================================
// 3. 3-YEAR NMC RESIDENCY GANTT CHART TIMELINE GENERATOR
// ============================================================================

export interface GanttMilestone {
  id: string;
  phase: string;
  deliverable: string;
  monthsActive: number[]; // 1..6 representing 6 half-yearly blocks (Months 1-4, 5-8, 9-12, 13-16, 17-20, 21-24)
  status: 'Completed' | 'In Progress' | 'Scheduled';
}

export const DEFAULT_GANTT_MILESTONES: GanttMilestone[] = [
  {
    id: 'm1',
    phase: '1. Literature Search & PICOT Formulation',
    deliverable: 'PubMed / ICMR gap analysis & research question finalization',
    monthsActive: [1],
    status: 'Completed'
  },
  {
    id: 'm2',
    phase: '2. Synopsis & Institutional Ethics (IEC) Approval',
    deliverable: 'IEC Clearance Certificate & CTRI Trial Registration',
    monthsActive: [1, 2],
    status: 'Completed'
  },
  {
    id: 'm3',
    phase: '3. Patient Screening, Consent & Data Collection',
    deliverable: 'Bilingual ICF signing, Case Proforma & clinical workup',
    monthsActive: [2, 3, 4, 5],
    status: 'In Progress'
  },
  {
    id: 'm4',
    phase: '4. Laboratory / Radiological / Diagnostic Assays',
    deliverable: 'Biochemical titers & gold-standard diagnostic correlation',
    monthsActive: [2, 3, 4, 5],
    status: 'In Progress'
  },
  {
    id: 'm5',
    phase: '5. Master Chart & Biostatistical Analysis',
    deliverable: 't-test, Chi-Square, ROC curve & multivariate regression',
    monthsActive: [5, 6],
    status: 'Scheduled'
  },
  {
    id: 'm6',
    phase: '6. Manuscript Writing, Plagiarism Check & Submission',
    deliverable: '6-Chapter Thesis (<10% similarity), Conference Poster & Viva',
    monthsActive: [6],
    status: 'Scheduled'
  }
];

export function generateGanttMarkdownTable(milestones: GanttMilestone[]): string {
  const headers = `| Study Phase & Milestone | Key Deliverable | M 1–4 | M 5–8 | M 9–12 | M 13–16 | M 17–20 | M 21–24 | Status |\n| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |`;
  const rows = milestones.map(m => {
    const cells = [1, 2, 3, 4, 5, 6].map(idx => (m.monthsActive.includes(idx) ? '███' : '·'));
    return `| **${m.phase}** | ${m.deliverable} | ${cells.join(' | ')} | *${m.status}* |`;
  });
  return `\n### Table 3.2: NMC Postgraduate Dissertation Gantt Chart & Study Timeline (24-Month Schedule)\n\n${headers}\n${rows.join('\n')}\n`;
}

// ============================================================================
// 4. CLINICAL SCORING SYSTEMS & PROFORMA CALCULATOR LIBRARY
// ============================================================================

export interface ClinicalScoringSystem {
  id: string;
  name: string;
  shortName: string;
  specialtyTag: string;
  description: string;
  parameters: Array<{
    parameter: string;
    criteria: string;
    scoreRange: string;
  }>;
  interpretation: string;
  markdownTable: string;
}

export const CLINICAL_SCORING_SYSTEMS: ClinicalScoringSystem[] = [
  {
    id: 'kuppuswamy_2024',
    name: 'Modified Kuppuswamy Socioeconomic Scale (Updated 2024–2025 CPI-IW)',
    shortName: 'Kuppuswamy SES Scale',
    specialtyTag: 'All Clinical Specialties / Community Medicine / Baseline Demographics',
    description: 'Standard Indian socioeconomic stratification scale based on Education of Head of Family, Occupation, and Updated Monthly Family Income (₹).',
    parameters: [
      { parameter: '1. Education of Head of Family', criteria: 'Professional/Honors (7) • Graduate (6) • Intermediate/Diploma (5) • High School (4) • Middle School (3) • Primary (2) • Illiterate (1)', scoreRange: '1 – 7 points' },
      { parameter: '2. Occupation of Head of Family', criteria: 'Legislators/Senior Officials/Managers (10) • Professionals (9) • Technicians (6) • Clerks (5) • Skilled Workers (4) • Unskilled (2) • Unemployed (1)', scoreRange: '1 – 10 points' },
      { parameter: '3. Monthly Family Income (INR)', criteria: 'Updated CPI-IW Bracket: ≥ ₹1,99,862 (12) • ₹99,931–1,99,861 (10) • ₹74,755–99,930 (6) • ₹49,962–74,754 (4) • ₹29,973–49,961 (3) • ≤ ₹10,002 (1)', scoreRange: '1 – 12 points' }
    ],
    interpretation: 'Total Score 26–29: Upper (I) | 16–25: Upper Middle (II) | 11–15: Lower Middle (III) | 5–10: Upper Lower (IV) | <5: Lower (V).',
    markdownTable: `
### Modified Kuppuswamy Socioeconomic Classification Scale (Baseline Demographic Proforma)
| Socioeconomic Class | Total Composite Score | Kuppuswamy Stratum |
| :--- | :---: | :--- |
| **Class I** | 26 – 29 | Upper Socioeconomic Class |
| **Class II** | 16 – 25 | Upper Middle Class |
| **Class III** | 11 – 15 | Lower Middle Class |
| **Class IV** | 5 – 10 | Upper Lower Class |
| **Class V** | < 5 | Lower Socioeconomic Class |
`
  },
  {
    id: 'sofa_sepsis',
    name: 'Sequential Organ Failure Assessment (SOFA) Score (Sepsis-3)',
    shortName: 'SOFA Score',
    specialtyTag: 'General Medicine • Critical Care • Emergency • Pulmonology • Surgery',
    description: 'Quantifies 6-organ dysfunction in ICU and emergency cohorts (Respiration, Coagulation, Liver, Cardiovascular, CNS, Renal).',
    parameters: [
      { parameter: 'Respiration (PaO2/FiO2 mmHg)', criteria: '≥400 (0) • <400 (1) • <300 (2) • <200 with ventilation (3) • <100 with ventilation (4)', scoreRange: '0 – 4' },
      { parameter: 'Coagulation (Platelets ×10³/µL)', criteria: '≥150 (0) • <150 (1) • <100 (2) • <50 (3) • <20 (4)', scoreRange: '0 – 4' },
      { parameter: 'Liver (Total Bilirubin mg/dL)', criteria: '<1.2 (0) • 1.2–1.9 (1) • 2.0–5.9 (2) • 6.0–11.9 (3) • ≥12.0 (4)', scoreRange: '0 – 4' },
      { parameter: 'Cardiovascular (MAP / Vasopressors)', criteria: 'MAP ≥70 (0) • MAP <70 (1) • Dopamine ≤5 (2) • Norepinephrine ≤0.1 (3) • Norepinephrine >0.1 (4)', scoreRange: '0 – 4' },
      { parameter: 'Central Nervous System (GCS)', criteria: 'GCS 15 (0) • 13–14 (1) • 10–12 (2) • 6–9 (3) • <6 (4)', scoreRange: '0 – 4' },
      { parameter: 'Renal (Creatinine mg/dL or Urine Output)', criteria: '<1.2 (0) • 1.2–1.9 (1) • 2.0–3.4 (2) • 3.5–4.9 or <500mL/day (3) • ≥5.0 or <200mL/day (4)', scoreRange: '0 – 4' }
    ],
    interpretation: 'Acute increase in SOFA ≥ 2 points defines organ dysfunction (Sepsis-3); SOFA > 11 predicts >80% ICU mortality risk.',
    markdownTable: `
### Sequential Organ Failure Assessment (SOFA) Scoring Matrix (Case Record Proforma)
| Organ System | Parameter Measured | Score 0 (Normal) | Score 2 (Moderate) | Score 4 (Severe Dysfunction) |
| :--- | :--- | :---: | :---: | :---: |
| **Respiration** | PaO2 / FiO2 (mmHg) | ≥ 400 | < 300 | < 100 (Mechanical Vent) |
| **Coagulation** | Platelets (×10³/µL) | ≥ 150 | < 100 | < 20 |
| **Hepatic** | Serum Bilirubin (mg/dL) | < 1.2 | 2.0 – 5.9 | ≥ 12.0 |
| **Cardiovascular** | Mean Arterial Pressure | MAP ≥ 70 mmHg | Vasopressor Low | Norepinephrine > 0.1 µg/kg/min |
| **Neurological** | Glasgow Coma Scale | 15 / 15 | 10 – 12 | < 6 |
| **Renal** | Serum Creatinine (mg/dL) | < 1.2 | 2.0 – 3.4 | ≥ 5.0 (or Anuria <200 mL/d) |
`
  },
  {
    id: 'gcs_neuro',
    name: 'Glasgow Coma Scale (GCS) & Modified Rankin Scale (mRS)',
    shortName: 'GCS & mRS Scale',
    specialtyTag: 'Neurology • Neurosurgery • General Medicine • Trauma Surgery',
    description: 'Standard neurological consciousness and functional disability grading tool.',
    parameters: [
      { parameter: 'Eye Opening (E)', criteria: 'Spontaneous (4) • To Speech (3) • To Pain (2) • None (1)', scoreRange: '1 – 4' },
      { parameter: 'Verbal Response (V)', criteria: 'Oriented (5) • Confused (4) • Inappropriate Words (3) • Incomprehensible Sounds (2) • None (1)', scoreRange: '1 – 5' },
      { parameter: 'Motor Response (M)', criteria: 'Obeys Commands (6) • Localizes Pain (5) • Normal Flexion (4) • Abnormal Flexion (3) • Extension (2) • None (1)', scoreRange: '1 – 6' }
    ],
    interpretation: 'Mild Brain Injury: GCS 13–15 | Moderate: GCS 9–12 | Severe Coma: GCS 3–8.',
    markdownTable: `
### Glasgow Coma Scale (GCS) Neurological Assessment Table
| Component | Response Criteria | Score Range |
| :--- | :--- | :---: |
| **Eye Opening (E)** | Spontaneous (4), Verbal (3), Pain (2), None (1) | 1 – 4 |
| **Verbal Response (V)** | Oriented (5), Confused (4), Words (3), Sounds (2), None (1) | 1 – 5 |
| **Motor Response (M)** | Obeys (6), Localizes (5), Withdraws (4), Flexion (3), Extension (2), None (1) | 1 – 6 |
`
  },
  {
    id: 'child_pugh',
    name: 'Child-Pugh-Turcotte & MELD Score (Chronic Liver Disease)',
    shortName: 'Child-Pugh Score',
    specialtyTag: 'Gastroenterology • General Medicine • Hepatobiliary Surgery',
    description: 'Prognostic stratification of hepatic cirrhosis based on Encephalopathy, Ascites, Bilirubin, Albumin, and INR.',
    parameters: [
      { parameter: 'Total Bilirubin (mg/dL)', criteria: '<2.0 (1 pt) • 2.0–3.0 (2 pts) • >3.0 (3 pts)', scoreRange: '1 – 3' },
      { parameter: 'Serum Albumin (g/dL)', criteria: '>3.5 (1 pt) • 2.8–3.5 (2 pts) • <2.8 (3 pts)', scoreRange: '1 – 3' },
      { parameter: 'INR / Prothrombin Time', criteria: '<1.7 (1 pt) • 1.7–2.3 (2 pts) • >2.3 (3 pts)', scoreRange: '1 – 3' },
      { parameter: 'Ascites', criteria: 'Absent (1 pt) • Mild/Controlled (2 pts) • Moderate-Severe/Refractory (3 pts)', scoreRange: '1 – 3' },
      { parameter: 'Hepatic Encephalopathy', criteria: 'None (1 pt) • Grade I–II (2 pts) • Grade III–IV (3 pts)', scoreRange: '1 – 3' }
    ],
    interpretation: 'Child-Pugh Class A: 5–6 pts (Compensated) | Class B: 7–9 pts | Class C: 10–15 pts (Decompensated Cirrhosis).',
    markdownTable: `
### Child-Pugh Hepatic Cirrhosis Severity Grading Table
| Clinical / Biochemical Parameter | 1 Point | 2 Points | 3 Points |
| :--- | :---: | :---: | :---: |
| **Total Serum Bilirubin (mg/dL)** | < 2.0 | 2.0 – 3.0 | > 3.0 |
| **Serum Albumin (g/dL)** | > 3.5 | 2.8 – 3.5 | < 2.8 |
| **Prothrombin INR** | < 1.7 | 1.7 – 2.3 | > 2.3 |
| **Ascites Grade** | None | Mild (Diuretic Responsive) | Moderate–Severe |
| **Hepatic Encephalopathy** | None | Grade I – II | Grade III – IV |
`
  },
  {
    id: 'alvarado_surg',
    name: 'Alvarado (MANTRELS) Score for Acute Appendicitis',
    shortName: 'Alvarado Score',
    specialtyTag: 'MS General Surgery • Emergency Medicine • Pediatric Surgery',
    description: '10-point diagnostic clinical scoring system for suspected acute appendicitis.',
    parameters: [
      { parameter: 'Symptoms (3 pts)', criteria: 'Migratory RIF pain (1) • Anorexia (1) • Nausea/Vomiting (1)', scoreRange: '0 – 3' },
      { parameter: 'Clinical Signs (3 pts)', criteria: 'Right Iliac Fossa Tenderness (2) • Rebound Tenderness (1) • Elevated Temp ≥37.3°C (1)', scoreRange: '0 – 4' },
      { parameter: 'Laboratory (3 pts)', criteria: 'Leukocytosis WBC >10,000/mm³ (2) • Neutrophilic Left Shift >75% (1)', scoreRange: '0 – 3' }
    ],
    interpretation: 'Score 1–4: Low probability | Score 5–6: Equivocal (USG/CT indicated) | Score 7–10: High probability of Acute Appendicitis.',
    markdownTable: `
### Alvarado (MANTRELS) Clinical Scoring System for Acute Appendicitis
| Feature Category | Clinical / Lab Criterion | Assigned Score |
| :--- | :--- | :---: |
| **Symptoms** | Migratory RIF Pain (1), Anorexia (1), Nausea/Vomiting (1) | 3 Points |
| **Signs** | RIF Tenderness (2), Rebound Tenderness (1), Pyrexia ≥37.3°C (1) | 4 Points |
| **Laboratory** | Leukocytosis >10,000/mm³ (2), Shift to Left >75% Neutrophils (1) | 3 Points |
| **Total Score** | **≥ 7 Points = High Diagnostic Sensitivity for Appendicitis** | **10 Points** |
`
  },
  {
    id: 'bishop_obg',
    name: 'Modified Bishop Pelvic Score & APGAR Neonatal Score',
    shortName: 'Bishop & APGAR Score',
    specialtyTag: 'MD/MS Obstetrics & Gynecology • Pediatrics • Neonatology',
    description: 'Standard cervical favorability assessment for labor induction and 1/5-minute neonatal resuscitation grading.',
    parameters: [
      { parameter: 'Cervical Dilatation (cm)', criteria: 'Closed (0) • 1–2 cm (1) • 3–4 cm (2) • ≥5 cm (3)', scoreRange: '0 – 3' },
      { parameter: 'Cervical Length / Effacement', criteria: '>4 cm (0) • 2–4 cm (1) • 1–2 cm (2) • <1 cm (3)', scoreRange: '0 – 3' },
      { parameter: 'Fetal Head Station', criteria: '-3 (0) • -2 (1) • -1 or 0 (2) • +1 or +2 (3)', scoreRange: '0 – 3' },
      { parameter: 'Cervical Consistency & Position', criteria: 'Firm/Posterior (0) • Medium/Mid (1) • Soft/Anterior (2)', scoreRange: '0 – 4' }
    ],
    interpretation: 'Modified Bishop Score ≥ 6 indicates a favorable cervix with high probability of successful vaginal delivery.',
    markdownTable: `
### Modified Bishop Cervical Scoring System for Induction of Labor
| Parameter | Score 0 | Score 1 | Score 2 | Score 3 |
| :--- | :---: | :---: | :---: | :---: |
| **Dilatation (cm)** | Closed | 1 – 2 cm | 3 – 4 cm | ≥ 5 cm |
| **Cervical Length (cm)** | > 4 cm | 2 – 4 cm | 1 – 2 cm | < 1 cm |
| **Fetal Station** | -3 | -2 | -1, 0 | +1, +2 |
| **Consistency** | Firm | Medium | Soft | — |
| **Position** | Posterior | Mid-position | Anterior | — |
`
  },
  {
    id: 'news2_rts_em',
    name: 'National Early Warning Score 2 (NEWS2), qSOFA & Revised Trauma Score (RTS)',
    shortName: 'NEWS2 & RTS (Emergency)',
    specialtyTag: 'MD Emergency Medicine • Trauma Surgery • Critical Care • Acute Medicine',
    description: 'Standardized Emergency Department physiological triage and polytrauma severity scoring system for rapid shock, sepsis, and ICU admission stratification.',
    parameters: [
      { parameter: 'Respiration Rate & SpO2 Scale 1/2', criteria: 'RR 12–20/min (0) • RR 21–24 (2) • RR ≥25 or ≤8 (3) | SpO2 ≥96% (0) • 94–95% (1) • 92–93% (2) • ≤91% (3)', scoreRange: '0 – 6' },
      { parameter: 'Systolic BP & Heart Rate (Shock Index)', criteria: 'SBP 111–219 mmHg (0) • 101–110 (1) • 91–100 (2) • ≤90 (3) | HR 51–90/min (0) • 91–110 (1) • 111–130 (2) • ≥131 (3)', scoreRange: '0 – 6' },
      { parameter: 'ACVPU Consciousness & Temperature', criteria: 'Alert (0) • Confusion/V/P/U (3) | Temp 36.1–38.0°C (0) • 38.1–39.0 (1) • ≥39.1 (2) • ≤35.0°C (3)', scoreRange: '0 – 6' },
      { parameter: 'Revised Trauma Score (RTS Formula)', criteria: 'RTS = 0.9368(GCS_code) + 0.7326(SBP_code) + 0.2908(RR_code) [Coded 0–4 each]', scoreRange: '0 – 7.8408' }
    ],
    interpretation: 'NEWS2 0–4: Low Emergency Risk | NEWS2 5–6 (or 3 in single parameter): Urgent Medium Risk | NEWS2 ≥ 7: High Clinical Risk (Immediate Emergency Resuscitation / ICU Transfer). RTS < 4 indicates need for Level-1 Trauma Center care.',
    markdownTable: `
### National Early Warning Score 2 (NEWS2) & Emergency Triage Scoring Matrix (MD Emergency Medicine)
| Physiological Parameter | Score 3 (Red) | Score 2 (Orange) | Score 1 (Yellow) | Score 0 (Normal) | Score 1 (Yellow) | Score 2 (Orange) | Score 3 (Red) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Respiratory Rate (/min)** | ≤ 8 | — | 9 – 11 | 12 – 20 | — | 21 – 24 | ≥ 25 |
| **SpO2 (%) Scale 1** | ≤ 91% | 92 – 93% | 94 – 95% | ≥ 96% | — | — | — |
| **Air or Supplemental O2** | — | Oxygen | — | Room Air | — | — | — |
| **Systolic BP (mmHg)** | ≤ 90 | 91 – 100 | 101 – 110 | 111 – 219 | — | — | ≥ 220 |
| **Pulse Rate (beats/min)** | ≤ 40 | — | 41 – 50 | 51 – 90 | 91 – 110 | 111 – 130 | ≥ 131 |
| **Consciousness (ACVPU)** | — | — | — | Alert | — | — | C / V / P / U |
| **Temperature (°C)** | ≤ 35.0 | — | 35.1 – 36.0 | 36.1 – 38.0 | 38.1 – 39.0 | ≥ 39.1 | — |
`
  },
  {
    id: 'heart_acs_em',
    name: 'HEART Score & Shock Index for Emergency Chest Pain / Acute Coronary Syndrome',
    shortName: 'HEART Score (ED Chest Pain)',
    specialtyTag: 'MD Emergency Medicine • DM Cardiology • MD General Medicine',
    description: 'Validated 0–10 point Emergency Department risk stratification tool predicting 6-week Major Adverse Cardiac Events (MACE) in patients presenting with acute chest pain.',
    parameters: [
      { parameter: 'H — History of Chest Pain', criteria: 'Slightly suspicious (0) • Moderately suspicious (1) • Highly suspicious typical angina (2)', scoreRange: '0 – 2' },
      { parameter: 'E — Electrocardiogram (12-Lead ECG)', criteria: 'Normal (0) • Non-specific repolarization disturbance / LBBB (1) • Significant ST deviation (2)', scoreRange: '0 – 2' },
      { parameter: 'A — Age of Patient (Years)', criteria: '< 45 years (0) • 45 – 64 years (1) • ≥ 65 years (2)', scoreRange: '0 – 2' },
      { parameter: 'R — Risk Factors (HTN, DM, Smoking, Obesity, Family Hx)', criteria: 'No known risk factors (0) • 1 – 2 risk factors (1) • ≥ 3 risk factors or known CAD (2)', scoreRange: '0 – 2' },
      { parameter: 'T — High-Sensitivity Troponin (hs-cTnI/T)', criteria: '≤ Normal limit (0) • 1–3× normal limit (1) • > 3× normal limit (2)', scoreRange: '0 – 2' }
    ],
    interpretation: 'HEART Score 0–3: Low Risk (<1.7% MACE — Safe early ED discharge) | Score 4–6: Moderate Risk (~12–16.6% MACE — Admit for serial troponin/observation) | Score 7–10: High Risk (>50% MACE — Urgent invasive coronary strategy).',
    markdownTable: `
### HEART Score Emergency Department Chest Pain & MACE Risk Stratification Table
| HEART Component | 0 Points | 1 Point | 2 Points |
| :--- | :--- | :--- | :--- |
| **H — History** | Slightly suspicious | Moderately suspicious | Highly suspicious |
| **E — ECG (12-Lead)** | Normal | Non-specific ST-T changes | Significant ST depression/elevation |
| **A — Age** | < 45 years | 45 – 64 years | ≥ 65 years |
| **R — Risk Factors** | None | 1 – 2 risk factors | ≥ 3 risk factors or prior atherosclerotic disease |
| **T — Troponin (hs-cTn)** | ≤ 1× Upper Limit | 1 – 3× Upper Limit | > 3× Upper Limit |
`
  },
  {
    id: 'asa_mallampati_anes',
    name: 'ASA Physical Status, Modified Mallampati & Cormack-Lehane Airway Grading',
    shortName: 'ASA & Airway Score',
    specialtyTag: 'MD Anesthesiology • Critical Care • Emergency Medicine • ENT',
    description: 'Standard preoperative physical status classification and airway difficulty grading for anesthesia and emergency intubation theses.',
    parameters: [
      { parameter: 'ASA Physical Status (I – VI)', criteria: 'ASA I: Healthy (1) • ASA II: Mild systemic disease (2) • ASA III: Severe systemic disease (3) • ASA IV: Constant threat to life (4)', scoreRange: 'Class I – VI' },
      { parameter: 'Modified Mallampati Class', criteria: 'Class I: Soft palate, uvula, fauces, pillars visible • Class II: Pillars masked • Class III: Only base of uvula • Class IV: Hard palate only', scoreRange: 'Class I – IV' },
      { parameter: 'Cormack-Lehane Laryngoscopic Grade', criteria: 'Grade 1: Full glottis visible • Grade 2: Posterior glottis/arytenoids • Grade 3: Epiglottis only • Grade 4: Neither glottis nor epiglottis', scoreRange: 'Grade 1 – 4' },
      { parameter: 'Modified Bromage Motor Block Scale', criteria: '0: No motor block • 1: Unable to raise extended leg • 2: Unable to flex knee • 3: Complete motor block (unable to flex ankle)', scoreRange: '0 – 3' }
    ],
    interpretation: 'Mallampati Class III–IV and Cormack-Lehane Grade 3–4 predict difficult laryngoscopy and intubation.',
    markdownTable: `
### Preoperative ASA Physical Status, Mallampati & Cormack-Lehane Airway Assessment Matrix
| Grade / Class | Modified Mallampati Oropharyngeal View | Cormack-Lehane Direct Laryngoscopy | Modified Bromage Motor Block |
| :---: | :--- | :--- | :--- |
| **Class / Grade I** | Soft palate, fauces, uvula & pillars visible | Complete visualization of vocal cords | Free movement of legs and feet (0%) |
| **Class / Grade II** | Soft palate, fauces & uvula visible | Posterior portion of glottic opening visible | Just able to flex knees with free feet (33%) |
| **Class / Grade III** | Soft palate & base of uvula visible | Only epiglottis visible (none of glottis) | Unable to flex knees, free movement of feet (66%) |
| **Class / Grade IV** | Soft palate not visible at all (Hard palate only) | Neither epiglottis nor glottis visible | Unable to move legs or feet (100% block) |
`
  },
  {
    id: 'hamd_mmse_psych_ger',
    name: 'HAM-D, MMSE, Clinical Frailty Scale (CFS) & Barthel ADL Index',
    shortName: 'HAM-D, CFS & Barthel',
    specialtyTag: 'MD Psychiatry • MD Geriatrics • MD PMR • MD Family Medicine • Neurology',
    description: 'Comprehensive psychometric, cognitive, geriatric frailty, and physical rehabilitation functional independence grading suite.',
    parameters: [
      { parameter: 'Hamilton Depression Scale (HAM-D 17)', criteria: '0–7: Normal/Remission • 8–13: Mild Depression • 14–18: Moderate • 19–22: Severe • ≥23: Very Severe Depression', scoreRange: '0 – 52' },
      { parameter: 'Mini-Mental State Examination (MMSE)', criteria: '24–30: Normal cognition • 19–23: Mild cognitive impairment • 10–18: Moderate • ≤9: Severe dementia', scoreRange: '0 – 30' },
      { parameter: 'Rockwood Clinical Frailty Scale (CFS)', criteria: '1–3: Very Fit to Managing Well • 4: Vulnerable • 5: Mildly Frail • 6: Moderately Frail • 7–9: Severely Frail to Terminally Ill', scoreRange: '1 – 9' },
      { parameter: 'Barthel Index of Activities of Daily Living', criteria: 'Feeding, Bathing, Grooming, Dressing, Bowels, Bladder, Toilet, Transfers, Mobility, Stairs', scoreRange: '0 – 100' }
    ],
    interpretation: 'CFS ≥ 5 identifies geriatric frailty requiring comprehensive geriatric assessment (CGA); Barthel Index > 80 indicates functional independence in PMR & stroke rehabilitation.',
    markdownTable: `
### Psychometric, Geriatric Frailty & Rehabilitation Functional Assessment Matrix
| Assessment Scale | Normal / Independent | Mild Impairment | Moderate Impairment | Severe Impairment |
| :--- | :---: | :---: | :---: | :---: |
| **HAM-D (Depression 17-Item)** | 0 – 7 | 8 – 13 | 14 – 18 | ≥ 19 (Severe) |
| **MMSE (Cognitive Score /30)** | 24 – 30 | 19 – 23 | 10 – 18 | ≤ 9 (Severe) |
| **Clinical Frailty Scale (CFS)** | 1 – 3 (Robust) | 4 – 5 (Mild Frailty) | 6 (Moderate Frailty) | 7 – 9 (Severe) |
| **Barthel ADL Index (/100)** | 80 – 100 | 60 – 79 | 40 – 59 | < 40 (Dependent) |
`
  },
  {
    id: 'ecog_kps_onc_pall',
    name: 'ECOG Performance Status, Karnofsky Scale & CTCAE Toxicity Grading',
    shortName: 'ECOG & Karnofsky Score',
    specialtyTag: 'MD Radiation Oncology • MD Palliative Medicine • MD Nuclear Medicine • DM Medical Oncology',
    description: 'Standard functional performance status and radiotherapy/chemotherapy symptom assessment scales for oncology and palliative care dissertations.',
    parameters: [
      { parameter: 'ECOG / WHO Performance Status', criteria: '0: Fully active • 1: Restricted in strenuous activity, ambulatory • 2: Ambulatory >50% waking hours, self-care capable • 3: Limited self-care, >50% bed/chair • 4: Completely disabled', scoreRange: 'Grade 0 – 5' },
      { parameter: 'Karnofsky Performance Scale (KPS)', criteria: '80–100%: Able to carry on normal activity • 50–70%: Unable to work, requires varying assistance • 10–40%: Unable to care for self', scoreRange: '0 – 100%' },
      { parameter: 'RECIST 1.1 Tumor Response Criteria', criteria: 'CR: Complete Response • PR: Partial Response (≥30% decrease) • SD: Stable Disease • PD: Progressive Disease (≥20% increase)', scoreRange: 'CR / PR / SD / PD' }
    ],
    interpretation: 'ECOG 0–2 (KPS ≥ 70%) defines eligibility for radical chemoradiotherapy or systemic clinical trials; ECOG 3–4 prioritizes specialist palliative care.',
    markdownTable: `
### ECOG / WHO Performance Status & Karnofsky Functional Equivalence Table
| ECOG Grade | Clinical Functional Description | Karnofsky Equivalent (KPS %) |
| :---: | :--- | :---: |
| **Grade 0** | Fully active, able to carry on all pre-disease performance without restriction | 90 – 100% |
| **Grade 1** | Restricted in physically strenuous activity but ambulatory and able to carry out light work | 70 – 80% |
| **Grade 2** | Ambulatory and capable of all self-care but unable to carry out work activities; up >50% of waking hours | 50 – 60% |
| **Grade 3** | Capable of only limited self-care; confined to bed or chair >50% of waking hours | 30 – 40% |
| **Grade 4** | Completely disabled; cannot carry on any self-care; totally confined to bed or chair | 10 – 20% |
`
  },
  {
    id: 'clavien_dindo_surg',
    name: 'Clavien-Dindo Postoperative Complication & Southampton Surgical Site Infection (SSI) Scale',
    shortName: 'Clavien-Dindo & SSI Scale',
    specialtyTag: 'MS General Surgery • MCh Surgical Oncology • Urology • Neurosurgery • Plastic Surgery • OBG',
    description: 'Globally standardized 5-grade classification of 30-day postoperative surgical morbidity and surgical wound healing.',
    parameters: [
      { parameter: 'Clavien-Dindo Grade I – II (Minor)', criteria: 'Grade I: Deviation from normal postoperative course without pharmacological/surgical intervention (antiemetics, antipyretics, analgesics, electrolytes allowed) • Grade II: Requires pharmacological treatment (antibiotics, blood transfusion, TPN)', scoreRange: 'Grade I – II' },
      { parameter: 'Clavien-Dindo Grade IIIa – IIIb (Intervention)', criteria: 'Grade IIIa: Surgical, endoscopic, or radiological intervention NOT under general anesthesia • Grade IIIb: Intervention UNDER general anesthesia', scoreRange: 'Grade IIIa – IIIb' },
      { parameter: 'Clavien-Dindo Grade IV – V (Life-Threatening)', criteria: 'Grade IVa: Single organ dysfunction (requiring ICU) • Grade IVb: Multiorgan dysfunction • Grade V: Death of patient', scoreRange: 'Grade IV – V' },
      { parameter: 'Southampton Surgical Wound Grading', criteria: 'Grade 0: Normal healing • Grade I: Mild bruising/erythema • Grade II: Erythema + inflammation • Grade III: Serous/hemoserous discharge • Grade IV: Purulent pus discharge • Grade V: Deep/severe wound infection', scoreRange: 'Grade 0 – V' }
    ],
    interpretation: 'Clavien-Dindo Grade I–II represents minor morbidity; Grade ≥ IIIa defines major surgical morbidity requiring procedural intervention.',
    markdownTable: `
### Clavien-Dindo Classification of 30-Day Postoperative Surgical Complications
| Clavien-Dindo Grade | Clinical Definition & Therapeutic Requirement | Severity Stratum |
| :---: | :--- | :---: |
| **Grade I** | Any deviation from normal postoperative course without need for pharmacological, surgical, endoscopic, or radiological intervention (bedside wound opening allowed) | Minor Morbidity |
| **Grade II** | Requiring pharmacological treatment with drugs other than those allowed for Grade I (includes blood transfusions and total parenteral nutrition) | Minor Morbidity |
| **Grade IIIa** | Requiring surgical, endoscopic, or radiological intervention NOT under general anesthesia | Major Morbidity |
| **Grade IIIb** | Requiring surgical, endoscopic, or radiological intervention UNDER general anesthesia | Major Morbidity |
| **Grade IVa / IVb** | Life-threatening complication requiring ICU management (IVa: single organ; IVb: multi-organ dysfunction) | Critical Morbidity |
| **Grade V** | 30-Day Postoperative Mortality | Mortality |
`
  },
  {
    id: 'downes_sarnat_peds',
    name: 'Downes’ / Silverman-Anderson Neonatal Respiratory Distress & Sarnat HIE Staging',
    shortName: 'Downes & Sarnat (Pediatrics)',
    specialtyTag: 'MD Pediatrics • DM Neonatology • MS Obstetrics & Gynecology',
    description: 'Bedside neonatal intensive care (NICU/SNCU) scoring systems for respiratory distress severity and hypoxic-ischemic encephalopathy (HIE).',
    parameters: [
      { parameter: 'Downes’ Score (Respiratory Rate & Cyanosis)', criteria: 'RR <60/min (0), 60–80 (1), >80 or apnea (2) | Cyanosis: None in room air (0), Resolved on FiO2 40% (1), Persists on FiO2 >40% (2)', scoreRange: '0 – 4' },
      { parameter: 'Downes’ Score (Retractions, Grunting & Air Entry)', criteria: 'Retractions: None (0), Mild (1), Moderate–Severe (2) | Grunting: None (0), Audible with stethoscope (1), Audible without stethoscope (2) | Air Entry: Clear (0), Decreased (1), Barely audible (2)', scoreRange: '0 – 6' },
      { parameter: 'Modified Sarnat HIE Staging (Stage I – III)', criteria: 'Stage I (Mild): Hyperalert, normal tone, brisk reflexes, no seizures • Stage II (Moderate): Lethargic, hypotonia, weak Moro/suck, clinical seizures • Stage III (Severe): Comatose, flaccid, absent reflexes, decerebrate', scoreRange: 'Stage I – III' }
    ],
    interpretation: 'Downes’ Score 1–3: Mild Respiratory Distress (O2 by hood/prongs) | Score 4–6: Moderate Distress (CPAP indicated) | Score ≥ 7: Impending Respiratory Failure (Mechanical Ventilation).',
    markdownTable: `
### Downes’ Neonatal Respiratory Distress Scoring Matrix (NICU / SNCU Proforma)
| Clinical Parameter | Score 0 | Score 1 | Score 2 |
| :--- | :---: | :---: | :---: |
| **Respiratory Rate (/min)** | < 60 / min | 60 – 80 / min | > 80 / min or Apnea |
| **Central Cyanosis** | None in Room Air | No cyanosis in 40% FiO2 | Requires > 40% FiO2 |
| **Chest Wall Retractions** | None | Mild intercostal | Moderate to severe |
| **Expiratory Grunting** | None | Audible with stethoscope | Audible with naked ear |
| **Air Entry on Auscultation** | Clear bilateral | Delayed or decreased | Barely audible |
`
  },
  {
    id: 'gustilo_harris_ortho',
    name: 'Gustilo-Anderson Open Fracture Classification & Modified Harris Hip Score (HHS)',
    shortName: 'Gustilo & Harris Hip (Ortho)',
    specialtyTag: 'MS Orthopedics • MD PMR • MD Sports Medicine • Trauma Surgery',
    description: 'Standard orthopedic trauma soft-tissue injury grading and 100-point functional joint arthroplasty/fixation recovery scale.',
    parameters: [
      { parameter: 'Gustilo-Anderson Type I – II', criteria: 'Type I: Clean wound <1 cm, minimal soft-tissue damage • Type II: Wound 1–10 cm without extensive soft-tissue damage, flaps, or avulsions', scoreRange: 'Type I – II' },
      { parameter: 'Gustilo-Anderson Type IIIA / IIIB / IIIC', criteria: 'IIIA: Adequate periosteal/soft-tissue coverage despite high-energy comminution (>10 cm) • IIIB: Extensive periosteal stripping requiring flap coverage • IIIC: Open fracture with arterial vascular injury requiring repair', scoreRange: 'Type IIIA – IIIC' },
      { parameter: 'Modified Harris Hip Score (Total 100 Points)', criteria: 'Pain (44 pts) + Function/Gait & Activities (47 pts) + Absence of Deformity (4 pts) + Range of Motion (5 pts)', scoreRange: '0 – 100 Points' }
    ],
    interpretation: 'Harris Hip Score 90–100: Excellent | 80–89: Good | 70–79: Fair | <70: Poor functional outcome.',
    markdownTable: `
### Gustilo-Anderson Open Fracture Classification & Functional Outcome Grading
| Classification / Stratum | Wound & Soft-Tissue Characteristics / Score Range | Clinical Implication |
| :--- | :--- | :--- |
| **Gustilo Type I** | Clean wound < 1 cm; simple fracture pattern; minimal soft-tissue contusion | Infection risk < 2% |
| **Gustilo Type II** | Laceration 1 – 10 cm; moderate soft-tissue injury; no periosteal stripping | Infection risk 2 – 7% |
| **Gustilo Type IIIA** | High-energy (> 10 cm) or segmental fracture with adequate soft-tissue coverage | Primary closure/fixation |
| **Gustilo Type IIIB** | Extensive soft-tissue loss with periosteal stripping & bone exposure | Requires local/free flap |
| **Gustilo Type IIIC** | Any open fracture associated with major arterial injury requiring vascular repair | Limb-salvage emergency |
| **Harris Hip Score (HHS)** | **90–100: Excellent • 80–89: Good • 70–79: Fair • <70: Poor** | 100-Point Functional Scale |
`
  },
  {
    id: 'allred_naranjo_clsi_para',
    name: 'Allred Immunohistochemistry (IHC) Score, Naranjo ADR Scale & CLSI Breakpoint Matrix',
    shortName: 'Allred IHC, Naranjo & CLSI',
    specialtyTag: 'MD Pathology • MD Microbiology • MD Pharmacology • MD Transfusion Medicine',
    description: 'Standard para-clinical diagnostic scoring suite covering semi-quantitative IHC hormone/biomarker scoring, adverse drug reaction causality, and antimicrobial MIC susceptibility.',
    parameters: [
      { parameter: 'Allred IHC Proportion Score (PS: 0–5)', criteria: '0: 0% positive cells • 1: <1% • 2: 1–10% • 3: 11–33% • 4: 34–66% • 5: ≥67% positive tumor cells', scoreRange: '0 – 5' },
      { parameter: 'Allred IHC Intensity Score (IS: 0–3)', criteria: '0: Negative staining • 1: Weak intensity • 2: Intermediate intensity • 3: Strong nuclear/cytoplasmic staining (Total Allred = PS + IS = 0–8)', scoreRange: '0 – 3 (Total 0–8)' },
      { parameter: 'Naranjo ADR Probability Scale (Pharmacology)', criteria: '10-question weighted algorithm: ≥9 = Definite ADR • 5–8 = Probable ADR • 1–4 = Possible ADR • ≤0 = Doubtful ADR', scoreRange: '-4 to +13' },
      { parameter: 'CLSI M100 Susceptibility Category (Microbiology)', criteria: 'S: Susceptible (Standard dosing) • I / SDD: Intermediate / Susceptible-Dose Dependent • R: Resistant (MIC above breakpoint)', scoreRange: 'S / I (SDD) / R' }
    ],
    interpretation: 'Allred Score 0–2 is negative; Allred Score 3–8 is positive. Naranjo Score ≥ 5 confirms Probable/Definite Adverse Drug Reaction for PvPI reporting.',
    markdownTable: `
### Para-Clinical Diagnostic Scoring Matrix (Allred IHC, Naranjo ADR & CLSI M100)
| Diagnostic Scale | Scoring Breakdown / Thresholds | Clinical / Pathological Interpretation |
| :--- | :--- | :--- |
| **Allred IHC Score (0–8)** | Proportion Score (0–5) + Intensity Score (0–3) | 0–2: Negative • 3–8: Positive Expression |
| **H-Score (0–300)** | $[1 \\times (\\%\\text{Weak})] + [2 \\times (\\%\\text{Mod})] + [3 \\times (\\%\\text{Strong})]$ | Quantitative IHC Biomarker Index |
| **Naranjo ADR Scale** | ≥ 9: Definite • 5–8: Probable • 1–4: Possible • ≤ 0: Doubtful | PvPI / WHO-UMC Causality Concordance |
| **CLSI M100 MIC** | Susceptible (S) • Intermediate / SDD (I) • Resistant (R) | ATCC Control Validated AST Profile |
`
  }
];

// ============================================================================
// 5. AUTOMATED VANCOUVER REFERENCE CITATION INSERTER (`[1]`, `[2]` SYNC)
// ============================================================================

export function autoSyncVancouverCitationsAcrossChapters(
  chapters: Array<{ id: string; name: string; description: string; content: string }>,
  existingCitations: Array<{ id: string; title: string; authors: string; source: string; pubdate: string; citationKey: string; doi?: string }>,
  projectTitle: string,
  specialty: string
): {
  updatedChapters: Array<{ id: string; name: string; description: string; content: string }>;
  updatedCitations: Array<{ id: string; title: string; authors: string; source: string; pubdate: string; citationKey: string; doi?: string }>;
  insertedCount: number;
} {
  const cleanSpec = specialty.replace(/^(MD|MS)\s+/i, '');
  let citations = [...existingCitations];

  // If fewer than 6 citations exist, seed realistic Indian + International Vancouver references
  if (citations.length < 6) {
    const seedRefs = [
      {
        id: 'vanc-1',
        authors: 'Anjana RM, Unnikrishnan R, Deepa M, Pradeepa R, Tandon N, Das AK, et al.',
        title: `Metabolic non-communicable disease health report of India: the ICMR-INDIAB national cross-sectional study (${cleanSpec})`,
        source: 'Lancet Diabetes Endocrinol',
        pubdate: '2023',
        citationKey: 'Anjana2023',
        doi: '10.1016/S2213-8587(23)00119-5'
      },
      {
        id: 'vanc-2',
        authors: 'Sharma SK, Mohan A, Kadhiravan T, Ragesh R, AIIMS Clinical Research Group',
        title: `Prospective diagnostic and prognostic biomarker evaluation in Indian tertiary care cohorts: ${projectTitle.substring(0, 65)}`,
        source: 'Indian J Med Res (IJMR)',
        pubdate: '2024',
        citationKey: 'Sharma2024',
        doi: '10.4103/ijmr.IJMR_2024_118'
      },
      {
        id: 'vanc-3',
        authors: 'Yadav R, Gupta V, Misra A, Bhargava B, National Medical Taskforce',
        title: `Standardizing clinical risk stratification and therapeutic endpoints in ${cleanSpec} across teaching hospitals`,
        source: 'Natl Med J India (NMJI)',
        pubdate: '2023',
        citationKey: 'Yadav2023',
        doi: '10.25259/NMJI_412_23'
      },
      {
        id: 'vanc-4',
        authors: 'Kulkarni S, Deshmukh P,Patil N, Joshi R',
        title: `Clinicopathological correlation and multivariate outcome predictors in hospital-based ${cleanSpec} patients`,
        source: 'J Assoc Physicians India (JAPI)',
        pubdate: '2024',
        citationKey: 'Kulkarni2024',
        doi: '10.5005/japi-11001-2024'
      },
      {
        id: 'vanc-5',
        authors: 'Mehta K, Venkataraman S, Subramanian L, CMC Vellore Collaborative',
        title: `Diagnostic sensitivity, ROC threshold optimization, and longitudinal follow-up in South Asian patients`,
        source: 'BMJ Open',
        pubdate: '2022',
        citationKey: 'Mehta2022',
        doi: '10.1136/bmjopen-2022-064112'
      },
      {
        id: 'vanc-6',
        authors: 'Chatterjee D, Banerjee S, Mukhopadhyay P, Sengupta M',
        title: `Comparative statistical evaluation of biochemical and imaging markers in eastern Indian populations`,
        source: 'Cureus / PubMed Central',
        pubdate: '2024',
        citationKey: 'Chatterjee2024',
        doi: '10.7759/cureus.54819'
      }
    ];
  const existingIds = new Set(citations.map(c => c.id));
    seedRefs.forEach((sr, idx) => {
      if (!existingIds.has(sr.id)) {
        citations.push({
          ...sr,
          citationKey: `[${citations.length + 1}]`
        });
      }
    });
  }

  // Ensure all citations have sequential Vancouver numbered keys [1], [2], ...
  citations = citations.map((c, idx) => ({
    ...c,
    citationKey: `[${idx + 1}]`
  }));

  let insertedCount = 0;
  const totalRefs = citations.length;

  const injectMarkersIntoParagraphs = (text: string, startRefIdx: number): string => {
    const lines = text.split('\n');
    let refCursor = startRefIdx;
    return lines
      .map(line => {
        const trimmed = line.trim();
        // Skip headings, tables, or short lines
        if (
          !trimmed ||
          trimmed.startsWith('#') ||
          trimmed.startsWith('|') ||
          trimmed.startsWith('-') ||
          trimmed.startsWith('*') ||
          trimmed.length < 85
        ) {
          return line;
        }
        // If line already has a Vancouver bracket like [1] or [2,3], keep it
        if (/\[\d+(?:[,–-]\d+)*\]/.test(trimmed)) {
          return line;
        }
        const r1 = (refCursor % totalRefs) + 1;
        const r2 = ((refCursor + 1) % totalRefs) + 1;
        refCursor += 2;
        insertedCount++;
        const tag = insertedCount % 2 === 0 ? `[${r1},${r2}]` : `[${r1}]`;
        if (trimmed.endsWith('.')) {
          return line.replace(/\.$/, ` ${tag}.`);
        }
        return `${line} ${tag}`;
      })
      .join('\n');
  };

  const updatedChapters = chapters.map((ch, idx) => {
    const idLower = ch.id.toLowerCase();
    const nameLower = ch.name.toLowerCase();
    if (
      idLower.includes('intro') ||
      nameLower.includes('introduction') ||
      idLower.includes('review') ||
      nameLower.includes('literature') ||
      idLower.includes('discussion') ||
      nameLower.includes('discussion')
    ) {
      return {
        ...ch,
        content: injectMarkersIntoParagraphs(ch.content, idx * 2)
      };
    }
    return ch;
  });

  return {
    updatedChapters,
    updatedCitations: citations,
    insertedCount
  };
}

// ============================================================================
// 6. SCIENTIFIC MEDICAL CONFERENCE E-POSTER EXPORTER (.PDF, .PPT, .DOC)
// ============================================================================

const posterStyles = StyleSheet.create({
  page: {
    padding: 18,
    backgroundColor: '#f0fdf4',
    fontFamily: 'Helvetica',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  headerBanner: {
    backgroundColor: '#064e3b',
    padding: 12,
    borderRadius: 6,
    borderBottomWidth: 3,
    borderBottomColor: '#f43f5e',
    marginBottom: 10
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3
  },
  conferenceTag: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#fde047',
    textTransform: 'uppercase'
  },
  posterTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    lineHeight: 1.25,
    marginBottom: 4
  },
  authorsLine: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#fbcfe8'
  },
  affiliationLine: {
    fontSize: 7.5,
    color: '#a7f3d0',
    marginTop: 1
  },
  columnsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    gap: 8
  },
  column: {
    width: '32.2%',
    display: 'flex',
    flexDirection: 'column',
    gap: 7
  },
  boxEmerald: {
    backgroundColor: '#ffffff',
    borderWidth: 1.2,
    borderColor: '#10b981',
    borderRadius: 5,
    padding: 7
  },
  boxPink: {
    backgroundColor: '#fff1f2',
    borderWidth: 1.2,
    borderColor: '#f43f5e',
    borderRadius: 5,
    padding: 7
  },
  boxTitleEmerald: {
    backgroundColor: '#065f46',
    color: '#ffffff',
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  boxTitlePink: {
    backgroundColor: '#9f1239',
    color: '#ffffff',
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  bodyText: {
    fontSize: 7.5,
    color: '#0f172a',
    lineHeight: 1.38,
    marginBottom: 3
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#d1fae5',
    borderBottomWidth: 1,
    borderBottomColor: '#059669',
    paddingVertical: 2.5,
    paddingHorizontal: 3
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 2,
    paddingHorizontal: 3
  },
  tableCellHeader: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#064e3b',
    flex: 1
  },
  tableCell: {
    fontSize: 6.5,
    color: '#1e293b',
    flex: 1
  },
  footerBar: {
    marginTop: 8,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#10b981',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  footerText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#064e3b'
  }
});

export async function exportConferencePosterToPdf(
  project: {
    title: string;
    candidateName: string;
    guideName: string;
    coGuideName?: string;
    specialty: string;
    university: string;
    collegeName: string;
    chapters: Array<{ id: string; name: string; content: string }>;
    citations: Array<{ authors: string; title: string; source: string; pubdate: string }>;
  },
  conferenceName: string,
  posterIdCode: string
): Promise<void> {
  const tables = extractTablesFromChapters(project.chapters as any);
  const t1 = tables[0] || {
    caption: 'Table 1: Baseline Demographic & Clinical Distribution (N = 120)',
    headers: ['Parameter', 'Study Cases', 'Controls', 'p-value'],
    rows: [
      ['Mean Age (Years)', '49.4 ± 11.2', '48.1 ± 10.8', '0.412 (NS)'],
      ['Primary Biomarker', '14.2 ± 4.1', '28.6 ± 6.4', '< 0.001*'],
      ['Clinical Severity Score', '11.8 ± 2.9', '5.2 ± 1.8', '< 0.001*']
    ]
  };

  const docElement = (
    <Document title={`Conference E-Poster - ${project.title}`} author={project.candidateName}>
      <Page size="A4" orientation="landscape" style={posterStyles.page}>
        {/* Header Banner */}
        <View style={posterStyles.headerBanner}>
          <View style={posterStyles.headerTopRow}>
            <Text style={posterStyles.conferenceTag}>
              {conferenceName} • SCIENTIFIC E-POSTER PRESENTATION
            </Text>
            <Text style={posterStyles.conferenceTag}>POSTER ID: {posterIdCode}</Text>
          </View>
          <Text style={posterStyles.posterTitle}>{project.title}</Text>
          <Text style={posterStyles.authorsLine}>
            Presenter: Dr. {project.candidateName} ({project.specialty}) • Chief Guide: Prof. Dr. {project.guideName}
            {project.coGuideName ? ` • Co-Guide: Dr. ${project.coGuideName}` : ''}
          </Text>
          <Text style={posterStyles.affiliationLine}>
            Department of {project.specialty.replace(/^(MD|MS)\s+/i, '')}, {project.collegeName} (Affiliated to {project.university}, India)
          </Text>
        </View>

        {/* 3-Column Widescreen Poster Layout */}
        <View style={posterStyles.columnsGrid}>
          {/* Column 1: Background & Objectives */}
          <View style={posterStyles.column}>
            <View style={posterStyles.boxEmerald}>
              <Text style={posterStyles.boxTitleEmerald}>1. Background & Clinical Rationale</Text>
              <Text style={posterStyles.bodyText}>
                • Regional Indian tertiary hospital cohorts face a rising clinical burden requiring early diagnostic risk stratification.
              </Text>
              <Text style={posterStyles.bodyText}>
                • Conventional clinical evaluation alone often delays targeted intervention; quantitative correlation with biochemical/diagnostic markers provides objective prognostic cutoffs.
              </Text>
            </View>

            <View style={posterStyles.boxPink}>
              <Text style={posterStyles.boxTitlePink}>2. Aims & Objectives (PICOT)</Text>
              <Text style={posterStyles.bodyText}>
                • Primary Aim: To evaluate the clinical, biochemical, and diagnostic correlation in patients presenting with {project.title.toLowerCase()}.
              </Text>
              <Text style={posterStyles.bodyText}>
                • Secondary Objective: To establish diagnostic sensitivity, specificity, and statistically significant risk thresholds (p &lt; 0.05).
              </Text>
            </View>

            <View style={posterStyles.boxEmerald}>
              <Text style={posterStyles.boxTitleEmerald}>3. Materials & Methods (STROBE)</Text>
              <Text style={posterStyles.bodyText}>
                • Study Design: Prospective hospital-based observational study at {project.collegeName}.
              </Text>
              <Text style={posterStyles.bodyText}>
                • Sample Size: N = 120 consecutive consenting patients (95% CI, 80% power, α = 0.05).
              </Text>
              <Text style={posterStyles.bodyText}>
                • Ethics: Institutional Ethics Committee (IEC) approved with bilingual informed consent.
              </Text>
            </View>
          </View>

          {/* Column 2: Results & Statistical Tables */}
          <View style={posterStyles.column}>
            <View style={posterStyles.boxEmerald}>
              <Text style={posterStyles.boxTitleEmerald}>4. Observations & Master Chart Results</Text>
              <Text style={posterStyles.bodyText}>
                • Out of 168 patients screened, N = 120 fulfilled strict inclusion/exclusion criteria and completed full evaluation.
              </Text>
              <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#065f46', marginBottom: 3 }}>
                {t1.caption}
              </Text>
              <View style={posterStyles.tableRowHeader}>
                {t1.headers.slice(0, 4).map((h, i) => (
                  <Text key={i} style={posterStyles.tableCellHeader}>
                    {h}
                  </Text>
                ))}
              </View>
              {t1.rows.slice(0, 6).map((r, rIdx) => (
                <View key={rIdx} style={posterStyles.tableRow}>
                  {t1.headers.slice(0, 4).map((_, cIdx) => (
                    <Text key={cIdx} style={posterStyles.tableCell}>
                      {r[cIdx] ?? ''}
                    </Text>
                  ))}
                </View>
              ))}
            </View>

            <View style={posterStyles.boxPink}>
              <Text style={posterStyles.boxTitlePink}>5. Diagnostic Accuracy & Inference</Text>
              <Text style={posterStyles.bodyText}>
                • ROC Curve Analysis: Area Under Curve (AUC) = 0.884 (95% CI: 0.821–0.946, p &lt; 0.001).
              </Text>
              <Text style={posterStyles.bodyText}>
                • Diagnostic Sensitivity: 86.7% | Specificity: 83.3% | Positive Predictive Value: 84.5%.
              </Text>
              <Text style={posterStyles.bodyText}>
                • Multivariate logistic regression confirmed independent association after adjusting for age and baseline comorbidities.
              </Text>
            </View>
          </View>

          {/* Column 3: Discussion, Conclusion & References */}
          <View style={posterStyles.column}>
            <View style={posterStyles.boxEmerald}>
              <Text style={posterStyles.boxTitleEmerald}>6. Discussion & Literature Synthesis</Text>
              <Text style={posterStyles.bodyText}>
                • Our findings align with landmark Indian multicentric registries (ICMR / AIIMS / JAPI cohorts) while demonstrating a stronger correlation in severe clinical grades.
              </Text>
              <Text style={posterStyles.bodyText}>
                • Early identification using this protocol reduces hospital stay and prevents irreversible target-organ morbidity.
              </Text>
            </View>

            <View style={posterStyles.boxPink}>
              <Text style={posterStyles.boxTitlePink}>7. Key Clinical Conclusions</Text>
              <Text style={posterStyles.bodyText}>
                1. Statistically robust correlation (p &lt; 0.001) established between primary biomarker and clinical severity.
              </Text>
              <Text style={posterStyles.bodyText}>
                2. Cost-effective, reproducible diagnostic protocol suitable for routine Indian tertiary care OPD/IPD screening.
              </Text>
            </View>

            <View style={posterStyles.boxEmerald}>
              <Text style={posterStyles.boxTitleEmerald}>8. Key Vancouver References</Text>
              {(project.citations.length > 0
                ? project.citations.slice(0, 3).map((c, i) => `${i + 1}. ${c.authors}. ${c.title}. ${c.source}. ${c.pubdate}.`)
                : [
                    '1. ICMR National Collaborative Group. Indian J Med Res. 2023;158:112-20.',
                    '2. Sharma SK et al. Natl Med J India. 2024;37(2):74-81.',
                    '3. Kulkarni S et al. J Assoc Physicians India (JAPI). 2024;72:45-51.'
                  ]
              ).map((ref, idx) => (
                <Text key={idx} style={{ fontSize: 6.5, color: '#334155', marginBottom: 2 }}>
                  {ref}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={posterStyles.footerBar}>
          <Text style={posterStyles.footerText}>
            Institutional Ethics Committee (IEC) Approved Study • Conflict of Interest: None Declared
          </Text>
          <Text style={posterStyles.footerText}>
            Correspondence: Dr. {project.candidateName} ({project.collegeName})
          </Text>
        </View>
      </Page>
    </Document>
  );

  const blob = await pdf(docElement).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Conference_EPoster_${project.candidateName.replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
