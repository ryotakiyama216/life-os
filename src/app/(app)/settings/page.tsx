"use client";

import * as React from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [savingName, setSavingName] = React.useState(false);
  const [savingEmail, setSavingEmail] = React.useState(false);

  React.useEffect(() => {
    setName((user?.user_metadata?.full_name as string | undefined) ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  async function handleSaveName() {
    setSavingName(true);
    try {
      const { error } = await createClient().auth.updateUser({ data: { full_name: name } });
      if (error) throw error;
      toast.success("名前を更新しました");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "名前の更新に失敗しました");
    } finally {
      setSavingName(false);
    }
  }

  async function handleSaveEmail() {
    if (!email.trim() || email === user?.email) return;
    setSavingEmail(true);
    try {
      const { error } = await createClient().auth.updateUser({ email });
      if (error) throw error;
      toast.success(
        "確認メールを送信しました。新しいメールアドレス宛のリンクをクリックすると変更が反映されます"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "メールアドレスの更新に失敗しました");
    } finally {
      setSavingEmail(false);
    }
  }

  return (
    <div>
      <PageHeader title="設定" description="アカウント情報の確認・変更" />
      <div className="max-w-lg space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">名前</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">表示名</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 山田太郎"
              />
            </div>
            <Button size="sm" onClick={handleSaveName} disabled={savingName}>
              保存
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">メールアドレス</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              変更すると新しいアドレス宛に確認メールが届きます。リンクをクリックするまで変更は反映されません。
            </p>
            <Button
              size="sm"
              onClick={handleSaveEmail}
              disabled={savingEmail || !email.trim() || email === user?.email}
            >
              保存
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
