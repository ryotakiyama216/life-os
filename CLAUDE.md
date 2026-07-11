# CLAUDE.md

このリポジトリで作業するときの前提知識。詳細な経緯・意思決定の理由は `history/YYYY-MM-DD.md`（日付ごとの作業記録）を参照すること。作業したセッションでは、その日の記録を`history/`に追記・新規作成する運用にしている。

## プロダクト概要

目標(Goal) → プロジェクト(Project) → タスク(Task) → 今日のTodo、をGTD方式で管理する個人用ツール（1人利用前提）。Notion的な多機能ツールで運用が破綻した反省から、「シンプルさ」「今何をすべきかが自動でわかること」を最優先する。詳細な要件は`history/2026-07-11.md`のヒアリング記録を参照。

## 現在のフェーズ

Supabase（Postgres + Auth）接続済み。メール+パスワード認証、RLSで自分の行だけ読み書きできる状態。localStorageは撤去済み。次はVercelデプロイ。

**AI機能について**: 一度Anthropic APIを使った「目標→プロジェクト/タスクの自動棚卸し」機能を実装したが、Claude.aiのチャット課金とAPI課金が別物であることをユーザーが認識し、コスト面の判断のため一旦取り下げ・実装を削除した（`history/2026-07-11.md`参照）。再度AI機能を追加する場合は、必ず事前にAPIキーの課金体系（従量課金であること）をユーザーに確認してから着手すること。

## コマンド

```bash
npm run dev     # 開発サーバー (http://localhost:3000)
npm run build   # 本番ビルド（型チェック・ESLintを含む。変更後は必ずこれで確認する）
npm run lint    # ESLintのみ
```

自動ブラウザ操作ツールはこの環境にない。UI変更後は`npm run build`とdevサーバーのHTTPレスポンス確認までを自分で行い、実クリックでの確認はユーザーに依頼する。ログイン必須のアプリになったため、curlでの疎通確認は`/login`へのリダイレクトが返ることの確認までが限界（実データの動作確認はユーザーに依頼する）。

## 技術スタックと制約

- **Next.js 14系**（15系ではない）。理由: ローカルNode.jsが18.17系で、Next.js 15以降が要求するNode 18.18+/20+を満たさないため。Node環境が20+に上がったら移行を検討してよい。
- **shadcn/ui**は`shadcn@2.3.0`（CLI最新版はNode 20+必須で動かない）で導入済み。style: `new-york`, baseColor: `zinc`（モノトーン）。新しいコンポーネントを追加する際も同バージョンを使うか、動かなければ手動でコンポーネントファイルを追加する。
- `tailwind.config.ts`の色定義は`var(--x)`直接参照（`hsl(var(--x))`ではない）。`globals.css`のCSS変数がすでに`oklch(...)`関数を含む完全な値のため。shadcn関連ファイルを再生成・追加するときはこの整合性が崩れていないか確認すること。
- **Supabase**: `@supabase/supabase-js` + `@supabase/ssr`（旧`auth-helpers-nextjs`は使わない）。ブラウザ用クライアントは`src/lib/supabase/client.ts`、サーバー用は`src/lib/supabase/server.ts`。`src/middleware.ts`がセッションCookieのリフレッシュと未ログイン時の`/login`リダイレクトを担う。
- 状態管理は**Zustand（v5、`persist`なし）**（`src/store/useAppStore.ts`）。データはSupabaseから`loadAll()`で読み込み、各CRUDアクションは非同期でSupabaseに書き込んでからstateを更新する。**localStorageは使っていない**（以前はlocalStorage版だったが撤去済み）。

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

## Supabase / DBまわり

