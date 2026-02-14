# Deploy CI/CD com Coolify

## Configuração no Coolify

1. **Tipo de deploy**  
   Crie o aplicativo como **Docker Compose** (build pack).

2. **Arquivo Compose**  
   Use o arquivo `docker-compose.coolify.yml` na raiz do repositório.

3. **Variável de ambiente**  
   Defina no Coolify:
   - `GHCR_IMAGE` = `ghcr.io/SEU_OWNER/SEU_REPO:latest`  
   Ex.: `ghcr.io/novti/next_project_nlean:latest`

4. **API no Coolify**  
   - **Settings** → **Configuration** → marque **API Access**.
   - **Keys & Tokens** → **API Tokens** → crie um token com permissão **Deploy**.
   - Na página do aplicativo, **Webhook** → copie a URL do **Deploy webhook**.

## Secrets no GitHub

Em **Settings** → **Secrets and variables** → **Actions**, crie:

| Nome             | Valor                          |
|------------------|--------------------------------|
| `COOLIFY_WEBHOOK`| URL do webhook de deploy       |
| `COOLIFY_TOKEN`  | Token de API do Coolify        |

## Fluxo

- **Push na branch `main`** ou **execução manual** (workflow_dispatch) disparam o workflow.
- A imagem é construída e enviada para o GHCR (`ghcr.io/<owner>/<repo>:latest`).
- O webhook do Coolify é chamado e o Coolify faz redeploy puxando a nova imagem.

## Registry privado (GHCR)

Se a imagem for privada, no servidor onde roda o Coolify faça login no GHCR:

```bash
docker login ghcr.io -u SEU_USERNAME --password-stdin
# Cole um Personal Access Token com permissão read:packages
```
