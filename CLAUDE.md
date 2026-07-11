# CLAUDE.md

このリポジトリで作業するときの前提知識。詳細な経緯・意思決定の理由は `history/YYYY-MM-DD.md`（日付ごとの作業記録）を参照すること。作業したセッションでは、その日の記録を`history/`に追記・新規作成する運用にしている。

## プロダクト概要

目標(Goal) → プロジェクト(Project) → タスク(Task) → 今日のTodo、をGTD方式で管理する個人用ツール（1人利用前提）。Notion的な多機能ツールで運用が破綻した反省から、「シンプルさ」「今何をすべきかが自動でわかること」を最優先する。詳細な要件は`history/2026-07-11.md`のヒアリング記録を参照。

## 現在のフェーズ

MVP（UI + ブラウザのlocalStorage永続化のみ）。Supabase接続・認証・AI機能はまだ実装していない。次フェーズの計画も`history/`配下に記録している。

**AI機能について**: 一度Anthropic APIを使った「目標→プロジェクト/タスクの自動棚卸し」機能を実装したが、Claude.aiのチャット課金とAPI課金が別物であることをユーザーが認識し、コスト面の判断のため一旦取り下げ・実装を削除した（`history/2026-07-11.md`参照）。再度AI機能を追加する場合は、必ず事前にAPIキーの課金体系（従量課金であること）をユーザーに確認してから着手すること。

## コマンド

```bash
npm run dev     # 開発サーバー (http://localhost:3000)
npm run build   # 本番ビルド（型チェック・ESLintを含む。変更後は必ずこれで確認する）
npm run lint    # ESLintのみ
```

自動ブラウザ操作ツールはこの環境にない。UI変更後は`npm run build`とdevサーバーのHTTPレスポンス確認までを自分で行い、実クリックでの確認はユーザーに依頼する。

## 技術スタックと制約

- **Next.js 14系**（15系ではない）。理由: ローカルNode.jsが18.17系で、Next.js 15以降が要求するNode 18.18+/20+を満たさないため。Node環境が20+に上がったら移行を検討してよい。
- **shadcn/ui**は`shadcn@2.3.0`（CLI最新版はNode 20+必須で動かない）で導入済み。style: `new-york`, baseColor: `zinc`（モノトーン）。新しいコンポーネントを追加する際も同バージョンを使うか、動かなければ手動でコンポーネントファイルを追加する。
- `tailwind.config.ts`の色定義は`var(--x)`直接参照（`hsl(var(--x))`ではない）。`globals.css`のCSS変数がすでに`oklch(...)`関数を含む完全な値のため。shadcn関連ファイルを再生成・追加するときはこの整合性が崩れていないか確認すること。
- 状態管理は**Zustand（v5）+ `persist`ミドルウェア**でlocalStorageに保存（`src/store/useAppStore.ts`、キー: `life-os-store`）。

## 重要な落とし穴: Zustandセレクタ

**Zustandのセレクタ関数内で`.filter()`や`.map()`、新しいオブジェクト/配列リテラルを生成してはいけない。** 例:

```ts
// NG: 呼び出すたびに新しい配列/オブジェクトを返す → 無限レンダリングループ → "Maximum update depth exceeded"
const tasks = useAppStore((s) => s.tasks.filter((t) => t.projectId === id));
const stats = useAppStore((s) => ({ total: ..., done: ... }));

// OK: storeからは生の配列参照だけ取得し、絞り込みはコンポーネント本体で行う
const allTasks = useAppStore((s) => s.tasks);
const tasks = allTasks.filter((t) => t.projectId === id);
```

Zustand v5は内部で`useSyncExternalStore`を使っており、セレクタが毎回新しい参照を返すと再レンダリングが収束せずクラッシュする。`.find()`で配列内の既存要素の参照を返すだけなら問題ない（新規オブジェクトを作らないため）。数値やbooleanなどプリミティブを返すのも問題ない。

## ディレクトリ構成

```
src/
  app/                 # Next.js App Router（ページ）
  components/
    ui/                # shadcn/uiの生成コンポーネント（基本的に手で書き換えない）
    layout/            # サイドバー・トップバー等のアプリシェル
    goal/ project/ task/ habit/ note/ today/ inbox/  # 機能別コンポーネント
  store/useAppStore.ts # Zustandストア（全ドメインのCRUD）
  types/index.ts        # ドメイン型（将来のSupabaseスキーマと1:1になるよう設計）
  lib/
    date.ts             # 日付ユーティリティ（date-fns）
    priority.ts          # 「今やるべきこと」を算出する優先度エンジン
history/                # セッションごとの作業記録（日付.md）
```

## データモデルの設計方針

`src/types/index.ts`の型は、将来Supabaseのテーブルにほぼそのまま移行できるように設計している。カラムは固定（Notionのような自由追加プロパティ方式ではない）。優先度は`P1`〜`P4`の4段階。新しいフィールドを追加する際もこの一貫性を保つこと。

## コーディングの流儀（このリポジトリでの実践）

- フォームは基本的に「作成・編集を1つのDialogコンポーネントで兼用」するパターン（`task-form-dialog.tsx`等）。`open`/`onOpenChange`をcontrolledでも渡せるようにし、Inboxの仕分けフローなど他画面から呼び出せるようにしている。
- Markdown編集は重量級エディタを使わず、`Textarea` + `react-markdown`プレビューの簡易切り替え（`markdown-editor.tsx`）。軽量さを優先する方針。
- 一覧ページは「フィルタ/ソートをローカルstateで持ち、storeからは生データだけ取得してJS側でfilter/sortする」パターンで統一している（上記Zustandの落とし穴を参照）。

## 次にやること

`history/`の最新の記録を参照。優先度が高い順に: Supabase接続（型定義をベースにスキーマ化）→ Supabase Auth導入 → Vercelデプロイ → AI機能（コスト判断待ちで保留中）→ SNS管理機能。
