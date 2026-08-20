# Sitio web — Freejolitos Consultores

Memoria técnica del proyecto. Si eres un agente y vas a tocar este repositorio, **lee esto
completo antes de editar nada**. Hay cuatro decisiones que se ven como errores y no lo son;
si las «arreglas», rompes accesibilidad o deshaces algo que el titular pidió expresamente.

Para el panorama general —qué es el sitio, cómo levantarlo, cómo desplegarlo— está
[README.md](README.md). Este archivo es lo que el README no dice: **por qué** está así.

> El razonamiento comercial del proyecto (lógica de precios, restricciones contractuales,
> prioridades de negocio) vive en un archivo local que no se versiona. Si necesitas una
> decisión de negocio que no esté aquí, pregúntasela al titular en vez de deducirla.

---

## 1. Las cinco reglas que mandan

Ganan sobre cualquier consideración estética o técnica.

1. **HTML estático.** Sin framework, sin build obligatorio, sin SPA.
2. **Todo el contenido existe en el HTML al cargar.** Prueba de fuego: desactiva JavaScript,
   recarga, y verifica que todo el texto sigue ahí. Si algo desaparece, está mal hecho.
3. **Una URL real por página.** Sin enrutamiento del lado del cliente.
4. **Cero dependencias de terceros que carguen en el navegador.** Nada de webfonts, analítica,
   CDN ni widgets. El titular vende protección de datos: el sitio no puede filtrar visitantes.
5. **Cifras explícitas en el texto.** Un agente no puede recomendar «contáctanos para
   cotización». Los precios van escritos, como texto, nunca como imagen.

---

## 2. Las cuatro desviaciones deliberadas

**Esta es la sección que evita que rompas algo.** Las cuatro están anotadas también en el
código, junto a la línea correspondiente.

| Qué | Por qué NO es un error |
|---|---|
| **`#6B6B6B` como texto secundario**, no el `#888888` de la paleta de marca | `#888888` sobre blanco da 3.54:1 y reprueba WCAG AA para texto normal, que es criterio de aceptación del proyecto. Las dos reglas se contradicen y ganó la accesibilidad. `#888888` sigue en el CSS como `--secundario-decorativo`, para bordes e iconografía. |
| **Cortinilla opaca de 1.2 s entre páginas** | Contradice la regla de «ninguna animación que retrase la aparición del contenido». Es una decisión explícita del titular, tomada con la contradicción sobre la mesa. Ver §4. |
| **Lienzo `#FAFEFE` en vez de `#FFFFFF`** | La paleta fija fondo blanco. `#FAFEFE` es `#D8FAF9` al 12 % sobre blanco — derivado de la paleta, no un gris inventado. Sin él no hay efecto de paneles flotando. |
| **Un script en la portada** (`assets/terminal.js`) | La regla 1 permite JavaScript «solo para lo que no se puede resolver sin él, y nunca para mostrar contenido». El easter egg del §5 cumple las dos: no se puede hacer sin JS, y no muestra contenido — lo reimprime. Sin JS la portada queda idéntica. |

---

## 3. Sistema visual

Paleta extraída del logotipo real. **No inventar colores.**

| Uso | Hex | Variable |
|---|---|---|
| Texto principal | `#343434` | `--texto` |
| Acento de marca | `#01CFCB` | `--acento` |
| Fondo de resaltes y tablas | `#D8FAF9` | `--resalte` |
| Texto secundario | `#6B6B6B` | `--secundario` |
| Bordes | `#CCCCCC` | `--borde` |
| Lienzo | `#FAFEFE` | `--lienzo` |

Tipografía: pila de sistema encabezada por Arial, para coherencia con los documentos de la
marca. **Sin webfonts** — evita una petición a un tercero y es coherente con la regla 4.

**Composición.** No hay líneas divisorias. Cada sección es un panel blanco redondeado (20 px)
flotando sobre el lienzo. Eso es lo que da la sensación de capas.

**Titular.** Peso normal (no negrita), interlínea 1.06, tracking −0.03em. Eso convierte la pila
Arial en tipografía de despliegue sin webfonts. Una frase por página va marcada en turquesa con
una barra gruesa a la altura de la base (`.marcado`), **no con subrayado**: los enlaces usan
línea de 2 px y no deben confundirse.

**El turquesa nunca es fondo de página completo ni bloque grande de color.** Los bloques oscuros
del cierre de página (`.slab`) y el pie (`.pie-caja`) son `#343434`, que es gris, no turquesa.

