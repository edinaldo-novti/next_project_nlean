# Cloudflare + Traefik (root)

Com o domínio atrás do Cloudflare, o tráfego que chega ao root depende do **modo SSL/TLS** no Cloudflare.

## Modos SSL no Cloudflare

| Modo | Cloudflare → origem (root) | Entrypoint no Traefik root |
|------|----------------------------|-----------------------------|
| **Flexible** | HTTP (porta 80) | `web` |
| **Full** | HTTPS (porta 443) | `websecure` |
| **Full (strict)** | HTTPS com cert válido | `websecure` |

- Se estiver em **Flexible**, o pedido chega ao root em **HTTP (80)**. O router tem de usar `entryPoints: web`. A config no repositório já inclui os dois routers (HTTP e HTTPS).
- Se estiver em **Full** ou **Full (strict)**, o pedido chega em **HTTPS (443)**. O router que é usado é o `websecure`.

## O que verificar no Cloudflare

1. **SSL/TLS** → Overview: escolher **Full** ou **Full (strict)** (recomendado). Se for **Flexible**, a config do Traefik já cobre (router em `web`).
2. **DNS**: o registo de `novti.net` (e `*.novti.net` se usar) deve apontar para o **IP público do servidor root** (proxy ligado, laranja).
3. **Proxy** (nuvem laranja): ativo é o normal; o tráfego passa pelo Cloudflare e depois para o IP do root.

## Config no root

O ficheiro `traefik-root-novti-dynamic.yml` tem dois routers:

- **novti-router-https** → entrypoint `websecure` (porta 443)
- **novti-router-http** → entrypoint `web` (porta 80)

Assim funciona tanto em Flexible como em Full/Full strict.
