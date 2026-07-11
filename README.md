# Life OS

目標 → プロジェクト → タスク → 今日のTodo、をGTD（Getting Things Done）の考え方で管理する個人用ツール。Notionのような多機能さは持たず、「今、目標達成のために何をすべきか」だけに集中できることを目指す。

## 現在のステータス

Supabase（Postgres + Auth）接続済み。メール+パスワードでの自分専用ログインと、DBへのデータ永続化が動作する。詳しい経緯は [`history/`](./history) の日付ごとの作業記録を参照。

## 主な機能

- **ログイン/新規登録** (`/login`) — メール+パスワードでのサインイン/サインアップ。未ログイン時は自動的にここへリダイレクトされる
- **Today** (`/`) — 期限切れタスクの警告と対応、今日やるタスク、目標優先度から逆算した「今やるべき候補」、今日の習慣、朝の時間割ブロック
- **Inbox** (`/inbox`) — クイックキャプチャで書き溜め、タスク/プロジェクト/目標/習慣/メモへ仕分け（GTD方式）
- **目標・プロジェクト・タスク** (`/goals`, `/projects`, `/tasks`) — 階層管理、状態・優先度・期限などでの絞り込み/並び替え
- **習慣** (`/habits`) — 頻度（毎日・曜日指定）と実施時刻を登録、Todayに自動反映
- **ページ・メモ** (`/notes`) — Markdownで自由に書けるメモ、目標/プロジェクトに関連付け可能

## 技術スタック

- フロントエンド: [Next.js 14](https://nextjs.org/)（App Router, TypeScript）
- UI: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)（モノトーン基調）
- バックエンド/DB/認証: [Supabase](https://supabase.com/)（Postgres + Auth、`@supabase/supabase-js` + `@supabase/ssr`）
- 状態管理: [Zustand](https://github.com/pmndrs/zustand)（クライアント側キャッシュ。永続化はSupabase側、localStorageは使わない）
- Markdown: `react-markdown` + `remark-gfm`
- 今後: ホスティングに [Vercel](https://vercel.com/) を予定

## セットアップ

```bash
npm install
```

### Supabaseの接続設定

1. [supabase.com](https://supabase.com/) でプロジェクトを作成する
2. Project Settings > API から **Project URL** と **anon public key** を取得する
3. `.env.local.example` を `.env.local` にコピーし、`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定する
4. Supabaseダッシュボードの **SQL Editor** で [`supabase/schema.sql`](./supabase/schema.sql) の内容を実行する（テーブル作成・RLS設定を含む。1回だけでOK）
5. （任意）Authentication設定で「Confirm email」を無効にすると、サインアップ後すぐにログインできる（個人利用なら無効化が楽）

```bash
npm run dev
```

`http://localhost:3000` で起動する。初回は`/login`にリダイレクトされるので、画面から新規登録してログインする。

```bash
npm run build   # 本番ビルド（型チェック・ESLintも実行）
npm run start   # ビルド後の起動確認
npm run lint    # ESLintのみ
```

### Node.jsバージョンについて

ローカル環境のNode.jsバージョン制約（18.17系）により、Next.js 15以降ではなく**Next.js 14系**を使用している。Node 20+へアップグレードした際は、Next.jsおよびshadcn CLIを最新版へ移行することを検討する。

## データについて

すべてのデータはSupabase（Postgres）に保存され、Row Level Securityにより自分のアカウントの行のみ読み書きできる。ブラウザ/端末をまたいで同期される。

## 今後の予定

1. Vercelへのデプロイ（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`を環境変数に設定）
2. AI機能（チャット/アシスタント、目標→プロジェクト→タスクの自動棚卸し、日次/週次レビュー生成）— コスト面の判断が必要なため保留中
3. SNS投稿・分析機能（将来構想）
