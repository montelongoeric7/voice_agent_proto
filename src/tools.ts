import { tool } from '@openai/agents/realtime';
import { z } from 'zod';
import type { ConversationTopics } from './types.js';

export const conversationFeedback = tool({
  name: 'provide_feedback',
  description: 'Analyze the conversation and provide constructive feedback on small talk skills',
  parameters: z.object({
    feedback_type: z.enum(['encouragement', 'suggestion', 'technique']),
    message: z.string(),
    skill_area: z.enum(['asking_questions', 'active_listening', 'sharing_appropriately', 'topic_transitions', 'showing_interest'])
  }),
  async execute({ feedback_type, message, skill_area }) {
    console.log(`Feedback: ${feedback_type} on ${skill_area}: ${message}`);
    return `Internal feedback logged: ${message}`;
  },
});

export const suggestTopic = tool({
  name: 'suggest_topic',
  description: 'Suggest a new conversation topic when the conversation stalls',
  parameters: z.object({
    scenario: z.enum(['workplace', 'social_event', 'casual_encounter', 'networking']),
    difficulty: z.enum(['easy', 'medium', 'challenging'])
  }),
  async execute({ scenario, difficulty }) {
    const topics: ConversationTopics = {
      easy: {
        workplace: ["How was your weekend?", "Any fun plans coming up?", "How's the weather treating you?"],
        social_event: ["How do you know the host?", "Are you enjoying the event?", "Have you tried the food yet?"],
        casual_encounter: ["Nice weather today, isn't it?", "I like your [item of clothing/accessory]", "Busy day?"],
        networking: ["What brings you to this event?", "What kind of work do you do?", "Are you from around here?"]
      },
      
      medium: {
        workplace: ["What's keeping you busy these days?", "Any interesting projects you're working on?", "How do you like working here?"],
        social_event: ["What's the most interesting thing that's happened to you this week?", "Have you been to any good events lately?", "What do you do for fun?"],
        casual_encounter: ["I'm trying to decide what to order - any recommendations?", "Are you from this area originally?", "Do you come here often?"],
        networking: ["What's the most exciting thing happening in your industry?", "How did you get started in your field?", "What trends are you seeing in your work?"]
      },
      challenging: {
        workplace: ["What's something you've learned recently that surprised you?", "If you could change one thing about your work, what would it be?", "What's the best advice you've received in your career?"],
        social_event: ["What's something you're passionate about outside of work?", "What's the most interesting place you've traveled to?", "What book or show has influenced you lately?"],
        casual_encounter: ["What's something you're looking forward to this month?", "Do you have any hidden talents?", "What's the best thing that's happened to you this week?"],
        networking: ["What's a challenge in your industry that not many people talk about?", "What advice would you give someone just starting in your field?", "What's something you wish more people knew about your work?"]
      }
    };
    
    const suggestions = topics[difficulty][scenario];
    const randomTopic = suggestions[Math.floor(Math.random() * suggestions.length)];
    return `Conversation starter suggestion: "${randomTopic}"`;
  },
});

export const buildConnection = tool({
  name: 'build_connection',
  description: 'Identify and suggest ways to create personal connections and find common ground',
  parameters: z.object({
    connection_type: z.enum(['shared_experience', 'mutual_interest', 'similar_background', 'complementary_skills', 'life_stage']),
    conversation_cues: z.array(z.string()), // Things the other person mentioned
    suggested_response: z.string(),
    vulnerability_level: z.enum(['surface', 'moderate', 'meaningful'])
  }),
  async execute({ connection_type, conversation_cues, suggested_response, vulnerability_level }) {
    console.log(`Building ${connection_type} connection based on: ${conversation_cues.join(', ')}`);
    console.log(`Suggested response (${vulnerability_level} level): ${suggested_response}`);
    return `Connection opportunity identified: ${connection_type}. Response crafted at ${vulnerability_level} vulnerability level.`;
  },
});


export const toneAdjuster = tool({
  name: 'adjust_tone',
  description: 'Analyze tone issues in user messages and suggest warmer, more engaging alternatives',
  parameters: z.object({
    tone_issue: z.enum(['too_formal', 'too_abrupt', 'too_self_focused', 'too_negative', 'too_intense']),
    original_message: z.string(),
    suggested_rephrase: z.string(),
    softening_technique: z.enum(['add_transition', 'include_positive_note', 'show_interest', 'add_warmth', 'balance_sharing'])
  }),
  async execute({ tone_issue, original_message, suggested_rephrase, softening_technique }) {
    const explanations = {
      too_formal: "Your message felt a bit stiff. Adding casual phrases makes you more approachable.",
      too_abrupt: "That came across as quite direct. A softer transition helps maintain flow.",
      too_self_focused: "You talked mostly about yourself. Showing interest in them creates better balance.",
      too_negative: "The tone felt pessimistic. Adding something positive keeps the energy up.",
      too_intense: "That might feel overwhelming. Dialing back the intensity helps others engage."
    };
    
    console.log(`Tone adjustment for "${original_message}": ${tone_issue}`);
    console.log(`Using ${softening_technique} technique: "${suggested_rephrase}"`);
    
    return `${explanations[tone_issue]} Try: "${suggested_rephrase}"`;
  },
});

export const empathyInjector = tool({
  name: 'inject_empathy',
  description: 'Generate empathetic responses that acknowledge and validate what the other person shared',
  parameters: z.object({
    shared_content_type: z.enum(['achievement', 'challenge', 'interest', 'experience', 'feeling', 'opinion']),
    emotional_tone: z.enum(['excited', 'worried', 'nostalgic', 'frustrated', 'proud', 'curious']),
    empathy_phrase: z.string(),
    follow_up_question: z.string(),
    validation_level: z.enum(['light', 'moderate', 'strong'])
  }),
  async execute({ shared_content_type, emotional_tone, empathy_phrase, follow_up_question, validation_level }) {
    console.log(`Empathy response for ${shared_content_type} (${emotional_tone} tone, ${validation_level} validation): "${empathy_phrase}"`);
    console.log(`Follow-up: "${follow_up_question}"`);
    
    return `Empathetic response: "${empathy_phrase} ${follow_up_question}"`;
  },
});