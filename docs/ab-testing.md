# A/B testing — preparado, no activado

Existen dos versiones del copy de Inicio: `copy/01-inicio-A.md` (**la que se publica**) y
`copy/01-inicio-B.md` (en reserva). Construir **solo la A**. La estructura queda lista para que un
Worker de Cloudflare sirva una u otra en el borde más adelante.

**Nunca hacer el A/B en el cliente.** Si JavaScript intercambia el texto, un agente puede ver una
versión distinta a la del visitante, o ambas. Eso contamina exactamente lo que el sitio busca
lograr.

---

## Historial

| Fecha | Cambio |
|---|---|
| 2026-11-14 | Se separa de `CLAUDE.md` (antes §6) para leerlo bajo demanda. Texto sin cambios. |
