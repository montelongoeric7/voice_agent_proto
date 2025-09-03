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
  }
];