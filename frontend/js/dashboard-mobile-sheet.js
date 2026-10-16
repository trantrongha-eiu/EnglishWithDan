// dashboard.html — Vocabulary
(function(){
  var fab      = document.getElementById('mobFab');
  var fabIcon  = document.getElementById('mobFabIcon');
  var backdrop = document.getElementById('mobBackdrop');
  var sheet    = document.getElementById('mobSheet');
  var isOpen   = false;

  // ── Open / close ────────────────────────────────
  window.toggleSheet = function(){
    isOpen ? closeSheet() : openSheet();
  };
  window.openSheet = function(){
    isOpen = true;
    backdrop.classList.add('active');
    sheet.classList.add('active');
    fab.classList.add('sheet-open');
    fabIcon.className = 'fas fa-times';
    // small delay so display:flex kicks in before transition
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        backdrop.classList.add('visible');
        sheet.classList.add('open');
      });
    });
    syncSheetBooks();
    syncSheetUnits();
  };
  window.closeSheet = function(){
    isOpen = false;
    backdrop.classList.remove('visible');
    sheet.classList.remove('open');
    fab.classList.remove('sheet-open');
    fabIcon.className = 'fas fa-bars';
    setTimeout(function(){
      backdrop.classList.remove('active');
      sheet.classList.remove('active');
      sheet.classList.remove('expanded'); // next open starts at the default height
    }, 320);
  };

  // ── Tabs ────────────────────────────────────────
  window.switchSheetTab = function(idx){
    [0,1,2].forEach(function(i){
      document.getElementById('sheetTab'+i).classList.toggle('active', i===idx);
      document.getElementById('sheetPanel'+i).classList.toggle('active', i===idx);
    });
  };

  // syncSheetBooks is defined in dashboard.js (loaded after this inline
  // script) and calls itself onto window — nothing to define here.

  // ── Custom Unit Picker ──────────────────────────
  (function(){
    var _units = [], _val = '', _pickers = [];
    function _lbl(v){ var u=_units.find(function(u){return String(u.value)===String(v);}); return u?u.label:''; }
    function _buildPicker(inpId, ddId){
      var inp=document.getElementById(inpId), dd=document.getElementById(ddId);
      if(!inp||!dd) return null;
      var isOpen=false;
      function render(q){
        var list=q?_units.filter(function(u){return u.label.toLowerCase().includes(q.toLowerCase());}):_units;
        dd.innerHTML='';
        if(!list.length){dd.innerHTML='<div class="up-empty">Không tìm thấy</div>';return;}
        list.forEach(function(u){
          var d=document.createElement('div');
          d.className='up-item'+(String(u.value)===String(_val)?' up-active':'');
          d.textContent=u.label;
          d.addEventListener('mousedown',function(e){e.preventDefault();_pick(String(u.value));});
          dd.appendChild(d);
        });
      }
      function openDD(){inp.value='';inp.placeholder=_lbl(_val)||'-- Chọn Paraphrase Unit --';render('');dd.style.display='block';isOpen=true;
        // The sheet is only as tall as its content; opening the unit list
        // inside a collapsed sheet leaves it half off-screen. Expand so the
        // whole list is reachable (no-op when the picker isn't in #mobSheet).
        if(sheet&&sheet.classList.contains('active'))sheet.classList.add('expanded');}
      // blur() on close — the dropdown-item mousedown handler below calls
      // e.preventDefault() (so the click reliably registers instead of the
      // input blurring first and closing the dropdown out from under the
      // tap), which left the input focused after picking. Harmless on
      // desktop, but leaving a text input focused is bad practice on
      // mobile even with readonly/inputmode=none preventing the keyboard
      // (unitPickerInputM) — blur explicitly once the pick is done.
      function closeDD(){dd.style.display='none';isOpen=false;inp.value=_lbl(_val);inp.placeholder=_lbl(_val)||'-- Chọn Paraphrase Unit --';inp.blur();}
      inp.addEventListener('focus',openDD);
      inp.addEventListener('input',function(){if(!isOpen){isOpen=true;dd.style.display='block';}render(inp.value);});
      inp.addEventListener('keydown',function(e){if(e.key==='Escape')closeDD();});
      document.addEventListener('mousedown',function(e){if(!inp.contains(e.target)&&!dd.contains(e.target)&&isOpen)closeDD();});
      return{refresh:function(){render(isOpen?inp.value:'');if(!isOpen)inp.value=_lbl(_val);},close:closeDD,updateDisplay:function(){if(!isOpen)inp.value=_lbl(_val);}};
    }
    function _pick(val){
      _val=val;
      var s1=document.getElementById('unitSelect'),s2=document.getElementById('unitSelectMob');
      if(s1)s1.value=val; if(s2)s2.value=val;
      _pickers.forEach(function(p){p.updateDisplay();});
      _pickers.forEach(function(p){p.close();});
      if(!val) return;
      loadUnit();
      if(window.closeSheet) closeSheet(); // no-op if the mobile sheet isn't open
    }
    window._upSetUnits=function(units){
      _units=units.map(function(u){return{value:String(u.unitNumber),label:'Unit '+u.unitNumber+' – '+u.title};});
      _pickers.forEach(function(p){p.refresh();});
    };
    // Mobile sheet only — the desktop sidebar picker was replaced by the
    // full-width #practice-browse view (js/dashboard-browse.js).
    var p2=_buildPicker('unitPickerInputM','unitPickerDdM');
    if(p2)_pickers.push(p2);
  })();

  // ── syncSheetUnits: now just syncs hidden selects (compat) ──────
  window.syncSheetUnits = function(){
    var src=document.getElementById('unitSelect'), dest=document.getElementById('unitSelectMob');
    if(src&&dest){dest.innerHTML=src.innerHTML;dest.value=src.value;}
  };

  // ── Hiện hint trên welcome screen mobile ────────
  function checkMob(){
    var hint = document.getElementById('mob-hint');
    if(hint){
      hint.style.display = window.innerWidth <= 768 ? 'block' : 'none';
    }
  }
  checkMob();
  window.addEventListener('resize', checkMob);

  // ── Drag handle: swipe UP to expand, swipe DOWN to collapse / close ──
  //   collapsed (default 72vh)  ⇄  expanded (95vh)  → close
  // A near-stationary press (tap) just toggles expanded, as a quick
  // affordance for students who don't discover the drag.
  var handle   = document.getElementById('sheetHandle');
  var startY   = 0;
  var dragging = false;
  handle.addEventListener('touchstart', function(e){
    startY   = e.touches[0].clientY;
    dragging = true;
    sheet.style.transition = 'none';
  }, {passive:true});
  handle.addEventListener('touchmove', function(e){
    if(!dragging) return;
    var dy = e.touches[0].clientY - startY;
    // Live feedback only for a downward drag (toward collapse/dismiss);
    // an upward drag just snaps to .expanded on release.
    sheet.style.transform = dy > 0 ? 'translateY(' + Math.min(dy, 260) + 'px)' : '';
  }, {passive:true});
  handle.addEventListener('touchend', function(e){
    if(!dragging) return;
    dragging = false;
    var dy = e.changedTouches[0].clientY - startY;
    sheet.style.transition = '';
    sheet.style.transform = '';
    var expanded = sheet.classList.contains('expanded');
    if(Math.abs(dy) < 8){                 // tap → toggle
      sheet.classList.toggle('expanded');
    } else if(dy <= -36){                 // swipe up → grow
      sheet.classList.add('expanded');
    } else if(dy >= 36){                  // swipe down
      if(expanded)      sheet.classList.remove('expanded');  // expanded → collapsed
      else if(dy > 80)  closeSheet();                        // collapsed → close
    }
  });

  // renderBookSidebar() and loadUnits() in dashboard.js already call
  // syncSheetBooks() / _upSetUnits() + syncSheetUnits() themselves on every
  // run, so the old load-time monkeypatch wrappers here were dead weight
  // (and the loadUnits one re-derived unit data by regex-parsing option
  // text, which mangled any title containing " – "). Removed.
})();
