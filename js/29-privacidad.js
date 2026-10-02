/* ═══ privacidad ═══
   Aviso de privacidad y consentimiento expreso del socio (datos personales y de salud).
   Los datos del responsable se configuran en js/config.js (GYM.privacidad).
   IMPORTANTE: el texto es una plantilla; el gimnasio debe revisarlo con su asesor legal. */

function privVersion(){ return (GYM.privacidad && GYM.privacidad.version) || '1.0'; }

// Texto del aviso (HTML). Solo menciona la IA si el gimnasio la tiene activada.
function avisoPrivacidadHTML(){
  const P=GYM.privacidad||{}, R=P.responsable||GYM.nombre;
  const contacto = P.correo
    ? `acércate a la recepción de ${esc(R)} o escribe a <b>${esc(P.correo)}</b>${P.telefono?' o llama al '+esc(P.telefono):''}`
    : `acércate a la recepción de ${esc(R)}${P.telefono?' o llama al '+esc(P.telefono):''}`;
  const dom = P.domicilio ? ` con domicilio en ${esc(P.domicilio)}` : '';
  const ia = GYM.aiEndpoint
    ? `<p>Para armar tu rutina, algunos datos de tu perfil (objetivo, nivel, edad, peso, estatura, limitaciones físicas y días de entrenamiento, <b>sin tu nombre</b>) se envían a un servicio de inteligencia artificial de un tercero, únicamente para generar el plan.</p>`
    : '';
  return `
<h3>Aviso de Privacidad</h3>
<p style="color:var(--mu)">Versión ${esc(privVersion())}${P.fecha?' · '+esc(P.fecha):''}</p>
<p><b>Responsable.</b> ${esc(R)}${dom} es responsable del tratamiento de tus datos personales, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>
<p><b>Qué datos recabamos.</b> Nombre, edad y sexo; datos físicos y de salud (peso, estatura, medidas corporales, lesiones, limitaciones físicas, condición y objetivos de entrenamiento); historial de entrenamientos, asistencia y registros de tu progreso; datos de tu mensualidad y pagos; y la ubicación aproximada del dispositivo al abrir la app, si lo permites.</p>
<p><b>Datos sensibles.</b> Tus datos de salud son datos personales sensibles. Solo se tratan con tu consentimiento expreso, que otorgas al aceptar este aviso.</p>
<p><b>Para qué los usamos.</b> Crear y ajustar tu rutina y tu plan de nutrición; darte seguimiento y medir tu progreso; llevar el control de asistencia y de tu mensualidad; contactarte (por ejemplo por WhatsApp) sobre tu plan o tus pagos; y proteger tu seguridad al entrenar.</p>
${ia}
<p><b>Quién puede verlos.</b> Tu entrenador o nutriólogo asignado y la coordinación del gimnasio. Tus datos se almacenan en servidores de proveedores tecnológicos (Google Firebase) que los resguardan por cuenta del gimnasio. No los vendemos ni los compartimos con terceros para fines comerciales.</p>
<p><b>Tus derechos.</b> Puedes <b>acceder, rectificar, cancelar u oponerte</b> (derechos ARCO) al tratamiento de tus datos, y revocar tu consentimiento, en cualquier momento: ${contacto}. Indica tu nombre y tu código de socio. Si revocas tu consentimiento, ya no podrás usar la app.</p>
<p><b>Menores de edad.</b> Si eres menor de edad, tu madre, padre o tutor debe leer y aceptar este aviso por ti.</p>
<p><b>Cambios.</b> Si este aviso cambia, te lo mostraremos de nuevo en la app para que lo aceptes.</p>`;
}

// Modal para leer el aviso. Modo "consent": pide aceptar o no aceptar (socios que ya existían).
let PRIV_CB=null;
function abrirAvisoPrivacidad(modo, cb){
  const m=document.getElementById('modal-aviso'); if(!m) return;
  document.getElementById('aviso-cuerpo').innerHTML=avisoPrivacidadHTML();
  const lectura=modo!=='consent';
  document.getElementById('aviso-btns-lectura').style.display=lectura?'flex':'none';
  document.getElementById('aviso-btns-consent').style.display=lectura?'none':'flex';
  document.getElementById('aviso-consent-txt').style.display=lectura?'none':'block';
  PRIV_CB=lectura?null:cb;
  m.classList.add('open');
  const c=document.getElementById('aviso-cuerpo'); if(c) c.scrollTop=0;
}
function cerrarAvisoPrivacidad(){ const m=document.getElementById('modal-aviso'); if(m) m.classList.remove('open'); PRIV_CB=null; }
function avisoAceptar(){ const cb=PRIV_CB; cerrarAvisoPrivacidad(); if(cb) cb(true); }
function avisoRechazar(){ const cb=PRIV_CB; cerrarAvisoPrivacidad(); if(cb) cb(false); }

// Registro del consentimiento que se guarda dentro del socio
function consentimientoNuevo(medio){
  return { aviso:privVersion(), fecha:new Date().toISOString(), medio:medio||'registro' };
}
function consentimientoVigente(s){
  return !!(s && s.consentimiento && s.consentimiento.aviso===privVersion());
}

// Casillero de la pantalla "Tu plan": el botón de confirmar queda apagado hasta aceptar
function privCasilleroCambio(){
  const ok=document.getElementById('priv-chk').checked;
  document.querySelectorAll('.priv-btn').forEach(b=>{ b.style.opacity=ok?'1':'.45'; b.setAttribute('aria-disabled',ok?'false':'true'); });
}
function privCasilleroOk(){
  const c=document.getElementById('priv-chk');
  if(c && c.checked) return true;
  showToast('Para continuar, acepta el Aviso de Privacidad');
  const box=document.getElementById('priv-box'); if(box){ box.scrollIntoView({block:'center',behavior:'smooth'}); box.style.outline='2px solid var(--r)'; setTimeout(()=>{ box.style.outline=''; },1800); }
  return false;
}
function privCasilleroReset(){ const c=document.getElementById('priv-chk'); if(c){ c.checked=false; privCasilleroCambio(); } }
