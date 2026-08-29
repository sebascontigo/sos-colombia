/* ============================================================
   SOS Colombia — app.js
   Lógica: navegación, voz (TTS), GPS+WhatsApp, silbato, luz SOS,
   búsqueda, compartir, accesibilidad, instalación PWA.
   Sin dependencias. Requiere datos.js cargado antes.
   ============================================================ */
(function(){
"use strict";

/* ---------- utilidades ---------- */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

var toastTimer=null;
function toast(msg, ms){
  var t=$("toast"); if(!t) return;
  t.textContent=msg; t.classList.remove("oculto");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){ t.classList.add("oculto"); }, ms||2600);
}

/* ============================================================
   NAVEGACIÓN (rutas por hash)
   ============================================================ */
var PAGINAS=["inicio","emergencias","auxilios","ayuda","mas"];
function irA(page){
  if(PAGINAS.indexOf(page)<0) page="inicio";
  PAGINAS.forEach(function(p){
    var el=$("page-"+p);
    if(el) el.classList.toggle("activa", p===page);
  });
  var btns=document.querySelectorAll(".nav-btn");
  for(var i=0;i<btns.length;i++){
    btns[i].classList.toggle("activo", btns[i].getAttribute("data-page")===page);
  }
  detenerVoz();
  window.scrollTo(0,0);
}
function ruta(){
  var h=(location.hash||"#/inicio").replace("#/","");
  irA(h);
}
window.addEventListener("hashchange", ruta);

/* ============================================================
   VOZ (TTS) — accesibilidad estrella
   ============================================================ */
var soportaVoz = ("speechSynthesis" in window);
function hablar(texto){
  if(!soportaVoz){ toast("Tu celular no soporta la lectura por voz"); return; }
  try{
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(texto);
    u.lang="es-ES"; u.rate=0.95;
    window.speechSynthesis.speak(u);
    toast("🔊 Leyendo…");
  }catch(e){ toast("No pude iniciar la voz"); }
}
function detenerVoz(){
  if(soportaVoz){ try{ window.speechSynthesis.cancel(); }catch(e){} }
}
function textoDePagina(page){
  var el=$("page-"+page);
  if(!el) return "";
  return el.innerText.replace(/\s+/g," ").trim();
}

/* ============================================================
   GPS + WHATSAPP / SMS  ("Estoy bien" / "Necesito ayuda")
   El SMS funciona sin datos (2G), clave cuando no hay internet.
   ============================================================ */
function normalizarNumero(num){
  // solo dígitos; si trae "+" (formato internacional), se respeta tal cual;
  // si es un celular colombiano de 10 dígitos, antepone 57 (para wa.me)
  var s=String(num||"").trim();
  if(s.indexOf("+")===0) return s.replace(/[^\d]/g,""); // ya tiene código de país
  var d=s.replace(/\D/g,"");
  if(d.length===10) d="57"+d;
  return d;
}
function abrirWhatsApp(texto, numero){
  var url = numero
    ? "https://wa.me/"+normalizarNumero(numero)+"?text="+encodeURIComponent(texto)
    : "https://wa.me/?text="+encodeURIComponent(texto);
  window.open(url, "_blank");
}
function enlaceSMS(texto, numero){
  // iOS usa "&body="; Android y el resto usan "?body=". El número va tras "sms:".
  var sep = /iP(hone|ad|od)/.test(navigator.userAgent) ? "&" : "?";
  return "sms:" + (numero||"") + sep + "body=" + encodeURIComponent(texto);
}
var mensajePendiente=null, numeroPendiente=null;
function mostrarChooser(texto, numero, nombreDestino){
  mensajePendiente=texto;
  numeroPendiente=numero||null;
  var destino=$("chooserDestino");
  if(destino){
    if(numero){
      var nombre=nombreDestino || FICHA.contactoNombre || numero;
      destino.textContent="➡️ Se enviará a: "+nombre;
    }
    else { destino.textContent="Al enviar, elige a quién. Consejo: guarda tus contactos de emergencia (pestaña Más)."; }
    destino.classList.remove("oculto");
  }
  var c=$("chooser"); if(c) c.classList.remove("oculto");
}
function cerrarChooser(){
  mensajePendiente=null; numeroPendiente=null;
  var c=$("chooser"); if(c) c.classList.add("oculto");
}
function resumenMedico(){
  // resumen corto de la ficha para adjuntar al aviso de ayuda
  var p=[];
  if(FICHA.sangre && FICHA.sangre!=="No sé") p.push("Sangre "+FICHA.sangre);
  if(FICHA.alergias) p.push("Alergias: "+FICHA.alergias);
  if(FICHA.medicamentos) p.push("Meds: "+FICHA.medicamentos);
  if(!p.length) return "";
  return " | "+p.join(" | ");
}
function enviarEstado(tipo){
  var base = (tipo==="bien") ? DATOS.compartir.estoyBien : DATOS.compartir.necesitoAyuda;
  if(tipo==="ayuda"){ var rm=resumenMedico(); if(rm) base+=rm; }
  var numero = FICHA.contactoNum || null;
  var nombre = FICHA.contactoNum ? FICHA.contactoNombre : null;
  if(!navigator.geolocation){ mostrarChooser(base, numero, nombre); return; }
  toast("Obteniendo tu ubicación…");
  navigator.geolocation.getCurrentPosition(
    function(pos){
      var la=pos.coords.latitude.toFixed(5), lo=pos.coords.longitude.toFixed(5);
      mostrarChooser(base + DATOS.compartir.ubicacion + "https://maps.google.com/?q="+la+","+lo, numero, nombre);
    },
    function(){ mostrarChooser(base + "(no pude obtener tu ubicación)", numero, nombre); },
    { timeout:8000, maximumAge:60000 }
  );
}

/* ============================================================
   MI UBICACIÓN (GPS sin internet)
   El GPS solo recibe señal: funciona sin datos ni WiFi.
   ============================================================ */
var ubicacionActual=null;
function verUbicacion(){
  var coords=$("ubicCoords"), prec=$("ubicPrecision");
  if(!navigator.geolocation){ coords.textContent=DATOS.miUbicacion.sinGPS; return; }
  coords.textContent=DATOS.miUbicacion.pidiendo;
  prec.textContent="";
  navigator.geolocation.getCurrentPosition(
    function(pos){
      var la=pos.coords.latitude.toFixed(5), lo=pos.coords.longitude.toFixed(5);
      ubicacionActual=la+","+lo;
      coords.textContent=la+"  ,  "+lo;
      prec.textContent=DATOS.miUbicacion.precision+Math.round(pos.coords.accuracy)+" metros";
      var bc=$("btnCopiarUbic"); if(bc) bc.classList.remove("oculto");
      toast("📍 Ubicación lista (funciona sin internet)");
    },
    function(){
      coords.textContent=DATOS.miUbicacion.error;
      prec.textContent="";
    },
    { timeout:15000, maximumAge:30000, enableHighAccuracy:true }
  );
}
function copiarUbicacion(){
  if(!ubicacionActual){ toast("Primero toca 'Ver mi ubicación'"); return; }
  var texto="Mi ubicación: https://maps.google.com/?q="+ubicacionActual;
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(texto).then(
      function(){ toast(DATOS.miUbicacion.copiado); },
      function(){ copiarFallback(texto); }
    );
  } else { copiarFallback(texto); }
}
function copiarFallback(texto){
  var ta=document.createElement("textarea");
  ta.value=texto; ta.style.position="fixed"; ta.style.opacity="0";
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand("copy"); toast(DATOS.miUbicacion.copiado); }
  catch(e){ toast("Anota tu ubicación: "+texto, 6000); }
  document.body.removeChild(ta);
}

