/* ═══ nutricion motor ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   No cambia la lógica: es el mismo código que antes vivía dentro de index.html. ═══ */
// ═════════════════════════════════════════
// MOTOR DE NUTRICIÓN — fórmulas verificadas
// BMR: Mifflin-St Jeor (1990)
// ═════════════════════════════════════════
function calcNutricion(s){
  const peso = pesoActual(s);
  const est = s.estatura, edad = s.edad;
  // BMR Mifflin-St Jeor
  const bmrH = 10*peso + 6.25*est - 5*edad + 5;
  const bmrM = 10*peso + 6.25*est - 5*edad - 161;
  // Género: acepta datos históricos (Hombre/Mujer) y las etiquetas actuales (Masculino/Femenino)
  const g=(s.genero||'').toUpperCase();
  const esHombre = g.includes('HOMBRE')||g.includes('MASCULINO');
  const esMujer = g.includes('MUJER')||g.includes('FEMENINO');
  const bmr = Math.round(esHombre ? bmrH : esMujer ? bmrM : (bmrH+bmrM)/2);

  // Factor de actividad según días de entrenamiento/semana
  const factores = {2:1.375, 3:1.45, 4:1.55, 5:1.65, 6:1.725};
  const factor = factores[s.dias] || 1.55;
  const tdee = Math.round(bmr * factor);

  // Ajuste calórico según objetivo
  let kcal, ajusteTxt, protKg, nota;
  switch(s.objetivo){
    case 'PERDER PESO':
      kcal = Math.round(tdee * 0.82); // déficit ~18%
      if(kcal < bmr) kcal = bmr;      // nunca por debajo del basal
      ajusteTxt = 'Déficit moderado (−18% del gasto total)';
      protKg = 2.0;
      nota = 'El déficit se genera aumentando tu actividad total, no con restricción extrema. Proteína alta (2.0 g/kg) para preservar masa muscular. Sentirás más hambre: contrólala con volumen de verduras y proteína en cada comida.';
      break;
    case 'GANAR MÚSCULO':
      kcal = Math.round(tdee * 1.10); // superávit ~10%
      ajusteTxt = 'Superávit ligero (+10% del gasto total)';
      protKg = 1.8;
      nota = 'Superávit controlado para construir músculo minimizando grasa. Prioriza carbohidratos alrededor del entrenamiento (antes y después). Creatina monohidratada 3–5 g/día es el suplemento con más evidencia.';
      break;
    case 'FUERZA PURA':
      kcal = Math.round(tdee * 1.05);
      ajusteTxt = 'Superávit mínimo (+5% del gasto total)';
      protKg = 1.8;
      nota = 'Mantenimiento ligeramente positivo: la fuerza requiere recuperación completa. Carbohidratos suficientes para rendir en series pesadas. Duerme 7–9 horas: ahí se consolida la fuerza.';
      break;
    default: // RESISTENCIA
      kcal = tdee;
      ajusteTxt = 'Mantenimiento (gasto total)';
      protKg = 1.6;
      nota = 'Calorías de mantenimiento con carbohidratos como combustible principal. Hidratación antes, durante y después de sesiones largas. Repón electrolitos si sudas más de 60 min.';
  }

  // Macros
  const prot = Math.round(protKg * peso);                       // g proteína
  const grasas = Math.round(Math.max(0.8*peso, (kcal*0.25)/9)); // ≥0.8 g/kg, ~25% kcal
  const kcalRestantes = kcal - prot*4 - grasas*9;
  const carbs = Math.max(0, Math.round(kcalRestantes/4));       // resto en carbohidratos
  const agua = Math.round(peso * 35 / 100) / 10;                 // litros (35 ml/kg)

  return { bmr, factor, tdee, kcal, prot, protKg, grasas, carbs, agua, ajusteTxt, nota, pesoBase: peso };
}
const MEAL_TEMPLATES={
  3:[{nombre:'Desayuno',pct:30,tag:'media'},{nombre:'Comida',pct:40,tag:'fuerte'},{nombre:'Cena',pct:30,tag:'media'}],
  4:[{nombre:'Desayuno',pct:27,tag:'media'},{nombre:'Colación',pct:13,tag:'ligera'},{nombre:'Comida',pct:37,tag:'fuerte'},{nombre:'Cena',pct:23,tag:'media'}],
  5:[{nombre:'Desayuno',pct:25,tag:'media'},{nombre:'Colación AM',pct:10,tag:'ligera'},{nombre:'Comida',pct:30,tag:'fuerte'},{nombre:'Colación PM',pct:10,tag:'ligera'},{nombre:'Cena',pct:25,tag:'media'}],
  6:[{nombre:'Desayuno',pct:20,tag:'media'},{nombre:'Colación AM',pct:8,tag:'ligera'},{nombre:'Comida',pct:27,tag:'fuerte'},{nombre:'Colación PM',pct:8,tag:'ligera'},{nombre:'Cena',pct:22,tag:'media'},{nombre:'Colación noche',pct:15,tag:'ligera'}]
};
const TAG_INFO={fuerte:{lbl:'Comida fuerte',v:0.30},media:{lbl:'Comida media',v:0.30},ligera:{lbl:'Colación',v:0}};
// Reparto muy general del plato por comida: reserva un espacio fijo de verduras (comidas fuertes/medias)
// y divide el resto entre proteína/carbohidratos/grasas en la misma proporción que tus macros del día.
function nutPlato(pP,cP,gP,verdurasPct){
  const rem=100-verdurasPct;
  let prot=Math.round(rem*pP/100), carb=Math.round(rem*cP/100);
  let grasa=100-verdurasPct-prot-carb;
  if(grasa<0){ carb=Math.max(0,carb+grasa); grasa=0; }
  return {verduras:verdurasPct, prot, carb, grasa};
}
function nutRepartoComidas(n,kcal,pP,cP,gP){
  const plant=MEAL_TEMPLATES[n]||MEAL_TEMPLATES[4];
  return plant.map(m=>{
    const info=TAG_INFO[m.tag];
    return Object.assign({kcal:Math.round(kcal*m.pct/100)}, m, info.v?{plato:nutPlato(pP,cP,gP,info.v*100)}:{});
  });
}
// Nutrición final: la calculada, o la que ajustó el nutriólogo/entrenador si personalizó al socio
function nutricionFinal(s){
  const base=calcNutricion(s), o=s.nutricion;
  if(!o || !o.override) return Object.assign({},base,{manual:false});
  return Object.assign({},base,{
    kcal:+o.kcal||base.kcal, prot:+o.prot||base.prot, carbs:+o.carbs||base.carbs, grasas:+o.grasas||base.grasas, agua:+o.agua||base.agua,
    manual:true
  });
}
