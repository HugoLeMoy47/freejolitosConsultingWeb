# La cortinilla entre páginas

Lectura bajo demanda: las reglas que mandan están en [CLAUDE.md](../CLAUDE.md).

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
> `/como-manejo-tu-informacion`. Auditoría estática ya descartada como causa: las diecisiete páginas
> cargan la misma `estilos.css` con `@view-transition { navigation: auto; }`, ninguna tiene
> `view-transition-name` (la regla §2 se respeta en todas), no hay ids duplicados, ni tags sin
> cerrar, ni `<meta http-equiv>`/`<base>`/CSP en el HTML. Nada en el código explica por qué esas
> cuatro páginas específicamente se comportan distinto a `/`, `/servicios`, `/como-trabajo`,
> `/quien-soy` o las páginas individuales de `/guias/*`. Antes de tocar CSS por esto, abrir DevTools
> → Console durante la navegación fallida y ver si hay un aviso de la View Transitions API — es el
> único diagnóstico que falta.

---

## Historial

| Fecha | Cambio |
|---|---|
| 2026-11-14 | Se separa de `CLAUDE.md` (antes §4) para leerlo bajo demanda. Texto sin cambios. |