**Logotipo:** `assets/logo.png`, proporción 4.317:1, **100 % opaco con fondo blanco sólido**
(verificado píxel a píxel: cero transparencia). Nunca recolorear, recortar ni distorsionar.

### Diagramas

Doce SVG **en línea**, cero peticiones externas: tres en Inicio, tres en Servicios, cinco glifos
en Cómo trabajo, uno en Datos e IA.

**Todos llevan `aria-hidden="true"` y ninguno contiene texto** — verificado: cero elementos
`<text>`, `<title>` o `<desc>`. Son adorno puro. Si borras cualquiera, no se pierde información.
Eso es exactamente lo que exige la descubribilidad para agentes: nada importante dentro de una
imagen.

El diagrama de modalidades de `/servicios` redibuja la tabla a escala real. **La tabla es la
fuente**; el dibujo no aporta ningún dato que no esté ahí.

### Fichas

`/como-trabajo` está en cinco fichas numeradas 01–05, retícula 2 + 1 ancha + 2. Con tres columnas
quedaba un hueco en la primera fila. **La numeración la genera un contador de CSS**, no está en
el HTML: es cronología visual, no texto inventado.

### Interactividad sin JavaScript

- Preguntas frecuentes en `<details open>`. **Abiertas al cargar** y presentes en el HTML, así que
  un agente las lee igual. Plegar es comodidad del visitante, nunca condición para ver el texto.
- Diagramas que reaccionan al puntero y al foco de teclado. El estado de reposo ya es el completo:
  la interacción da énfasis, **nunca revela información**.
- Movimiento ligado al desplazamiento con `animation-timeline: view()`. Anima `translate`,
  **nunca la opacidad**: el contenido es visible en todo momento aunque la animación no corra. Va
  dentro de `@supports` y de `prefers-reduced-motion: no-preference`.
- **Menú móvil como casilla + etiqueta**, la misma técnica que el `<details>` de arriba: sin
  JavaScript, el navegador expone el estado marcado/no marcado de la casilla y la etiqueta hace de
  botón visual (`.menu-boton`, icono de tres barras en CSS puro — nada de SVG nuevo, para no mover
  el conteo de doce SVG de más abajo). Debajo de `40rem` de ancho la casilla oculta `.navegacion`
  hasta que se marca; arriba de ese ancho la casilla no se muestra y el menú se ve como siempre. Los
  seis enlaces del menú **siguen en el HTML en todo momento**, igual que el resto de la sección.

### Pie de página

Los enlaces del pie (`.pie-caja`) se agrupan en tres bloques dentro de la misma caja oscura —
**Sitio**, **Privacidad**, **Contacto** — en vez de una lista plana de once enlaces. Cada bloque es
un `.pie-grupo` con una etiqueta `.pie-titulo` (un `<span>`, no un encabezado: no debe alterar la
jerarquía de `h1`/`h2` de la página) y su `<ul>`. La estructura es **idéntica en las dieciséis
páginas**, generada del mismo bloque de HTML — si un agente edita el pie de una página a mano en vez
de replicar la estructura de otra, es el error más probable de reintroducir.

---

## 4. La cortinilla entre páginas

Al navegar, una cortina opaca cubre la pantalla, la página cambia debajo, y se descubre. Está
hecha con view transitions puras, **sin una línea de JavaScript**:

```css
::view-transition { background-color: var(--cortina); }      /* el lienzo ES la cortinilla */
::view-transition-old(root) { animation: cubrir  var(--cortina-tiempo) linear both; }
::view-transition-new(root) { animation: revelar var(--cortina-tiempo) linear var(--cortina-tiempo) both; }
```

Se quitaron **todos** los `view-transition-name` (logotipo, título, píldora del menú, tarjetas,
bloque de cierre). Con una cortinilla opaca esos elementos flotarían encima del color y se verían
mal — el logotipo es oscuro y sobre `#343434` desaparecería.

### Los dos botones

```css
--cortina: var(--texto);    /* #343434. Cámbialo a var(--acento) para la versión turquesa */
--cortina-tiempo: 0.6s;     /* 0.6 cubrir + 0.6 revelar = 1.2 s en total */
```

Está en 1.2 s **por petición expresa del titular**. Si resulta pesado, se baja ahí y en ningún
otro lado. El turquesa como color de cortinilla queda disponible pero **no activado**: una
cortinilla opaca es un fondo de página completo durante un segundo, y eso el sistema visual lo
prohíbe para el turquesa.

