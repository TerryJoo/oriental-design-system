import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MarkdownEditor } from "./MarkdownEditor";

describe("MarkdownEditor", () => {
  it("renders default toolbar buttons", () => {
    render(<MarkdownEditor placeholder="입력" />);
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByText("H1")).toBeInTheDocument();
    expect(screen.getByText("•")).toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    const onChange = vi.fn();
    render(<MarkdownEditor placeholder="입력" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("입력"), {
      target: { value: "안녕" },
    });
    expect(onChange).toHaveBeenCalledWith("안녕");
  });

  it("supports custom toolbar actions", () => {
    render(
      <MarkdownEditor
        placeholder="x"
        actions={[{ key: "x", label: "X", wrap: "~" }]}
      />,
    );
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  describe("Accessibility", () => {
    it("gives every default toolbar button an aria-label from action.title", () => {
      render(<MarkdownEditor placeholder="입력" />);
      // The default 8 actions each declare a Korean title — verify the
      // accessible name resolution prefers `aria-label` over visible text.
      expect(screen.getByRole("button", { name: "굵게" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "기울임" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "제목 1" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "체크리스트" }),
      ).toBeInTheDocument();
    });

    it("falls back to action.key when no title is provided", () => {
      // Icon-only / title-less actions (e.g. SVG label) should still expose
      // an accessible name so axe button-name doesn't fire.
      render(
        <MarkdownEditor
          actions={[
            {
              key: "underline",
              label: <span aria-hidden="true">U</span>,
              wrap: "__",
            },
          ]}
        />,
      );
      expect(
        screen.getByRole("button", { name: "underline" }),
      ).toBeInTheDocument();
    });

    it("retains the title attribute as a tooltip alongside aria-label", () => {
      render(<MarkdownEditor placeholder="입력" />);
      const bold = screen.getByRole("button", { name: "굵게" });
      expect(bold).toHaveAttribute("title", "굵게");
      expect(bold).toHaveAttribute("aria-label", "굵게");
    });

    it("labels the textarea by default for screen readers", () => {
      render(<MarkdownEditor placeholder="입력" />);
      // Default aria-label gives the textarea an accessible name even
      // when no <label> is wired up by the consumer.
      expect(
        screen.getByRole("textbox", { name: "마크다운 편집기" }),
      ).toBeInTheDocument();
    });

    it("allows overriding the textarea aria-label via textareaProps", () => {
      render(
        <MarkdownEditor
          placeholder="입력"
          textareaProps={{ "aria-label": "본문" }}
        />,
      );
      expect(screen.getByRole("textbox", { name: "본문" })).toBeInTheDocument();
    });
  });

  describe("Preview", () => {
    it("invokes renderPreview with the current value on render", () => {
      const renderPreview = vi.fn((md: string) => <span>preview:{md}</span>);
      render(
        <MarkdownEditor
          defaultValue="hello **world**"
          renderPreview={renderPreview}
        />,
      );
      // Preview region exposed via role="region" + aria-label.
      expect(
        screen.getByRole("region", { name: "마크다운 미리보기" }),
      ).toBeInTheDocument();
      // Renderer received the initial source string verbatim.
      expect(renderPreview).toHaveBeenCalledWith("hello **world**");
      expect(screen.getByText("preview:hello **world**")).toBeInTheDocument();
    });

    it("updates the preview pane when typing in the textarea", () => {
      const renderPreview = (md: string) => (
        <span data-testid="preview-output">{md.toUpperCase()}</span>
      );
      render(
        <MarkdownEditor defaultValue="initial" renderPreview={renderPreview} />,
      );
      // Initial preview reflects the defaultValue.
      expect(screen.getByTestId("preview-output")).toHaveTextContent("INITIAL");
      // Type into the textarea — the preview should re-render with the
      // latest value through the internal uncontrolled-value mirror.
      fireEvent.change(
        screen.getByRole("textbox", { name: "마크다운 편집기" }),
        { target: { value: "fresh content" } },
      );
      expect(screen.getByTestId("preview-output")).toHaveTextContent(
        "FRESH CONTENT",
      );
    });

    it("renders previewLayout='stacked' with the stacked layout class", () => {
      const renderPreview = (md: string) => <span>{md}</span>;
      render(
        <MarkdownEditor
          defaultValue="x"
          renderPreview={renderPreview}
          previewLayout="stacked"
        />,
      );
      const preview = screen.getByRole("region", {
        name: "마크다운 미리보기",
      });
      // The stacked layout flips the divider from `md:border-s` (split) to
      // `border-t` only — assert the stacked class is on the preview pane.
      expect(preview.className).toContain("border-t");
      expect(preview.className).not.toContain("md:border-s");
      // The body wrapper applies the single-column grid.
      const body = preview.parentElement as HTMLElement;
      expect(body.className).toContain("grid-cols-1");
      expect(body.className).not.toContain("md:grid-cols-2");
    });
  });

  describe("Disabled", () => {
    it("disables the textarea and every toolbar button when `disabled` is true", () => {
      render(<MarkdownEditor disabled placeholder="입력" />);
      expect(screen.getByPlaceholderText("입력")).toBeDisabled();
      // All 8 default toolbar buttons must carry the native `disabled` attribute.
      const toolbar = screen.getByRole("toolbar");
      const buttons = within(toolbar).getAllByRole("button");
      expect(buttons).toHaveLength(8);
      for (const button of buttons) {
        expect(button).toBeDisabled();
      }
    });

    it("does not fire onChange when a toolbar button is clicked while disabled", () => {
      const onChange = vi.fn();
      render(
        <MarkdownEditor
          disabled
          defaultValue="본문"
          onChange={onChange}
          placeholder="입력"
        />,
      );
      // Native `disabled` blocks the click handler — confirm the callback is
      // never invoked and the underlying textarea value is untouched.
      fireEvent.click(screen.getByRole("button", { name: "굵게" }));
      expect(onChange).not.toHaveBeenCalled();
      expect(
        (screen.getByPlaceholderText("입력") as HTMLTextAreaElement).value,
      ).toBe("본문");
    });
  });
});
