/* =============================================================================
   Easter egg de la portada — «modo terminal»
   -----------------------------------------------------------------------------
   Cinco clics en el logotipo, en / y solo en /, y la pantalla se reimprime como
   una sesión de terminal. Otros cinco clics en el logotipo la apagan; un clic en
   cualquier enlace navega a esa página ya sin el efecto.

   POR QUÉ ESTO NO ROMPE LAS REGLAS DEL CLAUDE.md

   §2 «todo el contenido existe en el HTML al cargar» — este archivo no aporta ni
   una palabra de copy. Todo el texto que la terminal imprime lo LEE del DOM en el
   momento de encenderse. Sin JavaScript, el easter egg simplemente no existe y la
   página queda idéntica. Si editas el copy del HTML, la terminal cambia sola: no
   hay una segunda copia que se desincronice.

   §7 «prohibido el contenido con opacity:0 esperando a JavaScript» — el contenido
   original nunca se destruye ni se oculta al cargar. La terminal es una capa que
   se monta ENCIMA, y solo después de un gesto deliberado de cinco clics. Ningún
   agente la ve; ningún visitante la encuentra por accidente.

   §6 «nunca recolorear, recortar ni distorsionar el logotipo» — el PNG es opaco y
   de fondo blanco, así que dentro de la terminal va sobre una pastilla blanca,
   sin filtros. Es el único elemento de la pantalla que conserva su color real.

   prefers-reduced-motion — se respeta: sin tecleo y sin lluvia, la terminal
   aparece pintada de golpe. El easter egg sigue estando; lo que se va es el
   movimiento.
   ============================================================================= */

