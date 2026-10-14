import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { Header } from "../components/ui/Header";

export interface ScreenLayoutProps {
  /** 헤더 타이틀. */
  title: string;
  children: ReactNode;
}

/**
 * 화면(Screen) 공통 레이아웃 — 뒤로가기 헤더 + 콘텐츠 영역.
 * 각 화면은 이 레이아웃으로 감싸서 홈으로 돌아가는 동선을 통일한다.
 */
export function ScreenLayout({ title, children }: ScreenLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-neutral-normal">
      <Header
        type="normal"
        titleValue={title}
        back
        onBack={() => navigate("/")}
      />
      {children}
    </div>
  );
}
