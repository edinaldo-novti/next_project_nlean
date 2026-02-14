# Depuração: root → sub-server (novti.net)

O sub-server está ok (Traefik alcança o portal). O problema é o **Traefik do root** não encaminhar para o sub. Segue o que verificar **no servidor ROOT**.

---

## 1. Root alcança o sub?

No **root**, execute:

```bash
curl -v -H "Host: novti.net" http://192.168.3.40:80/up
```

- **Resposta 200 + HTML** → rede ok; o problema é o router/domínio no Traefik do root.
- **Connection refused / timeout** → firewall ou rede (root não chega ao 192.168.3.40:80).

---

## 2. Dynamic config está ativa no root?

- No Coolify do **root**: **Server** → **Traefik** / **Proxy** → **Dynamic Configurations**.
- Confirme que o ficheiro com o router `novti-router` e o service `novti-subserver` está lá e que o Traefik foi recarregado após alterações.
- Se editar YAML à mão, o caminho costuma ser o que está em **File provider** no static do Traefik (ex.: `/etc/traefik/dynamic/` ou o que o Coolify definir).

---

## 3. Nome do entrypoint HTTPS no root

No **root**, o Traefik pode usar outro nome para o entrypoint HTTPS (não `websecure`). Verifique:

```bash
docker exec <nome_container_traefik_root> cat /etc/traefik/traefik.yml
# ou onde estiver o static config
```

Procure as entradas `entryPoints`. O HTTPS pode ser `websecure`, `https` ou outro. No seu YAML dinâmico, `entryPoints` do router tem de ser **exatamente** esse nome.

---

## 4. Traefik v3 no root – sintaxe da rule

Se o Traefik do root for **v3**, a sintaxe pode ser ligeiramente diferente. Pode testar assim:

```yaml
# Alternativa para Traefik v3 (rule em uma linha)
rule: "Host(`novti.net`) || HostRegexp(`{subdomain:.+}.novti.net`)"
```

Se der erro ao carregar, veja os logs do Traefik no root.

---

## 5. Logs do Traefik no root

No **root**:

```bash
docker logs <container_traefik_root> 2>&1 | tail -100
```

Ao aceder a https://novti.net/up, procure erros como:

- "no available server" (service sem backend)
- "router not found" (router não carregado)
- erros de parsing do YAML (ficheiro dinâmico)

---

## 6. Resumo da config do root (referência)

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

- **entryPoints**: tem de ser o nome real do entrypoint HTTPS no root.
- **certResolver**: tem de existir no static (ex.: `letsencrypt`).
- **url**: porta 80 do sub (onde o Traefik do sub escuta).

Depois de alterar o YAML dinâmico, recarregue ou reinicie o Traefik no root e teste de novo **https://novti.net/up**.
