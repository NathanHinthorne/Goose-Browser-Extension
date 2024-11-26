/**
 * Goose 🪿
 */
class Goose {
  constructor() {
    this.position = { 
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 100, 
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 100 
    };
    this.element = this.createGoose();
    this.action = 'walking';
    this.pranksEnabled = false;
    this.memes = [
      'deal-with-it.jpg',
      'goose-murder.jpg',
      'hammer.jpg',
      'mess-with-the-honk.jpg',
      'peace-was-never-an-option.jpg',
      'peaking.jpg',
      'take-break-cat.jpg'
    ];
    
    this.setupTimer();
  }

  createGoose() {
    const goose = document.createElement('img');
    goose.src = chrome.runtime.getURL('images/goose-sprite.png');
    goose.className = 'goose';
    document.body.appendChild(goose);
    return goose;
  }

  async setupTimer() {
    const data = await chrome.storage.local.get(['timerMinutes', 'timerStart', 'timerActive']);
    if (data.timerActive) {
      const elapsed = (Date.now() - data.timerStart) / 1000 / 60;
      if (elapsed >= data.timerMinutes) {
        this.startPranks();
      } else {
        setTimeout(() => {
          this.startPranks();
        }, (data.timerMinutes - elapsed) * 60 * 1000);
      }
    }
  }

  async startPranks() {
    this.pranksEnabled = true;
    await this.playHonk();
    
    // Check if browser is active every 5 seconds
    const checkInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && this.pranksEnabled) {
        this.performRandomPrank();
      } else if (document.visibilityState === 'hidden') {
        this.pranksEnabled = false;
        clearInterval(checkInterval);
        chrome.storage.local.set({ timerActive: false });
      }
    }, 5000);
  }

  async playHonk() {
    const audio = new Audio(chrome.runtime.getURL('sounds/honk.mp3'));
    await audio.play();
  }

  async performRandomPrank() {
    const pranks = [
      this.dragMeme.bind(this),
      this.closeTab.bind(this)
    ];
    const randomPrank = pranks[Math.floor(Math.random() * pranks.length)];
    await randomPrank();
  }

  async dragMeme() {
    const meme = document.createElement('img');
    const randomMeme = this.memes[Math.floor(Math.random() * this.memes.length)];
    meme.src = chrome.runtime.getURL(`images/memes/${randomMeme}`);
    meme.className = 'goose-meme';
    meme.style.left = '50%';
    meme.style.top = '50%';
    meme.style.transform = 'translate(-50%, -50%)';
    
    // Make meme draggable
    meme.addEventListener('mousedown', (e) => {
      const move = (moveEvent) => {
        meme.style.left = moveEvent.pageX - e.offsetX + 'px';
        meme.style.top = moveEvent.pageY - e.offsetY + 'px';
      };
      
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', move);
      }, { once: true });
    });
    
    document.body.appendChild(meme);
  }

  async closeTab() {
    window.close();
  }

  walk() {
    if (this.action === 'walking') return;
    
    console.log('GOOSE WALKING');
    this.action = 'walking';
    const walkInterval = setInterval(() => {
      if (this.action != 'walking') {
        clearInterval(walkInterval);
        return;
      }
      
      // Random walk
      const newX = this.position.x + (Math.random() - 0.5) * 100;
      const newY = this.position.y + (Math.random() - 0.5) * 100;
      
      // Keep goose on screen
      this.position.x = Math.max(0, Math.min(window.innerWidth - 50, newX));
      this.position.y = Math.max(0, Math.min(window.innerHeight - 50, newY));
      
      this.element.style.left = this.position.x + 'px';
      this.element.style.top = this.position.y + 'px';
      
      // Flip goose sprite based on direction
      if (newX > this.position.x) {
        this.element.style.transform = 'scaleX(1)';
      } else {
        this.element.style.transform = 'scaleX(-1)';
      }
    }, 1000);
  }
}

// Initialize goose when page loads
const goose = new Goose();
// goose.walk();