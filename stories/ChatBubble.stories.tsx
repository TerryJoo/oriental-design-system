import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { ChatBubble, ChatThread } from "@/components/ChatBubble";
import type { ChatBubbleAuthor } from "@/components/ChatBubble";
import { Avatar } from "@/components/Avatar";
import { bothEras, radioArg } from "./_shared/argTypes";

const AUTHORS: readonly ChatBubbleAuthor[] = ["me", "ai"];

/**
 * Tiny status icon set used to demonstrate the `meta` slot conveying
 * sending / sent / delivered / read semantics. The component itself does
 * not ship a dedicated `status` prop — `meta` is a free-form `ReactNode`
 * slot, so consumers compose icons + timestamp themselves.
 */
const STATUS_ICON_CLASS = "inline-block w-3 h-3 align-middle";

const SendingIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={STATUS_ICON_CLASS}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" opacity="0.4" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const SentIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={STATUS_ICON_CLASS}
    aria-hidden="true"
  >
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const DeliveredIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={STATUS_ICON_CLASS}
    aria-hidden="true"
  >
    <path d="M3 13l4 4L15 9" />
    <path d="M9 13l4 4L21 7" />
  </svg>
);

const ReadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={STATUS_ICON_CLASS}
    aria-hidden="true"
  >
    <path d="M3 13l4 4L15 9l-1.5-1.5L7 14 4.5 11.5 3 13zm6 0l4 4L21 7l-1.5-1.5L13 14l-2.5-2.5L9 13z" />
  </svg>
);

const meta = {
  title: "Components/ChatBubble",
  component: ChatBubble,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Conversational message bubble with two author alignments: `author='me'` is right-aligned with the accent fill and an inverse-ink text color, while `author='ai'` is left-aligned on the era-sunken surface with a subtle border. The bubble exposes a `meta` slot under the message for timestamps, sender labels, or status indicators (sending / sent / delivered / read) — there is no dedicated `status` prop, so status is composed by the consumer. Pair with `ChatThread` (a `role='log'` container) to lay out a full conversation with consistent spacing.",
      },
    },
  },
  argTypes: {
    author: radioArg(
      AUTHORS,
      "Alignment & color treatment. `me` is right-aligned with accent fill; `ai` is left-aligned on the surface ink.",
    ),
  },
  args: {
    author: "ai",
    children: "안녕하세요. 오늘 도와드릴 일이 있을까요?",
  },
} satisfies Meta<typeof ChatBubble>;

export default meta;
type Story = StoryObj<typeof ChatBubble>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A single AI-authored bubble with neutral content. Defaults to `author='ai'` — left-aligned, era-sunken surface.",
      },
    },
  },
};

export const SenderReceiver: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Both alignments side by side. `author='ai'` (receiver) hugs the left with a sunken surface; `author='me'` (sender) hugs the right with the accent fill and inverse ink. Use `ChatThread` so each child can self-align via flex.",
      },
    },
  },
  render: () => (
    <ChatThread>
      <ChatBubble author="ai">먼저 보내는 메시지입니다.</ChatBubble>
      <ChatBubble author="me">제가 답장한 메시지입니다.</ChatBubble>
    </ChatThread>
  ),
};

export const WithAvatar: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Avatars sit in the dedicated `avatar` slot. The wrapper uses `flex-row-reverse` for `author='me'`, so the avatar always lands on the outer edge.",
      },
    },
  },
  render: () => (
    <ChatThread>
      <ChatBubble
        author="ai"
        avatar={
          <Avatar size="sm" alt="도담 봇">
            도담
          </Avatar>
        }
      >
        도담 봇이 응답한 메시지입니다.
      </ChatBubble>
      <ChatBubble
        author="me"
        avatar={
          <Avatar size="sm" alt="나">
            나
          </Avatar>
        }
      >
        제가 보낸 메시지입니다.
      </ChatBubble>
    </ChatThread>
  ),
};

export const WithTimestamp: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Timestamps render in the `meta` slot. The meta line aligns to the bubble's edge (right for `me`, left for `ai`) and uses `text-era-muted` for low-emphasis ink.",
      },
    },
  },
  render: () => (
    <ChatThread>
      <ChatBubble author="ai" meta="오후 2:14">
        오늘 일정 정리해드릴까요?
      </ChatBubble>
      <ChatBubble author="me" meta="오후 2:15">
        네, 부탁드립니다.
      </ChatBubble>
    </ChatThread>
  ),
};

