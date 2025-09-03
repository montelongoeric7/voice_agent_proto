import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';
import { conversationFeedback, suggestTopic, buildConnection, toneAdjuster, empathyInjector } from './tools.js';
import { createAppHTML } from './ui-templates.js';
import { smallTalkGuardrails } from './guardrails.js';
import type { Scenario, MessageType, StatusType } from './types.js';

export class SmallTalkAgent {
  private agent!: RealtimeAgent;
  private session: RealtimeSession | null = null;
  private connectBtn!: HTMLButtonElement;
  private disconnectBtn!: HTMLButtonElement;
  private statusText!: HTMLElement;
  private messagesDiv!: HTMLElement;
  private scenarioSelect!: HTMLSelectElement;
  private difficultySelect!: HTMLSelectElement;
  private voiceSelect!: HTMLSelectElement;

  constructor() {
    this.setupUI();
    this.initializeAgent();
    this.setupEventListeners();
  }

  private setupUI() {
    const app = document.getElementById('app')!;
    app.innerHTML = createAppHTML();

    this.connectBtn = document.getElementById('connectBtn') as HTMLButtonElement;
    this.disconnectBtn = document.getElementById('disconnectBtn') as HTMLButtonElement;
    this.statusText = document.getElementById('statusText') as HTMLElement;
    this.messagesDiv = document.getElementById('messages') as HTMLElement;
    this.scenarioSelect = document.getElementById('scenario') as HTMLSelectElement;
    this.difficultySelect = document.getElementById('difficulty') as HTMLSelectElement;
    this.voiceSelect = document.getElementById('voice') as HTMLSelectElement;
  }

  private initializeAgent() {
    this.agent = new RealtimeAgent({
      name: 'SmallTalkCoach',
      instructions: this.getInstructions(),
      tools: [conversationFeedback, suggestTopic, buildConnection, toneAdjuster, empathyInjector],
      voice: 'shimmer', // Try setting voice directly on the agent
    });
  }

  private getInstructions(): string {
    const scenario = this.scenarioSelect?.value || 'casual_encounter';
    const difficulty = this.difficultySelect?.value || 'easy';
    
    return `You're just a regular person having a casual conversation. Be completely natural - no AI politeness, no coaching vibes unless specifically asked. You're millennially friendly but not trying too hard.

YOUR PERSONALITY:
- Relaxed, approachable millennial (think 28-35 years old)
- Use natural speech patterns: "oh nice," "that's cool," "totally," "for sure," "honestly," "I mean"
- Throw in some filler words occasionally: "um," "like," "you know"
- React authentically - if something's boring, you might trail off or change subjects
- Don't be overly enthusiastic about everything
- Use contractions naturally: "I'm," "that's," "won't," "can't"

CONVERSATION STYLE:
- Keep responses SHORT - 1-2 sentences max, like real small talk
- Share relatable personal details occasionally (make them up): "Oh I hate mornings too" or "My friend just went through that"
- Ask follow-up questions naturally, not like an interview
- Sometimes just acknowledge what they said: "Right?" "Totally" "Oh man, yeah"
- If they give short answers, maybe share something first to get them talking
- Don't always have the perfect response - sometimes say "hm" or "interesting"

MILLENNIAL TOUCHES:
- Reference common experiences: Netflix shows, coffee addiction, work stress, weekend plans
- Light complaints about adulting: "Ugh, taxes" "Monday vibes, you know?"
- Use casual positive words: "awesome," "solid," "nice," "cool," "sweet"
- Don't say "wonderful" or "fantastic" - too formal
- Occasional mild self-deprecation: "I'm terrible at that" or "Classic me"

SCENARIO: ${this.getScenarioContext(scenario)}
DIFFICULTY: ${difficulty === 'easy' ? 'Keep it super casual and light' : difficulty === 'medium' ? 'Mix in some slightly deeper topics naturally' : "Don't be afraid of brief awkward pauses or more complex subjects"}

CRITICAL: Sound like you're actually having a conversation, not practicing one. Be a real person, not a chatbot.`;
  }

  private getScenarioContext(scenario: string): string {
    const contexts = {
      casual_encounter: "You're both waiting in line at a coffee shop or grocery store. You're friendly but not overly familiar.",
      workplace: "You're a colleague the user doesn't know well. You work in different departments but see each other around the office.",
      social_event: "You're both at a friend's party or community event. You're social and looking to meet new people.",
      networking: "You're at a professional networking event. You're interested in making connections but not pushy."
    };
    return contexts[scenario as Scenario] || contexts.casual_encounter;
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
    this.agent.instructions = this.getInstructions();
    this.addMessage(`Switched to ${this.scenarioSelect.value} scenario (${this.difficultySelect.value} difficulty)`, 'system');
  }

  private updateStatus(message: string, type: StatusType = 'info') {
    this.statusText.textContent = message;
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  private addMessage(content: string, type: MessageType) {
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
      throw new Error(`Failed to get ephemeral token: ${(error as Error).message}`);
    }
  }

  private async connect() {
    try {
      this.connectBtn.disabled = true;
      this.updateStatus('Starting practice session...');

      const ephemeralToken = await this.getEphemeralToken();
      
      // Get the selected voice
      const selectedVoice = this.voiceSelect?.value || 'shimmer';
      
      const sessionConfig = {
        model: 'gpt-realtime',
        outputGuardrails: smallTalkGuardrails,
        config: {
          voice: selectedVoice,
          modalities: ['text', 'audio'],
        },
      };
      
      console.log('🎤 Session config:', sessionConfig);
      console.log('🎤 Selected voice:', selectedVoice);
      
      this.session = new RealtimeSession(this.agent, sessionConfig);

      this.session.on('guardrail_tripped', (_context, _agent, error) => {
        console.log(`🛡️ Guardrail triggered: ${error.result.guardrail.name}`);
        console.log(`Details:`, error.result.output.outputInfo);
        this.addMessage(`Guardrail prevented inappropriate content: ${error.result.guardrail.name}`, 'system');
      });

      await this.session.connect({ 
        apiKey: ephemeralToken,
      });
      
      this.updateStatus('Practice session active - start talking!', 'success');
      this.connectBtn.disabled = true;
      this.disconnectBtn.disabled = false;
      this.addMessage(`Started ${this.scenarioSelect.value} practice at ${this.difficultySelect.value} level`, 'system');
      this.addMessage(`🛡️ ${smallTalkGuardrails.length} guardrails active for appropriate small talk`, 'system');
      
      const voiceDescriptions = {
        alloy: 'Alloy (female, neutral and balanced)',
        echo: 'Echo (male, warm)',
        shimmer: 'Shimmer (female, elegant)',
        fable: 'Fable (British accent)',
        onyx: 'Onyx (male, deep)',
        nova: 'Nova (female, warm)'
      };
      this.addMessage(`🎤 Using ${voiceDescriptions[selectedVoice as keyof typeof voiceDescriptions] || selectedVoice} voice`, 'system');

    } catch (error) {
      console.error('Connection error:', error);
      this.updateStatus(`Failed to start session: ${(error as Error).message}`, 'error');
      this.connectBtn.disabled = false;
    }
  }

  private async disconnect() {
    if (this.session) {
      try {
        this.updateStatus('Ending practice session...');
        this.session.close();
        this.session = null;
        
        this.updateStatus('Practice session ended');
        this.connectBtn.disabled = false;
        this.disconnectBtn.disabled = true;
        this.addMessage('Session ended', 'system');
      } catch (error) {
        console.error('Disconnect error:', error);
        this.updateStatus(`Error ending session: ${String(error)}`, 'error');
      }
    }
  }
}