# 코딩 스타일 가이드

## 1. TypeScript
- `type` 사용 (interface는 라이브러리 확장 시만)
- `import type { ... }` 분리
- `any` 금지 → `unknown` 또는 구체적 타입

## 2. UI/도메인 분리
| UI (컴포넌트 `.tsx`) | 도메인 (훅 `use*.ts`) |
|---|---|
| 렌더링, 이벤트 | 비즈니스 로직, 상태 변환 (단, 순수함수는 훅 상단에 별도 정의) |

## 3. 컴포넌트
- **Arrow function 필수**: `const Comp = () => <div />`
- JSX 파일: `.tsx`만
- Self-closing: `<Comp />`
- Boolean props: `<Comp disabled />` (not `disabled={true}`)
- 중괄호 생략: `title="Hello"` (not `title={'Hello'}`)
- Fragment 최소화

## 4. 네이밍
| 대상 | 규칙 |
|---|---|
| 컴포넌트 | `PascalCase` |
| 훅 | `useCamelCase` |
| 타입 | `PascalCase` |
| 상수 | `UPPER_SNAKE_CASE` |

## 5. 변수/함수
- `const` 우선, `var` 금지
- Magic Number → 상수
- 구조 분해: `const { id } = block`
- 템플릿 리터럴: `` `Block ${id}` ``
- 객체 단축: `{ id, content }`
- Arrow function body: 단일 표현식이면 `=>` 바로, 복수면 `{ }`

## 6. 비교/제어
- `===` 엄격 비교
- 단일 줄 if는 중괄호 생략 가능

## 7. import 순서
```
builtin → external → internal → parent → sibling → index
```
그룹 간 빈 줄 필수

## 8. 훅 패턴
```typescript
export const useXxx = (initial) => {
  const [state, setState] = useState(initial);
  const action = () => { ... };
  return { state, action };
};
```

## 9. 체크리스트
- [ ] Arrow function 컴포넌트
- [ ] 도메인 로직은 훅으로 분리
- [ ] type 사용 (interface X)
- [ ] import type 분리
- [ ] import 순서 + 빈 줄
