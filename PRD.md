# 깨두부 PRD

## 개요
90분 집중 사이클 기반 생산성 앱. "게으르지 말자"는 자기 점검 도구.

**타겟**: 나 혼자 사용
**기술**: pnpm, React 18 + TypeScript, Vite, shadcn/ui, Tailwind, Zustand, @dnd-kit/core, LocalStorage

---

## 핵심 개념

### Block
모든 항목의 기본 단위. 목표, 과제, 할일, 메모 모두 Block.

```typescript
type Block = {
  id: string;
  content: string;
  depth: 0 | 1;                   // 들여쓰기 (최대 2-depth)
  status: 'active' | 'deleted';  // 체크 시 deleted + 취소선
  parentId?: string;
};
```

### LeverageBlock
Keep/Try 영역의 Block. 다른 영역으로 이동 시 wrapper 벗겨짐.

```typescript
type LeverageBlock = {
  id: string;
  block: Block;
  timing: 'before' | 'during' | 'after';
  source: 'keep' | 'try';
  status: 'active' | 'archived';
  createdAt: Date;
  archivedAt?: Date;
};
```

---

## 사이클 구조

```
[90분 Flow] → [10/20분 Rest] → 반복 또는 마감

Flow 내부:
Plan (4탭) → Execute → Reflect
└ 목표 정의 → 목표 분할 → 목표 점검 → 목표 시각화
```

---

## 레이아웃

### 글로벌 (5:5)
```
┌─────────────────────────────────────────────────┐
│  ⏱️ Timer                                        │
├───────────┬───────────┬───────────┬─────────────┤
│   Plan    │  Execute  │  Reflect  │             │
├───────────┴───────────┴───────────┴─────────────┤
│  (Plan시) 탭: 정의 | 분할 | 점검 | 시각화         │
├───────────────────────┬─────────────────────────┤
│                       │  다음에 할 일            │
│    메인 콘텐츠         │  ─────────────────────  │
│                       │  작업 중 메모            │
└───────────────────────┴─────────────────────────┘
```

---

## Phase별 요약

### Plan
| 탭 | 내용 | 조건 |
|---|---|---|
| 목표 정의 | 한 문장 목표 | - |
| 목표 분할 | 3과제 × 3할일 (Block) | 목표 있음 |
| 목표 점검 | 확률 슬라이더, 80% 필수 | 과제 있음 |
| 목표 시각화 | 순서 + Leverage 체크 + 30초 시각화 | 80% 이상 |

### Execute
- 과제 체크리스트 + 작업 중 Leverage

### Reflect
- 완료율 표시
- 메모 분류 필수 (Keep/Try/다음에 할 일)
- 분류 완료해야 휴식 가능

### Rest (팝업)
- 10분 / 20분+스트레칭 선택

---

## Block 인터랙션

| 동작 | 설명 |
|---|---|
| Enter | 같은 depth 새 Block |
| Tab / Shift+Tab | 들여쓰기 / 내어쓰기 |
| Backspace (빈 Block) | 삭제 |
| D&D | 어디서든 어디로든 |
| 체크 | 취소선 + deleted |

---

## Keep/Try 드롭 시
timing badge 선택 필수: `[시작 전]` `[작업 중]` `[회고 시]`

---

## 우선순위

### MVP
- Block 시스템, Plan/Execute/Reflect/Rest, Leverage 관리, 타이머, LocalStorage

### 2차
- 히스토리/통계

### 3차
- Supabase 연동

### 4차
- 작업 가능 확률 계산에 AI api 연동