/* ============================================================
   FICHA MÉDICA DE EMERGENCIA (ICE) — privada, solo en el teléfono
   ============================================================ */
var FICHA={ nombre:"", sangre:"", alergias:"", medicamentos:"", contactoNombre:"", contactoNum:"" };
function guardarFichaLS(){ try{ localStorage.setItem("sosficha", JSON.stringify(FICHA)); }catch(e){} }
function cargarFicha(){
  try{ var g=localStorage.getItem("sosficha"); if(g){ var o=JSON.parse(g); if(o) FICHA=o; } }catch(e){}
  // rellena el formulario y el selector de sangre
  var sel=$("fSangre");
  if(sel){
    var html='<option value="">— elegir —</option>';
    DATOS.ficha.sangreOpciones.forEach(function(s){ if(s) html+='<option value="'+s+'">'+s+'</option>'; });
    sel.innerHTML=html;
    sel.value=FICHA.sangre||"";
  }
  if($("fNombre")) $("fNombre").value=FICHA.nombre||"";
  if($("fAlergias")) $("fAlergias").value=FICHA.alergias||"";
  if($("fMedicamentos")) $("fMedicamentos").value=FICHA.medicamentos||"";
  if($("fContactoNombre")) $("fContactoNombre").value=FICHA.contactoNombre||"";
  if($("fContactoNum")) $("fContactoNum").value=FICHA.contactoNum||"";
}
function guardarFicha(){
  FICHA.nombre=$("fNombre").value.trim();
  FICHA.sangre=$("fSangre").value;
  FICHA.alergias=$("fAlergias").value.trim();
  FICHA.medicamentos=$("fMedicamentos").value.trim();
  FICHA.contactoNombre=$("fContactoNombre").value.trim();
  FICHA.contactoNum=$("fContactoNum").value.trim();
  guardarFichaLS();
  toast(DATOS.ficha.guardada);
}
function fichaTieneDatos(){
  return !!(FICHA.nombre||FICHA.sangre||FICHA.alergias||FICHA.medicamentos||FICHA.contactoNum);
}
function verFichaGrande(){
  if(!fichaTieneDatos()){
    toast(DATOS.ficha.vacia);
    location.hash="#/mas";
    return;
  }
  var html="";
  if(FICHA.nombre) html+="<p class='fg-nombre'>"+esc(FICHA.nombre)+"</p>";
  if(FICHA.sangre) html+="<p class='fg-item'>🩸 Sangre: <strong>"+esc(FICHA.sangre)+"</strong></p>";
  if(FICHA.alergias) html+="<p class='fg-item'>⚠️ Alergias: "+esc(FICHA.alergias)+"</p>";
  if(FICHA.medicamentos) html+="<p class='fg-item'>💊 Medicamentos: "+esc(FICHA.medicamentos)+"</p>";
  if(FICHA.contactoNombre||FICHA.contactoNum){
    html+="<p class='fg-item'>📞 Contactar a: "+esc(FICHA.contactoNombre||"")+" "
        +"<a class='fg-tel' href='tel:"+esc(FICHA.contactoNum)+"'>"+esc(FICHA.contactoNum)+"</a></p>";
  }
  $("fichaGrandeContenido").innerHTML=html;
  $("overlayFicha").classList.remove("oculto");
}
function cerrarFichaGrande(){ var o=$("overlayFicha"); if(o) o.classList.add("oculto"); }

/* ============================================================
   CONTACTOS DE EMERGENCIA (lista propia, persistente)
   Máximo 5. El botón de emergencia les prepara el aviso.
   ============================================================ */
var CONTACTOS=[]; // [{nombre, tel}]
function guardarContactosLS(){ try{ localStorage.setItem("soscontactos", JSON.stringify(CONTACTOS)); }catch(e){} }
function cargarContactos(){
  try{
    var g=localStorage.getItem("soscontactos");
    if(g){
      var o=JSON.parse(g);
      if(Array.isArray(o)){
        CONTACTOS=o.filter(function(c){ return c && typeof c.nombre==="string" && typeof c.tel==="string"; }).slice(0,5);
      }
    }
  }catch(e){ CONTACTOS=[]; }
  // migración: si no hay contactos pero la ficha ICE tiene contacto guardado, importarlo
  if(CONTACTOS.length===0 && FICHA.contactoNombre && FICHA.contactoNum){
    CONTACTOS.push({ nombre:FICHA.contactoNombre, tel:FICHA.contactoNum });
    guardarContactosLS();
  }
  renderContactos();
}
function renderContactos(){
  var html="";
  if(CONTACTOS.length===0){
    html='<p class="nota">'+esc(DATOS.contactos.vacio)+'</p>';
  } else {
    CONTACTOS.forEach(function(c, i){
      html+='<div class="ctc-item">'
          +'<span class="ctc-inicial">'+esc((c.nombre||"?").charAt(0).toUpperCase())+'</span>'
          +'<span class="ctc-datos"><strong>'+esc(c.nombre)+'</strong><small>'+esc(c.tel)+'</small></span>'
          +'<button class="ctc-borrar" data-i="'+i+'" title="Borrar contacto">🗑️</button>'
          +'</div>';
    });
  }
  $("listaContactos").innerHTML=html;
  $("ctcNotaMax").textContent = CONTACTOS.length>=5 ? DATOS.contactos.maximo : "";
}
function agregarContacto(){
  var nombre=$("ctcNombre").value.trim();
  var tel=$("ctcTel").value.trim();
  if(!nombre || !tel){ toast("Escribe el nombre y el celular del contacto."); return; }
  // acepta números de CUALQUIER país: +34 6xx (España), +1 (EEUU), 57 3xx (Colombia)…
  if(!/^\+?[0-9][0-9\s-]{6,17}$/.test(tel)){ toast("Ese número no parece válido (ej: 3001234567 o +34600123456)."); return; }
  if(CONTACTOS.length>=5){ toast(DATOS.contactos.maximo); return; }
  CONTACTOS.push({ nombre:nombre, tel:tel });
  guardarContactosLS();
  $("ctcNombre").value=""; $("ctcTel").value="";
  renderContactos();
  toast(DATOS.contactos.agregado, 2500);
}
function borrarContacto(i){
  if(!confirm(DATOS.contactos.confirmarBorrar+" "+CONTACTOS[i].nombre)) return;
  CONTACTOS.splice(i,1);
  guardarContactosLS();
  renderContactos();
  toast(DATOS.contactos.borrado, 2000);
}

/* ============================================================
   BOTÓN DE EMERGENCIA (avisar a mis contactos con ubicación)
   1) pide GPS, 2) muestra la lista de contactos,
   3) al elegir uno: chooser de canal (WhatsApp/SMS) directo.
   ============================================================ */
