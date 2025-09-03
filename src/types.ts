export type FeedbackType = 'encouragement' | 'suggestion' | 'technique';
export type SkillArea = 'asking_questions' | 'active_listening' | 'sharing_appropriately' | 'topic_transitions' | 'showing_interest';
export type Scenario = 'workplace' | 'social_event' | 'casual_encounter' | 'networking';
export type Difficulty = 'easy' | 'medium' | 'challenging';
export type MessageType = 'user' | 'assistant' | 'system';
export type StatusType = 'info' | 'success' | 'error';

export type ConversationTopics = {
  [K in Difficulty]: {
    [S in Scenario]: string[];
  };
};
