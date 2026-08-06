// ==================== MAIN APP ====================
const app = {
  editor: null,
  isPlaying: false,
  metronomeInterval: null,
  isMetronomeOn: false,
  playbackTimeouts: [],
  
  init() {
    this.editor = new ScoreEditor();
    PianoRoll.init();
    GuitarTab.init();
    DrumSequencer.init();
    this.buildBottomPianoRoll();
    this.setupKeyboard();
    this.updateStatus('Prêt - Composer Pro Ultimate');
    
    // Init with a demo
    this.loadDemo();
  },
  
  loadDemo() {
    // Simple C major scale demo
    const demoNotes = [
      { pitch: 'C', octave: 4, duration: 'quarter', x: 120 },
      { pitch: 'D', octave: 4, duration: 'quarter', x: 160 },
      { pitch: 'E', octave: 4, duration: 'quarter', x: 200 },
      { pitch: 'F', octave: 4, duration: 'quarter', x: 240 },
      { pitch: 'G', octave: 4, duration: 'quarter', x: 280 },
      { pitch: 'A', octave: 4, duration: 'quarter', x: 320 },
      { pitch: 'B', octave: 4, duration: 'quarter', x: 360 },
      { pitch: 'C', octave: 5, duration: 'half', x: 400 }
    ];
    
    demoNotes.forEach((n, i) => {
      this.editor.notes.push({
        id: Date.now() + i,
        pitch: n.pitch,
        octave: n.octave,
        duration: n.duration,
        accidental: null,
        articulation: null,
        x: n.x,
        y: this.editor.getYForPitch(n.pitch, n.octave),
        selected: false,
        lyrics: ''
      });
    });
    
    this.editor.saveState();
    this.editor.draw();
    this.updateStatus(this.editor.notes.length + ' notes');
  },
  
  // Tab switching
  switchTab(tab, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.bottom-btn').forEach(b => b.classList.remove('active'));
    
    if (btn) {
      btn.classList.add('active');
      if (btn.classList.contains('bottom-btn')) {
        document.querySelectorAll('.tab-btn').forEach(b => {
          if (b.dataset.tab === tab) b.classList.add('active');
        });
      }
    }
    
    const content = document.getElementById('tab-' + tab);
    if (content) content.classList.add('active');
    
    // Show/hide right panel for score tab
    const panel = document.getElementById('right-panel');
    if (tab === 'score') {
      panel.style.display = 'flex';
    } else {
      panel.style.display = 'none';
    }
    
    this.updateStatus('Mode: ' + tab);
  },
  
  // Toolbar controls
  setDuration(dur) {
    this.editor.currentDuration = dur;
    document.querySelectorAll('.tool-btn').forEach(b => {
      if (b.id?.startsWith('dur-')) b.classList.remove('active');
    });
    const btn = document.getElementById('dur-' + dur);
    if (btn) btn.classList.add('active');
  },
  
  setAccidental(acc) {
    if (this.editor.currentAcc === acc) this.editor.currentAcc = null;
    else this.editor.currentAcc = acc;
    document.querySelectorAll('#acc-sharp,#acc-flat,#acc-natural').forEach(b => b.classList.remove('active'));
    if (this.editor.currentAcc) {
      const btn = document.getElementById('acc-' + this.editor.currentAcc);
      if (btn) btn.classList.add('active');
    }
  },
  
  setKey(key) {
    this.editor.currentKey = key;
    document.querySelectorAll('.tool-btn').forEach(b => {
      if (b.id?.startsWith('key-')) b.classList.remove('active');
    });
    const btn = document.getElementById('key-' + key);
    if (btn) btn.classList.add('active');
    this.editor.draw();
  },
  
  setClef(clef) {
    this.editor.currentClef = clef;
    this.editor.draw();
  },
  
  setArticulation(art) {
    this.editor.currentArticulation = this.editor.currentArticulation === art ? null : art;
    const selected = this.editor.getSelected();
    if (selected.length > 0) {
      selected.forEach(n => n.articulation = this.editor.currentArticulation);
      this.editor.saveState();
      this.editor.draw();
    }
  },
  
  toggleSnap() {
    this.editor.snapToGrid = !this.editor.snapToGrid;
    const btn = document.getElementById('snap-btn');
    const status = document.getElementById('snap-status');
    if (this.editor.snapToGrid) {
      btn.classList.add('active');
      status.textContent = 'Snap: ON';
      status.style.color = 'var(--green)';
    } else {
      btn.classList.remove('active');
      status.textContent = 'Snap: OFF';
      status.style.color = 'var(--text3)';
    }
  },
  
  addSlur() {
    const selected = this.editor.getSelected();
    if (selected.length < 2) {
      this.showModal('Liaison', 'Sélectionne au moins 2 notes pour créer une liaison.');
      return;
    }
    const sorted = selected.sort((a, b) => a.x - b.x);
    for (let i = 0; i < sorted.length - 1; i++) {
      const n1 = sorted[i];
      const n2 = sorted[i + 1];
      this.editor.slurs.push({
        x1: n1.x,
        y1: this.editor.getYForPitch(n1.pitch, n1.octave),
        x2: n2.x,
        y2: this.editor.getYForPitch(n2.pitch, n2.octave)
      });
    }
    this.editor.saveState();
    this.editor.draw();
  },
  
  addCrescendo() {
    const selected = this.editor.getSelected();
    if (selected.length === 0) return;
    selected.forEach(n => {
      this.editor.dynamics.push({
        x: n.x,
        y: this.editor.getYForPitch(n.pitch, n.octave) - 50,
        text: 'cresc.'
      });
    });
    this.editor.saveState();
    this.editor.draw();
  },
  
  addDiminuendo() {
    const selected = this.editor.getSelected();
    if (selected.length === 0) return;
    selected.forEach(n => {
      this.editor.dynamics.push({
        x: n.x,
        y: this.editor.getYForPitch(n.pitch, n.octave) - 50,
        text: 'dim.'
      });
    });
    this.editor.saveState();
    this.editor.draw();
  },
  
  toggleLyrics() {
    const panel = document.getElementById('lyrics-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  },
  
  updateLyrics() {
    const text = document.getElementById('lyrics-text').value;
    const words = text.split(/\s+/);
    const sorted = [...this.editor.notes].sort((a, b) => a.x - b.x);
    sorted.forEach((n, i) => {
      n.lyrics = words[i] || '';
    });
    this.editor.draw();
  },
  
  // Playback
  playAll() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    AudioEngine.init();
    
    const sorted = [...this.editor.notes].sort((a, b) => a.x - b.x);
    if (sorted.length === 0) {
      this.isPlaying = false;
      return;
    }
    
    let t = 0;
    const startX = sorted[0].x;
    
    sorted.forEach(note => {
      const dur = this.editor.getDurationSec(note.duration);
      
      this.playbackTimeouts.push(setTimeout(() => {
        AudioEngine.playNote(note.pitch, note.octave, dur);
        this.editor.selectNote(note);
        this.editor.showCursor(note.x);
        this.editor.draw();
      }, t * 1000));
      
      t += dur;
    });
    
    this.playbackTimeouts.push(setTimeout(() => {
      this.isPlaying = false;
      this.editor.hideCursor();
      this.editor.clearSelection();
      this.updateStatus('Lecture terminée');
    }, t * 1000));
    
    this.updateStatus('Lecture en cours...');
  },
  
  stopPlayback() {
    this.isPlaying = false;
    this.playbackTimeouts.forEach(id => clearTimeout(id));
    this.playbackTimeouts = [];
    this.editor.hideCursor();
    this.editor.clearSelection();
    this.updateStatus('Arrêté');
  },
  
  // Metronome
  updateMetronome(val) {
    document.getElementById('metro-display').textContent = val;
    document.getElementById('tempo').value = val;
  },
  
  updateTempo() {
    const val = document.getElementById('tempo').value;
    document.getElementById('metro-slider').value = val;
    document.getElementById('metro-display').textContent = val;
  },
  
  toggleMetronome() {
    this.isMetronomeOn = !this.isMetronomeOn;
    const btn = document.getElementById('metro-btn');
    const status = document.getElementById('metro-status');
    
    if (this.isMetronomeOn) {
      btn.textContent = '⏹ Arrêter';
      status.textContent = 'Métronome: ON';
      status.style.color = 'var(--green)';
      const bpm = parseInt(document.getElementById('metro-slider').value);
      const interval = 60000 / bpm;
      AudioEngine.init();
      this.metronomeInterval = setInterval(() => {
        AudioEngine.playTone(1000, 0.05, 'square', 0.5);
      }, interval);
    } else {
      btn.textContent = '▶ Démarrer';
      status.textContent = 'Métronome: OFF';
      status.style.color = 'var(--text3)';
      clearInterval(this.metronomeInterval);
    }
  },
  
  // File operations
  newScore() {
    if (confirm('Nouvelle partition ? Les modifications non sauvegardées seront perdues.')) {
      this.editor.notes = [];
      this.editor.selectedNotes.clear();
      this.editor.slurs = [];
      this.editor.dynamics = [];
      this.editor.lyrics = [];
      this.editor.history = [];
      this.editor.historyIndex = -1;
      document.getElementById('score-title-input').value = 'Sans titre';
      this.editor.saveState();
      this.editor.draw();
      this.updateStatus('0 notes');
    }
  },
  
  saveScore() {
    const data = JSON.stringify({
      title: document.getElementById('score-title-input').value || 'Sans titre',
      composer: 'Compositeur',
      tempo: document.getElementById('tempo').value,
      timeSignature: document.getElementById('time-sig').value,
      key: this.editor.currentKey,
      clef: this.editor.currentClef,
      notes: this.editor.notes,
      slurs: this.editor.slurs,
      dynamics: this.editor.dynamics,
      createdAt: new Date().toISOString()
    });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (document.getElementById('score-title-input').value || 'partition') + '.composer';
    a.click();
    URL.revokeObjectURL(url);
    this.updateStatus('Sauvegardé !');
  },
  
  exportMidi() {
    let midi = [0x4D, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0, 120];
    midi.push(0x4D, 0x54, 0x72, 0x6B);
    const trackLenPos = midi.length;
    midi.push(0, 0, 0, 0);
    
    const tempo = 60000000 / parseInt(document.getElementById('tempo').value);
    midi.push(0, 0xFF, 0x51, 0x03, (tempo >> 16) & 0xFF, (tempo >> 8) & 0xFF, tempo & 0xFF);
    
    const sorted = [...this.editor.notes].sort((a, b) => a.x - b.x);
    let time = 0;
    sorted.forEach(note => {
      const midiNote = CONSTANTS.notes.indexOf(note.pitch) + (note.octave + 1) * 12;
      const dur = Math.round(this.editor.getDurationSec(note.duration) * 480);
      midi.push(time, 0x90, midiNote, 100);
      midi.push(dur, 0x80, midiNote, 0);
      time = 0;
    });
    
    midi.push(0, 0xFF, 0x2F, 0);
    const trackLen = midi.length - trackLenPos - 4;
    midi[trackLenPos] = (trackLen >> 24) & 0xFF;
    midi[trackLenPos + 1] = (trackLen >> 16) & 0xFF;
    midi[trackLenPos + 2] = (trackLen >> 8) & 0xFF;
    midi[trackLenPos + 3] = trackLen & 0xFF;
    
    const blob = new Blob([new Uint8Array(midi)], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (document.getElementById('score-title-input').value || 'partition') + '.mid';
    a.click();
    URL.revokeObjectURL(url);
    this.updateStatus('MIDI exporté !');
  },
  
  exportImage() {
    const link = document.createElement('a');
    link.download = (document.getElementById('score-title-input').value || 'partition') + '.png';
    link.href = this.editor.canvas.toDataURL('image/png');
    link.click();
    this.updateStatus('Image exportée !');
  },
  
  // Bottom piano roll
  buildBottomPianoRoll() {
    const roll = document.getElementById('piano-roll');
    if (!roll) return;
    roll.innerHTML = '';
    const whites = ['C','D','E','F','G','A','B'];
    const blacks = { C: 'C#', D: 'D#', F: 'F#', G: 'G#', A: 'A#' };
    
    for (let oct = 3; oct <= 5; oct++) {
      whites.forEach(w => {
        if (blacks[w]) {
          const b = document.createElement('div');
          b.className = 'piano-key black';
          b.textContent = blacks[w] + oct;
          b.onclick = () => AudioEngine.playNote(blacks[w], oct, 0.3);
          roll.appendChild(b);
        }
        const k = document.createElement('div');
        k.className = 'piano-key';
        k.textContent = w + oct;
        k.onclick = () => AudioEngine.playNote(w, oct, 0.3);
        roll.appendChild(k);
      });
    }
  },
  
  // Panel toggle
  togglePanel() {
    document.getElementById('right-panel').classList.toggle('active');
  },
  
  // Modal
  showModal(title, body) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal').classList.add('active');
  },
  
  closeModal() {
    document.getElementById('modal').classList.remove('active');
  },
  
  // Status
  updateStatus(text) {
    document.getElementById('status-text').textContent = text;
    document.getElementById('note-count').textContent = this.editor.notes.length + ' notes';
  },
  
  // Keyboard shortcuts
  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        this.editor.undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        this.editor.redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveScore();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.newScore();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        this.editor.deleteSelected();
      }
      if (e.key === ' ') {
        e.preventDefault();
        if (this.isPlaying) this.stopPlayback();
        else this.playAll();
      }
      if (e.key === 'Escape') {
        this.editor.clearSelection();
        this.stopPlayback();
        this.closeModal();
      }
      
      // Duration shortcuts
      const durMap = { '1': 'whole', '2': 'half', '4': 'quarter', '8': 'eighth', '6': 'sixteenth' };
      if (durMap[e.key]) {
        this.setDuration(durMap[e.key]);
      }
    });
  },
  
  // Expose sub-modules
  get harmony() { return HarmonyTools; },
  get orchestra() { return OrchestraTools; },
  get pianoRoll() { return PianoRoll; },
  get guitar() { return GuitarTab; },
  get drums() { return DrumSequencer; },
  get undo() { return () => this.editor.undo(); },
  get redo() { return () => this.editor.redo(); },
  get deleteSelected() { return () => this.editor.deleteSelected(); },
  get clearSelection() { return () => this.editor.clearSelection(); }
};

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
</script>
</body>
</html>
