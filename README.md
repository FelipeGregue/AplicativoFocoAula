# FocoAula

Aplicativo de apoio à organização acadêmica de estudantes com TDAH. O sistema
reúne disciplinas, atividades, calendário acadêmico, notas, lembretes e ciclos
Pomodoro em uma interface voltada a dispositivos móveis.

O frontend funciona como PWA no navegador e também pode ser instalado no
Android por meio do Capacitor. Na versão móvel atual, os dados são armazenados
localmente no dispositivo.

O backend é apenas módulo experimental desenvolvido como uma arquitetura alternativa e uma base para expansão futura. Contém uma API modular em NestJS e utiliza SQLite. Pode servir de base para autenticação remota, backup e acesso em vários dispositivos. Não está integrado ao aplicativo móvel atual.

## Tecnologias

### Frontend

- Vue 3, TypeScript e Vite
- Vue Router
- PWA com Service Worker
- IndexedDB para armazenamento local
- Capacitor para integração com Android
- Capacitor Local Notifications


## Estrutura

```text
apps/
  frontend/   Aplicação Vue, PWA e projeto Android
```

## Pré-requisitos

Para executar o frontend:

- Node.js 24 ou versão compatível com as dependências do projeto
- npm

Para gerar e executar a versão Android:

- Android Studio
- Android SDK 36
- JDK 21
- Emulador Android ou dispositivo físico com depuração USB

O projeto Android possui uma configuração de Gradle Daemon Toolchain para
utilizar JDK 21.

## Instalação

Na raiz do projeto, instale as dependências dos workspaces:

```bash
npm install
```

## Executar no navegador

Na raiz do projeto:

```bash
npm run dev:frontend
```

Abra a URL exibida pelo Vite, normalmente:

```text
http://localhost:5173
```

O modo de desenvolvimento é adequado para testar as telas e as regras de
negócio. As notificações nativas do Android devem ser testadas na versão
instalada pelo Capacitor.

## Testar como PWA

Gere e visualize a versão de produção:

```bash
npm run build --workspace apps/frontend
npm run preview --workspace apps/frontend
```

Abra a URL informada pelo Vite. Em navegadores compatíveis, use a opção
`Instalar aplicativo` ou `Adicionar à tela inicial`.

## Sincronizar com o Android

Sempre que alterar arquivos de `apps/frontend/src`, execute na raiz:

```bash
npm run android:sync
```

Esse comando:

1. Compila o frontend e atualiza `apps/frontend/dist`.
2. Executa o Capacitor Sync.
3. Copia a versão web compilada para o projeto Android.

O Capacitor Sync atualiza o conteúdo web e as dependências nativas. Alterações
manuais nos ícones ou recursos nativos de splash podem exigir atualização dos
arquivos em `apps/frontend/android/app/src/main/res`.

## Abrir no Android Studio

Depois da sincronização, execute:

```bash
npm run android:open
```

Também é possível abrir manualmente no Android Studio:

```text
File > Open > apps/frontend/android
```

Aguarde a sincronização do Gradle antes de executar o aplicativo.

## Executar no emulador ou celular

1. Inicie um emulador pelo Device Manager ou conecte um celular.
2. No celular, habilite as opções do desenvolvedor e a depuração USB.
3. Selecione o dispositivo na barra superior do Android Studio.
4. Clique em `Run`.
5. Autorize as notificações quando o Android solicitar.

Para testar a tela de splash, encerre completamente o aplicativo antes de
abri-lo novamente. Apenas retornar a um app que está em segundo plano pode não
executar todo o fluxo de inicialização.

## Gerar um APK

No Android Studio, utilize o menu de geração de APK:

```text
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

O nome do menu pode variar entre versões do Android Studio. Para distribuição
oficial, gere um APK ou Android App Bundle assinado.

## Quando as alterações não aparecem no Android

O Android Studio não utiliza diretamente os arquivos de
`apps/frontend/src`. Ele executa a versão compilada e copiada pelo Capacitor.

Primeiro, sincronize novamente:

```bash
npm run android:sync
```

Se a versão antiga continuar aparecendo:

1. Encerre o aplicativo no dispositivo.
2. Execute novamente pelo Android Studio.
3. Use `Build > Clean Project` se necessário.
4. Desinstale o FocoAula do dispositivo e instale novamente.

A desinstalação também remove os dados locais do aplicativo.

## Armazenamento local

O frontend utiliza o banco IndexedDB chamado `focoaula-local`. Nele são
armazenados:

- usuários cadastrados no dispositivo;
- disciplinas;
- atividades;
- eventos acadêmicos;
- notas;
- preferências de lembretes.

Cada conta começa sem disciplinas, atividades, eventos ou notas. Os dados não
são sincronizados entre celulares e podem ser perdidos se o aplicativo for
desinstalado ou se seus dados forem apagados.

No navegador, o IndexedDB pode ser consultado pelas ferramentas de
desenvolvedor, normalmente em:

```text
Application > Storage > IndexedDB > focoaula-local
```

## Comandos úteis

```bash
# Frontend no navegador
npm run dev:frontend

# Build completo
npm run build

# Build e sincronização com Android
npm run android:sync

# Abrir o projeto no Android Studio
npm run android:open


