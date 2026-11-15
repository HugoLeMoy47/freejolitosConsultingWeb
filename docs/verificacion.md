# Verificación: historia de los scripts y contrastes

Lectura bajo demanda. La lista de qué verificar está en [CLAUDE.md](../CLAUDE.md).

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
   menú (siete enlaces) y el pie (tres grupos, doce enlaces) deben ser byte-por-byte idénticos en
   todas las páginas — ver «Pie de página» en §3.

Contraste verificado, todos los pares pasan AA: 12.45 texto sobre panel · 12.26 sobre lienzo ·
5.25 secundario · 11.24 sobre resalte · 6.40 botón · 9.79 y 12.45 en bloque oscuro · 7.75 pie ·
12.45 enlaces de texto dentro de `.slab` (blancos desde 2026-09-23; antes heredaban `#343434` sobre
`#343434` y eran invisibles en dieciséis páginas).

Sin desbordamiento horizontal a 375 px ni a 1280 px. La tabla de modalidades desplaza dentro de su
propia caja, no arrastra la página.

---

## Historial

| Fecha | Cambio |
|---|---|
| 2026-11-14 | Se separa de `CLAUDE.md` (antes §7) para leerlo bajo demanda. Texto sin cambios. |
