/* ═══ entrenadores admin ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// NUEVO ENTRENADOR — alta dinámica (coordinador)
// ═════════════════════════════════════════
function abrirNuevoEntrenador(){
  if(staffRol!=='coordinador'){ showToast('Solo el director puede dar de alta entrenadores'); return; }
  document.getElementById('ne-nombre').value='';
  document.getElementById('ne-usuario').value='';
  document.getElementById('ne-pass').value='';
  document.getElementById('ne-err').style.display='none';
  document.getElementById('ne-func-ent').classList.add('ck');
  document.getElementById('ne-func-nut').classList.remove('ck');
  const cont=document.getElementById('ne-especialidades');
  cont.innerHTML = DEPORTES.map(d=>`<div class="chk" onclick="this.classList.toggle('ck')">${d.emoji} ${d.nm}</div>`).join('') +
    `<div class="chk" onclick="this.classList.toggle('ck')">🏋️ Fuerza</div><div class="chk" onclick="this.classList.toggle('ck')">🤸 Funcional</div><div class="chk" onclick="this.classList.toggle('ck')">🏥 Rehabilitación</div>`;
  document.getElementById('modal-nuevo-ent').classList.add('open');
}
function cerrarModalNuevoEnt(){ document.getElementById('modal-nuevo-ent').classList.remove('open'); }
function crearNuevoEntrenador(){
  const nombre=limpiarTexto(document.getElementById('ne-nombre').value);
  const usuario=document.getElementById('ne-usuario').value.trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
  const pass=document.getElementById('ne-pass').value;
  const funciones=[document.getElementById('ne-func-ent').classList.contains('ck')?'entrenamiento':null, document.getElementById('ne-func-nut').classList.contains('ck')?'nutricion':null].filter(Boolean);
  if(!nombre||!usuario||!pass||pass.length<6||!funciones.length||STAFF_USERS[usuario]||(DB.entrenadores&&DB.entrenadores[usuario])){
    document.getElementById('ne-err').textContent='❌ Completa nombre, usuario, contraseña (mín. 6) y elige al menos una función. El usuario ya podría estar en uso.'; document.getElementById('ne-err').style.display='block'; return;
  }
  // Evitar duplicados accidentales: si ya existe alguien con ese nombre, confirmar antes de crear otro
  const yaExiste=Object.values(DB.entrenadores||{}).some(e=>e && e.nombre && e.nombre.trim().toLowerCase()===nombre.toLowerCase());
  if(yaExiste) uiConfirm('Ya existe un entrenador llamado "'+nombre+'". ¿Seguro que quieres crear OTRA cuenta con el mismo nombre? (si el usuario anterior fue un error, ciérralo con 🗑 Eliminar en vez de crear uno nuevo)',()=>crearNuevoEntrenadorFinal(usuario,pass,nombre,funciones),{label:'Crear de todas formas',danger:true});
  else crearNuevoEntrenadorFinal(usuario,pass,nombre,funciones);
}
// Crea la cuenta en Firebase Authentication (con una app secundaria para no cerrar la sesión del director) y le da rol
async function fbCrearAccesoStaff(usuario, pass, rol){
  if(!fbListo||!fbAuth||!fbEsStaff||fbRolDB!=='coordinador') throw new Error('permiso');
  let sec; try{ sec=firebase.app('sec'); }catch(e){ sec=firebase.initializeApp(fbApp.options,'sec'); }
  const sa=sec.auth();
  const cred=await sa.createUserWithEmailAndPassword(usuario+STAFF_DOM, pass);
  const uid=cred.user.uid;
  try{ await sa.signOut(); }catch(e){}
  await fbDB.ref('/roles/'+uid).set(rol||'entrenador');
  return uid;
}
function msgErrorAcceso(e){
  const c=String(e&&e.code||e&&e.message||'');
  if(c.includes('email-already-in-use')) return 'Ese usuario ya tiene cuenta en Firebase. Elige otro usuario o bórrala en Authentication.';
  if(c.includes('weak-password')) return 'La contraseña debe tener al menos 6 caracteres.';
  if(c.includes('network')) return 'Sin conexión. Conéctate para crear el acceso.';
  if(c.includes('permission')||c==='permiso') return 'No tienes permiso para crear accesos (solo el director, conectado).';
  return 'No se pudo crear el acceso: '+(e&&e.message||e);
}
async function crearNuevoEntrenadorFinal(usuario,pass,nombre,funciones){
  const especialidades=[...document.querySelectorAll('#ne-especialidades .chk.ck')].map(e=>e.textContent.trim());
  let uid;
  try{ uid=await fbCrearAccesoStaff(usuario,pass,'entrenador'); }
  catch(e){ const er=document.getElementById('ne-err'); er.textContent='❌ '+msgErrorAcceso(e); er.style.display='block'; return; }
  DB.entrenadores[usuario]={ id:usuario, uid, rol:'entrenador', nombre, especialidades, funciones, filosofia:null };
  dbSaveEntrenador(usuario);
  cerrarModalNuevoEnt();
  showToast('✓ '+(entTipoLabel(DB.entrenadores[usuario]))+' creado: usuario "'+usuario+'"'+(funciones.includes('entrenamiento')?' — al iniciar sesión le pedirá su filosofía':''));
  // Refrescar la vista si estamos parados en la lista de Entrenadores, para ver la tarjeta nueva de inmediato
  if(staffRol==='coordinador' && document.getElementById('staff-content')?.innerHTML.includes('Entrenadores')) abrirEntrenadores();
}


// ═════════════════════════════════════════
// VER / EDITAR / ELIMINAR ENTRENADORES (coordinador)
// ═════════════════════════════════════════
function sociosDeEntrenador(id){ return Object.values(DB.socios||{}).filter(s=>s.entrenadorId===id); }