`prefers-reduced-motion` la desactiva por completo.

> **Nadie la ha visto correr.** Chrome omite todas las view transitions cuando
> `document.visibilityState === "hidden"`, así que no se puede observar desde un panel embebido.
> Se verificó que las cinco reglas llegan intactas al navegador y que `--cortina` resuelve a
> `#343434`, pero hay que abrirla en Chrome de escritorio para verla.
>
> **Pendiente de depurar (reportado 2026-08-19):** el titular probó en Chrome de escritorio real y
> la cortinilla no corrió al entrar o salir de `/guias`, `/aviso-de-privacidad`, `/terminos` ni
> `/como-manejo-tu-informacion`. Auditoría estática ya descartada como causa: las dieciséis páginas
> cargan la misma `estilos.css` con `@view-transition { navigation: auto; }`, ninguna tiene
> `view-transition-name` (la regla §2 se respeta en todas), no hay ids duplicados, ni tags sin
> cerrar, ni `<meta http-equiv>`/`<base>`/CSP en el HTML. Nada en el código explica por qué esas
> cuatro páginas específicamente se comportan distinto a `/`, `/servicios`, `/como-trabajo`,
> `/quien-soy` o las páginas individuales de `/guias/*`. Antes de tocar CSS por esto, abrir DevTools
> → Console durante la navegación fallida y ver si hay un aviso de la View Transitions API — es el
> único diagnóstico que falta.

---

## 5. Easter egg de la portada — «modo terminal»

**Cinco clics en el logotipo, en `/` y solo en `/`**, y la pantalla se reimprime como una sesión
de terminal: fósforo verde sobre negro, el texto tecleándose renglón por renglón, y lluvia de
katakana durante los primeros 2.2 s. Otros cinco clics en el logotipo la apagan; un clic en
cualquier enlace navega a esa página ya sin el efecto.

Motor en `assets/terminal.js` (~340 líneas, sin dependencias). Estilos al final de `estilos.css`,
bajo su propio encabezado. `index.html` es la única página que carga el script, y además hay una
guarda de ruta dentro: si alguien lo incluyera en otra página, no haría nada.

**Lo que hay que entender antes de tocarlo:**

- **No contiene ni una palabra de copy.** Lee el texto del DOM vivo al encenderse: `<h2>` → nombre
  de archivo del `cat`, `.linea-precio` → línea en turquesa, `<details>` → `? pregunta`,
  `.resalte` → bloque con barra, `.acciones` → `→ enlace`. Si editas el HTML, la terminal cambia
  sola. Si hubiera una segunda copia del texto en el JS, se desincronizaría y el verificador de
  copy del §7 empezaría a mentir. **No metas copy ahí.**
- **El contenido original nunca se destruye ni se oculta.** La terminal se monta encima; el sitio
  real sigue completo debajo, solo `inert`. Apagarla es quitar un `<div>`.
- **El logotipo va intacto sobre una pastilla blanca.** El PNG es opaco: sobre negro sería un
  rectángulo blanco, y el sistema visual prohíbe recolorearlo. La pastilla es la única salida
  honesta. **No le pongas un filtro CSS.**
- **`prefers-reduced-motion` desactiva el tecleo y la lluvia**, no el easter egg: aparece pintado
  de golpe. Los tres verdes pasan AA sobre el negro (14.9:1, 6.9:1 y 10.1:1).
- **En la portada, el logotipo ya no recarga la página.** El contador hace `preventDefault`. No es
  una pérdida: apuntaba a la página en la que ya estabas.
- Un clic en el fondo de la terminal termina el pintado de golpe, para no tener que esperarlo.

Verificado en navegador (antes del pie de tres columnas de 2026-08-19): enciende a los cinco clics
y no a los cuatro; el contador se reinicia pasados 1200 ms; el `<main>` queda idéntico; apaga,
devuelve el foco al logotipo y vuelve a encender; un enlace lleva a `/servicios` con el estilo
normal. Cero errores en consola y cero peticiones externas.

El conteo de «104 renglones y 8 enlaces vivos» quedó obsoleto con el pie agrupado: `guion()` sigue
leyendo `.pie-caja nav a` en vivo (§5, no hay una segunda copia del texto), así que el `ls ..` del
terminal ahora imprime once enlaces en vez de ocho, y el total de renglones cambió con ellos. No es
un bug — es el comportamiento documentado arriba —, pero el número exacto no se ha vuelto a contar
en Chrome de escritorio real.

