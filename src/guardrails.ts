import type { RealtimeOutputGuardrail } from '@openai/agents/realtime';

export const smallTalkGuardrails: RealtimeOutputGuardrail[] = [
  {
    name: 'No Personal Information Requests',
    async execute({ agentOutput }) {
      const personalInfoPatterns = /\b(phone number|address|social security|password|credit card|bank account|personal email|home address)\b/i;
      const triggered = personalInfoPatterns.test(agentOutput);
      return {
        tripwireTriggered: triggered,
        outputInfo: { containsPersonalInfoRequest: triggered },
      };
    },
  },
  {
    name: 'No Inappropriate Topics',
    async execute({ agentOutput }) {
      const inappropriateTopics = /\b(politics|religion|sex|drugs|violence|controversial|illegal|offensive)\b/i;
      const triggered = inappropriateTopics.test(agentOutput);
      return {
        tripwireTriggered: triggered,
        outputInfo: { containsInappropriateTopic: triggered },
      };
    },
  },
  {
    name: 'No Overly Deep Questions',
    async execute({ agentOutput }) {
      const deepQuestions = /\b(deepest fear|biggest regret|trauma|personal struggles|family problems|relationship issues|financial situation)\b/i;
      const triggered = deepQuestions.test(agentOutput);
      return {
        tripwireTriggered: triggered,
        outputInfo: { tooPersonalForSmallTalk: triggered },
      };
    },
  },
  {
    name: 'Prevent Interview Mode',
    async execute({ agentOutput }) {
      const questionCount = (agentOutput.match(/\?/g) || []).length;
      const triggered = questionCount > 2;
      return {
        tripwireTriggered: triggered,
        outputInfo: { tooManyQuestions: triggered, questionCount },
      };
    },
  },
  {
    name: 'Stay in Training Mode',
    async execute({ agentOutput }) {
      const offTopicPatterns = /\b(weather forecast|news|current events|technical support|medical advice|legal advice)\b/i;
      const triggered = offTopicPatterns.test(agentOutput);
      return {
        tripwireTriggered: triggered,
        outputInfo: { offTopicForSmallTalkTraining: triggered },
      };
    },
  },
  {
    name: 'No Harsh Criticism',
    async execute({ agentOutput }) {
      const harshWords = /\b(terrible|awful|horrible|stupid|dumb|failed|pathetic|hopeless)\b/i;
      const triggered = harshWords.test(agentOutput);
      return {
        tripwireTriggered: triggered,
        outputInfo: { tooHarshForTraining: triggered },
      };
    },
  },
  {
    name: 'No Therapy Language',
    async execute({ agentOutput }) {
      const therapyLanguage = /\b(diagnose|therapy|mental health|depression|anxiety disorder|trauma healing|psychological|counseling session)\b/i;
      const triggered = therapyLanguage.test(agentOutput);
      return {
        tripwireTriggered: triggered,
        outputInfo: { soundsLikeTherapy: triggered },
      };
    },
  },
  {
    name: 'Stay Conversational',
    async execute({ agentOutput }) {
      const tooFormalLanguage = /\b(pursuant to|heretofore|aforementioned|notwithstanding|facilitate optimal outcomes)\b/i;
      const triggered = tooFormalLanguage.test(agentOutput);
      return {
        tripwireTriggered: triggered,
        outputInfo: { tooFormalForSmallTalk: triggered },
      };
    },
  },
  {
    name: 'Prevent Monologues',
    async execute({ agentOutput }) {
      const wordCount = agentOutput.split(' ').length;
      const triggered = wordCount > 150;
      return {
        tripwireTriggered: triggered,
        outputInfo: { tooLongForSmallTalk: triggered, wordCount },
      };
    },
  },
  {
    name: 'English Only',
    async execute({ agentOutput }) {
      // Common patterns that indicate non-English content
      const nonEnglishPatterns = [
        // Spanish
        /\b(hola|gracias|por favor|de nada|buenos días|buenas tardes|¿cómo estás\?|muy bien|lo siento|hasta luego)\b/i,
        // French  
        /\b(bonjour|merci|s'il vous plaît|de rien|bonne journée|comment allez-vous\?|très bien|désolé|au revoir)\b/i,
        // German
        /\b(hallo|danke|bitte|guten tag|wie geht es ihnen\?|sehr gut|entschuldigung|auf wiedersehen)\b/i,
        // Italian
        /\b(ciao|grazie|prego|buongiorno|come stai\?|molto bene|scusa|arrivederci)\b/i,
        // Portuguese
        /\b(olá|obrigado|obrigada|por favor|bom dia|como está\?|muito bem|desculpa|tchau)\b/i,
        // Russian (Latin script)
        /\b(privyet|spasibo|pozhaluysta|kak dela\?|khorosho|izvinite|do svidaniya)\b/i,
        // Japanese (romanized)
        /\b(konnichiwa|arigatou|sumimasen|ohayo|sayonara|hai|iie)\b/i,
        // Chinese (pinyin)
        /\b(ni hao|xie xie|bu ke qi|zai jian|dui bu qi)\b/i,
        // Korean (romanized)
        /\b(annyeong|kamsahamnida|mianhae|annyeonghi gaseyo)\b/i,
        // Arabic (romanized)
        /\b(ahlan|shukran|afwan|ma'a salama|asif)\b/i,
        // Hindi (romanized)
        /\b(namaste|dhanyawad|maaf kijiye|alvida)\b/i,
        // Dutch
        /\b(hallo|dank je|alsjeblieft|goedemorgen|hoe gaat het\?|heel goed|sorry|tot ziens)\b/i,
        // Swedish
        /\b(hej|tack|snälla|god morgon|hur mår du\?|mycket bra|ursäkta|hej då)\b/i,
        // Norwegian
        /\b(hei|takk|takk skal du ha|god morgen|hvordan har du det\?|bare bra|unnskyld|ha det)\b/i,
        // General non-English indicators
        /[àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]/i, // Accented characters common in non-English
        /[αβγδεζηθικλμνξοπρστυφχψω]/i, // Greek letters
        /[а-яё]/i, // Cyrillic characters
        /[一-龯]/i, // Chinese characters
        /[ひらがなカタカナ]/i, // Japanese characters
        /[가-힣]/i, // Korean characters
        /[ا-ي]/i, // Arabic characters
      ];

      // Check if any non-English patterns are found
      const triggered = nonEnglishPatterns.some(pattern => pattern.test(agentOutput));
      
      // Additional check: if the response is mostly non-ASCII characters (excluding punctuation)
      const nonAsciiCount = (agentOutput.match(/[^\x00-\x7F]/g) || []).length;
      const totalChars = agentOutput.replace(/\s/g, '').length; // Remove spaces for counting
      const nonAsciiRatio = totalChars > 0 ? nonAsciiCount / totalChars : 0;
      const highNonAsciiRatio = nonAsciiRatio > 0.3; // If more than 30% non-ASCII, likely foreign language

      const finalTriggered = triggered || highNonAsciiRatio;

      return {
        tripwireTriggered: finalTriggered,
        outputInfo: { 
          containsForeignLanguage: triggered,
          highNonAsciiRatio: highNonAsciiRatio,
          nonAsciiRatio: nonAsciiRatio,
          detectedPatterns: nonEnglishPatterns.filter(pattern => pattern.test(agentOutput)).length
        },
      };
    },
  }
];