function botonEmergencia(){
  if(CONTACTOS.length===0){
    toast(DATOS.contactos.emergenciaSinContactos, 4000);
    location.hash="#/mas";
    return;
  }
  // pedir ubicación en background mientras el usuario elige contacto
  verUbicacion();
  mostrarChooserContacto();
}
function mostrarChooserContacto(){
  var html="";
  CONTACTOS.forEach(function(c, i){
    html+='<button class="ctc-elegir" data-i="'+i+'">'
        +'<span class="ctc-inicial">'+esc((c.nombre||"?").charAt(0).toUpperCase())+'</span>'
        +'<span class="ctc-datos"><strong>'+esc(c.nombre)+'</strong><small>'+esc(DATOS.contactos.a)+esc(c.tel)+'</small></span>'
        +'<span class="ctc-ir">›</span>'
        +'</button>';
  });
  $("chooserListaContactos").innerHTML=html;
  $("chooserContacto").classList.remove("oculto");
}
function cerrarChooserContacto(){
  $("chooserContacto").classList.add("oculto");
}
function elegirContactoEmergencia(i){
  var c=CONTACTOS[i];
  cerrarChooserContacto();
  // armar el mensaje de emergencia con la ubicación (si ya llegó)
  var msg=DATOS.compartir.necesitoAyuda;
  if(ubicacionActual){
    msg+=DATOS.compartir.ubicacion+ubicacionActual.lat+","+ubicacionActual.lng+" ";
    msg+="https://maps.google.com/?q="+ubicacionActual.lat+","+ubicacionActual.lng+" ";
  }
  msg+=resumenMedico();
  msg+="— Enviado desde SOS Colombia";
  // chooser de canal apuntando a ese contacto
  mostrarChooser(msg, c.tel, c.nombre);
}

/* ============================================================
   SOS EN VIVO (modo emergencia activa)
   - sirena que no para (Web Audio) + vibración periódica
   - ubicación que se actualiza sola (watchPosition)
   - pantalla despierta (Wake Lock API si existe)
   - cola de envío a TODOS los contactos, uno por uno
   ============================================================ */
var SV={ activo:false, tipo:null, watchId:null, sirenaTimer:null, vibrateTimer:null,
         lat:null, lng:null, wakeLock:null, enviados:{} };
function svRenderChips(){
  var html="";
  DATOS.sosVivo.tipos.forEach(function(t){
    html+='<button class="sv-chip'+(SV.tipo===t.id?" activo":"")+'" data-tipo="'+t.id+'">'
        +'<span>'+t.icono+'</span> '+esc(t.txt)+'</button>';
  });
  $("svChips").innerHTML=html;
}
function svMensaje(){
  var m=DATOS.sosVivo.mensajes[SV.tipo]||DATOS.sosVivo.mensajes.peligro;
  var msg=m+" ";
  if(SV.lat!=null){
    msg+="https://maps.google.com/?q="+SV.lat+","+SV.lng+" ";
    msg+=resumenMedico();
    msg+=" "+DATOS.sosVivo.mensajeBase+SV.lat+","+SV.lng;
  } else {
    // SIN GPS aún: mensaje válido sin enlace roto
    msg+=resumenMedico();
    msg+=" (GPS sin señal todavía; si no contesto, mi última zona conocida es donde suelo estar. Llama al 123.)";
  }
  return msg;
}
function svActualizarCola(){
  var html='<p class="sv-cola-sub">'+esc(DATOS.sosVivo.cola.titulo)+'</p>';
  CONTACTOS.forEach(function(c,i){
    var hecho=!!SV.enviados[i];
    html+='<button class="sv-item'+(hecho?" hecho":"")+'" data-i="'+i+'">'
        +'<span class="ctc-inicial">'+esc((c.nombre||"?").charAt(0).toUpperCase())+'</span>'
        +'<span class="ctc-datos"><strong>'+esc(c.nombre)+'</strong><small>'
        +(hecho?DATOS.sosVivo.cola.enviado:DATOS.sosVivo.cola.pendiente)+'</small></span>'
        +(hecho?'<span class="sv-ok">✓</span>':'<span class="sv-ir">›</span>')
        +'</button>';
  });
  $("svCola").innerHTML=html;
}
function svSirena(){
  if(!SV.activo) return;
  // asegurar contexto de audio VIVO: el toque en ACTIVAR es el "gesto de usuario"
  // que los navegadores exigen; aquí lo reactivamos en cada pasada por si se suspendió
  if(!audioCtx){
    var AC=window.AudioContext||window.webkitAudioContext;
    if(AC) audioCtx=new AC();
  }
  if(audioCtx && audioCtx.state!=="running"){
    try{ audioCtx.resume(); }catch(e){}
  }
  if(audioCtx && audioCtx.state==="running"){
    try{
      // tono de alarma con cuerpo completo: fundamental + octava = más perceptible
      var t=audioCtx.currentTime;
      [1150, 2300].forEach(function(freq, i){
        var o=audioCtx.createOscillator(), g=audioCtx.createGain();
        o.type = i===0 ? "sawtooth" : "square";
        o.frequency.setValueAtTime(freq, t);
        o.frequency.exponentialRampToValueAtTime(freq*0.43, t+0.55);
        g.gain.setValueAtTime(i===0?0.5:0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t+0.6);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t); o.stop(t+0.62);
      });
    }catch(e){}
  }
  // flash visual sincronizado: la alarma también SE VE (respaldo si el audio sigue muteado)
  var caja=document.getElementById("sosVivoCaja");
  if(caja){
    caja.classList.add("sv-flash");
    setTimeout(function(){ caja.classList.remove("sv-flash"); }, 450);
  }
}
function activarSosVivo(){
  if(SV.activo) return;
  if(!SV.tipo){ toast(DATOS.sosVivo.sinTipo, 3000); return; }
  if(CONTACTOS.length===0){
    toast(DATOS.sosVivo.sinContactos, 4000);
    location.hash="#/mas";
    return;
  }
  // desbloquear el audio CON ESTE TOQUE (es el gesto de usuario que exige el navegador):
  // reproducimos un tono corto de arranque ya fuerte
  if(!audioCtx){
    var AC=window.AudioContext||window.webkitAudioContext;
    if(AC) audioCtx=new AC();
  }
  if(audioCtx && audioCtx.state!=="running"){ try{ audioCtx.resume(); }catch(e){} }
  SV.activo=true;
  SV.enviados={};
  var t=DATOS.sosVivo.tipos.filter(function(x){return x.id===SV.tipo;})[0];
  $("svTipo").textContent=DATOS.sosVivo.activo.tipo+t.icono+" "+t.txt;
  $("btnSosVivo").classList.add("oculto");
  $("svPanel").classList.remove("oculto");
  $("sosVivoIntro").classList.add("oculto");
  // sirena cada ~1.1 s + vibración periódica
  svSirena();
  SV.sirenaTimer=setInterval(svSirena, 1100);
  if(navigator.vibrate){
    navigator.vibrate([600,200,600]);
    SV.vibrateTimer=setInterval(function(){ navigator.vibrate([600,200,600]); }, 3000);
  }
  // pantalla despierta; si el sistema lo suelta (pantalla bloqueada con app abierta), se vuelve a pedir
  SV.pedirWakeLock=function(){
    if(!SV.activo) return;
    if(navigator.wakeLock && navigator.wakeLock.request){
      navigator.wakeLock.request("screen").then(function(wl){
        SV.wakeLock=wl;
        wl.addEventListener("release", function(){ setTimeout(SV.pedirWakeLock, 1000); });
      }).catch(function(){});
    }
  };
  SV.pedirWakeLock();
  // KEEP-ALIVE de la alarma: si el sistema pausa los timers (app a segundo plano),
  // al volver se reanudan solos. La alarma NUNCA se detiene sola — solo con el botón.
  SV.keepAlive=function(){
    if(!SV.activo) return;
    if(audioCtx && audioCtx.state!=="running"){ try{ audioCtx.resume(); }catch(e){} }
    if(!SV.sirenaTimer){ svSirena(); SV.sirenaTimer=setInterval(svSirena, 1100); }
    if(navigator.vibrate && !SV.vibrateTimer){
      navigator.vibrate([600,200,600]);
      SV.vibrateTimer=setInterval(function(){ navigator.vibrate([600,200,600]); }, 3000);
    }
  };
  document.addEventListener("visibilitychange", SV.keepAlive);
  document.addEventListener("pointerdown", SV.keepAlive);
  // ubicación en vivo; si está BLOQUEADA, reintento automático cada 15 s + cómo desbloquearla
  if(navigator.geolocation){
    $("svUbicacion").textContent=DATOS.sosVivo.activo.buscando;
    SV.watchId=navigator.geolocation.watchPosition(
      function(pos){
        SV.lat=pos.coords.latitude.toFixed(5);
        SV.lng=pos.coords.longitude.toFixed(5);
        if(SV.gpsRetry){ clearInterval(SV.gpsRetry); SV.gpsRetry=null; }
        $("svUbicacion").textContent=DATOS.sosVivo.activo.ubicacion+SV.lat+", "+SV.lng;
      },
      function(err){
        if(err && err.code===1){ // PERMISSION_DENIED: bloqueada
          $("svUbicacion").innerHTML=DATOS.sosVivo.gpsBloqueada;
        } else {
          $("svUbicacion").textContent=DATOS.sosVivo.activo.sinGPS;
        }
        // reintento automático cada 15 s (por si el usuario la desbloquea desde ajustes)
        if(!SV.gpsRetry){
          SV.gpsRetry=setInterval(function(){
            if(!SV.activo){ clearInterval(SV.gpsRetry); SV.gpsRetry=null; return; }
            navigator.geolocation.getCurrentPosition(function(pos){
              SV.lat=pos.coords.latitude.toFixed(5);
              SV.lng=pos.coords.longitude.toFixed(5);
              $("svUbicacion").textContent=DATOS.sosVivo.activo.ubicacion+SV.lat+", "+SV.lng;
            }, function(){}, { enableHighAccuracy:true, timeout:12000, maximumAge:5000 });
          }, 15000);
        }
      },
      { enableHighAccuracy:true, maximumAge:5000, timeout:15000 }
    );
  } else {
    $("svUbicacion").textContent=DATOS.sosVivo.activo.sinGPS;
  }
  svActualizarCola();
  toast(DATOS.sosVivo.activo.avisoSirena, 4000);
}
function svEnviarA(i){
  if(!SV.activo) return;
  var c=CONTACTOS[i];
  // WhatsApp directo; si falla el usuario puede usar el chooser normal
  var wa="https://wa.me/"+normalizarNumero(c.tel)+"?text="+encodeURIComponent(svMensaje());
  var w=window.open(wa, "_blank");
  // SMS como respaldo si el popup fue bloqueado (común en PWA instaladas)
  setTimeout(function(){
    if(!w || w.closed || typeof w.closed==="undefined"){
      window.location.href=enlaceSMS(svMensaje(), c.tel);
    }
  }, 900);
  SV.enviados[i]=true;
  svActualizarCola();
}
function detenerSosVivo(){
  if(!SV.activo) return;
  if(!confirm(DATOS.sosVivo.confDetener)) return;
  SV.activo=false;
  if(SV.sirenaTimer){ clearInterval(SV.sirenaTimer); SV.sirenaTimer=null; }
  if(SV.vibrateTimer){ clearInterval(SV.vibrateTimer); SV.vibrateTimer=null; }
  if(SV.gpsRetry){ clearInterval(SV.gpsRetry); SV.gpsRetry=null; }
  if(navigator.vibrate) navigator.vibrate(0);
  if(SV.watchId!=null){ navigator.geolocation.clearWatch(SV.watchId); SV.watchId=null; }
  if(SV.wakeLock){ try{ SV.wakeLock.release(); }catch(e){} SV.wakeLock=null; }
  if(SV.keepAlive){
    document.removeEventListener("visibilitychange", SV.keepAlive);
    document.removeEventListener("pointerdown", SV.keepAlive);
  }
  $("svPanel").classList.add("oculto");
  $("btnSosVivo").classList.remove("oculto");
  $("sosVivoIntro").classList.remove("oculto");
  $("btnSosVivo").textContent=DATOS.sosVivo.activar;
  toast(DATOS.sosVivo.detenido, 4500);
}

