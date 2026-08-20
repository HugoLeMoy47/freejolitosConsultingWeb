# Aviso sobre licencias y marca

Este repositorio mezcla dos cosas con dueños distintos: **código**, que se comparte, y
**marca y contenido**, que no. Este archivo dice cuál es cuál.

---

## Bajo Licencia MIT — puedes usarlo

Todo el código. Cópialo, modifícalo y úsalo en tus proyectos, incluso comerciales, respetando
el aviso de copyright de [`LICENSE`](LICENSE).

| Archivo | Qué es |
|---|---|
| `assets/estilos.css` | Hoja de estilos completa: sistema de paneles, cortinilla de navegación con view transitions, estilos del modo terminal |
| `assets/terminal.js` | Motor del easter egg: reimprime el DOM como sesión de terminal, sin dependencias |
| `.claude/servidor.js` | Servidor estático de desarrollo con URLs limpias, 50 líneas de Node |
| `.claude/launch.json` | Configuración de arranque del servidor |
| La **estructura** de los `.html` | Maquetación, HTML semántico, esqueleto del JSON-LD, patrones de accesibilidad |
| `robots.txt` | Las reglas para rastreadores, como técnica |

Si lo que te interesa es la estructura de datos para agentes o el efecto de terminal, llévatelos
sin pedir permiso. Para eso está la MIT.

---

## Guías y artículos — Creative Commons Atribución 4.0 (CC BY 4.0)

**Las guías y los artículos** de este sitio —los archivos bajo `guias/` y sus fuentes correspondientes en `copy/`— se publican bajo licencia Creative Commons Atribución 4.0 Internacional (CC BY 4.0). Puedes copiarlos, adaptarlos y usarlos, incluso con fines comerciales, siempre que cites la fuente: Hugo Legorreta Moysén, freejolitos.consulting.

Esto **no** incluye el copy comercial del sitio —Inicio, Servicios, Cómo trabajo y Quién soy—, que queda con todos los derechos reservados junto con el logotipo, el nombre y la paleta.

---

---

## Con todos los derechos reservados — no puedes usarlo

**El logotipo.** `assets/logo.png` es un signo distintivo de Freejolitos Consultores. Una licencia
de software no otorga derechos sobre marcas. No se puede reproducir, adaptar ni usar en material
propio. Si reutilizas el código, **sustituye este archivo por el tuyo**.

**El nombre.** «Freejolitos», «Freejolitos Consultores» y el dominio asociado. No los uses de
forma que sugiera relación, respaldo u origen común.

**El copy.** Todo el texto comercial del sitio: el contenido de `copy/`, el texto visible dentro
de los `.html`, `llms.txt`, y las descripciones de `meta` y JSON-LD. Está escrito para un negocio
concreto y calibrado a una guía de voz específica. No es plantilla.

**La paleta y el sistema visual**, en la medida en que identifican a la marca. Los colores
concretos son parte de la identidad; las técnicas para aplicarlos, no.

---

## Confidencialidad

El sitio describe experiencia previa con **agencias del sistema de Naciones Unidas que trabajan
con población migrante**. Esa formulación es deliberadamente genérica: existe un acuerdo de
confidencialidad que impide identificar a las organizaciones.

**Los nombres no aparecen en ningún archivo de este repositorio, y es intencional.** No los
agregues —ni al código, ni a los comentarios, ni a los mensajes de commit, ni a las incidencias—
aunque los conozcas por otra vía.

---

## Si quieres reutilizar esto como plantilla

1. Sustituye `assets/logo.png` por tu logotipo.
2. Vacía `copy/` y reescribe el texto de los cinco `.html`.
3. Cambia la paleta al principio de `assets/estilos.css` (bloque `:root`).
4. Reescribe `llms.txt`, `sitemap.xml` y el `canonical` de cada página con tu dominio.
5. Sustituye los bloques JSON-LD: los datos de `ProfessionalService`, `Person` y `Offer` son de
   otra persona.

Con eso queda un sitio estático, accesible, sin dependencias de terceros y legible por agentes,
que es la parte que vale la pena copiar.

