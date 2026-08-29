/* ============================================================
   SOS Colombia — datos.js
   Todo el contenido de la app en un solo lugar.
   Sin dependencias. Se carga antes que app.js.
   Fuentes: UNGRD, Cruz Roja Colombiana, Defensa Civil, MinSalud.
   ============================================================ */

const DATOS = {

  app: {
    nombre: "SOS Colombia",
    version: "3.3.0",
    actualizado: "2026-08-27",
    descripcion: "Guía de emergencia y ayuda comunitaria para Colombia. Gratis, sin internet y sin recolectar datos."
  },

  /* ---------- MI UBICACIÓN (GPS sin internet) ----------
     El GPS del celular solo recibe señal: funciona aunque no haya
     datos ni WiFi. Por eso podemos mostrar coordenadas offline. */
  miUbicacion: {
    nota: "El GPS de tu celular funciona SIN internet. Estas coordenadas las puedes enviar por SMS o leérselas a quien te rescate.",
    pidiendo: "📡 Buscando señal GPS… (funciona sin internet, puede tardar unos segundos)",
    error: "No pude obtener tu ubicación. Sal a un lugar abierto, lejos de techos, e inténtalo de nuevo.",
    sinGPS: "Tu celular no tiene GPS disponible.",
    copiado: "📋 Ubicación copiada. Pégala en un SMS o WhatsApp.",
    precision: "Precisión: ~"
  },

  /* ---------- FICHA MÉDICA DE EMERGENCIA (ICE) ----------
     Se guarda solo en el teléfono (localStorage). Nunca sale del equipo. */
  ficha: {
    nota: "Se guarda solo en TU teléfono (privado, no se envía a ningún lado). Si no puedes hablar, quien te ayude puede verla en grande.",
    sangreOpciones: ["", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "No sé"],
    guardada: "💾 Ficha guardada en tu teléfono.",
    vacia: "Tu ficha está vacía. Llénala primero en esta pantalla.",
    resumenPrefijo: " | "
  },

  /* ---------- METRÓNOMO RCP ---------- */
  metronomo: {
    iniciar: "🥁 Ritmo de compresiones (110/min)",
    detener: "⏹ Detener ritmo",
    activo: "🥁 Sigue el pitido: 110 compresiones por minuto. ¡No pares!"
  },

  /* ---------- CICLO RCP 30:2 ---------- */
  rcp: {
    iniciar: "🫁🫁 Ciclo completo 30:2 (compresiones + respiraciones)",
    detener: "⏹ Detener ciclo",
    faseCompresiones: "🫁 Compresiones: ¡sigue el pitido!",
    faseRespiraciones: "💨 2 respiraciones: inclina la cabeza, levanta la barbilla y sopla 1 segundo cada una.",
    listo: "Ciclo 30:2 listo. Vuelve a empezar: 30 compresiones…",
    nota: "El ciclo guiado marca 30 compresiones con pitidos, luego 2 respiraciones con tono distinto, y vuelve a empezar."
  },

  /* ---------- ASISTENTE DE TRIAJE "¿QUÉ HAGO AHORA?" ----------
     Preguntas cortas con dos botones (SÍ / NO). Cada respuesta lleva
     a otra pregunta o a una acción concreta (guía + número). */
  triaje: {
    titulo: "¿Qué hago ahora?",
    inicio: "¿La persona responde cuando le hablas o la mueves?",
    noResponde: "¿Está respirando? (Mira el pecho, acerca tu mejilla a su boca)",
    noRespira: {
      accion: "🚨 NO RESPIRA — empieza RCP YA",
      auxilio: "rcp",
      mensaje: "Confirma con alguien que llame al 123 con altavoz y empieza compresiones ahora mismo. Usa el ritmo guiado."
    },
    siRespiraInconsciente: {
      accion: "✅ Respira pero no responde",
      auxilio: "recuperacion",
      mensaje: "Ponla en posición de recuperación y no la dejes sola. Llama al 123."
    },
    responde: "¿Tiene alguna de estas señales? (elige la más urgente)",
    sangrado: {
      accion: "🩸 Sangrado fuerte",
      auxilio: "hemorragia",
      mensaje: "Presiona la herida con un paño limpio y firme. Llama al 123 si no para."
    },
    atragantado: {
      accion: "🫁 Se atraganta / no puede hablar",
      auxilio: "heimlich",
      mensaje: "No puede hablar ni toser: actúa de inmediato con la maniobra de Heimlich."
    },
    inconsciente: {
      accion: "😵 Se desmayó pero respira",
      auxilio: "recuperacion",
      mensaje: "Acuéstala, levanta las piernas y afloja la ropa. Si no reacciona en 1 minuto, llama al 123."
    },
    quemadura: {
      accion: "🔥 Quemadura",
      auxilio: "quemadura",
      mensaje: "Enfría con agua limpia 10 a 20 minutos. No cremas, no hielo, no revientes ampollas."
    },
    otro: {
      accion: "🩹 Otra herida o malestar",
      auxilio: null,
      mensaje: "Revisa las guías de abajo o llama al 123: te orientan por teléfono."
    },
    volver: "↩ Volver a empezar",
    avisoLlamar: "📞 Llamar al 123"
  },

  /* ---------- CHECKLIST DE PREPARACIÓN DEL HOGAR ----------
     Marcas lo que ya tienes. Se guarda en tu teléfono. */
  preparacion: {
    titulo: "🎒 Tu casa lista para una emergencia",
    nota: "Marca lo que ya tienes listo. Se guarda solo en TU teléfono para que lo completes poco a poco.",
    completado: "completado",
    faltan: "pendientes",
    todoListo: "🎉 ¡Todo listo! Repásalo cada 6 meses.",
    casi: "Vas bien, te faltan",
    empieza: "Empieza por lo básico: agua, linterna y un punto de encuentro.",
    items: [
      { id: "agua", icono: "💧", txt: "Agua: 4 litros por persona, para 3 días" },
      { id: "comida", icono: "🥫", txt: "Comida no perecedera para 3 días" },
      { id: "linterna", icono: "🔦", txt: "Linterna con pilas de repuesto" },
      { id: "radio", icono: "📻", txt: "Radio a pilas" },
      { id: "botiquin", icono: "🧰", txt: "Botiquín de primeros auxilios" },
      { id: "medicamentos", icono: "💊", txt: "Medicamentos de la familia, con receta" },
      { id: "documentos", icono: "📄", txt: "Copia de documentos en bolsa plástica" },
      { id: "efectivo", icono: "💵", txt: "Efectivo en billetes pequeños" },
      { id: "encuentro", icono: "📍", txt: "Punto de encuentro acordado con la familia" },
      { id: "mochila", icono: "🎒", txt: "Mochila de emergencia armada y a la mano" },
      { id: "extintor", icono: "🧯", txt: "Extintor revisado (y saber usarlo)" },
      { id: "apagadores", icono: "🔌", txt: "Saber dónde cortar luz, gas y agua" }
    ]
  },

  /* ---------- PLAN FAMILIAR DE EMERGENCIA ---------- */
  planFamiliar: {
    titulo: "👨‍👩‍👧 Plan familiar de emergencia",
    nota: "Llénalo con tu familia HOY, no cuando pase algo. Se guarda solo en tu teléfono.",
    guardado: "💾 Plan familiar guardado.",
    puntoEncuentro: "Punto de encuentro (parque, casa de un familiar…)",
    puntoEncuentroPh: "Ej: Parque del barrio, entrada norte",
    tel1: "Teléfono de contacto 1 (familia)",
    tel1Ph: "Ej: 3001234567",
    tel2: "Teléfono de contacto 2 (vecino/JAC)",
    tel2Ph: "Ej: 3109876543",
    verderia: "Si tienen que salir YA, dejen la casa: la vida va primero."
  },

  /* ---------- BOTIQUÍN CASERO ---------- */
  botiquin: [
    "Gasas, vendas, esparadrapo y curitas de distintos tamaños.",
    "Suero fisiológico (para lavar heridas y ojos) y agua oxigenada.",
    "Antiséptico (yodo povidona o clorhexidina), tijeras y pinzas.",
    "Analgésico simple (acetaminofén o ibuprofeno) y alcohol de uso externo.",
    "Guantes desechables, tapabocas y una manta térmica (papel aluminio grueso).",
    "Medicamentos recetados de la familia, con su receta pegada.",
    "Lista de teléfonos de emergencia y las alergias de cada uno.",
    "Revisa fechas de vencimiento cada 6 meses y ten una versión de viaje."
  ],

  /* ---------- CONTACTOS DE EMERGENCIA (lista propia) ----------
     Se guarda solo en el teléfono. El botón de emergencia arma el
     aviso con ubicación y lo prepara para cada contacto. */
  contactos: {
    titulo: "👥 Tus contactos de emergencia",
    nota: "Agrega las personas que deben saber si te pasa algo (mamá, pareja, vecino, JAC). Se guarda solo en TU teléfono. Cuando toques el botón rojo de emergencia, el aviso con tu ubicación queda listo para enviárseles.",
    nombrePh: "Nombre (Ej: Mamá)",
    telPh: "Celular (Ej: 3001234567)",
    agregar: "➕ Agregar contacto",
    vacio: "Aún no tienes contactos. Agrega al menos uno para que el botón de emergencia funcione.",
    maximo: "Máximo 5 contactos (para que el envío siga siendo rápido).",
    agregado: "✅ Contacto agregado.",
    borrado: "🗑️ Contacto borrado.",
    confirmarBorrar: "¿Borrar a este contacto?",
    emergencia: "🆘 Botón de emergencia",
    emergenciaNota: "Toca el botón rojo: se arma el aviso con tu ubicación y eliges a cuál de tus contactos enviarlo por WhatsApp o SMS (el SMS funciona sin datos).",
    emergenciaSinContactos: "Primero agrega tus contactos de emergencia en la pestaña Más.",
    elegirContacto: "¿A quién le envías el aviso?",
    a: "A: "
  },

  /* ---------- SOS EN VIVO (modo emergencia activa) ----------
     Al activarlo: sirena + vibración + pantalla despierta,
     ubicación que se actualiza sola, y aviso a TODOS los
     contactos uno por uno con el tipo de emergencia. */
  sosVivo: {
    titulo: "🚨 SOS EN VIVO",
    intro: "Actívalo cuando estés en peligro REAL: suena una alarma que no para, tu ubicación se actualiza sola y el aviso sale a TODOS tus contactos, uno por uno. Elígelo si no puedes escribir.",
    tipos: [
      { id: "sismo", icono: "🏚️", txt: "Sismo" },
      { id: "accidente", icono: "🚗", txt: "Accidente" },
      { id: "inundacion", icono: "🌊", txt: "Inundación" },
      { id: "incendio", icono: "🔥", txt: "Incendio" },
      { id: "salud", icono: "🩺", txt: "Emergencia médica" },
      { id: "peligro", icono: "⚠️", txt: "Peligro / persona sospechosa" }
    ],
    sinTipo: "⚠️ Elige primero qué te está pasando.",
    activar: "🔴 ACTIVAR SOS EN VIVO",
    activando: "ACTIVANDO EN 3… 2… 1…",
    detener: "⏹ DETENER SOS (mantén pulsado)",
    activo: {
      etiqueta: "SOS ACTIVO",
      tipo: "Emergencia: ",
      ubicacion: "📍 Ubicación en vivo (se actualiza sola): ",
      buscando: "📡 Buscando GPS…",
      sinGPS: "Sin señal GPS aún. Si puedes, sal a un espacio abierto.",
      avisoSirena: "🔊 Alarma sonando. Toca DETENER cuando estés a salvo.",
      cabeza: "El aviso se está enviando a tus contactos. Toca cada uno para completarlo:"
    },
    mensajes: {
      sismo: "🏚️ ¡SISMO! Estoy en la zona afectada. Esta es mi ubicación en vivo:",
      accidente: "🚗 ¡ACCIDENTE! Necesito ayuda YA. Mi ubicación en vivo:",
      inundacion: "🌊 ¡INUNDACIÓN donde estoy! Mi ubicación en vivo:",
      incendio: "🔥 ¡INCENDIO cerca de mí! Mi ubicación en vivo:",
      salud: "🩺 ¡EMERGENCIA MÉDICA! Necesito ayuda YA. Mi ubicación en vivo:",
      peligro: "⚠️ ¡ESTOY EN PELIGRO! No puedo hablar. Mi ubicación en vivo:"
    },
    cola: {
      titulo: "📤 Enviar a:",
      pendiente: "Toca para enviar",
      enviado: "✓ Enviado",
      auto: "Abre WhatsApp/SMS con el aviso listo; elige el contacto allí y envíalo."
    },
    detenido: "SOS detenido. Quédate seguro y llama al 123 si puedes (está arriba en Inicio).",
    sinContactos: "No tienes contactos guardados. Agrégalos en la pestaña Más y vuelve: en 30 segundos estará listo.",
    mensajeBase: "— Envío automático desde SOS Colombia (ubicación en vivo mientras el SOS esté activo). Si no puedo contestar, llama al 123: https://maps.google.com/?q=",
    confDetener: "¿Ya estás a salvo? Esto apagará la alarma y dejará de actualizar tu ubicación."
  },

  /* ---------- NÚMEROS NACIONALES (funcionan en todo el país) ---------- */
  numerosNacionales: [
    { num: "123", nombre: "Emergencias nacionales", desc: "Policía, ambulancia y bomberos. Línea única.", color: "rojo" },
    { num: "132", nombre: "Cruz Roja Colombiana", desc: "Primeros auxilios, rescate y ayuda humanitaria.", color: "verde" },
    { num: "144", nombre: "Defensa Civil", desc: "Gestión del riesgo, emergencias y rescate.", color: "verde" },
    { num: "119", nombre: "Bomberos", desc: "Incendios, rescates y materiales peligrosos.", color: "rojo" },
    { num: "192", nombre: "Salud mental (MinSalud)", desc: "Opción 4. Apoyo emocional gratis, 24 horas.", color: "azul" },
    { num: "147", nombre: "Información de salud", desc: "Orientación médica telefónica.", color: "amarillo" }
  ],

  /* ---------- DIRECTORIO POR CIUDAD ----------
     123 funciona en todas. Aquí van líneas locales de referencia.
     NOTA: verificar líneas locales con la alcaldía antes de publicar. */
  ciudades: [
    { ciudad: "Bogotá", lineas: [ { num: "123", desc: "Emergencias" }, { num: "192", desc: "Salud mental (opc. 4)" } ] },
    { ciudad: "Medellín", lineas: [ { num: "123", desc: "Emergencias" }, { num: "132", desc: "Cruz Roja Antioquia" } ] },
    { ciudad: "Cali", lineas: [ { num: "123", desc: "Emergencias" }, { num: "119", desc: "Bomberos Cali" } ] },
    { ciudad: "Barranquilla", lineas: [ { num: "123", desc: "Emergencias" } ] },
    { ciudad: "Cartagena", lineas: [ { num: "123", desc: "Emergencias" } ] },
    { ciudad: "Bucaramanga", lineas: [ { num: "123", desc: "Emergencias" } ] },
    { ciudad: "Cúcuta", lineas: [ { num: "123", desc: "Emergencias" } ] },
    { ciudad: "Pereira", lineas: [ { num: "123", desc: "Emergencias" } ] },
    { ciudad: "Santa Marta", lineas: [ { num: "123", desc: "Emergencias" } ] },
    { ciudad: "Manizales", lineas: [ { num: "123", desc: "Emergencias" } ] }
  ],

  /* ---------- 7 PROTOCOLOS DE DESASTRE ---------- */
  desastres: [
    {
      id: "sismo", icono: "🏚️", nombre: "Sismo / Terremoto",
      antes: [
        "Arma una mochila de emergencia: agua, linterna, pilas, radio, medicamentos, copia de documentos, efectivo y comida no perecedera.",
        "Acuerda un punto de encuentro con tu familia por si se separan.",
        "Identifica las salidas y zonas seguras de tu casa (lejos de ventanas y objetos que caigan).",
        "Asegura muebles altos y objetos pesados a la pared."
      ],
      durante: [
        "Mantén la calma. La mayoría de lesiones pasan por correr sin mirar.",
        "Agáchate, cúbrete y sujétate debajo de una mesa o escritorio firme.",
        "Aléjate de ventanas, espejos y objetos que puedan caer.",
        "Si estás en la calle, ve a un lugar abierto, lejos de edificios, postes y cables.",
        "No uses ascensores. Usa las escaleras solo si es seguro.",
        "Si vas conduciendo, detente en un lugar seguro y quédate dentro del vehículo."
      ],
      despues: [
        "Revisa si hay heridos y presta primeros auxilios si sabes. Llama al 123.",
        "Si ves grietas grandes, hueles a gas o hay cables sueltos, sal y no vuelvas a entrar.",
        "Cierra las llaves de gas, agua y electricidad si es seguro hacerlo.",
        "Usa el teléfono solo para emergencias. Envía mensajes de texto en vez de llamar.",
        "Prepárate para réplicas (temblores más pequeños que siguen al principal).",
        "Infórmate solo por fuentes oficiales (radio, UNGRD, alcaldía)."
      ]
    },
    {
      id: "inundacion", icono: "🌊", nombre: "Inundación",
      antes: [
        "Conoce si tu zona se inunda y las rutas de evacuación hacia partes altas.",
        "Guarda documentos y objetos de valor en lugares altos.",
        "Limpia canaletas, desagües y alcantarillas cerca de tu casa."
      ],
      durante: [
        "Sube a un lugar alto y seguro. No bajes hasta que el agua ceda.",
        "No camines ni conduzcas por zonas inundadas: 30 cm de agua pueden arrastrarte.",
        "Aléjate de cables eléctricos caídos y de corrientes fuertes.",
        "Si el agua sube rápido, evacúa de inmediato. No esperes a rescatar objetos."
      ],
      despues: [
        "No regreses hasta que las autoridades digan que es seguro.",
        "No uses electricidad ni gas hasta que revisen las instalaciones.",
        "Bota alimentos que tocaron el agua de inundación.",
        "Desinfecta todo lo que se mojó. Usa botas y guantes para limpiar.",
        "Hierve el agua o usa cloro antes de beberla."
      ]
    },
    {
      id: "deslizamiento", icono: "⛰️", nombre: "Deslizamiento",
      antes: [
        "Observa señales: grietas en paredes o suelo, árboles inclinados, ruidos extraños en la ladera.",
        "No construyas ni vivas en laderas inestables o cerca de quebradas.",
        "Si vives en ladera, ten lista una ruta de evacuación."
      ],
      durante: [
        "Si escuchas un rugido o ves que la tierra se mueve, evacúa de inmediato hacia un lado, no hacia abajo.",
        "Aléjate de la trayectoria del deslizamiento.",
        "Avisa a gritos a los vecinos si puedes hacerlo sin riesgo."
      ],
      despues: [
        "No regreses a la zona: puede haber un segundo deslizamiento.",
        "Llama al 123 si hay personas atrapadas. No excaves sin ayuda profesional.",
        "Reporta grietas nuevas a las autoridades."
      ]
    },
    {
      id: "volcan", icono: "🌋", nombre: "Erupción volcánica",
      antes: [
        "Conoce el nivel de alerta del volcán (verde, amarillo, naranja, rojo) por fuentes oficiales.",
        "Ten lista la mochila de emergencia y la ruta de evacuación.",
        "Protege depósitos de agua y alimentos de la ceniza."
      ],
      durante: [
        "Sigue las instrucciones oficiales de evacuación sin demora.",
        "Cubre nariz y boca con un paño húmedo para no respirar ceniza.",
        "Usa gafas y ropa que cubra la piel. No uses lentes de contacto.",
        "Refúgiate bajo techo si hay caída de ceniza."
      ],
      despues: [
        "Limpia la ceniza de techos con cuidado (pesa mucho y puede tumbarlos).",
        "No conduzcas con ceniza en la vía si puedes evitarlo.",
        "Sigue las indicaciones de las autoridades sobre agua y alimentos."
      ]
    },
    {
      id: "incendio", icono: "🔥", nombre: "Incendio",
      antes: [
        "No dejes velas, estufas o fogones encendidos sin vigilancia.",
        "Ten un extintor y aprende a usarlo. Revisa instalaciones eléctricas.",
        "En zona rural, no hagas quemas sin control ni permiso."
      ],
      durante: [
        "Sal agachado: el humo sube. Cubre nariz y boca con paño húmedo.",
        "Toca las puertas con el dorso de la mano antes de abrirlas; si están calientes, no abras.",
        "No uses ascensores. No regreses por objetos.",
        "Si tu ropa se incendia: detente, tírate al suelo y rueda."
      ],
      despues: [
        "No entres hasta que bomberos lo autoricen.",
        "Llama al 119 si hay focos activos.",
        "Atiende quemaduras con agua limpia (no hielo) y busca ayuda médica."
      ]
    },
    {
      id: "tsunami", icono: "🌊", nombre: "Tsunami (costa Pacífica)",
      antes: [
        "Si vives en la costa, conoce las rutas de evacuación hacia zonas altas.",
        "Participa en los simulacros de evacuación."
      ],
      durante: [
        "Si hay alerta de tsunami o el mar se retira de golpe, evacúa de inmediato a un lugar alto (mínimo 30 m sobre el nivel del mar o 3 km tierra adentro).",
        "No esperes a ver la ola. No regreses por pertenencias.",
        "Si estás en un bote, sal mar adentro, no hacia la orilla."
      ],
      despues: [
        "Quédate en zona alta hasta que las autoridades declaren el fin de la alerta.",
        "Las olas pueden repetirse durante horas.",
        "Aléjate de escombros en el agua y de cables caídos."
      ]
    },
    {
      id: "tormenta", icono: "🌪️", nombre: "Tormenta / Huracán",
      antes: [
        "Asegura techos, ventanas y objetos que el viento pueda llevarse.",
        "Carga agua, comida y linternas. Carga el celular.",
        "Poda árboles cercanos que puedan caer sobre la casa."
      ],
      durante: [
        "Refúgiate en el interior, lejos de ventanas.",
        "No salgas durante el ojo de la tormenta (calma engañosa).",
        "Desconecta aparatos eléctricos si hay rayos."
      ],
      despues: [
        "Cuidado con cables caídos y árboles inestables.",
        "No pises charcos cerca de cables eléctricos.",
        "Reporta daños a las autoridades."
      ]
    }
  ],

  /* ---------- PRIMEROS AUXILIOS ---------- */
  auxilios: [
    {
      id: "rcp", icono: "❤️", nombre: "RCP (no respira)",
      pasos: [
        "Confirma que la persona no respira y no responde.",
        "Llama al 123 y pon el altavoz. El operador te puede guiar.",
        "Arrodíllate junto a la persona. Pon las manos en el centro del pecho.",
        "Comprime fuerte y rápido: 100 a 120 por minuto, hundiendo 5 cm.",
        "No pares hasta que llegue ayuda o la persona reaccione."
      ]
    },
    {
      id: "heimlich", icono: "🫁", nombre: "Atragantamiento (Heimlich)",
      pasos: [
        "Pregunta: '¿te estás ahogando?'. Si no puede hablar ni toser, actúa.",
        "Párate detrás y rodea su cintura con tus brazos.",
        "Pon el puño sobre el ombligo, bajo el esternón.",
        "Presiona hacia adentro y hacia arriba, fuerte, varias veces.",
        "Repite hasta que expulse el objeto. Si pierde el conocimiento, inicia RCP y llama al 123."
      ]
    },
    {
      id: "hemorragia", icono: "🩸", nombre: "Hemorragia (sangrado)",
      pasos: [
        "Presiona la herida con un paño limpio y firme.",
        "Eleva la zona herida por encima del corazón si es posible.",
        "No retires objetos clavados: fíjalos y busca ayuda.",
        "Si empapa el paño, pon otro encima sin quitar el primero.",
        "Llama al 123 si el sangrado no para."
      ]
    },
    {
      id: "quemadura", icono: "🔥", nombre: "Quemadura",
      pasos: [
        "Enfría con agua limpia (no helada) por 10 a 20 minutos.",
        "No apliques crema, pasta dental ni hielo.",
        "No revientes las ampollas.",
        "Cubre con un paño limpio y suelto.",
        "Busca ayuda médica si es extensa, profunda o en cara/manos/genitales."
      ]
    },
    {
      id: "fractura", icono: "🦴", nombre: "Fractura",
      pasos: [
        "No muevas la zona lesionada.",
        "Inmoviliza con una tablilla o algo rígido, sin apretar.",
        "Aplica frío envuelto en tela para reducir inflamación.",
        "No intentes acomodar el hueso.",
        "Busca ayuda médica. Llama al 123 si es grave."
      ]
    },
    {
      id: "recuperacion", icono: "🛌", nombre: "Posición de recuperación",
      pasos: [
        "Para alguien inconsciente que SÍ respira.",
        "Ponlo de lado, con la cabeza inclinada hacia atrás para que respire.",
        "La pierna de arriba doblada para que no ruede.",
        "Revisa que respire constantemente.",
        "Llama al 123 y no lo dejes solo."
      ]
    },
    {
      id: "nohacer", icono: "⚠️", nombre: "Qué NO hacer",
      pasos: [
        "NO des agua ni comida a alguien inconsciente o con posible lesión interna.",
        "NO muevas a un herido grave salvo peligro inminente.",
        "NO retires objetos clavados.",
        "NO apliques torniquetes salvo sangrado masivo que no para.",
        "NO des medicamentos si no sabes. Espera a los profesionales."
      ]
    },
    {
      id: "convulsion", icono: "🧠", nombre: "Convulsiones",
      pasos: [
        "Mantén la calma y anota la hora: si dura más de 5 minutos, llama al 123.",
        "Aparta objetos duros y filosos que estén cerca. NO lo sujetes.",
        "Pon algo doblado bajo la cabeza. NO metas nada en la boca.",
        "Cuando termine, ponlo de lado (posición de recuperación) y acompáñalo.",
        "Si no despierta después, no respira o es la primera convulsión: al hospital."
      ]
    },
    {
      id: "serpiente", icono: "🐍", nombre: "Mordedura de serpiente",
      pasos: [
        "Mantén a la persona quieta y calmada: el movimiento esparce el veneno.",
        "Llama al 123 y di que fue mordedura de serpiente (necesita suero antiofídico).",
        "Inmoviliza la extremidad mordida al nivel del corazón. Quita anillos y relojes.",
        "NO hagas cortes, NO chupes la herida, NO pongas hielo ni torniquete.",
        "Si es posible sin riesgo, toma foto de la serpiente o recuerda su color: ayuda a elegir el suero. NO la persigas."
      ]
    },
    {
      id: "intoxicacion", icono: "🤢", nombre: "Intoxicación / envenenamiento",
      pasos: [
        "Llama al 123 y digan qué sustancia fue, cuánta y cuándo (lleven el envase).",
        "Si la persona no respira o no responde: RCP y ambulancia de inmediato.",
        "Si está consciente, dale agua. NO provoques vómito (puede quemar de nuevo al subir).",
        "Si cayó en la piel o los ojos, enjuaga con agua corriente 15 minutos o más.",
        "No des leche, aceite ni remedios caseros: pueden empeorarlo."
      ]
    },
    {
      id: "golpecalor", icono: "🥵", nombre: "Golpe de calor",
      pasos: [
        "Se reconoce por piel muy caliente y seca, confusión o desmayo. Es una emergencia: llama al 123.",
        "Llévala de inmediato a la sombra o un lugar fresco.",
        "Quítale ropa innecesaria y moja su cuerpo con agua fresca (cuello, axilas, ingle).",
        "Dale agua si está consciente, en sorbos. Si no puede beber, nada por la boca.",
        "No le des bebidas con alcohol ni cafeína, ni frotes alcohol en la piel."
      ]
    },
    {
      id: "electrocucion", icono: "⚡", nombre: "Electrocución",
      pasos: [
        "NO la toques: corta la energía o aparta el cable con algo SECO y no metálico (madera, plástico).",
        "Llama al 123: las quemaduras eléctricas pueden ser graves por dentro aunque se vean pequeñas.",
        "Si no respira tras el choque: RCP de inmediato.",
        "Revisa si tiene quemaduras en la entrada y salida de la corriente. Cúbrelas con un paño limpio.",
        "Aunque se sienta bien, debe ir al hospital: el corazón puede fallar horas después."
      ]
    },
    {
      id: "ahogamiento", icono: "🌊", nombre: "Ahogamiento / casi ahogamiento",
      pasos: [
        "Sácala del agua solo si es seguro para ti (con un palo, cuerda o flotador). NO te lances directo.",
        "Si no respira: inicia RCP y pide que alguien llame al 123 con altavoz.",
        "Si respira pero tose o está somnolienta: ponla de lado y vigila que no deje de respirar.",
        "Casi ahogarse en agua es peligroso aunque se vea bien: SIEMPRE requiere revisión médica.",
        "Los niños se ahogan en silencio y en poca agua (piscinas, baldes, tanques): vigílalos siempre."
      ]
    }
  ],

  /* ---------- AYUDA A VULNERABLES ---------- */
  vulnerables: [
    {
      icono: "👵", nombre: "Adultos mayores",
      tips: [
        "Ayúdalos a salir con calma, con sus medicamentos y documentos.",
        "Háblales claro y con paciencia; el miedo puede desorientarlos.",
        "Verifica que tengan agua, abrigo y un lugar seguro donde dormir."
      ]
    },
    {
      icono: "🧒", nombre: "Niños y niñas",
      tips: [
        "Explícales lo que pasa con palabras sencillas y tranquilizadoras.",
        "Un abrazo y mantener la rutina (comer, dormir) les da seguridad.",
        "No los expongas a noticias alarmantes ni imágenes fuertes.",
        "Ponles una etiqueta con su nombre y un teléfono de contacto."
      ]
    },
    {
      icono: "♿", nombre: "Personas con discapacidad",
      tips: [
        "Pregunta primero cómo puedes ayudar, no asumas.",
        "Asegura sus ayudas: bastón, silla de ruedas, audífono, medicamentos.",
        "Si es persona sorda, usa gestos claros o escribe. Si es persona ciega, guíala describiendo el camino."
      ]
    },
    {
      icono: "🏡", nombre: "Familias que lo perdieron todo",
      tips: [
        "Ofréceles los puntos de encuentro y albergues oficiales de tu municipio.",
        "Comparte agua, comida y abrigo si puedes.",
        "Escucha sin juzgar; a veces acompañar es la mayor ayuda."
      ]
    }
  ],

  /* ---------- AGUA Y ALIMENTOS ---------- */
  agua: [
    "Si dudas del agua, hiérvela por 1 minuto o agrega 2 gotas de cloro (sin perfume) por litro y espera 30 minutos.",
    "Guarda agua en recipientes limpios y tapados (mínimo 2 litros por persona al día).",
    "Bota alimentos que tocaron agua de inundación o que huelen mal.",
    "Lávate las manos con agua y jabón antes de comer y después de ir al baño."
  ],

  /* ---------- ANTI-ESTAFAS ---------- */
  estafas: [
    "No compartas cadenas de WhatsApp sin verificar. Confirma con fuentes oficiales (alcaldía, UNGRD, Cruz Roja).",
    "Nadie debe cobrarte por ayuda humanitaria. Si te piden dinero, es una estafa.",
    "No des datos personales ni bancarios a desconocidos que ofrezcan 'ayudas del gobierno'.",
    "Los sismos NO se pueden predecir. Cualquier mensaje que diga 'va a temblar a tal hora' es falso."
  ],

  /* ---------- DONAR BIEN ---------- */
  donar: {
    si: "Agua embotellada, alimentos no perecederos, pañales, artículos de aseo, cobijas, ropa en buen estado y medicamentos vigentes.",
    no: "No lleves ropa rota, comida vencida ni cosas que tú no usarías. Llévalo a los puntos de acopio oficiales, no por tu cuenta a la zona afectada (puedes estorbar el rescate).",
    voluntario: "Si quieres ayudar como voluntario, regístrate con la Cruz Roja o la Defensa Civil de tu ciudad. Ir organizado ayuda mucho más que ir solo."
  },

  /* ---------- FUENTES OFICIALES ---------- */
  fuentes: [
    { nombre: "UNGRD", desc: "Unidad Nacional para la Gestión del Riesgo de Desastres. Alertas y comunicados nacionales." },
    { nombre: "Servicio Geológico Colombiano", desc: "Información oficial de sismos y réplicas." },
    { nombre: "IDEAM", desc: "Alertas de clima, lluvias e inundaciones." },
    { nombre: "Cruz Roja y Defensa Civil", desc: "Puntos de ayuda y voluntariado." },
    { nombre: "Alcaldía y Gobernación", desc: "Instrucciones locales específicas de tu municipio." }
  ],

  jac: "En cada barrio hay una Junta de Acción Comunal (JAC) y líderes que conocen los puntos de encuentro y albergues locales. Pregunta por la tuya y guarda su contacto: en una emergencia, la ayuda más cercana viene de tus propios vecinos organizados.",

  radio: "Si se cae internet, una radio a pilas sintonizando emisoras locales es la forma más confiable de recibir instrucciones oficiales.",

  atrapado: [
    "Cúbrete la boca y nariz con tela para no tragar polvo.",
    "No grites sin necesidad: gastas aire y tragas polvo. Golpea tuberías o paredes 3 veces seguidas para que te escuchen.",
    "No enciendas fósforos ni mecheros (puede haber gas).",
    "Muévete lo menos posible para no levantar polvo.",
    "Usa la linterna del celular si tienes batería. Ahórrala."
  ],

  /* ---------- MENSAJES DE COMPARTIR ---------- */
  compartir: {
    texto: "🆘 Guía de emergencia para Colombia: números oficiales (123, 132, 144), qué hacer en un sismo y cómo ayudar. Guárdala y compártela, puede salvar vidas 👉 ",
    estoyBien: "Estoy bien 🙏 ",
    necesitoAyuda: "🆘 NECESITO AYUDA. ",
    ubicacion: "Mi ubicación: "
  }
};