/* ============================================================
   METRÓNOMO RCP (~110 compresiones/min) — Web Audio API
   ============================================================ */
var metronomoTimer=null, metronomoActivo=false;
function iniciarMetronomo(){
  if(!tonoSilbato()) return; // crea/reanuda el contexto de audio
  detenerMetronomo();
  metronomoActivo=true;
  var intervalo=Math.round(60000/110); // ~545 ms
  function tick(){
    if(!metronomoActivo||!audioCtx) return;
    var o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.type="square"; o.frequency.value=1000;
    g.gain.value=0.001;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.setTargetAtTime(0.5, audioCtx.currentTime, 0.005);
    g.gain.setTargetAtTime(0.001, audioCtx.currentTime+0.06, 0.02);
    setTimeout(function(){ try{ o.stop(); }catch(e){} }, 200);
  }
  tick();
  metronomoTimer=setInterval(tick, intervalo);
  var b=document.querySelector(".btn-metronomo"); if(b) b.textContent=DATOS.metronomo.detener;
  toast(DATOS.metronomo.activo, 4000);
}
function detenerMetronomo(){
  if(metronomoTimer){ clearInterval(metronomoTimer); metronomoTimer=null; }
  metronomoActivo=false;
  var b=document.querySelector(".btn-metronomo"); if(b) b.textContent=DATOS.metronomo.iniciar;
}

/* ============================================================
   CICLO RCP 30:2 (compresiones guiadas + 2 respiraciones)
   30 pitidos a 110/min, luego 2 tonos graves, y repite.
   ============================================================ */
var rcpTimer=null, rcpActivo=false;
function rcpTick(agudo){
  if(!audioCtx) return;
  var o=audioCtx.createOscillator(), g=audioCtx.createGain();
  o.type=agudo?"square":"sine";
  o.frequency.value=agudo?1000:440;
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  g.gain.value=0.001;
  g.gain.setTargetAtTime(agudo?0.5:0.4, audioCtx.currentTime, 0.005);
  g.gain.setTargetAtTime(0.001, audioCtx.currentTime+0.35, 0.03);
  setTimeout(function(){ try{ o.stop(); }catch(e){} }, 500);
}
function rcpAviso(texto){
  var el=document.getElementById("rcpFase");
  if(el) el.textContent=texto;
}
function iniciarRcpCiclo(){
  if(!tonoSilbato()) return;
  detenerRcpCiclo(); detenerMetronomo();
  rcpActivo=true;
  var b=document.querySelector(".btn-rcp-ciclo"); if(b) b.textContent=DATOS.rcp.detener;
  var intervalo=Math.round(60000/110);
  var compresiones=0;
  rcpAviso(DATOS.rcp.faseCompresiones);
  function faseCompresion(){
    if(!rcpActivo) return;
    rcpTick(true);
    compresiones++;
    if(compresiones>=30){
      rcpAviso(DATOS.rcp.faseRespiraciones);
      rcpTick(false);
      rcpTimer=setTimeout(function(){
        if(!rcpActivo) return;
        rcpTick(false);
        rcpTimer=setTimeout(function(){
          if(!rcpActivo) return;
          compresiones=0;
          rcpAviso(DATOS.rcp.listo);
          rcpTimer=setTimeout(faseCompresion, 1500);
        }, 1000);
      }, 1000);
      return;
    }
    rcpTimer=setTimeout(faseCompresion, intervalo);
  }
  faseCompresion();
}
function detenerRcpCiclo(){
  if(rcpTimer){ clearTimeout(rcpTimer); rcpTimer=null; }
  rcpActivo=false;
  rcpAviso("");
  var b=document.querySelector(".btn-rcp-ciclo"); if(b) b.textContent=DATOS.rcp.iniciar;
}

