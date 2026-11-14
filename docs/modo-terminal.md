# Easter egg de la portada — «modo terminal»

Lectura bajo demanda: las reglas que mandan están en [CLAUDE.md](../CLAUDE.md).

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
  copy de la verificación de copy (ver CLAUDE.md, «Verificar») empezaría a mentir. **No metas copy ahí.**
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

## Historial

| Fecha | Cambio |
|---|---|
| 2026-11-14 | Se separa de `CLAUDE.md` (antes §5) para leerlo bajo demanda. Texto sin cambios salvo una referencia de sección. |
