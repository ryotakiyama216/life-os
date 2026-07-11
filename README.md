# Life OS

目標 → プロジェクト → タスク → 今日のTodo、をGTD（Getting Things Done）の考え方で管理する個人用ツール。Notionのような多機能さは持たず、「今、目標達成のために何をすべきか」だけに集中できることを目指す。

## 現在のステータス

MVP（見た目 + ブラウザのlocalStorage永続化）が動作する状態。Supabase接続・認証・AI機能は未実装（今後のフェーズで対応予定）。詳しい経緯は [`history/`](./history) の日付ごとの作業記録を参照。

## 主な機能

- **Today** (`/`) — 期限切れタスクの警告と対応、今日やるタスク、目標優先度から逆算した「今やるべき候補」、今日の習慣、朝の時間割ブロック
- **Inbox** (`/inbox`) — クイックキャプチャで書き溜め、タスク/プロジェクト/目標/習慣/メモへ仕分け（GTD方式）
- **目標・プロジェクト・タスク** (`/goals`, `/projects`, `/tasks`) — 階層管理、状態・優先度・期限などでの絞り込み/並び替え
- **習慣** (`/habits`) — 頻度（毎日・曜日指定）と実施時刻を登録、Todayに自動反映
- **ページ・メモ** (`/notes`) — Markdownで自由に書けるメモ、目標/プロジェクトに関連付け可能

## 技術スタック

- フロントエンド: [Next.js 14](https://nextjs.org/)（App Router, TypeScript）
- UI: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)（モノトーン基調）
- 状態管理・永続化: [Zustand](https://github.com/pmndrs/zustand)（`persist`ミドルウェアでlocalStorage保存。将来Supabaseに置き換え予定）
- Markdown: `react-markdown` + `remark-gfm`
- 今後: バックエンド/DBに [Supabase](https://supabase.com/)、ホスティングに [Vercel](https://vercel.com/) を予定

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:3000` で起動する。

```bash
npm run build   # 本番ビルド（型チェック・ESLintも実行）
npm run start   # ビルド後の起動確認
npm run lint    # ESLintのみ
```

### Node.jsバージョンについて

ローカル環境のNode.jsバージョン制約（18.17系）により、Next.js 15以降ではなく**Next.js 14系**を使用している。Node 20+へアップグレードした際は、Next.jsおよびshadcn CLIを最新版へ移行することを検討する。

## データについて

現状すべてのデータはブラウザの`localStorage`（キー: `life-os-store`）に保存される。**別ブラウザ・別端末とは同期されない**。Supabase接続後はサーバー側DBに移行予定。

## 今後の予定

1. Supabaseプロジェクト作成・スキーマ設計・DB接続への移行
2. Supabase Authによる認証導入
3. Vercelへのデプロイ
4. AI機能（チャット/アシスタント、目標→プロジェクト→タスクの自動棚卸し、日次/週次レビュー生成）— コスト面の判断が必要なため保留中
5. SNS投稿・分析機能（将来構想）