/* ============================================================
   ASISTENTE DE TRIAJE "¿Qué hago ahora?"
   Preguntas cortas con botones grandes; llega a una acción.
   ============================================================ */
var triajeAuxilioPendiente=null;
function triajePaso(paso){
  var preg=$("triajePregunta"), ops=$("triajeOpciones"), res=$("triajeResultado");
  res.classList.add("oculto");
  if(paso==="inicio"){ $("triajeVolver").classList.add("oculto"); }
  else { $("triajeVolver").classList.remove("oculto"); }
  ops.innerHTML="";
  if(paso==="inicio"){
    preg.textContent=DATOS.triaje.inicio;
    ops.appendChild(triajeBoton("✅ Sí, responde", "respondeSi"));
    ops.appendChild(triajeBoton("😵 No responde", "noResponde"));
  } else if(paso==="respondeSi"){
    preg.textContent=DATOS.triaje.responde;
    ops.appendChild(triajeBoton(DATOS.triaje.sangrado.accion, "r:sangrado"));
    ops.appendChild(triajeBoton(DATOS.triaje.atragantado.accion, "r:atragantado"));
    ops.appendChild(triajeBoton(DATOS.triaje.inconsciente.accion, "r:inconsciente"));
    ops.appendChild(triajeBoton(DATOS.triaje.quemadura.accion, "r:quemadura"));
    ops.appendChild(triajeBoton(DATOS.triaje.otro.accion, "r:otro"));
  } else if(paso==="noResponde"){
    preg.textContent=DATOS.triaje.noResponde;
    ops.appendChild(triajeBoton("✅ Sí, respira", "inconscienteRespira"));
    ops.appendChild(triajeBoton("🚨 No respira", "noRespira"));
  }
  preg.classList.remove("oculto");
}
function triajeBoton(texto, valor){
  var b=document.createElement("button");
  b.className="triaje-btn";
  b.textContent=texto;
  b.setAttribute("data-valor", valor);
  return b;
}
function triajeResultado(clave){
  var t=DATOS.triaje[clave];
  $("triajePregunta").classList.add("oculto");
  $("triajeOpciones").innerHTML="";
  triajeAuxilioPendiente=t.auxilio;
  $("triajeAccion").textContent=t.accion;
  $("triajeMensaje").textContent=t.mensaje;
  var g=$("triajeGuia");
  if(t.auxilio){ g.classList.remove("oculto"); } else { g.classList.add("oculto"); }
  $("triajeResultado").classList.remove("oculto");
}
function triajeVolverAInicio(){
  triajeAuxilioPendiente=null;
  $("triajeResultado").classList.add("oculto");
  $("triajeVolver").classList.add("oculto");
  triajePaso("inicio");
}
function triajeIrAGuia(){
  if(!triajeAuxilioPendiente) return;
  var cont=$("listaAuxilios");
  var item=cont.querySelector('.item-acordeon[data-id="'+triajeAuxilioPendiente+'"]');
  if(item){
    item.classList.add("abierto");
    item.scrollIntoView({behavior:"smooth", block:"start"});
    toast("Guía abierta 👇", 2000);
  }
}

/* ============================================================
   CHECKLIST DE PREPARACIÓN DEL HOGAR (persistente)
   ============================================================ */
var CHECK={};
function guardarCheckLS(){ try{ localStorage.setItem("soscheck", JSON.stringify(CHECK)); }catch(e){} }
function cargarCheck(){
  try{
    var g=localStorage.getItem("soscheck");
    if(g) CHECK=JSON.parse(g)||{};
  }catch(e){ CHECK={}; }
}
function renderChecklist(){
  var html="";
  DATOS.preparacion.items.forEach(function(it){
    var marcado=!!CHECK[it.id];
    html+='<button class="chk-item'+(marcado?" marcado":"")+'" data-chk="'+it.id+'">'
        +'<span class="chk-caja">'+(marcado?"✓":"")+'</span>'
        +'<span class="chk-ico">'+it.icono+'</span>'
        +'<span class="chk-txt">'+esc(it.txt)+'</span>'
        +'</button>';
  });
  $("chkLista").innerHTML=html;
  var total=DATOS.preparacion.items.length;
  var hechos=DATOS.preparacion.items.filter(function(it){ return !!CHECK[it.id]; }).length;
  $("chkBarraInterna").style.width=(total?Math.round(hechos*100/total):0)+"%";
  var txt;
  if(hechos===total){ txt=DATOS.preparacion.todoListo; }
  else if(hechos===0){ txt=DATOS.preparacion.empieza; }
  else { txt=DATOS.preparacion.casi+" "+(total-hechos)+" "+DATOS.preparacion.faltan; }
  $("chkTexto").textContent=hechos+"/"+total+" "+txt;
}

/* ============================================================
   PLAN FAMILIAR DE EMERGENCIA (persistente)
   ============================================================ */
var PLAN={ punto:"", tel1:"", tel2:"" };
function guardarPlanLS(){ try{ localStorage.setItem("sosplan", JSON.stringify(PLAN)); }catch(e){} }
function cargarPlan(){
  try{
    var g=localStorage.getItem("sosplan");
    if(g){
      var o=JSON.parse(g);
      if(o){
        if(typeof o.punto==="string") PLAN.punto=o.punto;
        if(typeof o.tel1==="string") PLAN.tel1=o.tel1;
        if(typeof o.tel2==="string") PLAN.tel2=o.tel2;
      }
    }
  }catch(e){}
  $("planPunto").value=PLAN.punto||"";
  $("planTel1").value=PLAN.tel1||"";
  $("planTel2").value=PLAN.tel2||"";
  if(PLAN.punto||PLAN.tel1||PLAN.tel2) $("planConsejo").textContent=DATOS.planFamiliar.verderia;
}
function guardarPlan(){
  PLAN.punto=$("planPunto").value.trim();
  PLAN.tel1=$("planTel1").value.trim();
  PLAN.tel2=$("planTel2").value.trim();
  guardarPlanLS();
  $("planConsejo").textContent=DATOS.planFamiliar.verderia;
  toast(DATOS.planFamiliar.guardado, 2500);
}

/* ============================================================
   SILBATO DE EMERGENCIA (Web Audio API)
   ============================================================ */
