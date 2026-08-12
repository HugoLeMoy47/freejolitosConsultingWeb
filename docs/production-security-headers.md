# Cabeceras de seguridad recomendadas para producción (Cloudflare)

Estas son recomendaciones de cabeceras HTTP a aplicar en el edge (Cloudflare Worker / Pages), con valores conservadores que mejoran la postura de seguridad sin romper el sitio estático:

- **Strict-Transport-Security**: `max-age=63072000; includeSubDomains; preload`
  - Obliga HTTPS y protege contra ataques de downgrade. Aplicar sólo si todo el dominio y subdominios usan HTTPS.
- **Content-Security-Policy** (ejemplo restrictivo):
  - `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self';` 
  - Ajustar si se necesita permitir recursos externos (por ejemplo APIs o CDNs). Probar en modo `report-only` antes de endurecerla.
- **X-Content-Type-Options**: `nosniff`
- **X-Frame-Options**: `DENY` (o `SAMEORIGIN` si hay integraciones que lo requieran)
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: `interest-cohort=()` (restringe APIs innecesarias; ajustar según permisos requeridos)
- **Cache-Control**: en producción preferir políticas con buen control: p. ej. `public, max-age=3600, s-maxage=86400` según contenido.
- **Expect-CT**: opcional si se gestiona Certificate Transparency.

Notas:
- Aplica estas cabeceras en el edge (Cloudflare) o en el Worker que sirva el sitio, no sólo en el servidor de desarrollo.
- Prueba CSP en `Content-Security-Policy-Report-Only` para capturar falsos positivos antes del bloqueo.
- No agregar cabeceras que dupliquen mecanismos de seguridad ya aplicados por plataforma sin verificar efectos.
