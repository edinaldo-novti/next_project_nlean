# Traefik root → sub-server (novti.net)

## Ajustes na sua config

| Problema | Correção |
|----------|----------|
| **Porta ausente** | No file provider o `url` do loadBalancer deve ter porta. Use `http://192.168.3.40:80` (ou a porta em que o Traefik do sub escuta). |
| **Host não chega no sub** | Adicione `passHostHeader: true` no `loadBalancer` para o sub-server receber `Host: novti.net` e rotear certo. |
| **Nomes** | Troquei `trail-*` por `novti-*` só para ficar claro; pode manter o nome que preferir. |

## Config validada (root Traefik)

```yaml
http:
  routers:
    novti-router:
      rule: "Host(`novti.net`) || HostRegexp(`{subdomain:.+}.novti.net`)"
      entryPoints:
        - websecure
      service: novti-subserver
      priority: 1
      tls:
        certResolver: letsencrypt

  services:
    novti-subserver:
      loadBalancer:
        servers:
          - url: "http://192.168.3.40:80"
        passHostHeader: true
```

## Checklist

1. **Porta no sub-server**  
   No **192.168.3.40**, o Traefik está escutando em qual porta? (80, 8080, 443?)  
   - Se for 80: use `http://192.168.3.40:80`.  
   - Se for 8080: use `http://192.168.3.40:8080`.

2. **Nome do entrypoint no root**  
   No Traefik do **root**, o entrypoint HTTPS é mesmo `websecure`?  
   - No static config costuma ser `websecure` (HTTPS) e `web` (HTTP).  
   - Se for outro nome, troque em `entryPoints`.

3. **Resolver TLS**  
   O `certResolver: letsencrypt` está definido no static do Traefik root e o DNS de `novti.net` e `*.novti.net` aponta para o IP **público do root** (não do sub).

4. **Rede/firewall**  
   Do servidor **root** consegue acessar `http://192.168.3.40:80`?  
   - Teste: no root, `curl -H "Host: novti.net" http://192.168.3.40:80`.

5. **Traefik no sub-server**  
   No **192.168.3.40**, o Traefik precisa ter um router que aceite `Host(`novti.net`)` (e subdomínios se quiser) e aponte para o serviço da aplicação no Coolify. Se no sub não houver router para esse Host, a requisição chega mas não é entregue ao container.

## Se ainda não redirecionar

- Confirme que o ficheiro de dynamic config está no caminho que o Traefik root usa (ex.: diretório de file provider) e que o Traefik foi recarregado (reload/restart).
- Veja os logs do Traefik root: `docker logs <container_traefik_root>` e procure erros ao carregar o ficheiro ou ao aceder ao router `novti-router`.
- No sub (192.168.3.40), confirme que o Traefik está a escutar na porta usada no `url` e que existe router + service para o host da aplicação.