var audioCtx=null, oscSilbato=null, ganSilbato=null, silbatoTimer=null, silbatoActivo=false;
function tonoSilbato(){
  if(!audioCtx){
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC){ toast("Tu celular no soporta el silbato"); return false; }
    audioCtx=new AC();
  }
  if(audioCtx.state==="suspended"){ audioCtx.resume(); }
  return true;
}
function iniciarSilbato(){
  if(!tonoSilbato()) return;
  detenerSilbato();
  oscSilbato=audioCtx.createOscillator();
  ganSilbato=audioCtx.createGain();
  oscSilbato.type="sine"; oscSilbato.frequency.value=2800;
  ganSilbato.gain.value=0.001;
  oscSilbato.connect(ganSilbato); ganSilbato.connect(audioCtx.destination);
  oscSilbato.start();
  ganSilbato.gain.setTargetAtTime(0.6, audioCtx.currentTime, 0.02);
  silbatoActivo=true;
  $("btnSilbato").textContent="⏹ Detener silbato";
  toast("📣 Silbato activo. Toca para detener.");
  // patrón intermitente de emergencia
  var on=true;
  silbatoTimer=setInterval(function(){
    on=!on;
    ganSilbato.gain.setTargetAtTime(on?0.6:0.001, audioCtx.currentTime, 0.02);
  }, 700);
}
function detenerSilbato(){
  if(silbatoTimer){ clearInterval(silbatoTimer); silbatoTimer=null; }
  if(oscSilbato){ try{ oscSilbato.stop(); }catch(e){} oscSilbato=null; }
  silbatoActivo=false;
  var b=$("btnSilbato"); if(b) b.textContent="📣 Silbato SOS";
}

/* ============================================================
   LUZ SOS (parpadeo de pantalla en Morse ··· −−− ···)
   ============================================================ */
var luzActiva=false, luzTimer=null;
var SECUENCIA_SOS=[200,-200,200,-200,200,-600, 600,-200,600,-200,600,-600, 200,-200,200,-200,200,-1200];
function pasoLuz(i){
  if(!luzActiva) return;
  var ov=$("overlayLuz");
  var d=SECUENCIA_SOS[i % SECUENCIA_SOS.length];
  if(d>0){ ov.classList.add("destello"); } else { ov.classList.remove("destello"); }
  luzTimer=setTimeout(function(){ pasoLuz(i+1); }, Math.abs(d));
}
function iniciarLuz(){
  luzActiva=true;
  var ov=$("overlayLuz");
  ov.classList.remove("oculto");
  pasoLuz(0);
  toast("💡 Luz SOS activa");
}
function detenerLuz(){
  luzActiva=false;
  if(luzTimer){ clearTimeout(luzTimer); luzTimer=null; }
  var ov=$("overlayLuz");
  ov.classList.add("oculto"); ov.classList.remove("destello");
}

/* ============================================================
   COMPARTIR (Web Share API + fallback)
   ============================================================ */
function compartirApp(){
  var url=location.href.split("#")[0];
  var texto=DATOS.compartir.texto+url;
  if(navigator.share){
    navigator.share({ title:"SOS Colombia", text:DATOS.compartir.texto, url:url })
      .catch(function(){ /* cancelado */ });
  } else {
    abrirWhatsApp(texto);
  }
}

/* ============================================================
   ACCESIBILIDAD (letra, contraste, modo claro) — persistido
   ============================================================ */
var AJUSTES={ fs:17, contraste:false, claro:false };
function guardarAjustes(){ try{ localStorage.setItem("sosajustes", JSON.stringify(AJUSTES)); }catch(e){} }
function cargarAjustes(){
  try{
    var g=localStorage.getItem("sosajustes");
    if(g){
      var o=JSON.parse(g);
      if(o){
        if(typeof o.fs==="number") AJUSTES.fs=o.fs;
        if(typeof o.contraste==="boolean") AJUSTES.contraste=o.contraste;
        if(typeof o.claro==="boolean") AJUSTES.claro=o.claro;
        // si venía con el campo antiguo "oscuro", se ignora: el oscuro es ahora el tema por defecto
      }
    }
  }catch(e){}
  aplicarAjustes();
}
function aplicarAjustes(){
  document.documentElement.style.setProperty("--fs", AJUSTES.fs+"px");
  document.body.classList.toggle("contraste", AJUSTES.contraste);
  document.body.classList.toggle("claro", AJUSTES.claro);
  var bc=$("btnContraste"); if(bc) bc.textContent=AJUSTES.contraste?"Desactivar":"Activar";
  var bo=$("btnClaro"); if(bo) bo.textContent=AJUSTES.claro?"Desactivar":"Activar";
}
function cambiarLetra(delta){
  AJUSTES.fs=Math.min(24, Math.max(14, AJUSTES.fs+delta));
  aplicarAjustes(); guardarAjustes();
  toast("Tamaño de letra: "+AJUSTES.fs);
}

/* ============================================================
   INSTALACIÓN PWA
   ============================================================ */
var eventoInstalacion=null;
window.addEventListener("beforeinstallprompt", function(e){
  e.preventDefault(); eventoInstalacion=e;
});
function instalar(){
  if(eventoInstalacion){
    eventoInstalacion.prompt();
    eventoInstalacion.userChoice.then(function(){ eventoInstalacion=null; });
  } else {
    toast("Usa el menú del navegador (⋮) → 'Agregar a pantalla de inicio'", 4200);
  }
}

/* ============================================================
   RENDERIZADO DE CONTENIDO (desde DATOS)
   ============================================================ */
function renderNacionales(){
  var html="";
  DATOS.numerosNacionales.forEach(function(n){
    html+='<a class="llamada '+(n.color||"")+'" href="tel:'+n.num+'">'
        +'<span>'+esc(n.nombre)+'<small>'+esc(n.desc)+'</small></span>'
        +'<span class="num">'+esc(n.num)+'</span></a>';
  });
  $("numerosNacionales").innerHTML=html;
}

function renderDesastres(){
  var html="";
  DATOS.desastres.forEach(function(d, idx){
    html+='<div class="item-acordeon" data-idx="'+idx+'">'
        +'<button class="item-cab"><span class="ico">'+d.icono+'</span><span>'+esc(d.nombre)+'</span><span class="flecha">▼</span></button>'
        +'<div class="item-cuerpo">'
        +'<button class="btn-voz" data-voz="desastre" data-idx="'+idx+'">🔊 Escuchar</button>'
        +'<div class="mini-tabs">'
        +'<button class="activo" data-tab="antes">ANTES</button>'
        +'<button data-tab="durante">DURANTE</button>'
        +'<button data-tab="despues">DESPUÉS</button>'
        +'</div>'
        +'<div class="tab-panel" data-panel="antes">'+lista(d.antes)+'</div>'
        +'<div class="tab-panel oculto" data-panel="durante">'+lista(d.durante)+'</div>'
        +'<div class="tab-panel oculto" data-panel="despues">'+lista(d.despues)+'</div>'
        +'</div></div>';
  });
  $("listaDesastres").innerHTML=html;
}
function lista(arr){
  var h='<ul class="paso-lista">';
  arr.forEach(function(x){ h+="<li>"+esc(x)+"</li>"; });
  return h+"</ul>";
}

function renderCiudades(filtro){
  filtro=(filtro||"").toLowerCase();
  var html="";
  DATOS.ciudades.forEach(function(c){
    if(filtro && c.ciudad.toLowerCase().indexOf(filtro)<0) return;
    html+='<div class="tarjeta"><strong>'+esc(c.ciudad)+'</strong><ul>';
    c.lineas.forEach(function(l){ html+="<li><a href='tel:"+l.num+"'>"+esc(l.num)+"</a> — "+esc(l.desc)+"</li>"; });
    html+="</ul></div>";
  });
  if(!html) html='<p class="nota">No encontré esa ciudad. En toda Colombia funciona el <a href="tel:123">123</a>.</p>';
  $("listaCiudades").innerHTML=html;
}

