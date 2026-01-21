# 깨두부 - Claude Code 가이드

## ⚠️ 문서 수정 프로토콜

**PRD.md, CLAUDE.md, STYLE.md 수정 시 반드시:**

1. 변경 전 내용과 변경 후 내용을 명시
2. 사용자에게 확인 요청
3. 허가 받은 후에만 수정

```
예시:
"PRD.md 수정이 필요합니다.

[변경 전]
Block의 depth는 0 | 1

[변경 후]
Block의 depth는 0 | 1 | 2

이렇게 수정해도 될까요?"
```

---

## 데이터 모델

> PRD.md의 Block, LeverageBlock 참조

### CycleState
```typescript
type CycleState = {
  id: string;
  phase: 'plan' | 'execute' | 'reflect';
  planStep: 1 | 2 | 3 | 4;
  goal: Block | null;
  tasks: Block[];
  backlog: Block[];
  memos: Block[];
  keeps: LeverageBlock[];
  tries: LeverageBlock[];
  probability: number;
  createdAt: Date;
};
```

---

## 폴더 구조

```
src/
├── components/     # UI만 (렌더링)
├── hooks/          # 도메인 로직
├── stores/         # Zustand
├── services/       # Storage 추상화
├── types/          # 타입 정의
└── utils/          # 헬퍼 함수
```

---

## 핵심 컴포넌트

### BlockEditor
```typescript
type BlockEditorProps = {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  placeholder?: string;
  maxDepth?: 0 | 1;
  showOrder?: boolean;
  droppableId: string;
};
```

### 영역 ID (D&D)
`'goal' | 'tasks' | 'backlog' | 'memos' | 'keeps' | 'tries'`

---

## Store

### cycleStore
`cycle`, `setPhase`, `setPlanStep`, `setGoal`, `setTasks`, `setBacklog`, `setMemos`, `addKeep`, `addTry`, `setProbability`

### leverageStore
`items`, `add`, `archive`, `restore`, `delete`, `getByTiming`

### timerStore
`remaining`, `isRunning`, `start`, `pause`, `tick`, `startRest`

---

## 구현 순서

1. 타입 + Store + Storage 서비스
2. BlockEditor (키보드 + D&D)
3. 레이아웃 (Header, Sidebar, PhaseBar)
4. Plan (4탭)
5. Execute
6. Reflect (메모 분류)
7. Rest + Leverage 관리

---

## 주의사항

- Block은 어디서든 이동 가능
- Keep/Try만 LeverageBlock
- 체크 = deleted (완전 삭제 X)
- 80% 미만 → 다음 못 감
- 메모 분류 완료해야 휴식 가능
- Leverage 체크 완료해야 시각화 시작

### 프로세스
1. "커밋해줘" 요청 시 **커밋 메시지를 먼저 보여주고 확인 요청**
2. 사용자 승인 후 커밋 실행
3. 항상 `Co-authored-by: Claude <claude@anthropic.com>` 포함

## 커밋 메시지 규칙

Conventional Commits 형식을 따른다:
```
<type>: <subject>

[body]

Co-authored-by: Claude <claude@anthropic.com>
```

### Type
- feat: 새 기능
- fix: 버그 수정
- refactor: 리팩토링
- style: 포맷팅
- docs: 문서
- chore: 설정, 빌드

### 규칙
- subject는 50자 이내, 명령형으로
- body에 변경 내용 bullet으로 정리
- 항상 Co-authored-by 포함
