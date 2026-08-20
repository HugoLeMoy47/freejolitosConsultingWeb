# Sitio web — Freejolitos Consultores

Sitio profesional de **Hugo Legorreta**, consultor independiente de TI que trabaja con
organizaciones de la sociedad civil mexicanas del sector de movilidad humana: casas de migrantes,
albergues y organizaciones que atienden población migrante y refugiada.

HTML estático escrito a mano. Sin framework, sin proceso de build, sin una sola dependencia que
cargue en el navegador.

> **Estado: en despliegue** en <https://freejolitos.consulting>. Ver
> [Antes de publicar](#antes-de-publicar) para lo que falta cerrar.

---

## Por qué está hecho así

El sitio no busca tráfico masivo — el nicho casi no tiene volumen de búsqueda. Tiene tres
trabajos, y el orden importa:

1. **Aguantar el googleo posterior a una recomendación.** De ahí viene casi todo el tráfico real.
2. **Dominar el nombre propio** en buscadores.
3. **Ser encontrable y citable por agentes de IA.** Es la apuesta diferenciadora del proyecto, y
   la razón de la mitad de las decisiones técnicas.

De ahí salen cinco reglas que mandan sobre cualquier consideración estética o técnica:

| # | Regla | Por qué |
|---|---|---|
| 1 | HTML estático, sin framework ni SPA | Un agente lee HTML, no ejecuta tu aplicación |
| 2 | **Todo el contenido existe en el HTML al cargar** | Prueba de fuego: desactiva JavaScript, recarga. Si algo desaparece, está mal hecho |
| 3 | Una URL real por página | Sin enrutamiento del lado del cliente |
| 4 | **Cero dependencias de terceros en el navegador** | El cliente vende protección de datos. El sitio no puede filtrar visitantes a nadie |
| 5 | Cifras explícitas en el texto | Un agente no puede recomendar «contáctanos para cotización». Los precios van escritos |

La regla 4 es literal: sin Google Fonts, sin analítica, sin CDN, sin widgets. Los doce diagramas
son SVG en línea y la tipografía es pila de sistema. **Una carga de página son cuatro peticiones
como máximo, todas al propio dominio** — HTML, hoja de estilos, logotipo y, solo en la portada, el
script del easter egg.

---

## Levantar el sitio en local

**No funciona abriendo los `.html` con doble clic.** Las rutas son absolutas desde la raíz, así
que bajo `file://` se resuelven contra la raíz del disco: no carga el CSS ni el logotipo, y todos
los enlaces dan 404. Además `file://` no permite transiciones entre documentos.

Necesitas servirlo por HTTP. El servidor viene incluido — 50 líneas de Node, sin dependencias:

```bash
node .claude/servidor.js
```

Y abre <http://localhost:4321>. Acepta otro puerto como argumento.

Hace dos cosas que importan: mapea `/servicios` → `servicios.html` igual que Cloudflare Pages, y
manda `Cache-Control: no-store`, sin lo cual el navegador cachea el CSS y no ves tus cambios.

> Vive en `.claude/` a propósito: Cloudflare Pages ignora los directorios que empiezan con punto,
> así que no se despliega junto al sitio.

---

## Estructura

```
.
├── index.html              Inicio
├── servicios.html          Servicios y precios
├── como-trabajo.html       Cómo trabajo
├── quien-soy.html          Quién soy
├── como-manejo-tu-informacion.html  Datos e IA
├── 404.html                noindex, sin canonical, sin JSON-LD
│
├── wrangler.jsonc          Configuración de despliegue en Cloudflare
├── .assetsignore           Qué del repositorio NO se publica en el sitio
│
├── copy/                   ← FUENTE DE VERDAD del texto
│   ├── 01-inicio-A.md          versión publicada
│   ├── 01-inicio-B.md          variante en reserva, para A/B futuro
│   ├── 02-servicios.md
│   ├── 03-como-trabajo.md
│   ├── 04-quien-soy.md
│   └── 05-como-manejo-tu-informacion.md
│
├── assets/
│   ├── estilos.css         Hoja única
│   ├── terminal.js         Easter egg de la portada. El único script del sitio
│   └── logo.png            2245×520 (4.317:1). Opaco, fondo blanco
│
├── robots.txt              Rastreadores de IA permitidos uno por uno
├── sitemap.xml
├── llms.txt                Resumen en texto plano: oferta, precios, método
│
├── .claude/
│   ├── servidor.js         Servidor de desarrollo
│   └── launch.json
│
└── CLAUDE.md               Memoria del proyecto. Léelo antes de tocar nada
```

`/guias` y `/casos` están planeadas pero **no existen**: guías por copy pendiente, casos por
bloqueo contractual. Ninguna aparece en la navegación ni en `sitemap.xml` — una página vacía le
dice a un agente que el sitio está a medias.

---

## Editar el contenido

**`copy/` es la fuente de verdad, no los `.html`.** El texto está calibrado a una guía de voz
específica: primera persona del singular, cercano y directo, con un punto de formalidad. Sin
plural mayestático, sin «soluciones integrales», sin «aliado estratégico», sin épica.

El flujo es: editas el archivo de `copy/`, y luego reflejas el cambio en el HTML — no al revés.
Existe una verificación que compara el texto renderizado de cada página contra su archivo de
`copy/`; hoy son **76 bloques con 0 discrepancias**.

**No reescribas el copy para «mejorarlo».** Si un texto no cabe en el diseño, se ajusta el diseño.

### Reglas de contenido

- No inventar testimonios, cifras, logotipos de clientes ni «años de experiencia».
- **No identificar a las agencias cliente.** Hay acuerdo de confidencialidad; la única
  formulación aprobada es «agencias del sistema de Naciones Unidas que trabajan con población
  migrante». Ver [NOTICE.md](NOTICE.md).
- No publicar tarifas por hora. Solo los precios de paquete que aparecen en el copy.
- Sin formulario de contacto, sin blog, sin newsletter, sin chat, sin cookies ni banners.

---

## Sistema de diseño

Paleta extraída del logotipo real. No inventar colores.

| Uso | Hex |
|---|---|
| Texto principal | `#343434` |
| Acento de marca | `#01CFCB` |
| Fondo de resaltes y tablas | `#D8FAF9` |
| Texto secundario | `#6B6B6B` |
| Bordes | `#CCCCCC` |
| Lienzo | `#FAFEFE` |

Tipografía: pila de sistema encabezada por Arial. Sin webfonts — evita una petición a un tercero
y es coherente con la regla 4.

Composición: cada sección es un panel blanco redondeado flotando sobre el lienzo. Sin líneas
divisorias. El turquesa se usa en detalles, resaltes y divisiones — **nunca** como fondo de página
completo ni en bloques grandes.

Dos valores del `:root` se ven como errores y no lo son: `#6B6B6B` en vez del `#888888` de la
marca (el original reprueba WCAG AA) y `#FAFEFE` en vez de blanco puro (es `#D8FAF9` al 12 %).
Están documentados en el §16 de [CLAUDE.md](CLAUDE.md).

---

## Descubribilidad para agentes

Es la razón de ser del proyecto, no «SEO estándar».

- **JSON-LD en cada página**: `ProfessionalService` con `areaServed` y `priceRange`, `Person`,
  un `Offer` por escalón de servicio **con su precio**, y `FAQPage`.
- **`llms.txt`** — resumen en texto plano de qué es el sitio, a quién sirve y a qué precio.
- **`robots.txt`** — rastreadores de IA permitidos explícitamente, uno por uno.
- **Un `<h1>` literal por página.** Los agentes no infieren de la vibra: si el encabezado no dice
  «organizaciones que atienden población migrante en México», nadie lo deduce.
- **Nada importante dentro de imágenes.** Los doce SVG llevan `aria-hidden="true"` y no contienen
  un solo elemento de texto. Son adorno puro: si borras cualquiera, no se pierde información.
- Los precios son texto, nunca imagen.

---

## Accesibilidad

Criterio de aceptación, no aspiración.

- Contraste **WCAG AA en todos los pares**: 12.45 texto sobre panel · 12.26 sobre lienzo · 5.25
  secundario · 11.24 sobre resalte · 6.40 botón · 7.75 pie.
- `prefers-reduced-motion` desactiva **todas** las transiciones, incluida la cortinilla entre
  páginas y el tecleo del easter egg.
- Jerarquía real de encabezados, sin saltos. HTML semántico.
- Las preguntas frecuentes van en `<details open>`: plegar es comodidad del visitante, nunca
  condición para ver el texto.
- Sin desbordamiento horizontal a 375 px ni a 1280 px. Las directoras de organización revisan
  desde el teléfono.

---

## Detalles que sorprenden

**La cortinilla entre páginas.** Al navegar, una cortina opaca de 1.2 s cubre la pantalla. Está
hecha con view transitions puras, sin JavaScript. Se puede ajustar con dos variables al principio
de `estilos.css` (`--cortina` y `--cortina-tiempo`). Es una decisión deliberada del titular que
contradice el brief original; está razonada en el §15 de [CLAUDE.md](CLAUDE.md).

**El modo terminal.** Cinco clics en el logotipo, en `/` y solo en `/`, y la pantalla se reimprime
como una sesión de terminal. Otros cinco lo apagan; cualquier enlace navega a esa página ya sin el
efecto. El motor **no contiene una sola palabra de copy** — lee el texto del DOM vivo, así que si
editas el HTML la terminal cambia sola. Detalle en el §14 de [CLAUDE.md](CLAUDE.md).

> Ninguno de los dos se puede observar desde un panel embebido: Chrome detiene las animaciones en
> pestañas que no componen. Hay que abrirlos en Chrome de escritorio.

---

## Despliegue

En producción en <https://freejolitos.consulting>, como **Worker de Cloudflare con assets
estáticos** — no como proyecto de Pages. Cloudflare fusionó Pages dentro de Workers y los sitios
estáticos nuevos nacen así.

Toda la configuración está en [`wrangler.jsonc`](wrangler.jsonc). Para desplegar a mano:

```bash
npx wrangler deploy
```

En PowerShell hay que llamar a `npx.cmd`: la política de ejecución de Windows bloquea el
envoltorio `npx.ps1`. No hace falta cambiar esa política.

### Tres cosas que cuestan un despliegue fallido si no se saben

**Workers no ignora los directorios que empiezan con punto.** Eso es comportamiento de Pages. Aquí
todo lo que no deba publicarse tiene que estar en [`.assetsignore`](.assetsignore), **incluido
`.git/`** — el primer despliegue dejó `/.git/config` y `/.git/index` sirviéndose en público.

**`_redirects` solo acepta rutas relativas.** Una redirección entre nombres de dominio se rechaza
con `Only relative URLs are allowed`. El 301 de `www` al dominio raíz vive como *Redirect Rule* en
el panel de Cloudflare, no en el repositorio.

**`_headers` sí funciona**, y ahí están las cabeceras de seguridad.

### Despliegue automático

**Ya está conectado.** Cada push a `main` dispara una compilación en la nube que clona el
repositorio y ejecuta `npx wrangler deploy`. El comando de arriba solo hace falta para desplegar
sin pasar por GitHub.

Una compilación fallida **no tumba el sitio**: la última versión buena sigue publicada hasta que
otra la reemplace. Conviene saberlo, porque un error de configuración puede pasar desapercibido
—el sitio se ve bien— mientras los cambios nuevos no llegan a producción.

---

## Antes de publicar

- [x] **Datos de contacto.** WhatsApp real en las cinco páginas desde el 12 de agosto de 2026.
- [ ] **Verificar que `hola@freejolitos.consulting` reciba.** El dominio tiene MX activos, pero el
      alias debe existir como reenvío en el registrador o el correo rebota.
- [ ] Validar el JSON-LD con la herramienta de resultados enriquecidos de Google. Requiere URL
      pública; hasta ahora solo se verificó que parsea.
- [ ] Redirección 301 de `www` al dominio raíz.
- [ ] Revisar el sitio con ojos humanos en Chrome de escritorio y en un teléfono real.

Y tras cualquier cambio, la lista de siempre: JavaScript desactivado y todo sigue visible · un
`<h1>` único por página · JSON-LD válido en las cinco · cero peticiones a dominios externos · el
copy coincide palabra por palabra con `copy/`.

---

## Licencia

**El código está bajo Licencia MIT.** El logotipo, el nombre «Freejolitos Consultores» y el copy
comercial quedan con **todos los derechos reservados**.

Si quieres reutilizar la estructura, hay una guía de cinco pasos en [NOTICE.md](NOTICE.md).

---

## Trabajar en esto con un agente

[CLAUDE.md](CLAUDE.md) es la memoria del proyecto: qué existe, por qué se decidió así, y qué
falta. Documenta cuatro decisiones que parecen errores y no lo son. **Manténlo al día** — es lo
único que un agente nuevo lee automáticamente, y sin él una sesión desde otro equipo «arreglaría»
esas cuatro cosas.