function renderAtrapado(){
  $("atrapado").innerHTML=lista(DATOS.atrapado);
}

function renderAuxilios(){
  var html="";
  DATOS.auxilios.forEach(function(a, idx){
    var extra="";
    if(a.id==="rcp"){
      extra='<button class="btn-metronomo">'+DATOS.metronomo.iniciar+'</button>'
          +'<button class="btn-rcp-ciclo">'+DATOS.rcp.iniciar+'</button>'
          +'<p class="rcp-fase" id="rcpFase"></p>';
    }
    html+='<div class="item-acordeon" data-idx="'+idx+'" data-id="'+a.id+'">'
        +'<button class="item-cab"><span class="ico">'+a.icono+'</span><span>'+esc(a.nombre)+'</span><span class="flecha">▼</span></button>'
        +'<div class="item-cuerpo">'
        +'<button class="btn-voz" data-voz="auxilio" data-idx="'+idx+'">🔊 Escuchar</button>'
        +extra
        +lista(a.pasos)
        +'</div></div>';
  });
  $("listaAuxilios").innerHTML=html;
}

function renderVulnerables(){
  var html="";
  DATOS.vulnerables.forEach(function(v){
    html+='<div class="tarjeta"><strong>'+v.icono+' '+esc(v.nombre)+'</strong>'+lista(v.tips)+'</div>';
  });
  $("listaVulnerables").innerHTML=html;
}

function renderAyudaExtra(){
  $("listaAgua").innerHTML=lista(DATOS.agua);
  $("listaBotiquin").innerHTML=lista(DATOS.botiquin);
  $("donar").innerHTML='<p><strong>✅ Lo que más se necesita:</strong> '+esc(DATOS.donar.si)+'</p>'
    +'<p><strong>⚠️ '+esc(DATOS.donar.no)+'</strong></p>'
    +'<p>'+esc(DATOS.donar.voluntario)+'</p>';
  $("listaEstafas").innerHTML=lista(DATOS.estafas);
  var f='<ul>';
  DATOS.fuentes.forEach(function(x){ f+="<li><strong>"+esc(x.nombre)+"</strong> — "+esc(x.desc)+"</li>"; });
  f+="</ul>";
  $("listaFuentes").innerHTML=f;
  $("tipJac").innerHTML="🏘️ <strong>Tu JAC:</strong> "+esc(DATOS.jac);
  $("tipRadio").innerHTML="📻 "+esc(DATOS.radio);
}

function renderAcerca(){
  $("acerca").innerHTML='<p><strong>'+esc(DATOS.app.nombre)+'</strong> · versión '+esc(DATOS.app.version)+'</p>'
    +'<p>Actualizado: '+esc(DATOS.app.actualizado)+'</p>'
    +'<p>'+esc(DATOS.app.descripcion)+'</p>'
    +'<p class="nota">🔒 Esta app no recolecta tus datos ni necesita cuenta. Funciona sin internet después de abrirla una vez.</p>'
    +'<p class="nota">Fuentes: UNGRD, Cruz Roja Colombiana, Defensa Civil, Ministerio de Salud. Ante una emergencia real llama siempre al <a href="tel:123">123</a>.</p>';
}

function renderAccesos(){
  var accesos=[
    {ico:"🏚️", txt:"Sismo", page:"emergencias"},
    {ico:"💧", txt:"Agua segura", page:"ayuda"},
    {ico:"📞", txt:"Números", page:"emergencias"},
    {ico:"⛑️", txt:"Primeros auxilios", page:"auxilios"},
    {ico:"📣", txt:"Silbato SOS", accion:"silbato"},
    {ico:"💡", txt:"Luz SOS", accion:"luz"},
    {ico:"🤝", txt:"Cómo ayudar", page:"ayuda"},
    {ico:"🛑", txt:"Anti-estafas", page:"ayuda"}
  ];
  var html="";
  accesos.forEach(function(a,i){
    html+='<button class="acceso" data-i="'+i+'"><span class="ico">'+a.ico+'</span>'+esc(a.txt)+'</button>';
  });
  $("accesosRapidos").innerHTML=html;
  $("accesosRapidos")._datos=accesos;
}

function renderTodo(){
  renderNacionales(); renderDesastres(); renderCiudades(""); renderAtrapado();
  renderAuxilios(); renderVulnerables(); renderAyudaExtra(); renderAcerca(); renderAccesos();
  renderChecklist(); triajePaso("inicio"); svRenderChips();
}

/* ============================================================
   EVENTOS (delegación)
   ============================================================ */
