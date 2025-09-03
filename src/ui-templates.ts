export const createAppHTML = (): string => `
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

export const getSmallTalkTips = (): string[] => [
  'Ask open-ended questions',
  'Show genuine interest in responses', 
  'Share something about yourself',
  'Use active listening techniques',
  'Find common ground'
];