(function () {
  "use strict";

  /* Solo la portada. /servicios y las demás no lo cargan siquiera. */
  if (!/^\/(index\.html)?$/.test(location.pathname)) return;

  var marca = document.querySelector(".marca");
  if (!marca || !document.querySelector("main")) return;

  var PROMPT = "freejolitos@consulting:~$";
  var CLICS = 5;
  var VENTANA = 1200; /* ms entre clics para que cuenten como seguidos */

  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)");
  var tty = null;
  var raf = 0;

  /* ---------------------------------------------------------------- gesto -- */

  function alQuintoClic(el, hacer) {
    var n = 0;
    var ultimo = 0;
    el.addEventListener("click", function (ev) {
      /* En la portada el logotipo apunta a la página en la que ya estás: no
         perdemos ninguna navegación real al frenar el clic. */
      ev.preventDefault();
      var ahora = Date.now();
      n = ahora - ultimo < VENTANA ? n + 1 : 1;
      ultimo = ahora;
      if (n >= CLICS) {
        n = 0;
        hacer();
      }
    });
  }

  /* ------------------------------------------------------------- lectura -- */

  function limpio(el) {
    return el.textContent.replace(/\s+/g, " ").trim();
  }

  /* Devuelve la lista de renglones a imprimir, leída del DOM vivo. */
  function guion() {
    var L = [];

    function add(clase, texto, href) {
      L.push({ clase: clase, texto: texto, href: href || null });
    }
    function cmd(t) {
      add("cmd", t);
    }
    function vacia() {
      add("vacia", "");
    }

    cmd("whoami");
    var pie = document.querySelector(".pie-caja p");
    /* innerText respeta los <br> del pie; textContent los aplastaría en un
       renglón y «Freejolitos Consultores Hugo Legorreta» se leería como un
       solo nombre. */
    (pie ? pie.innerText.split("\n") : ["Freejolitos Consultores"]).forEach(function (t) {
      if (t.trim()) add("tenue", t.trim());
    });
    vacia();

    var portada = document.querySelector(".portada");
    if (portada) {
      cmd("cat propuesta.txt");
      var h1 = portada.querySelector("h1");
      if (h1) add("titulo", limpio(h1).toUpperCase());
      var sub = portada.querySelector(".subtitulo");
      if (sub) add("tenue", limpio(sub));
      vacia();
    }

    var secciones = document.querySelectorAll("main section.panel, main section.slab");
    Array.prototype.forEach.call(secciones, function (sec) {
      var h2 = sec.querySelector("h2");
      if (!h2) return;
      cmd("cat " + (h2.id || "seccion") + ".txt");
      add("h2", "[ " + limpio(h2).toUpperCase() + " ]");
      cuerpo(sec, add, "");
      vacia();
    });

    /* El menú, como un ls. Los textos salen del pie, que los tiene descriptivos. */
    cmd("ls ..");
    var menu = document.querySelectorAll(".pie-caja nav a");
    Array.prototype.forEach.call(menu, function (a) {
      var ruta = a.getAttribute("href");
      add("dir", "  " + (ruta + "                ").slice(0, 17) + limpio(a), ruta);
    });
    vacia();

    return L;
  }

  /* Recorre los hijos de un nodo respetando el orden del documento. */
  function cuerpo(nodo, add, sangria) {
    Array.prototype.forEach.call(nodo.children, function (el) {
      elemento(el, add, sangria);
    });
  }

  /* Cada caso especial está aquí; lo que no reconoce, lo recorre hacia dentro. */
  function elemento(el, add, sangria) {
    /* Los doce SVG del sitio son adorno y van todos con aria-hidden. */
    if (el.getAttribute("aria-hidden") === "true") return;

    var etiqueta = el.tagName.toUpperCase();

    if (etiqueta === "H2") return; /* ya se imprimió como encabezado */

    if (etiqueta === "P") {
      parrafo(el, add, sangria);
      return;
    }

    if (etiqueta === "H3") {
      add("sub", sangria + "▸ " + limpio(el));
      return;
    }

    if (etiqueta === "DETAILS") {
      var pregunta = el.querySelector("summary");
      if (pregunta) add("pregunta", sangria + "? " + limpio(pregunta));
      /* Solo los hermanos del <summary>: recorrer el <details> entero volvería
         a imprimir la pregunta, ahora como <h3>. */
      Array.prototype.forEach.call(el.children, function (hijo) {
        if (hijo.tagName.toUpperCase() === "SUMMARY") return;
        elemento(hijo, add, sangria + "  ");
      });
      return;
    }

    if (el.classList.contains("resalte")) {
      cuerpo(el, add, sangria + "│ ");
      return;
    }

    if (el.classList.contains("acciones")) {
      Array.prototype.forEach.call(el.querySelectorAll("a"), function (a) {
        add("accion", sangria + "→ " + limpio(a), a.getAttribute("href"));
      });
      return;
    }

    if (etiqueta === "A") {
      add("enlace", sangria + "↳ " + limpio(el), el.getAttribute("href"));
      return;
    }

    if (el.children.length) cuerpo(el, add, sangria);
  }

  function parrafo(p, add, sangria) {
    /* Un <p> que solo envuelve un enlace es un enlace, no un párrafo. Comparar
       los textos importa: un párrafo con un enlace incrustado a media frase
       también tiene un solo hijo elemento, y no es lo mismo. */
    var unico = p.children.length === 1 ? p.children[0] : null;
    if (unico && unico.tagName.toUpperCase() === "A" && limpio(unico) === limpio(p)) {
      add("enlace", sangria + "↳ " + limpio(p), unico.getAttribute("href"));
      return;
    }

    var clase = p.classList.contains("linea-precio")
      ? "precio"
      : p.classList.contains("subtitulo")
        ? "tenue"
        : "texto";
    add(clase, sangria + limpio(p));

    /* Los enlaces incrustados en un párrafo salen como nota al pie: en una
       terminal no hay dónde hacer clic dentro de una frase. */
    Array.prototype.forEach.call(p.querySelectorAll("a"), function (a) {
      add("enlace", sangria + "  ↳ " + a.getAttribute("href") + "   " + limpio(a), a.getAttribute("href"));
    });
  }

  /* -------------------------------------------------------------- ajuste -- */

  /* Corta duro a N columnas, como una terminal de verdad: sin reflujo.
     Conserva el adorno de la izquierda («  », «│ », «▸ », «  ↳ ») en la primera
     línea y lo convierte en espacios para las siguientes, de modo que el bloque
     queda alineado. Partir con split(" ") a secas se comía la sangría inicial. */
  function envolver(t, cols) {
    if (t.length <= cols) return [t];

    var adorno = t.match(/^[^\wÁÉÍÓÚÑáéíóúñ¿¡$"'(]*/)[0];
    var sigue = adorno.replace(/\S/g, " ") + "  ";
    var palabras = t.slice(adorno.length).split(/ +/).filter(Boolean);

    var salida = [];
    var linea = adorno;
    var estrenando = true;

    palabras.forEach(function (palabra) {
      var prueba = estrenando ? linea + palabra : linea + " " + palabra;
      if (prueba.length > cols && !estrenando) {
        salida.push(linea);
        linea = sigue + palabra;
      } else {
        linea = prueba;
      }
      estrenando = false;
    });

    if (!estrenando) salida.push(linea);
    return salida.length ? salida : [t];
  }

  function columnas(flujo) {
    var regla = document.createElement("span");
    regla.className = "ln";
    regla.style.position = "absolute";
    regla.style.visibility = "hidden";
    regla.textContent = new Array(101).join("M");
    flujo.appendChild(regla);
    var ancho = regla.getBoundingClientRect().width / 100;
    flujo.removeChild(regla);
    var n = Math.floor((flujo.clientWidth - 4) / (ancho || 8));
    return Math.max(26, Math.min(82, n));
  }

  /* -------------------------------------------------------------- pintar -- */

  function renglon(L) {
    var div = document.createElement("div");
    div.className = "ln ln-" + L.clase;

    if (L.clase === "cmd") {
      var p = document.createElement("span");
      p.className = "ln-prompt";
      p.textContent = PROMPT + " ";
      div.appendChild(p);
    }

    var caja;
    if (L.href) {
      caja = document.createElement("a");
      caja.href = L.href;
    } else {
      caja = document.createElement("span");
    }
    var nodo = document.createTextNode("");
    caja.appendChild(nodo);
    div.appendChild(caja);

    return { el: div, nodo: nodo, texto: L.texto, clase: L.clase };
  }

  function pintar(flujo, lineas, alTerminar) {
    var i = 0;
    var actual = null;
    var j = 0;
    var coste = 8;
    var pausa = 0;
    var saltar = quieto.matches;

    function terminar() {
      raf = 0;
      var cursor = document.createElement("div");
      cursor.className = "ln ln-cmd ln-cursor";
      var p = document.createElement("span");
      p.className = "ln-prompt";
      p.textContent = PROMPT + " ";
      cursor.appendChild(p);
      flujo.appendChild(cursor);
      if (alTerminar) alTerminar();
    }

    function paso() {
      if (pausa > 0 && !saltar) {
        pausa--;
        raf = requestAnimationFrame(paso);
        return;
      }

      var cupo = saltar ? Infinity : 260;

      while (cupo > 0) {
        if (!actual) {
          if (i >= lineas.length) {
            terminar();
            return;
          }
          actual = renglon(lineas[i]);
          flujo.appendChild(actual.el);
          j = 0;
          /* El comando se teclea; la salida se vuelca. */
          coste = actual.clase === "cmd" ? 62 : 8;
          if (actual.texto === "") {
            i++;
            actual = null;
            continue;
          }
        }

        if (j >= actual.texto.length) {
          var era = actual.clase;
          i++;
          actual = null;
          if (era === "cmd" && !saltar) {
            pausa = 7;
            break;
          }
          continue;
        }

        j += 1;
        actual.nodo.nodeValue = actual.texto.slice(0, j);
        cupo -= coste;
      }

      flujo.parentNode.scrollTop = flujo.parentNode.scrollHeight;
      raf = requestAnimationFrame(paso);
    }

    paso();

    return function () {
      saltar = true;
    };
  }

  /* -------------------------------------------------------------- lluvia -- */

  function lluvia(cv) {
    var glifos = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789$#@%&*";
    var ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var paso = 16;
    var cols, gotas, id;

    function medir() {
      cv.width = Math.floor(cv.clientWidth * dpr);
      cv.height = Math.floor(cv.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(cv.clientWidth / paso);
      gotas = [];
      for (var k = 0; k < cols; k++) {
        gotas[k] = Math.random() * -60;
      }
    }
    medir();

    function cuadro() {
      ctx.fillStyle = "rgba(5, 10, 7, 0.09)";
      ctx.fillRect(0, 0, cv.clientWidth, cv.clientHeight);
      ctx.font = paso - 2 + "px ui-monospace, Consolas, monospace";
      for (var k = 0; k < cols; k++) {
        var g = glifos.charAt(Math.floor(Math.random() * glifos.length));
        var y = gotas[k] * paso;
        ctx.fillStyle = Math.random() > 0.96 ? "#D8FFE6" : "#2BD96B";
        ctx.fillText(g, k * paso, y);
        if (y > cv.clientHeight && Math.random() > 0.975) gotas[k] = 0;
        gotas[k] += 1;
      }
      id = requestAnimationFrame(cuadro);
    }
    cuadro();

    return function detener() {
      cancelAnimationFrame(id);
    };
  }

  /* ------------------------------------------------------------ encender -- */

  function encender() {
    if (tty) return;

    var lineas = guion();

    tty = document.createElement("div");
    tty.id = "tty";
    tty.setAttribute("role", "dialog");
    tty.setAttribute("aria-label", "Modo terminal");

    var cv = document.createElement("canvas");
    cv.className = "tty-lluvia";
    cv.setAttribute("aria-hidden", "true");

    var barra = document.createElement("div");
    barra.className = "tty-barra";

    var boton = document.createElement("button");
    boton.type = "button";
    boton.className = "tty-marca";
    boton.setAttribute("aria-label", "Salir del modo terminal: cinco clics en el logotipo");
    var img = document.createElement("img");
    img.src = "/assets/logo.png";
    img.width = 2245;
    img.height = 520;
    img.alt = "Freejolitos Consultores";
    boton.appendChild(img);

    var pista = document.createElement("p");
    pista.className = "tty-pista";
    pista.textContent = "cinco clics en el logotipo para volver";

    barra.appendChild(boton);
    barra.appendChild(pista);

    var flujo = document.createElement("div");
    flujo.className = "tty-flujo";

    tty.appendChild(cv);
    tty.appendChild(barra);
    tty.appendChild(flujo);
    document.body.appendChild(tty);

    /* El sitio real sigue ahí, entero. Solo queda fuera del foco y del ratón. */
    ["header", "main", "footer"].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) el.inert = true;
    });
    document.documentElement.classList.add("tty-activo");

    var cols = columnas(flujo);
    var extendidas = [];
    lineas.forEach(function (L) {
      envolver(L.texto, cols).forEach(function (t, k) {
        extendidas.push({
          clase: k === 0 ? L.clase : L.clase === "cmd" ? "texto" : L.clase,
          texto: t,
          href: k === 0 ? L.href : null
        });
      });
    });

    var detener = null;
    if (!quieto.matches) {
      detener = lluvia(cv);
      setTimeout(function () {
        cv.classList.add("tty-lluvia-fin");
      }, 2200);
      setTimeout(function () {
        if (detener) detener();
        if (cv.parentNode) cv.parentNode.removeChild(cv);
      }, 3200);
    } else {
      cv.parentNode.removeChild(cv);
    }

    var saltar = pintar(flujo, extendidas, null);

    /* Clic en el fondo: termina el pintado de golpe. */
    flujo.addEventListener("click", function (ev) {
      if (ev.target.closest("a")) return;
      saltar();
    });

    alQuintoClic(boton, apagar);
    boton.focus();
  }

  function apagar() {
    if (!tty) return;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    tty.parentNode.removeChild(tty);
    tty = null;
    ["header", "main", "footer"].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) el.inert = false;
    });
    document.documentElement.classList.remove("tty-activo");
    marca.focus();
  }

  alQuintoClic(marca, encender);
})();
