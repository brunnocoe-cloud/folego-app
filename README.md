# Fôlego — Finanças Serenas

Protótipo web estático e responsivo com seis telas conectadas, Tailwind CSS via CDN, imagens originais e interações em JavaScript.

## Executar localmente

```bash
npm start
```

O comando inicia um servidor local; abra o endereço mostrado no terminal. A página inicial é `index.html` e a jornada de entrada começa em `boas-vindas.html`.

## Publicar

No Git Bash, WSL ou terminal macOS/Linux:

```bash
chmod +x deploy.sh
./deploy.sh
```

O script cria o commit inicial e, quando as CLIs autenticadas do GitHub e da Vercel estão disponíveis, cria o repositório público e publica a versão de produção.

Também é possível publicar diretamente com:

```bash
npx vercel --prod --yes
```
