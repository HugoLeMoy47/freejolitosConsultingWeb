# Sitio web — Freejolitos Consultores

**Estado y pendientes: en Jarvis, clave `FJ-WEB`** (conector MCP `jarvis`). Al empezar: `consultar_proyecto`; al terminar: `cerrar_sesion` con liga al commit o PR. Sin conector: `BITACORA.md` en la raíz, encabezado `## AAAA-MM-DD · título`.

Lee esto completo antes de editar. Hay cuatro decisiones que parecen errores y no lo son (§2). Arranque y despliegue: [README.md](README.md). El razonamiento comercial vive en un archivo local sin versionar: si falta una decisión de negocio, pregúntala al titular, no la deduzcas.

**Lectura bajo demanda** (solo si tu tarea la toca): [sistema visual](docs/sistema-visual.md) · [cortinilla](docs/cortinilla.md) · [modo terminal](docs/modo-terminal.md) · [A/B](docs/ab-testing.md) · [historia de la verificación](docs/verificacion.md).

## 1. Las cinco reglas que mandan

1. **HTML estático.** Sin framework, sin build obligatorio, sin SPA.
2. **Todo el contenido existe en el HTML al cargar.** Prueba: desactiva JavaScript y recarga; si algo desaparece, está mal.
3. **Una URL real por página.** Sin enrutamiento del lado del cliente.
4. **Cero dependencias de terceros en el navegador:** ni webfonts, analítica, CDN ni widgets. El titular vende protección de datos.
5. **Cifras explícitas en el texto,** nunca como imagen ni «contáctanos para cotización».

## 2. Las cuatro desviaciones deliberadas (no las «arregles»)

| Qué | Por qué no es error |
|---|---|
| Texto secundario `#6B6B6B`, no `#888888` | `#888888` da 3.54:1 y reprueba WCAG AA. `#888888` sigue como `--secundario-decorativo` para bordes. |
| Cortinilla opaca de 1.2 s | Decisión expresa del titular con la contradicción a la vista. Ver [cortinilla](docs/cortinilla.md). |
| Lienzo `#FAFEFE` | Es `#D8FAF9` al 12 % sobre blanco; da el efecto de paneles flotando. |
| Un script en la portada (`assets/terminal.js`) | No se puede hacer sin JS y no muestra contenido, lo reimprime. Ver [modo terminal](docs/modo-terminal.md). |

## 3. Reglas de contenido

**El copy de `copy/` es definitivo:** no se reescribe ni se «mejora»; si no cabe, se ajusta el diseño. Voz: primera persona del singular, cercana y directa, profesional; sin plural mayestático, «soluciones integrales», «aliado estratégico» ni épica.

**Prohibiciones firmes**
- No inventar contenido, testimonios, cifras, logotipos de clientes ni «años de experiencia».
- **No identificar a las agencias cliente** (acuerdo de confidencialidad). Única formulación: «agencias del sistema de Naciones Unidas que trabajan con población migrante». Sus nombres no están en el repo a propósito: ni en código, comentarios, commits ni incidencias.
- Sin página de casos ni referencias a clientes concretos.
- Únicos precios publicables: los de paquete de `copy/`.
- Sin formulario de contacto, blog, newsletter, chat, cookies ni banners. Acción principal: WhatsApp; alternativa: correo.
- A/B: se construye solo `copy/01-inicio-A.md`, y nunca en el cliente.

**Posicionamiento vigente** (titular, 2026-09-23). Manda sobre cualquier redacción anterior; si algo lo contradice, se corrige en todos los lugares a la vez (HTML, `<meta>`/`og:`, JSON-LD, `copy/`, `llms.txt`). Ante duda, `/quien-soy` (`copy/04`).

| Tema | Lo cierto | Ya no se dice |
|---|---|---|
| Figura fiscal | Hugo factura a su nombre, persona física con actividad empresarial, bajo la marca Freejolitos Consultores. | «Facturo bajo el nombre de Freejolitos». |
| Equipo | Consultor con red de especialistas (tecnología, fiscal, jurídico, salud, agrícola, gobierno, tercer sector), con visto bueno del cliente; un técnico que él supervisa da el soporte operativo. | «Trabajo solo». |
| Trayectoria | Tecnología desde 2008: banca, telecom, marketing y producción, gobierno, logística y comercio exterior, fintech, más la formulación de Naciones Unidas. Solo sectores. | Solo «banca y telecomunicaciones». |
| Cobertura | Todo México, base en la ZMVM; a distancia; visitas fuera de la ZMVM se acuerdan antes con traslados. JSON-LD: `areaServed` México, `workLocation` ZMVM. | Cobertura solo ZMVM. |
| Soporte | Dentro del acompañamiento mensual y hasta las horas de la modalidad; lo adicional, con autorización por escrito. | Soporte sin límite. |
| Fuera del tercer sector | Sí trabaja con empresas, a la medida; paquetes y tarifa son para organizaciones sin área de sistemas. | Tono que cierra la puerta. |
| Precios | En todo el sitio, precio de lista con IVA ($16,704 · $8,120 · $16,240 · $24,360) con «+ IVA» al lado. La tarifa institucional solo se anuncia; única excepción: su tabla en `/servicios`. JSON-LD: `price` con IVA, `valueAddedTaxIncluded: true`. | Precio OSC fuera de esa tabla; montos sin IVA sueltos. |
| Motivo | Convicción: dejar algo sembrado (epígrafe de Thoreau). | «Porque quiero que lo que hago sirva para algo». |

## 4. Verificar antes de dar algo por terminado

1. **Copy:** `npm run verify:copy` y `node scripts/verify-semantic.js`, juntos. Esperado: 0 discrepancias, salvo el bloque comentado de `como-manejo-tu-informacion`.
2. **DOM:** un `h1` por página, sin saltos de jerarquía, ids duplicados ni anclas rotas; JSON-LD que parsea; doce SVG `aria-hidden` sin texto; cero peticiones externas; un solo script (`assets/terminal.js`, solo en `/`); menú y pie idénticos en las diecisiete páginas.
3. Contraste AA y sin desbordamiento horizontal a 375 y 1280 px.

## 5. Git

Commits y push de ramas sin preguntar; cambios por rama y PR hacia `main`. Fusionar a `main` publica (Cloudflare Pages): solo con autorización explícita de Hugo, cada vez. Nunca `--force` ni reescribir historial. Repo público: cero nombres de clientes.