> **Ojo al probarlo:** igual que la cortinilla, no se puede observar desde un panel embebido —
> Chrome detiene `requestAnimationFrame` en pestañas que no componen y el pintado se congela en el
> quinto carácter. Hay que abrirlo en Chrome de escritorio.

---

## 6. Reglas de contenido

**El copy de `copy/` es definitivo. No reescribirlo, no «mejorarlo», no agregarle entusiasmo.**
Está calibrado a una guía de voz específica. Si un texto no cabe en el diseño, se ajusta el
diseño.

**Voz:** primera persona del singular. Hugo habla, no la empresa. Cercano y directo, con un punto
de formalidad — profesional, nunca coloquial. Sin plural mayestático, sin «soluciones integrales»,
sin «aliado estratégico», sin épica.

### Prohibiciones firmes

- **No inventar** contenido, testimonios, cifras, logotipos de clientes ni «años de experiencia».
- **No identificar a las agencias cliente.** Existe un acuerdo de confidencialidad. La única
  formulación aprobada es «agencias del sistema de Naciones Unidas que trabajan con población
  migrante», y no se cambia ni se precisa más. **Sus nombres no están en ningún archivo de este
  repositorio, y es a propósito.** No los agregues —ni al código, ni a los comentarios, ni a los
  mensajes de commit, ni a las incidencias— aunque los conozcas por otra vía.
- **No agregar página de casos ni referencias a clientes concretos.** No está autorizada.
- **Los únicos precios publicables son los de paquete que aparecen en `copy/`.** No agregar
  ninguna otra cifra, de ningún otro tipo.
- **No agregar** formulario de contacto, blog, newsletter, chat en vivo, cookies ni banners de
  consentimiento. La acción principal es WhatsApp; la alternativa, correo.

### A/B testing — preparado, no activado

Existen dos versiones del copy de Inicio: `copy/01-inicio-A.md` (**la que se publica**) y
`copy/01-inicio-B.md` (en reserva). Construir **solo la A**. La estructura queda lista para que un
Worker de Cloudflare sirva una u otra en el borde más adelante.

**Nunca hacer el A/B en el cliente.** Si JavaScript intercambia el texto, un agente puede ver una
versión distinta a la del visitante, o ambas. Eso contamina exactamente lo que el sitio busca
lograr.

---

## 7. Verificar antes de dar algo por terminado

Los scripts sí están en el repositorio (`scripts/verify-copy.js`, `scripts/verify-semantic.js`,
`npm run verify:copy`). **Arreglados el 2026-08-19** — tenían dos bugs que inflaban los
«faltantes» a decenas por página incluso en texto sin tocar:

