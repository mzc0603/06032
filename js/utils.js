const GameUtils = {
  soundEnabled: true,
  
  init() {
    const saved = localStorage.getItem('soundEnabled');
    this.soundEnabled = saved !== 'false';
    this.updateSoundButton();
  },

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('soundEnabled', this.soundEnabled);
    this.updateSoundButton();
    if (this.soundEnabled) {
      this.playSound('click');
    }
  },

  updateSoundButton() {
    const btn = document.querySelector('.sound-toggle');
    if (btn) {
      btn.textContent = this.soundEnabled ? '🔊' : '🔇';
      btn.classList.toggle('muted', !this.soundEnabled);
    }
  },

  playSound(type) {
    if (!this.soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const sounds = {
      click: { freq: 800, duration: 0.1, type: 'sine' },
      move: { freq: 400, duration: 0.08, type: 'square' },
      score: { freq: 600, duration: 0.15, type: 'sine' },
      win: { freq: 880, duration: 0.3, type: 'sine' },
      lose: { freq: 220, duration: 0.4, type: 'sawtooth' },
      merge: { freq: 520, duration: 0.12, type: 'triangle' },
      drop: { freq: 300, duration: 0.1, type: 'square' },
      clear: { freq: 700, duration: 0.2, type: 'sine' }
    };
    
    const sound = sounds[type] || sounds.click;
    oscillator.type = sound.type;
    oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
  },

  saveHighScore(gameId, score) {
    const key = `highScore_${gameId}`;
    const current = this.getHighScore(gameId);
    if (score > current) {
      localStorage.setItem(key, score.toString());
      return true;
    }
    return false;
  },

  getHighScore(gameId) {
    const key = `highScore_${gameId}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  },

  saveGameState(gameId, state) {
    const key = `gameState_${gameId}`;
    localStorage.setItem(key, JSON.stringify(state));
  },

  loadGameState(gameId) {
    const key = `gameState_${gameId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  },

  clearGameState(gameId) {
    const key = `gameState_${gameId}`;
    localStorage.removeItem(key);
  },

  showModal(title, message, buttons = []) {
    const existing = document.querySelector('.modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    let buttonsHtml = buttons.map(btn => 
      `<button class="control-btn ${btn.class || 'primary'}" onclick="${btn.onclick}">${btn.text}</button>`
    ).join('');
    
    modal.innerHTML = `
      <div class="modal-content">
        <h2>${title}</h2>
        <p>${message}</p>
        <div class="modal-buttons">${buttonsHtml}</div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hideModal();
    });
  },

  hideModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
  },

  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

function toggleMenu() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {
  GameUtils.init();
  
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelector('.nav-links').classList.remove('active');
    });
  });
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameUtils;
}