export const Statuses: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Sending → sent → delivered → read, expressed through the `meta` slot. The component does not ship a `status` prop, so each row composes a small icon + label inline. Stack vertically to compare the four states.",
      },
    },
  },
  render: () => (
    <ChatThread>
      <ChatBubble
        author="me"
        meta={
          <span className="inline-flex items-center gap-1">
            <SendingIcon />
            <span>전송 중</span>
          </span>
        }
      >
        전송 중인 메시지
      </ChatBubble>
      <ChatBubble
        author="me"
        meta={
          <span className="inline-flex items-center gap-1">
            <SentIcon />
            <span>전송됨 · 오후 2:16</span>
          </span>
        }
      >
        전송된 메시지
      </ChatBubble>
      <ChatBubble
        author="me"
        meta={
          <span className="inline-flex items-center gap-1">
            <DeliveredIcon />
            <span>수신됨 · 오후 2:17</span>
          </span>
        }
      >
        상대방에게 도착한 메시지
      </ChatBubble>
      <ChatBubble
        author="me"
        meta={
          <span className="inline-flex items-center gap-1 text-[rgb(var(--accent-600))]">
            <ReadIcon />
            <span>읽음 · 오후 2:18</span>
          </span>
        }
      >
        상대방이 읽은 메시지
      </ChatBubble>
    </ChatThread>
  ),
};

export const LongMessage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Paragraph-length text wraps inside the bubble. The bubble caps at `max-w-[78%]` of the thread, so long copy line-wraps rather than stretching the parent.",
      },
    },
  },
  render: () => (
    <ChatThread>
      <ChatBubble author="ai" meta="오후 2:20">
        오방색은 청·적·황·백·흑의 다섯 빛깔로, 한국 전통 문화에서
        동·남·중앙·서·북의 다섯 방위와 우주를 구성하는 다섯 가지 요소를
        상징합니다. 디자인 시스템에서 이 팔레트를 그대로 가져오기보다 각 색이
        가진 의미와 비율을 현대적인 UI 표면 토큰에 녹여 재해석하는 것이
        중요합니다.
      </ChatBubble>
      <ChatBubble author="me" meta="오후 2:21">
        흥미롭네요. 그러면 액센트 색은 어디서 가져오나요? 따뜻한 토라코타 톤이
        오방색 중 어디에 가장 가까운지 비교해주시면 좋겠습니다. 가능하다면
        헤리티지 에라와 네온 에라 각각의 사용 예시도 함께 보여주세요.
      </ChatBubble>
    </ChatThread>
  ),
};

export const MultilineWithFormatting: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Children accept arbitrary JSX, so multi-line content can be authored with explicit `<br />` or block elements, and inline emphasis (`<strong>`, `<em>`) is preserved.",
      },
    },
  },
  render: () => (
    <ChatThread>
      <ChatBubble author="ai" meta="오후 3:00">
        <span>
          오늘의 할 일을 정리했습니다.
          <br />
          <strong>1.</strong> 토큰 정리
          <br />
          <strong>2.</strong> 컴포넌트 스토리북 추가
          <br />
          <strong>3.</strong> <em>era 비교 검수</em>
        </span>
      </ChatBubble>
      <ChatBubble author="me" meta="오후 3:01">
        <span>
          좋아요!
          <br />
          <em>3번</em>부터 시작할게요.
        </span>
      </ChatBubble>
    </ChatThread>
  ),
};

export const Conversation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A realistic seven-bubble thread alternating between `ai` and `me`. Use this to validate `ChatThread` spacing (`gap-2.5`) and the rhythm of left/right alignments.",
      },
    },
  },
  render: () => (
    <ChatThread>
      <ChatBubble
        author="ai"
        avatar={
          <Avatar size="sm" alt="도담">
            도담
          </Avatar>
        }
        meta="오후 1:00"
      >
        안녕하세요! 무엇을 도와드릴까요?
      </ChatBubble>
      <ChatBubble author="me" meta="오후 1:01">
        오방색 팔레트에 대해 설명해주세요.
      </ChatBubble>
      <ChatBubble
        author="ai"
        avatar={
          <Avatar size="sm" alt="도담">
            도담
          </Avatar>
        }
        meta="오후 1:01"
      >
        오방색은 청·적·황·백·흑 다섯 가지 색을 의미합니다.
      </ChatBubble>
      <ChatBubble author="me" meta="오후 1:02">
        각 색이 어떤 방위를 상징하나요?
      </ChatBubble>
      <ChatBubble
        author="ai"
        avatar={
          <Avatar size="sm" alt="도담">
            도담
          </Avatar>
        }
        meta="오후 1:02"
      >
        청은 동, 적은 남, 황은 중앙, 백은 서, 흑은 북을 상징합니다.
      </ChatBubble>
      <ChatBubble author="me" meta="오후 1:03">
        오! 디자인 시스템에 어떻게 적용되었나요?
      </ChatBubble>
      <ChatBubble
        author="ai"
        avatar={
          <Avatar size="sm" alt="도담">
            도담
          </Avatar>
        }
        meta="오후 1:03"
      >
        헤리티지 에라는 흙과 자기, 네온 에라는 청·적 두 빛으로 재해석했어요.
      </ChatBubble>
    </ChatThread>
  ),
};