1) los rótulos internos del `.md` (`## H1`, `## Entrada`, `## Cierre`, `## Metadatos`, las notas en
   blockquote, las directivas `**JSON-LD:**`/`**Acción principal:**`) se comparaban tal cual contra
   el HTML renderizado, cuando nunca aparecen como texto visible — ahora se excluyen como
   «andamiaje» antes de verificar (`isScaffoldBlock` en ambos scripts; **Title:**/**Meta
   description:** sí se comparan, pero sin el rótulo).
2) en `verify-semantic.js`, `htmlCandidates()` insertaba saltos de línea para partir la página en
   candidatos por párrafo, pero llamaba a `stripHtml()` después, cuya normalización de espacios se
   comía esos saltos — el documento entero quedaba como un solo candidato gigante y la similitud de
   coseno se diluía a casi cero para todo, incluso texto idéntico palabra por palabra. Ahora usa un
   separador que no es whitespace.
3) los bloques **Title:**/**Meta description:** se buscaban como texto de página, pero
   `<meta name="description" content="...">` guarda su texto en un **atributo**, no entre tags —
   quitar los tags se lo llevaba entero. Ahora se lee el atributo directamente y se compara por
   igualdad, no por búsqueda de texto.

**Ambos scripts corren mejor juntos que solos:** el de comparación literal (`verify-copy.js`) usa
solapamiento de palabras con un umbral del 60 %, que en oraciones cortas con vocabulario común
("información", "inteligencia artificial") puede dar falso positivo de coincidencia aunque la frase
exacta no esté; el semántico (`verify-semantic.js`, n-gramas + coseno) es más estricto ahí y atrapa
ausencias que el literal deja pasar. Ver el ejemplo real en el punto 1.

1. **Fidelidad del copy.** Comparar el texto renderizado de cada página contra su archivo en
   `copy/`, ignorando `<script>`, `<svg>`, comentarios y andamiaje editorial (ver arriba). Estado a
   2026-08-19 tras el arreglo (`npm run verify:copy` y `node scripts/verify-semantic.js`): **las
   cinco páginas en 0 discrepancias en los dos scripts**, salvo la única ausencia esperada de
   siempre — el bloque comentado de `como-manejo-tu-informacion` (bloqueado hasta que el titular
   migre a un plan comercial de IA). El resto de la divergencia que hubo en esa página (detallada
   antes en §8) se resolvió el mismo día: el titular confirmó que la página en vivo es la versión
   correcta, y `copy/05` se actualizó para igualarla — no se tocó el HTML.
2. **Auditoría del DOM.** Un `h1` por página, cero saltos de jerarquía, cero ids duplicados, cero
   anclas rotas, JSON-LD que parsea, doce SVG sin texto dentro (`como-manejo-tu-informacion.html`
   recuperó el suyo el 2026-08-19 — datos reales aislados en caja punteada tachada, datos ficticios
   fluyendo hacia el sistema; adorno puro, cero información nueva), siete `<details>` abiertos en
   Inicio, cero peticiones a dominios externos. **Un solo script en todo el sitio**
   (`assets/terminal.js`, únicamente en la portada, §5): si aparece otro, es un error. El
   menú (seis enlaces) y el pie (tres grupos, once enlaces) deben ser byte-por-byte idénticos en las
   dieciséis páginas — ver «Pie de página» en §3.

Contraste verificado, todos los pares pasan AA: 12.45 texto sobre panel · 12.26 sobre lienzo ·
5.25 secundario · 11.24 sobre resalte · 6.40 botón · 9.79 y 12.45 en bloque oscuro · 7.75 pie.

Sin desbordamiento horizontal a 375 px ni a 1280 px. La tabla de modalidades desplaza dentro de su
propia caja, no arrastra la página.

---

## 8. Lo que falta

1. **Verificar el alias de correo.** El WhatsApp ya es real: `wa.me/525533444852`, confirmado por
   el titular el 12 de agosto de 2026 y presente en las dieciséis páginas. Falta comprobar que
   `hola@freejolitos.consulting` exista como reenvío en el registrador — el dominio tiene MX
   activos, pero si el alias no está dado de alta, el correo rebota y el sitio anuncia una
   dirección muerta.
2. **Validar el JSON-LD** con la herramienta de resultados enriquecidos de Google. Requiere URL
   pública; hasta ahora solo se validó que parsea.
3. **Ver el sitio con ojos humanos.** Nadie ha visto una captura.
4. **`/casos` no existe** y con razón — §6 prohíbe agregar una página de casos sin autorización.
   `/guias` sí existe, con siete guías publicadas, en la navegación y en `sitemap.xml`.
5. **Depurar por qué la cortinilla del §4 no corre** en `/guias`, `/aviso-de-privacidad`,
   `/terminos` ni `/como-manejo-tu-informacion` en Chrome de escritorio real — nota añadida en §4.
6. **Scripts de verificación (`scripts/verify-*.js`): arreglados el 2026-08-19** — ver el detalle
   en §7. Ya no hace falta reconciliarlos con una cifra manual aparte.
7. **SVG de `como-manejo-tu-informacion.html`: repuesto el 2026-08-19.** Se había perdido en el
   cambio de nombre de `datos-e-ia.html`. El inventario de doce del §3 vuelve a cuadrar.
8. **`como-manejo-tu-informacion.html` había divergido de `copy/05` — resuelto el 2026-08-19.**
   Con los dos scripts arreglados de §7 corriendo juntos salió a la luz que la página se había
   reescrito a mano después del cambio de nombre de `datos-e-ia.html` sin que `copy/05` se
   actualizara: el `<h1>`, el párrafo de apertura, dos oraciones más, el `<title>` y el meta
   description ya no coincidían, y hasta el propio título del archivo de copy («Qué pasa con la
   información de tu organización») seguía con el nombre viejo de la página. El titular confirmó que
   la página en vivo es la versión correcta; **`copy/05` se reescribió para igualarla**, título del
   documento incluido (ahora `# Cómo manejo tu información`). El HTML no se tocó. El bloque
   comentado sigue igual — sigue bloqueado hasta que el titular migre a un plan comercial de IA, ver
   el punto 9.
9. **Descomentar el bloque de términos comerciales** de `como-manejo-tu-informacion.html` cuando corresponda. Está
   comentado con la razón escrita al lado.

