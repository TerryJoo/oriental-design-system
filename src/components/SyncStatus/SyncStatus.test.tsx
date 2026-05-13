import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SyncStatus } from "./SyncStatus";
import { syncStatusStateMap, type SyncStatusState } from "./SyncStatus.styles";

describe("SyncStatus", () => {
  it("renders default connected label", () => {
    render(<SyncStatus />);
    expect(screen.getByText("연결됨")).toBeInTheDocument();
  });

  describe("State", () => {
    (["connected", "syncing", "offline"] as const).forEach(
      (state: SyncStatusState) => {
        it(`state=${state} shows correct label`, () => {
          render(<SyncStatus state={state} />);
          expect(
            screen.getByText(syncStatusStateMap[state].text),
          ).toBeInTheDocument();
        });
      },
    );
  });

  it("supports a custom label", () => {
    render(<SyncStatus label="동기화 OK" />);
    expect(screen.getByText("동기화 OK")).toBeInTheDocument();
  });
});
