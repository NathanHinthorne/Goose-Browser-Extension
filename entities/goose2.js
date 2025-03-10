class DragMemesState extends GooseState {
  enter() {
    this.goose.speed = 50;
    this.goose.setAnimation(Goose.ANIMATIONS.WALKING);
    this.targetRandomLocation();

    // Create meme element
    this.meme = this.createMemeElement();
    document.body.appendChild(this.meme);

    // Set initial meme position
    this.updateMemePosition();
  }

  update() {
    if (this.distanceToTarget < 10) {
      this.setVelocity(0, 0);
      this.goose.setState(Goose.STATES.IDLE);
      this.enableUserDrag();
    } else {
      this.moveToTarget();
      this.updateMemePosition();
    }
  }

  exit() {
    // Meme will be draggable by the user after the goose releases it
  }

  targetRandomLocation() {
    const randPoint = this.genPointInBounds();
    this.setTarget(randPoint.x, randPoint.y);
  }

  createMemeElement() {
    const meme = document.createElement('div');
    meme.style.position = 'absolute';
    meme.style.zIndex = '9999';
    meme.style.cursor = 'move';

    const memeImage = document.createElement('img');
    const imagePath = Goose.MEME_IMAGES[Math.floor(Math.random() * Goose.MEME_IMAGES.length)];
    memeImage.src = chrome.runtime.getURL(imagePath);
    memeImage.className = 'goose-meme';
    memeImage.style.display = 'block';
    meme.appendChild(memeImage);

    const closeButton = document.createElement('div');
    closeButton.innerHTML = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '0';
    closeButton.style.right = '0';
    closeButton.style.backgroundColor = 'red';
    closeButton.style.color = 'white';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '20px';
    closeButton.style.height = '20px';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
      meme.remove();
    });
    meme.appendChild(closeButton);

    return meme;
  }

  updateMemePosition() {
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    this.meme.style.left = `${this.goose.position.x + scrollX}px`;
    this.meme.style.top = `${this.goose.position.y + scrollY}px`;
  }

  enableUserDrag() {
    this.meme.draggable = false; // Disable default HTML5 drag and drop
    this.meme.addEventListener('mousedown', this.onMouseDown.bind(this));
  }

  onMouseDown(event) {
    event.preventDefault();
    const meme = event.target.closest('.goose-meme').parentElement;
    const offsetX = event.clientX - meme.getBoundingClientRect().left;
    const offsetY = event.clientY - meme.getBoundingClientRect().top;

    const onMouseMove = (moveEvent) => {
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      meme.style.left = `${moveEvent.clientX - offsetX + scrollX}px`;
      meme.style.top = `${moveEvent.clientY - offsetY + scrollY}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}