#!/usr/bin/env node
/**
 * Stop / Notification hook — OS별 데스크탑 알림.
 *
 * - Stop: 작업이 끝났을 때 "작업 완료" 알림
 * - Notification: Claude가 입력/승인을 기다릴 때 해당 메시지로 알림
 *
 * 알림 수단이 없는 환경에서는 조용히 종료한다 (절대 차단하지 않음, 항상 exit 0).
 */

"use strict";

const fs = require("fs");
const { spawn } = require("child_process");

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function run(cmd, args) {
  try {
    const child = spawn(cmd, args, { stdio: "ignore", detached: true });
    child.on("error", () => {});
    child.unref();
  } catch {
    /* 무시 */
  }
}

function escAppleScript(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escPowerShell(s) {
  return String(s).replace(/`/g, "``").replace(/"/g, '`"');
}

function notify(title, message) {
  const platform = process.platform;

  if (platform === "darwin") {
    const script = `display notification "${escAppleScript(message)}" with title "${escAppleScript(
      title,
    )}" sound name "Ping"`;
    run("osascript", ["-e", script]);
    return;
  }

  if (platform === "linux") {
    // notify-send 가 있으면 사용, 없으면 조용히 패스
    run("notify-send", ["--app-name=Claude Code", title, message]);
    return;
  }

  if (platform === "win32") {
    const ps = `
      [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
      $t = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
      $texts = $t.GetElementsByTagName('text')
      $texts.Item(0).AppendChild($t.CreateTextNode("${escPowerShell(title)}")) | Out-Null
      $texts.Item(1).AppendChild($t.CreateTextNode("${escPowerShell(message)}")) | Out-Null
      $toast = [Windows.UI.Notifications.ToastNotification]::new($t)
      [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Claude Code").Show($toast)
    `.trim();
    run("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps]);
    return;
  }
  // 그 외 플랫폼: 아무것도 안 함
}

function main() {
  const raw = readStdin();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }

  const event = payload.hook_event_name || "";
  let title = "Claude Code";
  let message = "작업이 완료되었습니다.";

  if (event === "Notification") {
    title = "Claude Code — 입력 대기";
    message = payload.message || "Claude가 응답을 기다리고 있습니다.";
  } else if (event === "Stop" || event === "SubagentStop") {
    title = "Claude Code — 작업 완료";
    message = "요청한 작업이 끝났습니다.";
  }

  notify(title, message);
  process.exit(0);
}

main();