// Shared chip class for the WithReactions story. Notes on each utility:
//
//  - `bg-era-base` is opaque in both eras (Heritage `#f6efe1`, Neon `#0b0e18`),
//    so contrast vs `text-era-primary` is decoupled from the parent surface.
//    Heritage 16.39:1 / Neon 15.78:1 — both far above AA 4.5:1.
//  - The previous `bg-era-soft` was a borderColor-only utility (it has no
//    `backgroundColor` mapping in `tailwind.preset.ts`), so the chip was
//    transparent and inherited the bubble's accent-600 fill, dropping
//    contrast to ~2.5:1 on Heritage `me` and failing the axe gate.
//  - `border-era` is the full-shorthand era border utility from
//    `globals.css`; it stays era-aware without depending on `bg-*`.
const REACTION_CHIP_CLASS =
  "px-2 py-0.5 rounded-full bg-era-base text-era-primary border-era";

export const WithReactions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "ChatBubble does not ship a dedicated `reactions` or `footer` prop, but reaction chips can be composed inside `children` (or in a sibling rendered after the bubble). This story demonstrates the in-children pattern with a small reaction strip below the message body. Chips use `bg-era-base` (opaque in both eras) so contrast is preserved when the chip sits inside the `me` bubble's accent-600 fill — `bg-era-soft` is a borderColor-only utility and would render the chip transparent.",
      },
    },
  },
  render: () => (
    <ChatThread>
      <ChatBubble author="ai" meta="오후 4:00">
        <span>네온 에라 미리보기 보냈어요. 어떠신가요?</span>
        <span className="mt-2 flex flex-wrap gap-1.5 text-xs">
          <span className={REACTION_CHIP_CLASS}>👍 3</span>
          <span className={REACTION_CHIP_CLASS}>🔥 1</span>
          <span className={REACTION_CHIP_CLASS}>🎉 2</span>
        </span>
      </ChatBubble>
      <ChatBubble author="me" meta="오후 4:01">
        <span>완전 좋아요!</span>
        <span className="mt-2 flex flex-wrap gap-1.5 text-xs">
          <span className={REACTION_CHIP_CLASS}>❤️ 2</span>
        </span>
      </ChatBubble>
    </ChatThread>
  ),
};

export const EraCompare: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Heritage vs Neon side-by-side. The `me` bubble keeps the accent fill in both eras, while the `ai` bubble's surface, border, and ink swap between 한지/먹선 and 글래스/네온 — the bubble reads era tokens (`bg-era-sunken`, `border-era`, `text-era-primary`, `text-era-muted`) so no React re-render is required to switch.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <ChatThread>
        <ChatBubble author="ai" meta="오후 5:00">
          헤리티지와 네온, 어떤 분위기가 마음에 드세요?
        </ChatBubble>
        <ChatBubble author="me" meta="오후 5:01">
          둘 다 좋네요!
        </ChatBubble>
        <ChatBubble author="ai" meta="오후 5:01">
          서피스와 잉크가 자동으로 바뀌어요.
        </ChatBubble>
      </ChatThread>
    )),
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Presentational assertion: ChatBubble is a passive surface (no onClick / onCopy / onReply handlers in its API), so the play function verifies the rendered structure instead — `data-author` on each bubble, the `role='log'` thread, the meta timestamp, and the status label.",
      },
    },
  },
  render: () => (
    <ChatThread data-testid="thread">
      <ChatBubble author="ai" meta="오후 6:00" data-testid="bubble-ai">
        받는 메시지입니다.
      </ChatBubble>
      <ChatBubble
        author="me"
        meta={
          <span className="inline-flex items-center gap-1">
            <ReadIcon />
            <span>읽음 · 오후 6:01</span>
          </span>
        }
        data-testid="bubble-me"
      >
        보낸 메시지입니다.
      </ChatBubble>
    </ChatThread>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const thread = await canvas.findByTestId("thread");
    expect(thread).toHaveAttribute("role", "log");
    expect(thread).toHaveAttribute("aria-live", "polite");

    const aiBubble = await canvas.findByTestId("bubble-ai");
    expect(aiBubble).toHaveAttribute("data-author", "ai");
    expect(aiBubble).toHaveAttribute("role", "group");

    const meBubble = await canvas.findByTestId("bubble-me");
    expect(meBubble).toHaveAttribute("data-author", "me");
    expect(meBubble).toHaveAttribute("role", "group");

    expect(canvas.getByText("오후 6:00")).toBeInTheDocument();
    expect(canvas.getByText(/읽음 · 오후 6:01/)).toBeInTheDocument();
  },
};
