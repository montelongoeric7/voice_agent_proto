import './style.css';
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';

class VoiceAgentDemo {
  private agent: RealtimeAgent;
  private session: RealtimeSession | null = null;
  private connectBtn: HTMLButtonElement;
  private disconnectBtn: HTMLButtonElement;
  private statusText: HTMLElement;
  private messagesDiv: HTMLElement;

  constructor() {
    console.log('🚀 Initializing Voice Agent Demo...');

    this.agent = new RealtimeAgent({
      name: 'Assistant',
      instructions: 'You are a helpful assistant. Keep your responses conversational and engaging.',
    });

    console.log('✅ Agent created:', this.agent);

    this.connectBtn = document.getElementById('connectBtn') as HTMLButtonElement;
    this.disconnectBtn = document.getElementById('disconnectBtn') as HTMLButtonElement;
    this.statusText = document.getElementById('statusText') as HTMLElement;
    this.messagesDiv = document.getElementById('messages') as HTMLElement;

    // Setup event listeners
    this.setupEventListeners();
    
    console.log('✅ Voice Agent Demo initialized');
  }

  private setupEventListeners() {
    this.connectBtn.addEventListener('click', () => this.connect());
    this.disconnectBtn.addEventListener('click', () => this.disconnect());
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
      this.updateStatus('Getting ephemeral token...');
      console.log('🔑 Requesting ephemeral token from server...');
      
      const response = await fetch('http://localhost:3001/session');
      console.log('📡 Server response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📦 Server response data:', data);
      
      if (!data.client_secret?.value) {
        console.error('❌ No client_secret in response:', data);
        throw new Error('No client_secret in response');
      }
      
      const token = data.client_secret.value;
      console.log('✅ Ephemeral token obtained:', token.substring(0, 20) + '...');
      return token;
    } catch (error) {
      console.error('❌ Error fetching ephemeral token:', error);
      throw new Error(`Failed to get ephemeral token: ${error.message}`);
    }
  }

  private async connect() {
    try {
      console.log('🔗 Starting connection process...');
      this.connectBtn.disabled = true;
      this.updateStatus('Connecting...');

      const ephemeralToken = await this.getEphemeralToken();
      this.addMessage('Ephemeral token obtained successfully', 'system');
      this.updateStatus('Creating session...');

      console.log('📱 Creating RealtimeSession...');
      this.session = new RealtimeSession(this.agent, {
        model: 'gpt-4o-realtime-preview-2024-12-17', // Using the working model
      });
      console.log('✅ RealtimeSession created:', this.session);

      // Setup session event listeners
      console.log('🎧 Setting up event listeners...');
      
      this.session.on('connected', () => {
        console.log('🎉 Session connected successfully!');
        this.updateStatus('Connected! You can start talking.', 'success');
        this.connectBtn.disabled = true;
        this.disconnectBtn.disabled = false;
        this.addMessage('Voice agent connected and ready', 'system');
      });

      this.session.on('disconnected', () => {
        console.log('📴 Session disconnected');
        this.updateStatus('Disconnected from voice agent');
        this.connectBtn.disabled = false;
        this.disconnectBtn.disabled = true;
        this.addMessage('Voice agent disconnected', 'system');
      });

      this.session.on('error', (error: Error) => {
        console.error('❌ Session error:', error);
        this.updateStatus(`Error: ${error.message}`, 'error');
        this.addMessage(`Error: ${error.message}`, 'system');
        this.connectBtn.disabled = false;
        this.disconnectBtn.disabled = true;
      });

      // Add more detailed event listeners for debugging
      this.session.on('connecting', () => {
        console.log('🔄 Session connecting...');
        this.updateStatus('Establishing connection...');
        this.addMessage('Establishing connection...', 'system');
      });

      // Log all events for debugging
      const originalEmit = this.session.emit.bind(this.session);
      this.session.emit = (event: string, ...args: any[]) => {
        console.log(`📡 Session event: ${event}`, args);
        return originalEmit(event, ...args);
      };

      // Connect to the session
      console.log('🚀 Calling session.connect()...');
      this.updateStatus('Connecting to OpenAI...');
      
      await this.session.connect({ 
        apiKey: ephemeralToken 
      });
      
      console.log('✅ session.connect() completed');

    } catch (error) {
      console.error('❌ Connection error:', error);
      console.error('Error stack:', error.stack);
      this.updateStatus(`Connection failed: ${error.message}`, 'error');
      this.addMessage(`Connection failed: ${error.message}`, 'system');
      this.connectBtn.disabled = false;
    }
  }

  private async disconnect() {
    if (this.session) {
      try {
        console.log('📴 Disconnecting session...');
        this.updateStatus('Disconnecting...');
        await this.session.disconnect();
        this.session = null;
        console.log('✅ Session disconnected successfully');
      } catch (error) {
        console.error('❌ Disconnect error:', error);
        this.updateStatus(`Disconnect error: ${error.message}`, 'error');
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM loaded, initializing demo...');
  new VoiceAgentDemo();
});

window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
});