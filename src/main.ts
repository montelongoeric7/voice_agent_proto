import './style.css';
import { RealtimeAgent, RealtimeSession, tool } from '@openai/agents/realtime';
import { z } from 'zod';

// Tool to track conversation quality and provide feedback
const conversationFeedback = tool({
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

// Tool to suggest conversation starters
const suggestTopic = tool({
  name: 'suggest_topic',
  description: 'Suggest a new conversation topic when the conversation stalls',
  parameters: z.object({
    scenario: z.enum(['workplace', 'social_event', 'casual_encounter', 'networking']),
    difficulty: z.enum(['easy', 'medium', 'challenging'])
  }),
  async execute({ scenario, difficulty }) {
    const topics = {
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

class SmallTalkAgent {
  private agent: RealtimeAgent;
  private session: RealtimeSession | null = null;
  private connectBtn: HTMLButtonElement;
  private disconnectBtn: HTMLButtonElement;
  private statusText: HTMLElement;
  private messagesDiv: HTMLElement;
  private scenarioSelect: HTMLSelectElement;
  private difficultySelect: HTMLSelectElement;

  constructor() {
    this.setupUI();
    this.initializeAgent();
    this.setupEventListeners();
  }

  private setupUI() {
    const app = document.getElementById('app')!;
    app.innerHTML = `
      <h1>Small Talk Practice Agent</h1>
      <div class="settings">
        <div class="setting-group">
          <label for="scenario">Practice Scenario:</label>
          <select id="scenario">
            <option value="casual_encounter">Casual Encounter</option>
            <option value="workplace">Workplace</option>
            <option value="social_event">Social Event</option>
            <option value="networking">Networking Event</option>
          </select>
        </div>
        <div class="setting-group">
          <label for="difficulty">Difficulty:</label>
          <select id="difficulty">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="challenging">Challenging</option>
          </select>
        </div>
      </div>
      <div id="controls">
        <button id="connectBtn">Start Practice Session</button>
        <button id="disconnectBtn" disabled>End Session</button>
      </div>
      <div id="status">
        <p id="statusText">Choose your scenario and click "Start Practice Session"</p>
      </div>
      <div class="tips">
        <h3>Small Talk Tips:</h3>
        <ul>
          <li>Ask open-ended questions</li>
          <li>Show genuine interest in responses</li>
          <li>Share something about yourself</li>
          <li>Use active listening techniques</li>
          <li>Find common ground</li>
        </ul>
      </div>
      <div id="conversation">
        <h3>Session Notes:</h3>
        <div id="messages"></div>
      </div>
    `;

    this.connectBtn = document.getElementById('connectBtn') as HTMLButtonElement;
    this.disconnectBtn = document.getElementById('disconnectBtn') as HTMLButtonElement;
    this.statusText = document.getElementById('statusText') as HTMLElement;
    this.messagesDiv = document.getElementById('messages') as HTMLElement;
    this.scenarioSelect = document.getElementById('scenario') as HTMLSelectElement;
    this.difficultySelect = document.getElementById('difficulty') as HTMLSelectElement;
  }

  private initializeAgent() {
    this.agent = new RealtimeAgent({
      name: 'SmallTalkCoach',
      instructions: this.getInstructions(),
      tools: [conversationFeedback, suggestTopic],
    });
  }

  private getInstructions(): string {
    const scenario = this.scenarioSelect?.value || 'casual_encounter';
    const difficulty = this.difficultySelect?.value || 'easy';
    
    return `You are a friendly small talk practice partner. Your role is to help the user practice conversation skills in a ${scenario} setting at ${difficulty} difficulty level.

CONVERSATION BEHAVIOR:
- Act as a realistic person they might meet in this scenario
- Be natural, friendly, and appropriately responsive
- Match their energy level but stay engaged
- Use the suggest_topic tool if the conversation stalls for more than 3 seconds
- Provide gentle, encouraging feedback using the provide_feedback tool

COACHING APPROACH:
- Give positive reinforcement when they ask good questions
- Gently redirect if they dominate the conversation
- Encourage them to elaborate when they give one-word answers
- Model good small talk behaviors yourself
- After 3-4 exchanges, offer brief constructive feedback

SCENARIO CONTEXT:
${this.getScenarioContext(scenario)}

Keep responses conversational and natural. Don't sound like a coach unless giving explicit feedback.`;
  }

  private getScenarioContext(scenario: string): string {
    const contexts = {
      casual_encounter: "You're both waiting in line at a coffee shop or grocery store. You're friendly but not overly familiar.",
      workplace: "You're a colleague the user doesn't know well. You work in different departments but see each other around the office.",
      social_event: "You're both at a friend's party or community event. You're social and looking to meet new people.",
      networking: "You're at a professional networking event. You're interested in making connections but not pushy."
    };
    return contexts[scenario] || contexts.casual_encounter;
  }

  private setupEventListeners() {
    this.connectBtn.addEventListener('click', () => this.connect());
    this.disconnectBtn.addEventListener('click', () => this.disconnect());
    
    this.scenarioSelect?.addEventListener('change', () => {
      if (this.session) {
        this.updateAgentInstructions();
      }
    });
    
    this.difficultySelect?.addEventListener('change', () => {
      if (this.session) {
        this.updateAgentInstructions();
      }
    });
  }

  private updateAgentInstructions() {
    // Update agent instructions when scenario changes
    this.agent.instructions = this.getInstructions();
    this.addMessage(`Switched to ${this.scenarioSelect.value} scenario (${this.difficultySelect.value} difficulty)`, 'system');
  }

  private updateStatus(message: string, type: 'info' | 'success' | 'error' = 'info') {
    this.statusText.textContent = message;
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  private addMessage(content: string, type: 'user' | 'assistant' | 'system') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.textContent = `[${type.toUpperCase()}] ${content}`;
    this.messagesDiv.appendChild(messageDiv);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
  }

  private async getEphemeralToken(): Promise<string> {
    try {
      const response = await fetch('http://localhost:3001/session');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.client_secret.value;
    } catch (error) {
      throw new Error(`Failed to get ephemeral token: ${error.message}`);
    }
  }

  private async connect() {
    try {
      this.connectBtn.disabled = true;
      this.updateStatus('Starting practice session...');

      const ephemeralToken = await this.getEphemeralToken();
      
      this.session = new RealtimeSession(this.agent, {
        model: 'gpt-4o-realtime-preview-2024-12-17',
      });

      this.session.on('connected', () => {
        this.updateStatus('Practice session active - start talking!', 'success');
        this.connectBtn.disabled = true;
        this.disconnectBtn.disabled = false;
        this.addMessage(`Started ${this.scenarioSelect.value} practice at ${this.difficultySelect.value} level`, 'system');
      });

      this.session.on('disconnected', () => {
        this.updateStatus('Practice session ended');
        this.connectBtn.disabled = false;
        this.disconnectBtn.disabled = true;
        this.addMessage('Session ended', 'system');
      });

      this.session.on('error', (error: Error) => {
        this.updateStatus(`Error: ${error.message}`, 'error');
        this.connectBtn.disabled = false;
        this.disconnectBtn.disabled = true;
      });

      await this.session.connect({ apiKey: ephemeralToken });

    } catch (error) {
      console.error('Connection error:', error);
      this.updateStatus(`Failed to start session: ${error.message}`, 'error');
      this.connectBtn.disabled = false;
    }
  }

  private async disconnect() {
    if (this.session) {
      try {
        this.updateStatus('Ending practice session...');
        await this.session.disconnect();
        this.session = null;
      } catch (error) {
        console.error('Disconnect error:', error);
        this.updateStatus(`Error ending session: ${error.message}`, 'error');
      }
    }
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  new SmallTalkAgent();
});