function eventos(){
  // navegación inferior
  var nav=$("navInferior");
  nav.addEventListener("click", function(e){
    var b=e.target.closest(".nav-btn"); if(!b) return;
    location.hash="#/"+b.getAttribute("data-page");
  });

  // botones principales de inicio
  $("btnEstoyBien").addEventListener("click", function(){ enviarEstado("bien"); });
  $("btnNecesitoAyuda").addEventListener("click", function(){ enviarEstado("ayuda"); });
  $("btnEmergencia").addEventListener("click", botonEmergencia);
  $("btnCompartir").addEventListener("click", compartirApp);

  // SOS en vivo
  $("btnSosVivo").addEventListener("click", activarSosVivo);
  $("btnDetenerSos").addEventListener("click", detenerSosVivo);
  $("svChips").addEventListener("click", function(e){
    var chip=e.target.closest(".sv-chip");
    if(!chip) return;
    SV.tipo=chip.getAttribute("data-tipo");
    svRenderChips();
  });
  $("svCola").addEventListener("click", function(e){
    var item=e.target.closest(".sv-item");
    if(item) svEnviarA(+item.getAttribute("data-i"));
  });

  // chooser de canal: WhatsApp (con datos) o SMS (sin datos), apuntando al contacto ICE si existe
  $("chooserWhatsApp").addEventListener("click", function(){
    if(mensajePendiente) abrirWhatsApp(mensajePendiente, numeroPendiente);
    cerrarChooser();
  });
  $("chooserSMS").addEventListener("click", function(){
    if(mensajePendiente){ window.location.href=enlaceSMS(mensajePendiente, numeroPendiente); }
    cerrarChooser();
  });
  $("chooserCancelar").addEventListener("click", cerrarChooser);
  $("chooser").addEventListener("click", function(e){ if(e.target===this) cerrarChooser(); });

  // contactos de emergencia
  $("btnAgregarContacto").addEventListener("click", agregarContacto);
  $("chooserContactoCancelar").addEventListener("click", cerrarChooserContacto);
  $("chooserContacto").addEventListener("click", function(e){ if(e.target===this) cerrarChooserContacto(); });
  $("listaContactos").addEventListener("click", function(e){
    var b=e.target.closest(".ctc-borrar");
    if(b) borrarContacto(+b.getAttribute("data-i"));
  });
  $("chooserListaContactos").addEventListener("click", function(e){
    var b=e.target.closest(".ctc-elegir");
    if(b) elegirContactoEmergencia(+b.getAttribute("data-i"));
  });

  // mi ubicación (GPS sin internet)
  $("btnUbicacion").addEventListener("click", verUbicacion);
  $("btnCopiarUbic").addEventListener("click", copiarUbicacion);

  // ficha médica de emergencia
  $("btnFicha").addEventListener("click", verFichaGrande);
  $("btnGuardarFicha").addEventListener("click", guardarFicha);
  $("btnVerFicha").addEventListener("click", verFichaGrande);
  $("cerrarFicha").addEventListener("click", cerrarFichaGrande);
  $("overlayFicha").addEventListener("click", function(e){ if(e.target===this) cerrarFichaGrande(); });

  // voz global (lee la página actual)
  $("btnVozGlobal").addEventListener("click", function(){
    var page=(location.hash||"#/inicio").replace("#/","");
    hablar(textoDePagina(page));
  });

  // herramientas
  $("btnSilbato").addEventListener("click", function(){ silbatoActivo?detenerSilbato():iniciarSilbato(); });
  $("btnLuzSOS").addEventListener("click", iniciarLuz);
  $("cerrarLuz").addEventListener("click", detenerLuz);
  // silbato y luz SIEMPRE a la mano (barra superior)
  $("btnSilbatoTop").addEventListener("click", function(){
    if(silbatoActivo){ detenerSilbato(); toast("Silbato detenido"); }
    else { iniciarSilbato(); toast("📣 Silbato sonando — está en el volumen del celular", 3000); }
  });
  $("btnLuzTop").addEventListener("click", iniciarLuz);

  // accesibilidad
  $("btnLetraMenos").addEventListener("click", function(){ cambiarLetra(-1); });
  $("btnLetraNormal").addEventListener("click", function(){ AJUSTES.fs=17; aplicarAjustes(); guardarAjustes(); toast("Letra normal"); });
  $("btnLetraMas").addEventListener("click", function(){ cambiarLetra(+1); });
  $("btnContraste").addEventListener("click", function(){ AJUSTES.contraste=!AJUSTES.contraste; aplicarAjustes(); guardarAjustes(); });
  $("btnClaro").addEventListener("click", function(){ AJUSTES.claro=!AJUSTES.claro; aplicarAjustes(); guardarAjustes(); });

  // instalación
  $("btnInstalar").addEventListener("click", instalar);

  // buscador de ciudades
  $("buscadorCiudad").addEventListener("input", function(){ renderCiudades(this.value); });

  // triaje: volver y ver guía
  $("triajeVolver").addEventListener("click", triajeVolverAInicio);
  $("triajeGuia").addEventListener("click", triajeIrAGuia);

  // plan familiar
  $("btnGuardarPlan").addEventListener("click", guardarPlan);

  // acordeones + mini-tabs + voz por sección (delegación en contenido)
  $("contenido").addEventListener("click", function(e){
    // metrónomo RCP
    var bm=e.target.closest(".btn-metronomo");
    if(bm){ metronomoActivo?detenerMetronomo():iniciarMetronomo(); return; }
    // ciclo RCP 30:2
    var br=e.target.closest(".btn-rcp-ciclo");
    if(br){ rcpActivo?detenerRcpCiclo():iniciarRcpCiclo(); return; }
    // checklist del hogar
    var chk=e.target.closest(".chk-item");
    if(chk){
      var id=chk.getAttribute("data-chk");
      CHECK[id]=!CHECK[id];
      guardarCheckLS(); renderChecklist();
      return;
    }
    // triaje
    var tb=e.target.closest(".triaje-btn");
    if(tb){
      var v=tb.getAttribute("data-valor");
      if(v==="respondeSi") triajePaso("respondeSi");
      else if(v==="noResponde") triajePaso("noResponde");
      else if(v==="noRespira") triajeResultado("noRespira");
      else if(v==="inconscienteRespira") triajeResultado("siRespiraInconsciente");
      else if(v.indexOf("r:")===0) triajeResultado(v.slice(2));
      return;
    }
    // voz por sección
    var bv=e.target.closest(".btn-voz");
    if(bv){
      var tipo=bv.getAttribute("data-voz"), idx=+bv.getAttribute("data-idx");
      if(tipo==="desastre"){
        var d=DATOS.desastres[idx];
        hablar(d.nombre+". Antes: "+d.antes.join(". ")+". Durante: "+d.durante.join(". ")+". Después: "+d.despues.join(". "));
      } else if(tipo==="auxilio"){
        var a=DATOS.auxilios[idx];
        hablar(a.nombre+". "+a.pasos.join(". "));
      }
      return;
    }
    // mini-tabs antes/durante/después
    var tab=e.target.closest(".mini-tabs button");
    if(tab){
      var cuerpo=tab.closest(".item-cuerpo");
      var tabs=cuerpo.querySelectorAll(".mini-tabs button");
      for(var i=0;i<tabs.length;i++) tabs[i].classList.toggle("activo", tabs[i]===tab);
      var nombre=tab.getAttribute("data-tab");
      var paneles=cuerpo.querySelectorAll(".tab-panel");
      for(var j=0;j<paneles.length;j++){
        paneles[j].classList.toggle("oculto", paneles[j].getAttribute("data-panel")!==nombre);
      }
      return;
    }
    // acordeón
    var cab=e.target.closest(".item-cab");
    if(cab){
      cab.closest(".item-acordeon").classList.toggle("abierto");
      return;
    }
    // accesos rápidos
    var acc=e.target.closest(".acceso");
    if(acc){
      var datos=$("accesosRapidos")._datos;
      var item=datos[+acc.getAttribute("data-i")];
      if(item.accion==="silbato"){ silbatoActivo?detenerSilbato():iniciarSilbato(); }
      else if(item.accion==="luz"){ iniciarLuz(); }
      else if(item.page){ location.hash="#/"+item.page; }
      return;
    }
  });

  // online/offline
  function estadoRed(){
    var el=$("estadoRed");
    if(!el) return;
    el.textContent = navigator.onLine ? "Guía de emergencia" : "Sin internet — funcionando offline";
  }
  window.addEventListener("online", estadoRed);
  window.addEventListener("offline", estadoRed);
  estadoRed();
}

/* ============================================================
   SERVICE WORKER + ARRANQUE
   ============================================================ */
function registrarSW(){
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js").catch(function(){});
    // cuando el SW detecta versión nueva y toma control, la app se recarga sola
    navigator.serviceWorker.addEventListener("message", function(e){
      if(e.data==="NUEVA_VERSION"){
        toast("🔄 Versión nueva: actualizando…", 1500);
        setTimeout(function(){ location.reload(); }, 1500);
      }
    });
    // al volver a la app (desde segundo plano), buscar actualizaciones
    document.addEventListener("visibilitychange", function(){
      if(document.visibilityState==="visible"){
        navigator.serviceWorker.getRegistration().then(function(reg){
          if(reg) reg.update().catch(function(){});
        }).catch(function(){});
      }
    });
  }
}

function init(){
  cargarAjustes();
  cargarFicha();
  cargarContactos();
  cargarCheck();
  cargarPlan();
  renderTodo();
  eventos();
  registrarSW();
  ruta();
  if(!soportaVoz){
    var bg=$("btnVozGlobal"); if(bg) bg.style.display="none";
  }
  // WARM-UP del GPS: pedir el permiso UNA vez al abrir la app.
  // Así, cuando toque "Necesito ayuda" o el SOS, la ubicación ya está
  // autorizada y llega sin preguntar. No se muestra nada si falla.
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      function(pos){
        ubicacionActual={ lat:pos.coords.latitude.toFixed(5), lng:pos.coords.longitude.toFixed(5) };
      },
      function(){ /* permiso negado u error: silencio; se pedirá al usar */ },
      { timeout:10000, maximumAge:300000 }
    );
  }
}
if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

})();
