import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PromptInput } from "./PromptInput";

describe("PromptInput", () => {
  it("renders textarea with placeholder", () => {
    render(<PromptInput placeholder="입력" />);
    expect(screen.getByPlaceholderText("입력")).toBeInTheDocument();
  });

  it("calls onChange while typing", () => {
    const onChange = vi.fn();
    render(<PromptInput placeholder="x" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("x"), {
      target: { value: "안녕" },
    });
    expect(onChange).toHaveBeenCalledWith("안녕");
  });

  it("submits on Enter without Shift", () => {
    const onSubmit = vi.fn();
    render(<PromptInput defaultValue="hi" onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("hi");
  });

  it("does NOT submit on Shift+Enter", () => {
    const onSubmit = vi.fn();
    render(<PromptInput defaultValue="hi" onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole("textbox"), {
      key: "Enter",
      shiftKey: true,
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits on send button click", () => {
    const onSubmit = vi.fn();
    render(<PromptInput defaultValue="hi" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByLabelText("전송"));
    expect(onSubmit).toHaveBeenCalledWith("hi");
  });

  it("links label to textarea via htmlFor/id", () => {
    render(<PromptInput label="질문" placeholder="ask" />);
    expect(screen.getByLabelText("질문")).toBe(
      screen.getByPlaceholderText("ask"),
    );
  });

  it("renders error, sets aria-invalid and aria-describedby", () => {
    render(<PromptInput error="필수 항목입니다" placeholder="x" />);
    const textarea = screen.getByPlaceholderText("x");
    const errorNode = screen.getByText("필수 항목입니다");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(errorNode).toBeInTheDocument();
    const describedBy = textarea.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy && errorNode.id).toBeTruthy();
    expect(describedBy?.split(" ")).toContain(errorNode.id);
  });

  it("renders helperText when no error, hides helperText when error is set", () => {
    const { rerender } = render(
      <PromptInput helperText="도움말 텍스트" placeholder="x" />,
    );
    expect(screen.getByText("도움말 텍스트")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("x")).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );

    rerender(
      <PromptInput
        helperText="도움말 텍스트"
        error="에러 메시지"
        placeholder="x"
      />,
    );
    expect(screen.queryByText("도움말 텍스트")).not.toBeInTheDocument();
    expect(screen.getByText("에러 메시지")).toBeInTheDocument();
  });

  it("renders maxLength counter and updates on input", () => {
    render(<PromptInput maxLength={20} defaultValue="hi" placeholder="x" />);
    const textarea = screen.getByPlaceholderText("x") as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute("maxLength", "20");
    expect(screen.getByText("2 / 20")).toBeInTheDocument();
    fireEvent.change(textarea, { target: { value: "hello" } });
    expect(screen.getByText("5 / 20")).toBeInTheDocument();
    const describedBy = textarea.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy).toMatch(/-counter$/);
  });

  it("loading disables textarea/send and announces via Spinner", () => {
    render(<PromptInput loading defaultValue="hi" placeholder="x" />);
    const textarea = screen.getByPlaceholderText("x") as HTMLTextAreaElement;
    const sendBtn = screen.getByLabelText("전송") as HTMLButtonElement;
    expect(textarea).toBeDisabled();
    expect(sendBtn).toBeDisabled();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("로딩 중")).toBeInTheDocument();
  });

  it("preserves textareaProps spread alongside new props (legacy back-compat)", () => {
    render(
      <PromptInput
        label="질문"
        error="에러"
        maxLength={50}
        placeholder="x"
        textareaProps={{
          "aria-describedby": "external-help",
          name: "prompt",
        }}
      />,
    );
    const textarea = screen.getByPlaceholderText("x") as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute("name", "prompt");
    // New props win over legacy aria-describedby — but the legacy id is appended.
    const describedBy = textarea.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const ids = describedBy!.split(" ");
    expect(ids).toContain("external-help");
    expect(ids.some((id) => id.endsWith("-help"))).toBe(true);
    expect(ids.some((id) => id.endsWith("-counter"))).toBe(true);
    // Internal id wins over any id smuggled through textareaProps.
    expect(textarea.id).toBeTruthy();
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });
});
