# Sistema visual

Lectura bajo demanda: las reglas que mandan están en [CLAUDE.md](../CLAUDE.md).

Paleta extraída del logotipo real. **No inventar colores.**

| Uso | Hex | Variable |
|---|---|---|
| Texto principal | `#343434` | `--texto` |
| Acento de marca | `#01CFCB` | `--acento` |
| Fondo de resaltes y tablas | `#D8FAF9` | `--resalte` |
| Texto secundario | `#6B6B6B` | `--secundario` |
| Bordes | `#CCCCCC` | `--borde` |
| Lienzo | `#FAFEFE` | `--lienzo` |

**Excepción — colores de estado, no de marca.** El `.termometro` de
`guias/diez-senales-equipo-necesita-atencion.html` usa rojo/ámbar/verde para severidad
(`.termometro-bajo/-medio/-critico` en `estilos.css`). No son parte de la paleta de arriba — señalan
riesgo, no identidad — así que "no inventar colores" no aplica ahí. Antes vivían como `style=`
inline sin verificar contraste (el verde de cifra daba 1.84:1 sobre su fondo); ahora son clases con
tonos oscuros elegidos para ≥4.5:1. Si se agrega un segundo widget de severidad, reusar estas clases
en vez de inventar un tercer set de colores.

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
  ocho enlaces del menú (incluyendo `/productos` y `/laboratorio`) **siguen en el HTML en todo momento**, igual que el resto de la sección.
- **Checklists de las guías** (`<input type="checkbox">` dentro de `<li>`): cada casilla va envuelta
  en `<label>` — nombre accesible para lector de pantalla, y clic en el texto marca la casilla (un
  solo hit-target, sin zona muerta). El estilo (`estilos.css`, sección «Listas de verificación») usa
  `label:has(input[type="checkbox"])` para dar área de toque y `:hover` a las 75 casillas de los 6
  archivos de `/guias/*` sin tocar el HTML de cada una — si agregas una guía nueva con checklist,
  basta con `<li><label><input type="checkbox"> texto</label></li>`, el CSS ya la alcanza.

### Pie de página

Los enlaces del pie (`.pie-caja`) se agrupan en tres bloques dentro de la misma caja oscura —
**Sitio**, **Privacidad**, **Contacto** — en vez de una lista plana de doce enlaces. Cada bloque es
un `.pie-grupo` con una etiqueta `.pie-titulo` (un `<span>`, no un encabezado: no debe alterar la
jerarquía de `h1`/`h2` de la página) y su `<ul>`. La estructura es **idéntica en todas las
páginas**, generada del mismo bloque de HTML — si un agente edita el pie de una página a mano en vez
de replicar la estructura de otra, es el error más probable de reintroducir.

---

## Historial

| Fecha | Cambio |
|---|---|
| 2026-11-14 | Se separa de `CLAUDE.md` (antes §3) para leerlo bajo demanda. Texto sin cambios. |