- スキーマは`supabase/schema.sql`に集約（テーブル定義・RLSポリシー・updated_atトリガー）。テーブルを追加・変更したらこのファイルも更新し、変更内容をユーザーに伝えて手動でSQL Editorに反映してもらう（マイグレーションツールは導入していない）。
- 全テーブルの`user_id`は`default auth.uid()`。クライアントからinsertする際に`user_id`を明示的に渡す必要はない（RLSの`with check`が自動的に締める）。
- クエリ層は`src/lib/supabase/queries/`配下にエンティティごと（`goals.ts`, `projects.ts`, `tasks.ts`, `habits.ts`, `notes.ts`, `inbox.ts`, `morning-blocks.ts`）。ほとんどは`src/lib/supabase/entity.ts`の`createEntityQueries<T>(table)`ジェネリックファクトリで賄っている（fetchAll/insert/update/remove）。habit_logsだけは`habits.ts`内に個別実装（find-or-create-or-toggleのロジックがあるため）。
- snake_case⇄camelCaseの変換は`src/lib/supabase/case.ts`の`toDbRow`/`fromDbRow`で汎用的に行っている（フィールドごとの変換テーブルは持たない。新しいカラムを追加する場合もこの命名規則を踏襲すれば自動で変換される）。
- ストアの各CRUDアクションは非同期関数で、失敗時は`toast.error`をストア内で表示してからthrowする。呼び出し側（フォームダイアログ等）はtry/catchで受けて、成功時だけダイアログを閉じる・ページ遷移する設計（エラー時にtoastが二重に出ないよう、呼び出し側では追加のtoast.errorを出さない）。
- 認証: `src/components/auth/auth-provider.tsx`がセッション監視とログイン後の`loadAll()`実行を担当。ルートは`src/app/(app)/`グループ配下（AppShellあり）と`src/app/login/`（AppShellなし）に分かれている。ルートlayout(`src/app/layout.tsx`)はAppShellを持たない。

## ディレクトリ構成

```
src/
  app/
    (app)/             # ログイン必須のページ群（Today/Inbox/Goals/Projects/Tasks/Habits/Notes）。layout.tsxでAppShellを描画
    login/             # ログイン/新規登録ページ（AppShellなし）
    layout.tsx         # ルートレイアウト（ThemeProvider/AuthProvider/Toasterのみ）
  middleware.ts         # 認証セッションのリフレッシュ・リダイレクト
  components/
    ui/                # shadcn/uiの生成コンポーネント（基本的に手で書き換えない）
    layout/            # サイドバー・トップバー等のアプリシェル
    auth/               # AuthProvider
    goal/ project/ task/ habit/ note/ today/ inbox/  # 機能別コンポーネント
  store/useAppStore.ts # Zustandストア（Supabase連携の非同期CRUD）
  types/index.ts        # ドメイン型（Supabaseスキーマと1:1）
  lib/
    date.ts             # 日付ユーティリティ（date-fns）
    priority.ts          # 「今やるべきこと」を算出する優先度エンジン
    use-debounced-callback.ts  # 入力のデバウンス（メモ編集のDB書き込み頻度を抑える）
    supabase/
      client.ts / server.ts  # Supabaseクライアント（ブラウザ/サーバー）
      case.ts             # snake_case⇄camelCase変換
      entity.ts           # 汎用CRUDクエリファクトリ
      queries/            # エンティティごとのクエリ
supabase/schema.sql    # DBスキーマ（Supabase SQL Editorで実行する）
history/                # セッションごとの作業記録（日付.md）
```

## データモデルの設計方針

`src/types/index.ts`の型は、Supabaseのテーブルとほぼ1:1になるように設計している（`supabase/schema.sql`参照）。カラムは固定（Notionのような自由追加プロパティ方式ではない）。優先度は`P1`〜`P4`の4段階。新しいフィールドを追加する際は、型定義とSQLスキーマの両方を一貫して更新すること。

## コーディングの流儀（このリポジトリでの実践）

- フォームは基本的に「作成・編集を1つのDialogコンポーネントで兼用」するパターン（`task-form-dialog.tsx`等）。`open`/`onOpenChange`をcontrolledでも渡せるようにし、Inboxの仕分けフローなど他画面から呼び出せるようにしている。フォームの`handleSubmit`はasync化し、ストアのCRUD呼び出しを`await`してから`setOpen(false)`する（失敗時はcatchして何もしない＝ダイアログを開いたままにする）。
- Markdown編集は重量級エディタを使わず、`Textarea` + `react-markdown`プレビューの簡易切り替え（`markdown-editor.tsx`）。軽量さを優先する方針。キー入力ごとにDBへ書き込むと非効率なので、メモのタイトル/本文編集は`useDebouncedCallback`で~600msデバウンスしてから`updateNote`を呼んでいる（`notes/[id]/page.tsx`参照）。
- 一覧ページは「フィルタ/ソートをローカルstateで持ち、storeからは生データだけ取得してJS側でfilter/sortする」パターンで統一している（上記Zustandの落とし穴を参照）。

## 次にやること

`history/`の最新の記録を参照。優先度が高い順に: Vercelデプロイ（環境変数設定）→ AI機能（コスト判断待ちで保留中）→ SNS管理機能。
