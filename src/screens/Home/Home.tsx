import { useNavigate } from "react-router-dom";

import { Header } from "../../components/ui/Header";
import { Empty } from "../../components/ui/Empty";
import { MenuItem } from "../../components/ui/MenuItem";
import { Icon } from "../../icons";
import { screenRegistry } from "../registry";

/** 포트폴리오 홈 — 구현한 화면 목록. 클릭 시 해당 화면으로 이동. */
export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-neutral-normal">
      <Header
        type="normal"
        titleValue="또하나의가족 디자인시스템"
        back={false}
      />

      {screenRegistry.length === 0 ? (
        <div className="flex items-center justify-center px-(--sz-20) py-(--sz-64)">
          <Empty
            mainText="아직 구현된 화면이 없습니다"
            subText="src/screens/registry.ts 에 화면을 추가하면 여기에 표시됩니다"
          />
        </div>
      ) : (
        <nav className="flex flex-col">
          {screenRegistry.map((screen) => (
            <MenuItem
              key={screen.id}
              variant="icon"
              label={screen.title}
              onClick={() => navigate(`/screens/${screen.id}`)}
            >
              <Icon name="chevron_right_line" size={24} />
            </MenuItem>
          ))}
        </nav>
      )}
    </div>
  );
}
