/* ═══ pdf rutina ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// PDF DE LA RUTINA — el socio descarga su plan aprobado
// Carga jsPDF de forma diferida (mismo patrón que Three.js), solo cuando se pide.
// ═════════════════════════════════════════
let _jsPDFPromise=null;
function cargarJsPDF(){
  if(window.jspdf && window.jspdf.jsPDF) return Promise.resolve();
  if(_jsPDFPromise) return _jsPDFPromise;
  _jsPDFPromise = new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.crossOrigin='anonymous';
    s.onload=()=>res();
    s.onerror=()=>{ _jsPDFPromise=null; rej(new Error('jspdf load')); };
    document.head.appendChild(s);
  });
  return _jsPDFPromise;
}

async function generarPDFRutina(){
  const s=activeSocio; if(!s) return;
  const btn=document.getElementById('btn-pdf-rutina');
  const btnTxt=btn?btn.textContent:'';
  if(btn){ btn.textContent='GENERANDO…'; btn.style.pointerEvents='none'; }
  try{
    await cargarJsPDF();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'mm', format:'a4' });

  const NAVY=[15,22,34], NAVY_L=[38,48,64];
  const GREEN=[128,196,73], GREEN_D=[80,142,48];
  const GRAY_BG=[244,247,241], GRAY_LINE=[224,229,219], GRAY_ZEBRA=[249,250,247];
  const TXT=[26,30,24], MUTED=[125,132,118];
  const DAY_COLORS=[GREEN_D, NAVY_L];

  const pageW=210, pageH=297, marginX=13, gap=6;
  const colW=(pageW-marginX*2-gap)/2;
  const contentW=colW-6;
  const colX=[marginX, marginX+colW+gap];
  const NAME_W=37, SR_W=19, PESO_W=19, NUM_W=5, NAME_WRAP_W=33;
  const maxY=272;
  let colY=[0,0];

  const ent = s.entrenadorId ? getEntrenador(s.entrenadorId) : null;
  const seenDayStructures = {};

  function iconTarget(cx,cy,r,fg){
    doc.setDrawColor(...fg); doc.setLineWidth(0.55);
    doc.circle(cx,cy,r*0.72,'S'); doc.circle(cx,cy,r*0.42,'S');
    doc.setFillColor(...fg); doc.circle(cx,cy,r*0.14,'F');
  }
  function iconPerson(cx,cy,r,fg){
    doc.setFillColor(...fg);
    doc.circle(cx,cy-r*0.32,r*0.34,'F');
    doc.roundedRect(cx-r*0.46,cy+r*0.02,r*0.92,r*0.62,r*0.22,r*0.22,'F');
  }
  function iconCoach(cx,cy,r,fg){
    doc.setDrawColor(...fg); doc.setLineWidth(0.7);
    doc.circle(cx,cy,r*0.62,'S');
    doc.setLineWidth(0.8);
    doc.line(cx-r*0.28,cy+r*0.02,cx-r*0.06,cy+r*0.26);
    doc.line(cx-r*0.06,cy+r*0.26,cx+r*0.32,cy-r*0.24);
  }
  function iconCalendar(cx,cy,r,fg){
    doc.setFillColor(...fg);
    doc.roundedRect(cx-r*0.55,cy-r*0.45,r*1.1,r*0.95,r*0.15,r*0.15,'F');
    doc.setFillColor(255,255,255);
    doc.rect(cx-r*0.55,cy-r*0.45,r*1.1,r*0.32,'F');
    doc.setFillColor(...fg);
    doc.rect(cx-r*0.32,cy-r*0.62,r*0.13,r*0.34,'F');
    doc.rect(cx+r*0.19,cy-r*0.62,r*0.13,r*0.34,'F');
  }
  function iconDumbbell(cx,cy,r,fg){
    doc.setFillColor(...fg);
    doc.circle(cx-r*0.42,cy,r*0.26,'F'); doc.circle(cx+r*0.42,cy,r*0.26,'F');
    doc.setDrawColor(...fg); doc.setLineWidth(1.3);
    doc.line(cx-r*0.2,cy,cx+r*0.2,cy);
  }
  function iconStar(cx,cy,r,fg){
    const pts=[]; const spikes=5;
    for(let i=0;i<spikes*2;i++){
      const rad = i%2===0? r*0.62 : r*0.26;
      const ang = -Math.PI/2 + i*Math.PI/spikes;
      pts.push([cx+rad*Math.cos(ang), cy+rad*Math.sin(ang)]);
    }
    doc.setFillColor(...fg);
    const rel=[]; for(let i=1;i<pts.length;i++) rel.push([pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]]);
    doc.lines(rel, pts[0][0], pts[0][1], [1,1], 'F', true);
  }

  function drawBanner(){
    doc.setFillColor(...NAVY); doc.rect(0,0,pageW,34,'F');
    doc.setFillColor(...GREEN_D); doc.triangle(148,0,pageW,0,pageW,34,'F');
    doc.setFillColor(...GREEN); doc.triangle(170,0,pageW,0,pageW,34,'F');

    const cx=24, cy=17;
    doc.setFillColor(255,255,255); doc.circle(cx,cy,11.5,'F');
    doc.setDrawColor(...GREEN); doc.setLineWidth(1.1); doc.circle(cx,cy,11.5,'S');
    doc.setDrawColor(...NAVY); doc.setLineWidth(0.4); doc.circle(cx,cy,9.3,'S');
    doc.setFont('helvetica','bold'); doc.setFontSize(11.5); doc.setTextColor(...NAVY);
    doc.text('CC', cx, cy+1.3, {align:'center'});
    doc.setFont('helvetica','normal'); doc.setFontSize(4.4); doc.setTextColor(...GREEN_D);
    doc.text('AGS.', cx, cy+4.6, {align:'center'});

    doc.setFont('helvetica','bold'); doc.setFontSize(15.5); doc.setTextColor(255,255,255);
    doc.text('CLUB CAMPESTRE', 41, 13);
    doc.text('AGUASCALIENTES', 41, 20.5);
    doc.setFontSize(10); doc.setTextColor(...GREEN);
    doc.text('TU RUTINA DE ENTRENAMIENTO', 41, 27.5);
  }

  function drawInfoStrip(){
    const y=44, iconR=4.2, groupW=(pageW-marginX*2)/4;
    const items=[
      {icon:iconTarget, label:'OBJETIVO', val:s.objetivo||'—'},
      {icon:iconPerson, label:'SOCIO', val:s.nombre||'—'},
      {icon:iconCoach, label:'ENTRENADOR', val:(s.asignado&&s.asignado!=='—')?s.asignado:'Club Campestre'},
      {icon:iconCalendar, label:'DESDE', val:fmtFecha(s.fechaRegistro)},
    ];
    items.forEach((it,i)=>{
      const gx=marginX+i*groupW;
      it.icon(gx+iconR+1, y, iconR, GREEN_D);
      doc.setFont('helvetica','bold'); doc.setFontSize(6.8); doc.setTextColor(...MUTED);
      doc.text(it.label, gx+iconR*2+4, y-2.2);
      doc.setFont('helvetica','bold'); doc.setFontSize(9.2); doc.setTextColor(...TXT);
      const valLines=doc.splitTextToSize(it.val, groupW-iconR*2-6);
      doc.text(valLines.slice(0,2), gx+iconR*2+4, y+2.6);
      if(i>0){ doc.setDrawColor(...GRAY_LINE); doc.setLineWidth(0.25); doc.line(gx-4,y-6,gx-4,y+6); }
    });
    const bottomY=54;
    doc.setDrawColor(...GRAY_LINE); doc.setLineWidth(0.3); doc.line(marginX,bottomY,pageW-marginX,bottomY);
    return bottomY+8;
  }

  function drawPageContinuationHeader(){
    doc.setFillColor(...NAVY); doc.rect(0,0,pageW,13,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(255,255,255);
    doc.text('TU RUTINA', marginX, 8.3);
    doc.setTextColor(...GREEN); doc.setFont('helvetica','normal'); doc.setFontSize(8);
    doc.text(' · '+(s.nombre||''), marginX+22, 8.3);
    return 20;
  }

  function drawPageFooter(){
    doc.setDrawColor(...GRAY_LINE); doc.setLineWidth(0.2); doc.line(marginX,284,pageW-marginX,284);
    doc.setFont('helvetica','normal'); doc.setFontSize(6.7); doc.setTextColor(...MUTED);
    doc.text('Club Campestre Aguascalientes · Fitness System Pro', marginX, 289);
    doc.text('Pág. '+doc.internal.getCurrentPageInfo().pageNumber, pageW-marginX, 289, {align:'right'});
  }

  function newPage(){
    drawPageFooter();
    doc.addPage();
    const top=drawPageContinuationHeader();
    colY=[top,top];
  }

  drawBanner();
  colY[0]=colY[1]=drawInfoStrip();

  const dias = DIAS_ORDER.map(k=>({key:k,d:s.rutina[k]})).filter(x=>x.d);

  dias.forEach((item,dayIdx)=>{
    const d=item.d;
    const color=DAY_COLORS[dayIdx%2];
    const sig = (d.ejercicios||[]).map(e=>e.nm).join('|');
    const isDup = sig && seenDayStructures[sig];
    if(sig && !isDup) seenDayStructures[sig]={label:d.label,tipo:d.tipo};

    const rows=[];
    if(d.ejercicios && d.ejercicios.length){
      d.ejercicios.forEach((ej,i)=>{
        doc.setFont('helvetica','bold'); doc.setFontSize(8);
        const nameLines=isDup?[ej.nm||'']:doc.splitTextToSize(ej.nm||'', NAME_WRAP_W);
        doc.setFont('helvetica','normal'); doc.setFontSize(7.4);
        const rxP=rxTexto(ej,s); const srLines=doc.splitTextToSize((esEjCardio(ej)||esEjRondas(ej)||esEjMovilidad(ej))?rxP.sr.replace(' × ','×'):`${ej.series}×${ej.reps}`, SR_W-1.5);
        const pesoLines=doc.splitTextToSize(String((esEjCardio(ej)||esEjRondas(ej)||esEjMovilidad(ej))?rxP.carga:(pct1RM(ej.peso)?'Moderado — 2 reps en reserva':(ej.peso||'—'))), PESO_W-1.5);
        let tipLines=[];
        if(!isDup && (ej.tip || ej.metodo || (ej.alternativas||[]).length)){
          doc.setFont('helvetica','italic'); doc.setFontSize(7);
          const partes=[];
          if(ej.metodo) partes.push('Método: '+(ej.grupo?ej.grupo+' · ':'')+ej.metodo.nm+(ej.metodo.detalle?' ('+ej.metodo.detalle+')':'')+'.');
          if(ej.descanso) partes.push('Descanso: '+String(ej.descanso).replace('→','->')+'.');
          if(ej.tip) partes.push('Tip: '+ej.tip);
          if((ej.alternativas||[]).length) partes.push('Si está ocupado: '+ej.alternativas.map(a=>a.nm).join(' / ')+'.');
          tipLines=doc.splitTextToSize(partes.join('  '), contentW-2);
        }
        const headLines=Math.max(nameLines.length, srLines.length, pesoLines.length);
        const rowH = Math.max(headLines*3.3, 4.2) + (tipLines.length? tipLines.length*2.85+1.3 : 0) + 1.9;
        rows.push({ej,idx:i,nameLines,srLines,pesoLines,tipLines,rowH});
      });
    }
    const refLine = isDup ? 5.5 : 0;
    const blockH = 8 + 5 + refLine + (rows.length? rows.reduce((a,r)=>a+r.rowH,0) : 7) + 3;

    let idx = colY[0]<=colY[1] ? 0 : 1;
    if(colY[idx]+blockH>maxY){ newPage(); idx=0; }
    const x=colX[idx]; let y=colY[idx];

    doc.setFillColor(...color); doc.roundedRect(x,y,colW,8,1.4,1.4,'F');
    const dk = color.map(c=>Math.max(0,c-25));
    doc.setFillColor(...dk);
    doc.triangle(x+colW-7,y, x+colW,y, x+colW,y+8,'F');
    doc.setFillColor(255,255,255); iconDumbbell(x+6,y+4,2.9,[255,255,255]);
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(255,255,255);
    doc.text(`${d.label} — ${d.tipo}`, x+11, y+5.2);
    y+=8+2;

    if(isDup){
      doc.setFont('helvetica','italic'); doc.setFontSize(7.1); doc.setTextColor(...MUTED);
      doc.text(`(Misma estructura que ${seenDayStructures[sig].label} — ${seenDayStructures[sig].tipo})`, x+1, y);
      y+=5;
    }

    if(!rows.length){
      doc.setFillColor(...GRAY_BG); doc.roundedRect(x,y,colW,7,1,1,'F');
      doc.setFont('helvetica','italic'); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
      doc.text('Descanso / recuperación activa', x+3.5, y+4.7);
      y+=7+3;
    } else {
      doc.setFillColor(...GRAY_BG); doc.rect(x,y-3.5,colW,4.8,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(6.1); doc.setTextColor(...MUTED);
      doc.text('EJERCICIO', x+3+NUM_W, y-0.7);
      doc.text('SERIES×REPS', x+3+NUM_W+NAME_W, y-0.7);
      doc.text('PESO', x+3+NUM_W+NAME_W+SR_W, y-0.7);
      y+=2.9;

      rows.forEach((r,ri)=>{
        if(ri%2===1){
          doc.setFillColor(...GRAY_ZEBRA);
          doc.rect(x,y-3.1,colW,r.rowH,'F');
        }
        doc.setFillColor(...color); doc.roundedRect(x+3,y-2.9,4,4,0.8,0.8,'F');
        doc.setFont('helvetica','bold'); doc.setFontSize(6.5); doc.setTextColor(255,255,255);
        doc.text(String(r.idx+1), x+3+2, y+0.15, {align:'center'});

        doc.setFont('helvetica','bold'); doc.setFontSize(isDup?7.3:7.8); doc.setTextColor(...TXT);
        doc.text(r.nameLines, x+3+NUM_W, y);
        doc.setFont('helvetica','normal'); doc.setFontSize(7.3); doc.setTextColor(...MUTED);
        doc.text(r.srLines, x+3+NUM_W+NAME_W, y);
        doc.text(r.pesoLines, x+3+NUM_W+NAME_W+SR_W, y);

        let ry = y + Math.max(r.nameLines.length,r.srLines.length,r.pesoLines.length)*3.3;
        if(r.tipLines.length){
          doc.setFont('helvetica','italic'); doc.setFontSize(6.9); doc.setTextColor(...GREEN_D);
          doc.text(r.tipLines, x+3+NUM_W, ry);
          ry += r.tipLines.length*2.85+1.3;
        }
        y = ry + 1.9;
      });
    }
    colY[idx]=y+2.5;
  });

  let ny=Math.max(colY[0],colY[1])+4;
  const notaTrainer = (ent && ent.filosofia && ent.filosofia.adjustmentPhilosophy) ? ent.filosofia.adjustmentPhilosophy : null;
  const notasList = [
    'Calienta 5–10 min antes de cada sesión.',
    'Mantén buena técnica y controla cada repetición.',
    'Descansa 60–90 seg entre series (resistencia) y 90–120 seg en hipertrofia.',
    'Hidrátate durante el entrenamiento.',
    'Duerme 7–8 horas diarias y cuida tu alimentación.',
  ];
  if(notaTrainer) notasList.push('Criterio de tu entrenador: '+notaTrainer);

  doc.setFont('helvetica','normal'); doc.setFontSize(7.4);
  const wrapped = notasList.map(t=>doc.splitTextToSize('•  '+t, pageW-marginX*2-10));
  const boxH = 11 + wrapped.reduce((a,w)=>a+w.length*3.5,0) + 3;
  const CLOSE_H = 22;
  if(ny+boxH+CLOSE_H>maxY+6){ newPage(); ny=colY[0]; }

  doc.setDrawColor(...GRAY_LINE); doc.setFillColor(...GRAY_BG);
  doc.roundedRect(marginX,ny,pageW-marginX*2,boxH,2,2,'FD');
  iconStar(marginX+8,ny+6.5,3.4,GREEN_D);
  doc.setFont('helvetica','bold'); doc.setFontSize(9.2); doc.setTextColor(...NAVY);
  doc.text('NOTAS IMPORTANTES', marginX+14,ny+7.8);
  let by=ny+13.5;
  doc.setFont('helvetica','normal'); doc.setFontSize(7.4); doc.setTextColor(...TXT);
  wrapped.forEach(w=>{ doc.text(w, marginX+7, by); by+=w.length*3.5; });

  // ── Cierre motivacional (altura fija, no estira hasta el fondo) ──
  const closeY=ny+boxH+5;
  doc.setFillColor(...NAVY); doc.roundedRect(marginX,closeY,pageW-marginX*2,CLOSE_H,2,2,'F');
  doc.setFillColor(...GREEN_D);
  doc.triangle(marginX,closeY, marginX+22,closeY, marginX,closeY+CLOSE_H,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(255,255,255);
  doc.text('TU ESFUERZO DE HOY', pageW/2, closeY+CLOSE_H/2-2, {align:'center'});
  doc.setFont('helvetica','bolditalic'); doc.setTextColor(...GREEN);
  doc.text('ES TU MEJOR INVERSIÓN.', pageW/2, closeY+CLOSE_H/2+4.5, {align:'center'});

  drawPageFooter();

    doc.save(`Rutina-${(s.nombre||s.id).replace(/\s+/g,'_')}.pdf`);
    showToast('📄 PDF descargado');
  }catch(e){
    console.error(e);
    showToast('⚠ No se pudo generar el PDF — revisa tu conexión');
  }finally{
    if(btn){ btn.textContent=btnTxt||'📄 DESCARGAR PDF'; btn.style.pointerEvents=''; }
  }
}

// ── TAB: PROGRESO ──
function renderProgresoTab(){
  av3dDestruir();
  const s=activeSocio; if(!s) return;
  const ev=calcEvolucion(s);
  const sem=sesionesSemana(s);
  const ses=(s.logs?.sesiones||[]).slice().reverse().slice(0,8);
  const pesos=s.logs?.pesoCorporal||[];
  const prs=s.logs?.prs||{};
  const pesoNow=pesoActual(s);

  const barsHTML = DIAS_ORDER.map((k,i)=>{
    const isToday=k===HOY_KEY;
    const cls = sem[i]?'done':(isToday?'tod':'empty');
    const h = sem[i]?'85%':(isToday?'45%':'22%');
    return `<div class="bar ${cls}" style="height:${h}"><span>${'LMXJVSD'[i]}</span></div>`;
  }).join('');

  const prKeys=Object.keys(prs);
  const prHTML = prKeys.length
    ? prKeys.sort((a,b)=>prs[b].kg-prs[a].kg).slice(0,6).map(nm=>`
        <div class="pr-row"><div class="pr-nm">${nm}</div><div class="pr-kg">${kgToDisplay(prs[nm].kg)} ${unidadPeso}</div><div class="pr-dt">${fmtFecha(prs[nm].fecha)}</div></div>`).join('')
    : '<div class="empty-msg">Registra los kg que usas en cada ejercicio<br>y aquí aparecerán tus récords personales.</div>';

  const sesHTML = ses.length
    ? ses.map(x=>`<div class="ses-row"><div class="ses-f">${fmtFecha(x.fecha)}</div><div><div class="ses-t">${esc(sc(x.tipo))}</div><div style="font-size:11.5px;color:var(--mu);font-family:var(--fb)">${x.ejercicios} ejercicios completados</div></div><div class="ses-e">${x.volumen?Math.round(x.volumen)+' kg vol.':''}${x.tut>=20?(x.volumen?' · ':'')+fmtTut(x.tut)+' iso':''}</div></div>`).join('')
    : '<div class="empty-msg">Aún no hay sesiones registradas.<br>Al finalizar tu primera sesión aparecerá aquí.</div>';

  const delta = ev.deltaPeso===null ? '' :
    `<span style="color:${ev.deltaPeso<=0?'var(--v)':'var(--g)'}">${ev.deltaPeso>0?'+':''}${ev.deltaPeso} kg desde tu registro inicial</span>`;

  document.getElementById('dsec-progreso').innerHTML=`
    ${appHead('Progreso','Tu esfuerzo se ve en los resultados.')}
    <div class="sec-row"><div class="sec-t">Resumen</div></div>
    <div class="kpi-row">
      <div class="kpi">${it('calendar')}<div class="kpi-l">Sesiones totales</div><div class="kpi-v">${ev.total}</div><div class="kpi-s">desde ${fmtFecha(s.fechaRegistro)}</div></div>
      <div class="kpi">${it('timer')}<div class="kpi-l">Esta semana</div><div class="kpi-v">${ev.estaSemana}<small>/${s.dias}</small></div><div class="kpi-s">objetivo: ${s.dias} días</div></div>
      <div class="kpi">${it('target')}<div class="kpi-l">Adherencia, 4 sem</div><div class="kpi-v">${ev.adherencia}<small>%</small></div><div class="kpi-s">${ev.ult4} de ${s.dias*4} sesiones</div></div>
      <div class="kpi">${it('flame')}<div class="kpi-l">Racha</div><div class="kpi-v">${ev.racha}<small> sem</small></div><div class="kpi-s">${ev.racha>0?'sin fallar':'comienza hoy'}</div></div>
    </div>

    <div class="card">
      <div class="card-t">${it('calendar','sm')}Consistencia<span class="card-t-r">${ev.estaSemana}/${s.dias} días</span></div>
      <div class="cons">${DIAS_ORDER.map((k,i)=>`<div class="cons-d${sem[i]?' ok':''}${k===HOY_KEY?' hoy':''}"><i>${sem[i]?ico('check'):''}</i><span>${'LMXJVSD'[i]}</span></div>`).join('')}</div>
      <div class="cons-v">${ev.volSemana>0?Math.round(ev.volSemana).toLocaleString()+' kg de volumen total esta semana':(ev.tutSemana>0?'':'Completa una sesión para sumar volumen')}${ev.tutSemana>0?(ev.volSemana>0?' · ':'')+fmtTut(ev.tutSemana)+' de isométricos esta semana':''}</div>
    </div>

    <div class="card">
      <div class="card-t">${it('chart','sm')}Evolución de peso corporal</div>
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:8px;">
        <div style="font-family:var(--fd);font-size:36px;color:var(--v);line-height:1">${pesoNow} kg</div>
        <div style="font-size:12px;font-family:var(--fb)">${delta}</div>
      </div>
      <canvas class="chart" id="chart-peso"></canvas>
      <div class="peso-input-row">
        <input type="number" id="peso-nuevo" placeholder="${pesoNow}" step="0.1" min="30" max="250" inputmode="decimal">
        <div class="btn-mini" onclick="guardarPeso()">Registrar peso</div>
      </div>
    </div>

    <div class="card" id="card-cuerpo">
      <div class="card-t">${it('user','sm')}Tu rendimiento y equilibrio corporal</div>
      <div id="cuerpo-contenido"></div>
    </div>

    <div class="card">
      <div class="card-t">${it('trophy','sm')}Récords personales (PR)</div>
      ${prHTML}
    </div>

    <div class="card">
      <div class="card-t">${it('clock','sm')}Historial de sesiones</div>
      ${sesHTML}
    </div>`;

  drawPesoChart(pesos);
  renderCuerpo();
}

// ── Render del bloque de composición corporal ──
function renderCuerpo(){
  const s=activeSocio; if(!s) return;
  const cont=document.getElementById('cuerpo-contenido'); if(!cont) return;
  const {primera, ultima, todas}=getMedidas(s);
  const inputsHTML=`
    <div class="esp-lbl" style="margin:14px 0 8px">REGISTRAR MEDIDAS DE HOY (cm)</div>
    <div class="med-inputs">
      ${MED_CAMPOS.map(c=>`<div class="med-in"><label>${c.nm}</label><input type="number" id="med-${c.id}" inputmode="decimal" step="0.5" placeholder="${ultima?.[c.id]||c.base}"></div>`).join('')}
    </div>
    <div class="btn-mini" style="width:100%;text-align:center" onclick="guardarMedidas()">📏 Guardar medidas</div>`;

  const rend = calcularRendimiento(s);
  const equilibrio = calcularEquilibrioCorporal(s);
  const hayProgresion = primera && ultima && primera!==ultima;
  const dosGraficasHTML = `
    <div class="esp-lbl" style="margin:14px 0 8px">TUS MAPAS</div>
    <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center">
      <div style="flex:1;min-width:150px;max-width:220px;display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 6px 12px;background:radial-gradient(circle at 50% 30%,color-mix(in srgb,var(--v) 10%,transparent),transparent 70%);border-radius:16px">
        <div style="font-family:var(--fb);font-weight:700;font-size:11px;color:var(--chart1)">RENDIMIENTO</div>
        ${radarChartSVG(rend,{size:170,color:'var(--chart1)',color2:'var(--chart2)',glow:true})}
        <div style="font-size:10px;color:var(--mu);font-family:var(--fb);text-align:center;line-height:1.5">PRs, asistencia, cardio y nivel. No depende de tu foto.</div>
      </div>
      <div style="flex:1;min-width:150px;max-width:220px;display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 6px 12px;background:radial-gradient(circle at 50% 30%,color-mix(in srgb,var(--p) 10%,transparent),transparent 70%);border-radius:16px">
        <div style="font-family:var(--fb);font-weight:700;font-size:11px;color:var(--n)">EQUILIBRIO CORPORAL</div>
        ${radarChartSVG(equilibrio,{size:170,color:'var(--n)',color2:'var(--p)',glow:true})}
        <div style="font-size:10px;color:var(--mu);font-family:var(--fb);text-align:center;line-height:1.5">${hayProgresion
          ? '50 = sin cambio. Sube donde más avanzas hacia tu objetivo, baja donde te quedas atrás.'
          : 'Registra 2 mediciones en fechas distintas para activarlo.'}</div>
      </div>
    </div>`;

  function av3dHTML(conMedidas){
    return `
    <div class="logo-progreso"><video src="video/logo-progreso.mp4" autoplay muted loop playsinline disablepictureinpicture aria-label="Gimnasio CC"></video></div>`;
  }

  if(!ultima){
    cont.innerHTML=`${dosGraficasHTML}${av3dHTML(false)}${inputsHTML}`;
    return;
  }

  // Deltas primera → última
  const deltasHTML = primera && primera!==ultima ? `
    <div class="deltas-grid">
      ${MED_CAMPOS.filter(c=>primera[c.id]!=null&&ultima[c.id]!=null).map(c=>{
        const d=+(ultima[c.id]-primera[c.id]).toFixed(1);
        const crece=['pecho','brazo','muslo'].includes(c.id);
        const bueno=(crece&&d>0)||(!crece&&d<0);
        const cls=d===0?'delta-neutral':bueno?'delta-up':'delta-neutral';
        return `<div class="delta-c"><div class="delta-v ${cls}">${d>0?'+':''}${d} cm</div><div class="delta-l">${c.nm}</div></div>`;
      }).join('')}
    </div>` : '';

  cont.innerHTML=`
    ${dosGraficasHTML}
    ${deltasHTML}
    ${av3dHTML(true)}
    <div class="esp-lbl" style="margin:14px 0 8px">EVOLUCIÓN POR ZONA</div>
    <div class="chips-row">
      ${MED_CAMPOS.map(c=>`<div class="chip-sel ${medChartSel===c.id?'ac':''}" data-med="${c.id}" onclick="setMedChart('${c.id}')">${c.nm}</div>`).join('')}
    </div>
    <canvas class="chart" id="chart-med"></canvas>
    ${inputsHTML}`;
  dibujarMedChart();
}

function guardarPeso(){ asegurarLogs(activeSocio);
  const s=activeSocio; if(!s) return;
  const v=parseFloat(document.getElementById('peso-nuevo').value);
  if(!v || v<30 || v>250){ showToast('⚠ Ingresa un peso válido'); return; }
  if(!s.logs.pesoCorporal) s.logs.pesoCorporal=[];
  const hoy=fechaISO(new Date());
  const ex=s.logs.pesoCorporal.find(p=>p.fecha===hoy);
  if(ex) ex.kg=v; else s.logs.pesoCorporal.push({fecha:hoy,kg:v});
  dbSave(s.code);
  showToast('✓ Peso registrado: '+v+' kg');
  renderProgresoTab();
}

// ── Mini gráfica canvas (sin dependencias) ──
function drawPesoChart(pesos){
  const cv=document.getElementById('chart-peso'); if(!cv) return;
  const dpr=window.devicePixelRatio||1;
  const W=cv.clientWidth||320, H=cv.clientHeight||150;
  cv.width=W*dpr; cv.height=H*dpr;
  const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,W,H);
  const ACC=(getComputedStyle(document.documentElement).getPropertyValue('--chart1')||'#1e7a4b').trim();
  const TXC=(getComputedStyle(document.documentElement).getPropertyValue('--tx')||'#173527').trim();
  const txA=a=>{const x=TXC.replace('#','');const r=parseInt(x.substr(0,2),16),g=parseInt(x.substr(2,2),16),b=parseInt(x.substr(4,2),16);return `rgba(${r},${g},${b},${a})`};
  const accA=a=>{const x=ACC.replace('#','');const r=parseInt(x.substr(0,2),16),g=parseInt(x.substr(2,2),16),b=parseInt(x.substr(4,2),16);return `rgba(${r},${g},${b},${a})`};
  if(pesos.length<2){
    ctx.fillStyle=txA(0.45); ctx.font='10px Figtree, sans-serif';
    ctx.textAlign='center'; ctx.fillText('Registra tu peso 2+ veces para ver la curva',W/2,H/2);
    return;
  }
  const pad={l:34,r:12,t:14,b:20};
  const vals=pesos.map(p=>p.kg);
  let min=Math.min(...vals), max=Math.max(...vals);
  const range=Math.max(1,(max-min)); min-=range*0.15; max+=range*0.15;
  const X=i=>pad.l+(W-pad.l-pad.r)*(i/(pesos.length-1));
  const Y=v=>pad.t+(H-pad.t-pad.b)*(1-(v-min)/(max-min));

  // grid
  ctx.strokeStyle=accA(0.07); ctx.lineWidth=1;
  for(let g=0;g<=3;g++){
    const y=pad.t+(H-pad.t-pad.b)*g/3;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
    ctx.fillStyle=txA(0.4); ctx.font='8px Figtree, sans-serif'; ctx.textAlign='right';
    ctx.fillText((max-(max-min)*g/3).toFixed(1), pad.l-5, y+3);
  }
  // área
  const grad=ctx.createLinearGradient(0,pad.t,0,H-pad.b);
  grad.addColorStop(0,accA(0.18)); grad.addColorStop(1,accA(0));
  ctx.beginPath(); ctx.moveTo(X(0),H-pad.b);
  pesos.forEach((p,i)=>ctx.lineTo(X(i),Y(p.kg)));
  ctx.lineTo(X(pesos.length-1),H-pad.b); ctx.closePath();
  ctx.fillStyle=grad; ctx.fill();
  // línea
  ctx.beginPath();
  pesos.forEach((p,i)=>{ i===0?ctx.moveTo(X(i),Y(p.kg)):ctx.lineTo(X(i),Y(p.kg)); });
  ctx.strokeStyle=ACC; ctx.lineWidth=2; ctx.lineJoin='round';
  ctx.shadowColor=accA(0.5); ctx.shadowBlur=6; ctx.stroke(); ctx.shadowBlur=0;
  // puntos
  pesos.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(X(i),Y(p.kg),2.6,0,Math.PI*2);
    ctx.fillStyle=(getComputedStyle(document.documentElement).getPropertyValue('--dk3')||'#ffffff').trim(); ctx.fill();
    ctx.strokeStyle=ACC; ctx.lineWidth=1.5; ctx.stroke();
  });
  // fechas extremos
  ctx.fillStyle=txA(0.45); ctx.font='8px Figtree, sans-serif';
  ctx.textAlign='left'; ctx.fillText(fmtFecha(pesos[0].fecha),pad.l,H-6);
  ctx.textAlign='right'; ctx.fillText(fmtFecha(pesos[pesos.length-1].fecha),W-pad.r,H-6);
}

// ── TAB: NUTRICIÓN ──
function nutElegirComidas(n){
  const s=activeSocio; if(!s) return;
  s.comidasPorDia=n; dbSave(s.code); renderNutricionTab();
}
function renderNutricionTab(){
  const s=activeSocio; if(!s) return;
  const nut=nutricionFinal(s), base=calcNutricion(s);
  const pK=nut.prot*4, cK=nut.carbs*4, gK=nut.grasas*9;
  const tot=pK+cK+gK;
  const pP=Math.round(pK/tot*100), cP=Math.round(cK/tot*100), gP=100-pP-cP;
  const menu=comoArray(s.nutricion&&s.nutricion.menu);
  const nComidas=[3,4,5,6].includes(+s.comidasPorDia)?+s.comidasPorDia:4;
  const reparto=nutRepartoComidas(nComidas,nut.kcal,pP,cP,gP);

  document.getElementById('dsec-nutricion').innerHTML=`
    ${appHead('Nutrición',nut.manual?'Tu plan de alimentación, personalizado para ti.':'Tu plan de alimentación, calculado con tus datos.')}
    ${nut.manual?`<div class="nut-note" style="border-color:color-mix(in srgb,var(--v2) 45%,transparent)">🥗 Ajustado por <b style="color:var(--tx)">${esc(s.nutricion.por||'tu nutriólogo')}</b>${s.nutricion.fecha?' · '+esc(fmtFecha(s.nutricion.fecha)):''}${s.nutricion.nota?`<br><span style="font-style:italic">“${esc(s.nutricion.nota)}”</span>`:''}</div>`
      :`<div class="nut-note">Objetivo: <b style="color:var(--tx)">${esc(sc(s.objetivo))}</b> · ${nut.ajusteTxt}<br>Calculado con tu peso actual: <b style="color:var(--tx)">${nut.pesoBase} kg</b> — se actualiza solo al registrar peso en Progreso.</div>`}

    <div class="macro-grid">
      <div class="macro-c" style="--mc:var(--v)">${it('flame')}<div class="mc-v">${nut.kcal}<span class="mc-u"> kcal</span></div><div class="mc-l">Calorías / día</div><div class="mc-s">${nut.ajusteTxt}</div></div>
      <div class="macro-c" style="--mc:var(--n)">${it('dumbbell')}<div class="mc-v">${nut.prot}<span class="mc-u"> g</span></div><div class="mc-l">Proteína</div><div class="mc-s">${nut.protKg} g/kg · ${pP}% kcal · reparte en 3–4 comidas</div></div>
      <div class="macro-c" style="--mc:var(--g)">${it('bolt')}<div class="mc-v">${nut.carbs}<span class="mc-u"> g</span></div><div class="mc-l">Carbohidratos</div><div class="mc-s">${cP}% kcal · prioriza pre y post entreno</div></div>
      <div class="macro-c" style="--mc:var(--p)">${it('drop')}<div class="mc-v">${nut.grasas}<span class="mc-u"> g</span></div><div class="mc-l">Grasas</div><div class="mc-s">${gP}% kcal · mínimo saludable garantizado (0.8 g/kg)</div></div>
    </div>

    <div class="card">
      <div class="card-t">${it('chart','sm')}Distribución de macros</div>
      <div class="dist-bar">
        <div style="width:${pP}%;background:var(--n)"></div>
        <div style="width:${cP}%;background:var(--g)"></div>
        <div style="width:${gP}%;background:var(--p)"></div>
      </div>
      <div class="dist-leg">
        <span><b style="color:var(--n)">●</b> Proteína ${pP}%</span>
        <span><b style="color:var(--g)">●</b> Carbohidratos ${cP}%</span>
        <span><b style="color:var(--p)">●</b> Grasas ${gP}%</span>
      </div>
    </div>

    <div class="card">
      <div class="card-t">${it('leaf','sm')}Reparto de tus comidas</div>
      <div class="q-sub" style="margin:2px 0 12px">¿En cuántas comidas repartes tu día?</div>
      <div class="comida-sel">${[3,4,5,6].map(n=>`<button type="button" class="${n===nComidas?'on':''}" onclick="nutElegirComidas(${n})">${n}</button>`).join('')}</div>
      <div class="comida-list">
        ${reparto.map(m=>`<div class="comida-it">
          <div class="comida-it-h"><span class="comida-tag ${m.tag}">${esc(m.tag==='ligera'?'Colación':m.tag==='fuerte'?'Fuerte':'Media')}</span><b>${esc(m.nombre)}</b><span class="comida-kcal">~${m.kcal} kcal</span></div>
          ${m.plato?`<div class="comida-plato">🥦 ${m.plato.verduras}% verduras · 🍗 ${m.plato.prot}% proteína · 🍚 ${m.plato.carb}% carbohidratos${m.plato.grasa?` · 🥑 ${m.plato.grasa}% grasas`:''}</div>`
            :`<div class="comida-plato ligera">🥜 Snack: proteína + grasa saludable — evita cargarlo de carbohidratos simples</div>`}
        </div>`).join('')}
      </div>
      <div class="f-nota" style="margin-top:10px">Guía general para armar tu plato — no es una receta ni un menú fijo. Ajusta las porciones a tu ojo con estas proporciones como referencia.</div>
    </div>

    ${menu.length?`<div class="card">
      <div class="card-t">${it('leaf','sm')}Menú sugerido</div>
      ${menu.map(m=>`<div class="nut-detail" style="align-items:flex-start"><span style="flex:0 0 auto;font-weight:700;color:var(--tx)">${esc(m.nombre)}</span><b style="text-align:right;font-weight:500;color:var(--mu)">${esc(m.detalle)}</b></div>`).join('')}
    </div>`:''}

    <div class="card">
      <div class="card-t">${it('info','sm')}${nut.manual?'Cálculo automático (referencia)':'Cómo se calculó (datos reales)'}</div>
      <div class="nut-detail"><span>Metabolismo basal (Mifflin-St Jeor)</span><b>${base.bmr} kcal</b></div>
      <div class="nut-detail"><span>Factor de actividad (${s.dias} días/sem)</span><b>× ${base.factor}</b></div>
      <div class="nut-detail"><span>Gasto total diario (TDEE)</span><b>${base.tdee} kcal</b></div>
      <div class="nut-detail"><span>Ajuste por objetivo</span><b>${base.kcal} kcal</b></div>
      <div class="nut-detail"><span>Agua recomendada (35 ml/kg)</span><b>${base.agua} L/día + 0.5 L por sesión</b></div>
    </div>

    <div class="card">
      <div class="card-t">${it('star','sm')}Guía de tu ${nut.manual?'nutriólogo':'entrenador'}</div>
      <div style="font-size:11px;color:var(--n);font-family:var(--fb);line-height:1.8">${nut.manual&&s.nutricion.nota?esc(s.nutricion.nota):base.nota}</div>
    </div>

    <div style="font-size:11.5px;color:var(--mu);font-family:var(--fb);line-height:1.7;padding:0 4px;">⚕ Estos valores son una guía${nut.manual?' personalizada por tu nutriólogo o entrenador':' calculada con fórmulas estándar'}. Coméntalos con tu entrenador y, si tienes alguna condición médica, con tu médico o nutriólogo.</div>`;
}
