#!/usr/bin/env bash
set -e

echo "🌿 Criando repositório e publicando Fôlego na Vercel..."

if [ ! -d .git ]; then
  git init
fi

git add .
if ! git diff --cached --quiet; then
  git commit -m "feat: lancamento completo do ecossistema Folego Financas Serenas"
fi

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  if ! git remote get-url origin >/dev/null 2>&1; then
    gh repo create folego-app --public --source=. --remote=origin --push
  else
    git push -u origin HEAD
  fi
  echo "✅ Repositório no GitHub criado e atualizado com sucesso!"
else
  echo "ℹ️ GitHub CLI ausente ou sem login; etapa do GitHub ignorada."
fi

if command -v vercel >/dev/null 2>&1; then
  vercel --prod --yes
  echo "⚡ Publicado na Vercel com sucesso!"
else
  echo "ℹ️ Vercel CLI ausente; execute 'npm i -g vercel' e rode este script novamente."
fi
