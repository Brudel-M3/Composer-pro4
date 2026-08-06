<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Éditeur de Partition</title>
<style>
  :root{
    --bar-bg:#1c1c1e;
    --bar-bg-2:#232326;
    --accent:#3b9dff;
    --accent-dim:#2c6fb0;
    --paper:#ffffff;
    --ink:#1a1a1a;
    --rail-bg:#0f0f10;
    --divider:#333336;
    --text-dim:#9a9a9e;
  }
  *{box-sizing:border-box; -webkit-tap-highlight-color:transparent; user-select:none;}
  html,body{height:100%; margin:0; overflow:hidden; background:#000; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}

  #app{
    max-width:480px;
    margin:0 auto;
    height:100vh;
    display:flex;
    flex-direction:column;
    background:var(--paper);
    position:relative;
  }

  /* ---------- TOP BAR ---------- */
  #topbar{
    background:var(--bar-bg);
    display:flex;
    align-items:center;
    padding:8px 6px;
    gap:2px;
    border-bottom:1px solid #000;
    flex-shrink:0;
  }
  .tbtn{
    width:38px; height:38px;
    display:flex; align-items:center; justify-content:center;
    border-radius:8px;
    background:transparent;
    border:none;
    color:#e7e7ea;
  }
  .tbtn:active{background:#33333a;}
  .tbtn.active{background:var(--accent); color:#fff;}
  .tbtn svg{width:20px; height:20px;}
  #topbar .spacer{flex:1;}
  #titleWrap{flex:1; text-align:center; padding:0 4px; min-width:0;}
  #titleWrap input{
    background:transparent; border:none; color:#fff; font-size:14px; text-align:center;
    width:100%; font-weight:600; outline:none;
  }
  #titleWrap .composer{color:var(--text-dim); font-size:10px; margin-top:1px;}

  /* ---------- BODY: rail + canvas ---------- */
  #body{flex:1; display:flex; min-height:0;}

  #rail{
    width:56px;
    background:var(--rail-bg);
    display:flex;
    flex-direction:column;
    align-items:center;
    padding:8px 0;
    gap:6px;
    overflow-y:auto;
    flex-shrink:0;
    border-right:1px solid #000;
  }
  .railBtn{
    width:44px; height:44px;
    border-radius:10px;
    background:#1c1c1e;
    border:2px solid transparent;
    display:flex; align-items:center; justify-content:center;
    color:#e7e7ea;
  }
  .railBtn.active{ border-color:var(--accent); background:#123a5c;}
  .railBtn svg{width:22px; height:22px;}
  .railDivider{width:34px; height:1px; background:var(--divider); margin:4px 0;}
  .railLabel{font-size:8px; color:var(--text-dim); margin-top:-4px;}

  /* duration palette grid */
  #durationGrid{display:flex; flex-direction:column; gap:4px;}
  .durBtn{
    width:44px; height:38px;
    background:#1c1c1e; border-radius:8px; border:2px solid transparent;
    display:flex; align-items:center; justify-content:center;
    color:#e7e7ea;
  }
  .durBtn.active{border-color:var(--accent); background:#123a5c;}
  .durBtn svg{width:24px; height:28px;}

  /* ---------- SCORE CANVAS AREA ---------- */
  #scoreScroll{
    flex:1;
    overflow:auto;
    background:#e9e9ea;
    -webkit-overflow-scrolling:touch;
  }
  #page{
    background:var(--paper);
    margin:14px auto;
    width:96%;
    min-height:calc(100% - 28px);
    box-shadow:0 1px 4px rgba(0,0,0,0.15);
    padding:18px 10px 40px;
  }
  #scoreTitle{ text-align:center; font-family:Georgia,'Times New Roman',serif; font-size:22px; color:var(--ink); margin-bottom:2px;}
  #scoreComposer{ text-align:right; font-family:Georgia,serif; font-size:11px; color:#555; margin-bottom:14px; padding-right:6px;}

  svg#staffSvg{ width:100%; display:block; touch-action:manipulation; }
  .staffLine{ stroke:#000; stroke-width:1; }
  .barline{ stroke:#000; stroke-width:1; }
  .measureHitbox{ fill:transparent; }
  .measureHitbox:active{ fill:rgba(59,157,255,0.06); }
  .noteHead{ fill:#111; }
  .noteHead.open{ fill:none; stroke:#111; stroke-width:1.6; }
  .noteHead.selected{ fill:#3b9dff; }
  .stem{ stroke:#111; stroke-width:1.3; }
  .flag{ fill:#111; }
  .dot{ fill:#111; }
  .accidental{ fill:#111; font-size:14px; font-family:Georgia,serif; }
  .clef{ fill:#111; }
  .timesig{ fill:#111; font-family:Georgia,serif; font-weight:bold; font-size:13px; }
  .measureNum{ fill:#888; font-size:9px; font-family:sans-serif; }
  .tempoMark{ fill:#111; font-size:11px; font-family:Georgia,serif; }

  /* ---------- PIANO KEYBOARD PANEL ---------- */
  #pianoPanel{
    height:0; overflow:hidden;
    background:#111;
    transition:height 0.18s ease;
    flex-shrink:0;
  }
  #pianoPanel.open{ height:150px; }
  #pianoScroller{ height:100%; overflow-x:auto; overflow-y:hidden; -webkit-overflow-scrolling:touch;}
  #pianoKeys{ position:relative; height:100%; width:1120px; }
  .whiteKey{
    position:absolute; top:0; height:100%; width:38px;
    background:#f7f7f5; border:1px solid #222; border-radius:0 0 4px 4px;
  }
  .whiteKey:active{ background:var(--accent); }
  .blackKey{
    position:absolute; top:0; height:60%; width:24px;
    background:#111; border-radius:0 0 3px 3px; z-index:2;
    border:1px solid #000;
  }
  .blackKey:active{ background:var(--accent-dim); }
  .keyLabel{ position:absolute; bottom:6px; width:100%; text-align:center; font-size:9px; color:#888; pointer-events:none;}

  /* ---------- TRANSPORT ---------- */
  #transport{
    background:var(--bar-bg);
    display:flex; align-items:center; justify-content:center;
    gap:22px;
    padding:10px 0;
    flex-shrink:0;
    border-top:1px solid #000;
  }
  .transBtn{ width:34px; height:34px; display:flex; align-items:center; justify-content:center; color:#e7e7ea; }
  .transBtn svg{ width:100%; height:100%; }
  #playBtn{ width:44px; height:44px; background:var(--accent); border-radius:50%; }
  #playBtn svg{ width:20px; height:20px; margin-left:2px; }
  #tempoDisplay{
    position:absolute; right:8px; bottom:56px; background:rgba(28,28,30,0.9); color:#fff;
    font-size:11px; padding:4px 8px; border-radius:6px; display:flex; align-items:center; gap:6px;
  }
  #tempoDisplay input{ width:40px; background:transparent; border:none; color:#fff; font-size:11px; text-align:center;}

  /* ---------- MORE MENU ---------- */
  #moreMenu{
    position:absolute; top:54px; right:6px; background:#2a2a2d; border-radius:10px;
    box-shadow:0 4px 14px rgba(0,0,0,0.4); display:none; flex-direction:column; overflow:hidden;
    z-index:50; min-width:190px;
  }
  #moreMenu.open{ display:flex; }
  #moreMenu button{
    background:transparent; border:none; color:#e7e7ea; text-align:left; padding:12px 14px;
    font-size:14px; border-bottom:1px solid #38383b;
  }
  #moreMenu button:last-child{ border-bottom:none; }
  #moreMenu button:active{ background:#3a3a3e; }

  #toast{
    position:absolute; left:50%; top:60px; transform:translateX(-50%);
    background:rgba(20,20,22,0.92); color:#fff; padding:8px 14px; border-radius:20px;
    font-size:12px; opacity:0; pointer-events:none; transition:opacity 0.25s;
    z-index:60; white-space:nowrap;
  }
  #toast.show{ opacity:1; }
</style>
</head>
<body>
<div id="app">

  <!-- TOP BAR -->
  <div id="topbar">
    <button class="tbtn" id="btnHome" title="Accueil">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
    </button>
    <button class="tbtn" id="btnAddStaff" title="Ajouter une portée">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="14" y2="17"/><circle cx="19" cy="17" r="3" fill="currentColor" stroke="none"/><path d="M19 15.7v2.6M17.7 17h2.6" stroke="#1c1c1e" stroke-width="1.2"/></svg>
    </button>
    <button class="tbtn" id="btnUndo" title="Annuler">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 7L4 12l5 5"/><path d="M4 12h11a5 5 0 0 1 0 10h-1"/></svg>
    </button>
    <button class="tbtn" id="btnRedo" title="Rétablir">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 7l5 5-5 5"/><path d="M20 12H9a5 5 0 0 0 0 10h1"/></svg>
    </button>

    <div id="titleWrap">
      <input id="scoreTitleInput" value="Sans titre">
      <div class="composer">Compositeur</div>
    </div>

    <button class="tbtn" id="btnPiano" title="Clavier">
      <svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="16" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="6.5" y1="4" x2="6.5" y2="20" stroke="currentColor" stroke-width="1.4"/><line x1="11" y1="4" x2="11" y2="20" stroke="currentColor" stroke-width="1.4"/><line x1="15.5" y1="4" x2="15.5" y2="20" stroke="currentColor" stroke-width="1.4"/><rect x="4.2" y="4" width="2.4" height="9" /><rect x="8.8" y="4" width="2.4" height="9" /><rect x="15.2" y="4" width="2.4" height="9" /><rect x="19.4" y="4" width="1" height="0" /></svg>
    </button>
    <button class="tbtn" id="btnMore" title="Plus">
      <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
    </button>
  </div>

  <div id="moreMenu">
    <button id="menuTempo">Tempo… (<span id="menuTempoVal">90</span> ♩/min)</button>
    <button id="menuMeasure">Ajouter une mesure</button>
    <button id="menuClear">Effacer la partition</button>
    <button id="menuExport">Exporter (bientôt disponible)</button>
  </div>

  <div id="toast"></div>

  <!-- BODY -->
  <div id="body">
    <div id="rail">
      <button class="railBtn active" id="toolSelect" title="Sélection">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l7 16 2-7 7-2z"/></svg>
      </button>
      <button class="railBtn" id="toolPencil" title="Saisie de notes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16.5 3.5l4 4L7 21l-5 1 1-5z"/></svg>
      </button>
      <button class="railBtn" id="toolEraser" title="Gomme">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3l5 5-9.5 9.5H7L2 13z"/><path d="M8 21h13"/></svg>
      </button>

      <div class="railDivider"></div>

      <div id="durationGrid"></div>

      <div class="railDivider"></div>

      <button class="railBtn" id="toolDot" title="Point">•</button>
      <button class="railBtn" id="toolSharp" title="Dièse">♯</button>
      <button class="railBtn" id="toolFlat" title="Bémol">♭</button>
      <button class="railBtn" id="toolNatural" title="Bécarre">♮</button>
    </div>

    <div id="scoreScroll">
      <div id="page">
        <div id="scoreTitle">Sans titre</div>
        <div id="scoreComposer">Compositeur</div>
        <svg id="staffSvg" viewBox="0 0 900 260"></svg>
      </div>
    </div>
  </div>

  <!-- PIANO -->
  <div id="pianoPanel">
    <div id="pianoScroller">
      <div id="pianoKeys"></div>
    </div>
  </div>

  <!-- TRANSPORT -->
  <div id="transport">
    <button class="transBtn" id="btnRewind" title="Retour au début">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6z"/><path d="M20 5L9 12l11 7z"/></svg>
    </button>
    <button id="playBtn" class="transBtn" title="Lecture">
      <svg id="playIcon" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
    </button>
    <button class="transBtn" id="btnLoop" title="Boucle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
    </button>
  </div>
</div>

<script>
(function(){
  "use strict";

  /* ================= CONFIG ================= */
  const SLOTS_PER_MEASURE = 16;  // sixteenth-note resolution, 4/4
  const SYSTEM_MEASURES = 4;     // measures per row (system)
  const MEASURE_W = 78;          // px width of one measure
  const STAFF_X0 = 44;           // left margin before first barline
  const STAFF_LINE_GAP = 9;      // px between adjacent staff lines
  const STEP_PX = STAFF_LINE_GAP/2; // px per diatonic index step
  const STAFF_TOP_Y = 46;        // y of top line of the FIRST row (F5, idx8)
  const ROW_H = 108;             // vertical distance between successive rows
  const VIEW_W = STAFF_X0 + SYSTEM_MEASURES*MEASURE_W + 18;

  function rowOfMeasure(m){ return Math.floor(m/SYSTEM_MEASURES); }
  function rowTopY(row){ return STAFF_TOP_Y + row*ROW_H; }
  function bottomLineY(row){ return rowTopY(row) + 4*STAFF_LINE_GAP; }

  const DURATIONS = [
    {id:'whole',   slots:16, label:'Ronde'},
    {id:'half',    slots:8,  label:'Blanche'},
    {id:'quarter', slots:4,  label:'Noire'},
    {id:'eighth',  slots:2,  label:'Croche'},
    {id:'sixteenth',slots:1, label:'Double croche'}
  ];

  const LETTERS = ['C','D','E','F','G','A','B'];
  const SEMITONE = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};

  /* ================= STATE ================= */
  let state = {
    title: "Sans titre",
    tempo: 90,
    tool: 'pencil',          // select | pencil | eraser
    duration: 'quarter',
    dotted: false,
    accidental: 0,           // -1 flat, 0 natural, 1 sharp
    notes: [],                // {measure, slotStart, slots, idx, accidental, dotted, id}
    selectedId: null,
    measureCount: 12,
  };
  let undoStack = [];
  let redoStack = [];
  let idCounter = 1;
  let isPlaying = false;
  let playTimer = null;
  let audioCtx = null;

  function pushUndo(){
    undoStack.push(JSON.stringify(state.notes));
    if(undoStack.length>50) undoStack.shift();
    redoStack = [];
  }
  function undo(){
    if(!undoStack.length) return toast("Rien à annuler");
    redoStack.push(JSON.stringify(state.notes));
    state.notes = JSON.parse(undoStack.pop());
    render();
  }
  function redo(){
    if(!redoStack.length) return toast("Rien à rétablir");
    undoStack.push(JSON.stringify(state.notes));
    state.notes = JSON.parse(redoStack.pop());
    render();
  }

  function toast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._tm);
    toast._tm = setTimeout(()=>t.classList.remove('show'), 1400);
  }

  /* ================= PITCH HELPERS ================= */
  // idx: diatonic staff position, 0 = bottom line E4
  function noteNameFromIdx(idx){
    const diff = idx + 2; // shift so diff 0 = C4
    const li = ((diff % 7) + 7) % 7;
    const letter = LETTERS[li];
    const octave = 4 + Math.floor(diff/7);
    return {letter, octave};
  }
  function freqForNote(idx, accidental){
    const {letter, octave} = noteNameFromIdx(idx);
    const midi = (octave+1)*12 + SEMITONE[letter] + accidental;
    return 440 * Math.pow(2, (midi-69)/12);
  }
  function labelForNote(idx, accidental){
    const {letter, octave} = noteNameFromIdx(idx);
    const acc = accidental===1?'♯':accidental===-1?'♭':'';
    return letter+acc+octave;
  }
  function yForIdx(idx, row){ return bottomLineY(row) - idx*STEP_PX; }
  function idxForY(y, row){ return Math.round((bottomLineY(row) - y)/STEP_PX); }

  /* ================= SVG NOTE DRAWING (shared: staff + palette icons) ================= */
  const NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs){
    const e = document.createElementNS(NS, tag);
    for(const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function buildNoteGlyph(cx, cy, opts){
    // opts: {duration, dotted, stemDir (1 down / -1 up), scale}
    const s = opts.scale || 1;
    const g = el('g', {});
    const rx = 4.6*s, ry = 3.4*s;
    const open = opts.duration==='whole' || opts.duration==='half';
    const head = el('ellipse', {
      cx, cy, rx, ry,
      transform:`rotate(-18 ${cx} ${cy})`,
      class:'noteHead ' + (open?'open':'') + (opts.selected?' selected':'')
    });
    g.appendChild(head);

    if(opts.duration !== 'whole'){
      const stemDir = opts.stemDir || (cy < (STAFF_TOP_Y+2*STAFF_LINE_GAP) ? 1 : -1);
      const stemLen = 26*s;
      const stemX = stemDir===1 ? cx-rx+1 : cx+rx-1;
      const y2 = stemDir===1 ? cy+stemLen : cy-stemLen;
      g.appendChild(el('line', {x1:stemX, y1:cy, x2:stemX, y2:y2, class:'stem'}));

      const flags = opts.duration==='eighth' ? 1 : opts.duration==='sixteenth' ? 2 : 0;
      for(let i=0;i<flags;i++){
        const fy = y2 + (stemDir===1? i*6 : -i*6);
        const path = stemDir===1
          ? `M${stemX} ${fy} q9 3 9 11 q-4 -3 -9 -3 z`
          : `M${stemX} ${fy} q9 -3 9 -11 q-4 3 -9 3 z`;
        g.appendChild(el('path',{d:path, class:'flag'}));
      }
    }
    if(opts.dotted){
      g.appendChild(el('circle',{cx:cx+rx+4, cy:cy-2, r:1.6, class:'dot'}));
    }
    if(opts.accidental){
      const sym = opts.accidental===1?'♯':opts.accidental===-1?'♭':'♮';
      const t = el('text',{x:cx-14, y:cy+4, class:'accidental'});
      t.textContent = sym;
      g.appendChild(t);
    }
    return g;
  }

  /* palette icons */
  function buildPaletteIconSVG(duration){
    const svg = el('svg',{viewBox:'0 0 26 30'});
    svg.appendChild(buildNoteGlyph(11, 22, {duration, stemDir:-1, scale:0.9}));
    return svg;
  }

  /* ================= RENDER: DURATION PALETTE ================= */
  function renderPalette(){
    const grid = document.getElementById('durationGrid');
    grid.innerHTML = '';
    DURATIONS.forEach(d=>{
      const btn = document.createElement('button');
      btn.className = 'durBtn' + (state.duration===d.id ? ' active':'');
      btn.title = d.label;
      btn.appendChild(buildPaletteIconSVG(d.id));
      btn.addEventListener('click', ()=>{
        state.duration = d.id;
        renderPalette();
      });
      grid.appendChild(btn);
    });
  }

  /* ================= RENDER: STAFF ================= */
  function measureX(m){ return STAFF_X0 + (m % SYSTEM_MEASURES)*MEASURE_W; }

  function renderStaff(){
    const svg = document.getElementById('staffSvg');
    svg.innerHTML = '';
    const MEASURES = state.measureCount;
    const rows = Math.ceil(MEASURES/SYSTEM_MEASURES);
    const viewH = rowTopY(rows-1) + 4*STAFF_LINE_GAP + 34;
    svg.setAttribute('viewBox', `0 0 ${VIEW_W} ${viewH}`);

    for(let row=0; row<rows; row++){
      const top = rowTopY(row);
      const bottom = bottomLineY(row);
      const measuresInRow = Math.min(SYSTEM_MEASURES, MEASURES - row*SYSTEM_MEASURES);
      const rowRight = STAFF_X0 + measuresInRow*MEASURE_W;

      // 5 lines
      for(let i=0;i<5;i++){
        const y = top + i*STAFF_LINE_GAP;
        svg.appendChild(el('line',{x1:STAFF_X0-14, y1:y, x2:rowRight, y2:y, class:'staffLine'}));
      }
      // clef on every row
      const clef = el('text',{x:STAFF_X0-12, y:bottom+2, class:'clef', style:'font-size:44px;font-family:Georgia,serif;'});
      clef.textContent = '𝄞';
      svg.appendChild(clef);

      // time signature only on the first row
      if(row===0){
        const ts1 = el('text',{x:STAFF_X0+22, y:top+2*STAFF_LINE_GAP+2, class:'timesig'});
        ts1.textContent='4';
        const ts2 = el('text',{x:STAFF_X0+22, y:bottom+2, class:'timesig'});
        ts2.textContent='4';
        svg.appendChild(ts1); svg.appendChild(ts2);

        const tempoTxt = el('text',{x:STAFF_X0+40, y:top-12, class:'tempoMark'});
        tempoTxt.textContent = '♩ = '+state.tempo;
        svg.appendChild(tempoTxt);
      }

      // barlines
      for(let c=0;c<=measuresInRow;c++){
        const x = STAFF_X0 + c*MEASURE_W;
        svg.appendChild(el('line',{x1:x, y1:top, x2:x, y2:bottom, class:'barline'}));
      }
      // final barline of the whole piece is thicker
      if(row===rows-1){
        const x = STAFF_X0 + measuresInRow*MEASURE_W;
        svg.appendChild(el('line',{x1:x-2, y1:top, x2:x-2, y2:bottom, class:'barline', 'stroke-width':2}));
      }

      // measure numbers + hitboxes
      for(let c=0;c<measuresInRow;c++){
        const m = row*SYSTEM_MEASURES + c;
        const x = STAFF_X0 + c*MEASURE_W;
        if(c===0){
          const num = el('text',{x:x+2, y:top-6, class:'measureNum'});
          num.textContent = (m+1);
          svg.appendChild(num);
        }
        const hit = el('rect',{x, y:top-30, width:MEASURE_W, height:4*STAFF_LINE_GAP+60, class:'measureHitbox', 'data-measure':m});
        hit.addEventListener('click', (ev)=>onMeasureTap(ev, m));
        svg.appendChild(hit);
      }
    }

    // notes
    state.notes.forEach(n=>drawNote(svg, n));

    // playback cursor
    if(isPlaying){
      svg.appendChild(el('line',{id:'cursor', x1:playCursorX, y1:playCursorTop, x2:playCursorX, y2:playCursorBottom, stroke:'#3b9dff','stroke-width':2}));
    }
  }

  function slotToX(measure, slot){
    return measureX(measure) + (slot/SLOTS_PER_MEASURE) * MEASURE_W + 6;
  }

  function drawNote(svg, n){
    const row = rowOfMeasure(n.measure);
    const cx = slotToX(n.measure, n.slotStart) + 6;
    const cy = yForIdx(n.idx, row);

    // ledger lines
    if(n.idx <= -2){
      for(let li=-2; li>=n.idx; li-=2){
        const ly = yForIdx(li, row);
        svg.appendChild(el('line',{x1:cx-8, y1:ly, x2:cx+8, y2:ly, class:'staffLine'}));
      }
    } else if(n.idx >= 10){
      for(let li=10; li<=n.idx; li+=2){
        const ly = yForIdx(li, row);
        svg.appendChild(el('line',{x1:cx-8, y1:ly, x2:cx+8, y2:ly, class:'staffLine'}));
      }
    }

    const g = buildNoteGlyph(cx, cy, {
      duration:n.duration, dotted:n.dotted, accidental:n.accidental,
      selected: n.id===state.selectedId,
      stemDir: cy < (rowTopY(row)+2*STAFF_LINE_GAP) ? 1 : -1
    });
    g.style.cursor='pointer';
    g.addEventListener('click', (ev)=>{ ev.stopPropagation(); onNoteTap(n); });
    svg.appendChild(g);
  }

  /* ================= INTERACTION ================= */
  function slotsForDuration(id, dotted){
    const base = DURATIONS.find(d=>d.id===id).slots;
    return dotted ? Math.round(base*1.5) : base;
  }

  function measureOccupied(measure, slotStart, slots){
    return state.notes.some(n=>{
      if(n.measure!==measure) return false;
      const end = n.slotStart + n.slots;
      return slotStart < end && (slotStart+slots) > n.slotStart;
    });
  }

  function onMeasureTap(ev, measure){
    if(state.tool !== 'pencil') return;
    const svg = document.getElementById('staffSvg');
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());

    const localX = loc.x - measureX(measure);
    let slot = Math.round((localX/MEASURE_W)*SLOTS_PER_MEASURE);
    slot = Math.max(0, Math.min(SLOTS_PER_MEASURE-1, slot));

    const slots = slotsForDuration(state.duration, state.dotted);
    if(slot + slots > SLOTS_PER_MEASURE){
      toast("Ne tient pas dans la mesure");
      return;
    }
    if(measureOccupied(measure, slot, slots)){
      toast("Emplacement occupé");
      return;
    }

    const row = rowOfMeasure(measure);
    const idx = idxForY(loc.y, row);

    pushUndo();
    state.notes.push({
      id: idCounter++,
      measure, slotStart:slot, slots,
      duration:state.duration, dotted:state.dotted,
      idx, accidental: state.accidental
    });
    state.notes.sort((a,b)=> a.measure-b.measure || a.slotStart-b.slotStart);
    render();
  }

  function onNoteTap(n){
    if(state.tool === 'eraser'){
      pushUndo();
      state.notes = state.notes.filter(x=>x.id!==n.id);
      render();
      return;
    }
    if(state.tool === 'select'){
      state.selectedId = (state.selectedId===n.id) ? null : n.id;
      render();
      toast(labelForNote(n.idx, n.accidental));
      return;
    }
    if(state.tool === 'pencil'){
      // preview pitch
      playSingleNote(freqForNote(n.idx, n.accidental), 0.35);
    }
  }

  /* ================= TOOL RAIL WIRING ================= */
  function setTool(tool){
    state.tool = tool;
    ['toolSelect','toolPencil','toolEraser'].forEach(id=>{
      document.getElementById(id).classList.remove('active');
    });
    const map = {select:'toolSelect', pencil:'toolPencil', eraser:'toolEraser'};
    document.getElementById(map[tool]).classList.add('active');
  }
  document.getElementById('toolSelect').addEventListener('click', ()=>setTool('select'));
  document.getElementById('toolPencil').addEventListener('click', ()=>setTool('pencil'));
  document.getElementById('toolEraser').addEventListener('click', ()=>setTool('eraser'));

  document.getElementById('toolDot').addEventListener('click', (e)=>{
    state.dotted = !state.dotted;
    e.target.style.color = state.dotted ? '#3b9dff' : '';
  });
  function setAccidental(val, btnId){
    state.accidental = (state.accidental===val) ? 0 : val;
    ['toolSharp','toolFlat','toolNatural'].forEach(id=>document.getElementById(id).style.color='');
    if(state.accidental!==0 || val===0) {
      if(state.accidental===val) document.getElementById(btnId).style.color = '#3b9dff';
    }
  }
  document.getElementById('toolSharp').addEventListener('click', ()=>setAccidental(1,'toolSharp'));
  document.getElementById('toolFlat').addEventListener('click', ()=>setAccidental(-1,'toolFlat'));
  document.getElementById('toolNatural').addEventListener('click', ()=>setAccidental(0,'toolNatural'));

  /* ================= TOP BAR WIRING ================= */
  document.getElementById('btnUndo').addEventListener('click', undo);
  document.getElementById('btnRedo').addEventListener('click', redo);
  document.getElementById('btnAddStaff').addEventListener('click', ()=>toast("Ajout de portées multiples — bientôt disponible"));
  document.getElementById('btnHome').addEventListener('click', ()=>toast("Retour à l'accueil — bientôt disponible"));

  const morebtn = document.getElementById('btnMore');
  const moreMenu = document.getElementById('moreMenu');
  morebtn.addEventListener('click', (e)=>{ e.stopPropagation(); moreMenu.classList.toggle('open'); });
  document.addEventListener('click', ()=> moreMenu.classList.remove('open'));

  document.getElementById('menuTempo').addEventListener('click', ()=>{
    const v = prompt("Nouveau tempo (noire = ?)", state.tempo);
    if(v && !isNaN(v)){ state.tempo = Math.max(20, Math.min(300, parseInt(v))); document.getElementById('menuTempoVal').textContent = state.tempo; render(); }
    moreMenu.classList.remove('open');
  });
  document.getElementById('menuMeasure').addEventListener('click', ()=>{
    state.measureCount += 4;
    render();
    toast("Mesures ajoutées");
    moreMenu.classList.remove('open');
  });
  document.getElementById('menuClear').addEventListener('click', ()=>{
    if(state.notes.length && confirm("Effacer toutes les notes ?")){
      pushUndo(); state.notes=[]; render();
    }
    moreMenu.classList.remove('open');
  });
  document.getElementById('menuExport').addEventListener('click', ()=>{
    toast("Export PDF / MusicXML — bientôt disponible");
    moreMenu.classList.remove('open');
  });

  document.getElementById('scoreTitleInput').addEventListener('input', (e)=>{
    document.getElementById('scoreTitle').textContent = e.target.value || 'Sans titre';
  });

  /* ================= PIANO PANEL ================= */
  const pianoPanel = document.getElementById('pianoPanel');
  document.getElementById('btnPiano').addEventListener('click', (e)=>{
    pianoPanel.classList.toggle('open');
    e.currentTarget.classList.toggle('active');
  });

  function buildPiano(){
    const cont = document.getElementById('pianoKeys');
    cont.innerHTML='';
    const whiteSeq = ['C','D','E','F','G','A','B'];
    const blackAfter = {C:1,D:1,F:1,G:1,A:1};
    let wIdx=0;
    for(let oct=3; oct<=6; oct++){
      whiteSeq.forEach(letter=>{
        const x = wIdx*38;
        const wk = document.createElement('div');
        wk.className='whiteKey';
        wk.style.left = x+'px';
        if(letter==='C'){
          const lab = document.createElement('div');
          lab.className='keyLabel'; lab.textContent='C'+oct;
          wk.appendChild(lab);
        }
        wk.addEventListener('touchstart', ()=>playKeyByName(letter,0,oct), {passive:true});
        wk.addEventListener('mousedown', ()=>playKeyByName(letter,0,oct));
        cont.appendChild(wk);
        if(blackAfter[letter]){
          const bk = document.createElement('div');
          bk.className='blackKey';
          bk.style.left = (x+27)+'px';
          bk.addEventListener('touchstart', ()=>playKeyByName(letter,1,oct), {passive:true});
          bk.addEventListener('mousedown', ()=>playKeyByName(letter,1,oct));
          cont.appendChild(bk);
        }
        wIdx++;
      });
    }
    cont.style.width = (wIdx*38+20)+'px';
  }
  function playKeyByName(letter, acc, octave){
    const midi = (octave+1)*12 + SEMITONE[letter] + acc;
    const freq = 440*Math.pow(2,(midi-69)/12);
    playSingleNote(freq, 0.4);
  }

  /* ================= AUDIO ================= */
  function ensureAudio(){
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
  }
  function playSingleNote(freq, dur){
    ensureAudio();
    const t0 = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.28, t0+0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0+dur+0.02);
  }

  /* ================= PLAYBACK ================= */
  let playCursorX = STAFF_X0;
  let playCursorTop = STAFF_TOP_Y-8;
  let playCursorBottom = STAFF_TOP_Y+4*STAFF_LINE_GAP+8;
  const playIcon = document.getElementById('playIcon');
  function togglePlay(){
    isPlaying ? stopPlay() : startPlay();
  }
  function startPlay(){
    if(!state.notes.length){ toast("Aucune note à jouer"); return; }
    ensureAudio();
    isPlaying = true;
    playIcon.innerHTML = '<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>';
    const secPerSlot = (60/state.tempo) / 4; // quarter = 4 slots

    const sorted = [...state.notes].sort((a,b)=> (a.measure*SLOTS_PER_MEASURE+a.slotStart) - (b.measure*SLOTS_PER_MEASURE+b.slotStart));
    let i = 0;
    function step(){
      if(!isPlaying) return;
      if(i>=sorted.length){ stopPlay(); return; }
      const n = sorted[i];
      const row = rowOfMeasure(n.measure);
      const absSlot = n.measure*SLOTS_PER_MEASURE + n.slotStart;
      const freq = freqForNote(n.idx, n.accidental);
      playSingleNote(freq, n.slots*secPerSlot*0.9);
      playCursorX = slotToX(n.measure, n.slotStart)+6;
      playCursorTop = rowTopY(row)-8;
      playCursorBottom = bottomLineY(row)+8;
      render();
      i++;
      const nextDelay = i<sorted.length
        ? ((sorted[i].measure*SLOTS_PER_MEASURE+sorted[i].slotStart) - absSlot) * secPerSlot * 1000
        : n.slots*secPerSlot*1000;
      playTimer = setTimeout(step, Math.max(30,nextDelay));
    }
    step();
  }
  function stopPlay(){
    isPlaying = false;
    clearTimeout(playTimer);
    playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    render();
  }
  document.getElementById('playBtn').addEventListener('click', togglePlay);
  document.getElementById('btnRewind').addEventListener('click', ()=>{ stopPlay(); playCursorX=STAFF_X0; render(); });
  document.getElementById('btnLoop').addEventListener('click', (e)=>{ e.currentTarget.classList.toggle('active'); toast("Boucle (visuel) — bientôt fonctionnelle"); });

  /* ================= RENDER ALL ================= */
  function render(){
    renderPalette();
    renderStaff();
  }

  buildPiano();
  render();

})();
</script>
</body>
</html>
