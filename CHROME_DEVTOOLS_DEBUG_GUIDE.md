# Chrome DevTools로 YouTube 임베드 차단 원인 확인하기

## 🎯 목적

iframe이 "이 콘텐츠는 차단되어 있습니다" 오류를 보이는 **정확한 원인**을 파악합니다.

---

## 📋 단계별 가이드

### 1단계: 테스트 페이지 열기

1. Chrome 브라우저 실행
2. 다음 URL 접속:
   ```
   https://glec-website.vercel.app/knowledge/videos/f983ef8b-632b-4151-8980-9b01cf49647d
   ```

### 2단계: 개발자 도구 열기

**방법 A**: 키보드 단축키
- Windows/Linux: `F12` 또는 `Ctrl + Shift + I`
- Mac: `Cmd + Option + I`

**방법 B**: 마우스 우클릭
- 페이지 빈 공간에서 우클릭
- "검사" 또는 "Inspect" 클릭

### 3단계: Console 탭 선택

1. 개발자 도구 상단의 **Console** 탭 클릭
2. 빨간색 오류 메시지 찾기 (❌ 아이콘)

### 4단계: 오류 메시지 확인

다음 중 어떤 오류가 표시되는지 확인:

#### ❌ **Case 1: X-Frame-Options 오류**

```
Refused to display 'https://www.youtube.com/embed/4qnXyIdzYC8' in a frame
because it set 'X-Frame-Options' to 'deny'.
```

**의미**: YouTube가 X-Frame-Options 헤더로 임베드를 차단

**원인**:
- YouTube Studio에서 임베드 비활성화 (하지만 체크박스 없음)
- 또는 YouTube 채널 설정에서 전역 임베드 차단

**해결 방법**: 아래 "채널 설정 확인" 섹션 참조

---

#### ❌ **Case 2: CSP frame-ancestors 오류**

```
Refused to frame 'https://www.youtube.com/embed/4qnXyIdzYC8' because it violates
the following Content Security Policy directive: "frame-ancestors 'none'".
```

**의미**: YouTube의 CSP(Content Security Policy)가 임베드 차단

**원인**:
- 연령 제한 콘텐츠
- 저작권 클레임 (Content ID)
- 특정 국가에서만 차단

**해결 방법**: 아래 "연령 제한 및 저작권 확인" 섹션 참조

---

#### ❌ **Case 3: 404 Not Found**

```
Failed to load resource: the server responded with a status of 404 (Not Found)
https://www.youtube.com/embed/4qnXyIdzYC8
```

**의미**: YouTube 영상이 삭제되었거나 비공개로 전환됨

**원인**:
- 영상이 삭제됨
- 비공개로 설정 변경
- 잘못된 video ID

**해결 방법**: YouTube에서 영상 존재 여부 확인
```
https://www.youtube.com/watch?v=4qnXyIdzYC8
```

---

#### ❌ **Case 4: Mixed Content 오류**

```
Mixed Content: The page at 'https://glec-website.vercel.app/...' was loaded over HTTPS,
but requested an insecure frame 'http://www.youtube.com/embed/4qnXyIdzYC8'.
```

**의미**: HTTPS 페이지에서 HTTP iframe 요청 (보안 오류)

**원인**: iframe src가 `http://` 대신 `https://`를 사용해야 함

**해결 방법**: GLEC 코드 수정 (하지만 이미 `https://` 사용 중 ✅)

---

#### ❌ **Case 5: CORS 오류**

```
Access to fetch at 'https://www.youtube.com/embed/4qnXyIdzYC8' from origin
'https://glec-website.vercel.app' has been blocked by CORS policy.
```

**의미**: CORS(Cross-Origin Resource Sharing) 정책 위반

**원인**: GLEC iframe 설정 문제 (하지만 이미 수정 완료 ✅)

**해결 방법**: iframe에 올바른 `allow` 속성 추가 (이미 완료)

---

#### ✅ **Case 6: 오류 없음 (정상)**

Console에 오류가 없고 영상이 재생되면 문제 해결 완료!

---

## 🔍 추가 디버깅: Network 탭 확인

Console에 오류가 없는데도 영상이 안 나오면:

### 1단계: Network 탭 열기

1. 개발자 도구 상단의 **Network** 탭 클릭
2. 페이지 새로고침 (`Ctrl + R` 또는 `F5`)

### 2단계: iframe 요청 찾기

1. 필터 입력란에 `embed` 입력
2. `embed/4qnXyIdzYC8` 항목 클릭

### 3단계: Response Headers 확인

우측 패널에서 **Headers** 탭 선택 → **Response Headers** 섹션 확인:

**찾아야 할 헤더**:

```
X-Frame-Options: DENY
```
또는
```
X-Frame-Options: SAMEORIGIN
```

**이 헤더가 있으면** → YouTube가 임베드 차단 중

**이 헤더가 없으면** → 다른 원인 (CSP, 연령 제한 등)

---

## 🛠️ 원인별 해결 방법

### 해결 방법 A: 채널 설정 확인

YouTube Studio에 "임베드 허용" 체크박스가 없다고 하셨으므로, **채널 수준의 설정**을 확인:

1. [YouTube Studio](https://studio.youtube.com) 접속
2. 좌측 메뉴 → **설정** (톱니바퀴 아이콘)
3. **채널** → **고급 설정**
4. **"다른 웹사이트에서 내 콘텐츠 게시 허용"** 찾기
5. ✅ 체크되어 있는지 확인

### 해결 방법 B: 연령 제한 및 저작권 확인

1. YouTube Studio → **콘텐츠** → "GLEC AI DTG official" 선택
2. **제한** 탭 확인:
   - "연령 제한": **없음** 또는 **설정 안 함** 확인
   - "연령 제한 (자체 인증)": 체크 해제
3. **저작권** 탭 확인:
   - "저작권 클레임": 없어야 함
   - 클레임이 있으면 → 이의 제기 또는 음원 교체

### 해결 방법 C: 공개 범위 확인

1. YouTube Studio → **콘텐츠** → "GLEC AI DTG official" 선택
2. **표시** 탭 확인:
   - ✅ **공개**: 모든 사람이 볼 수 있음 (임베드 가능)
   - ✅ **일부 공개**: 링크가 있는 사람만 (임베드 가능)
   - ❌ **비공개**: 본인만 볼 수 있음 (임베드 불가능)

### 해결 방법 D: youtube-nocookie.com 사용 (Privacy-Enhanced Mode)

YouTube의 프라이버시 강화 모드를 사용하면 일부 차단을 우회할 수 있습니다:

**기존 (현재)**:
```html
<iframe src="https://www.youtube.com/embed/4qnXyIdzYC8">
```

**개선 (Privacy-Enhanced)**:
```html
<iframe src="https://www.youtube-nocookie.com/embed/4qnXyIdzYC8">
```

**차이점**:
- `youtube-nocookie.com`: 쿠키를 설정하지 않음 (GDPR 준수)
- 일부 브라우저에서 임베드 차단이 완화될 수 있음

GLEC 웹사이트에 이 변경을 적용할 수 있습니다 (선택사항).

---

## 📸 스크린샷 가이드

오류 메시지를 정확히 파악하려면 다음 스크린샷을 제공해 주세요:

### 1. Console 탭 스크린샷

1. Chrome DevTools → **Console** 탭
2. 빨간색 오류 메시지가 보이는 전체 화면 캡처
3. 오류 메시지 전체 텍스트 복사

**예시**:
```
[복사한 오류 메시지를 여기에 붙여넣기]
```

### 2. Network 탭 스크린샷

1. Chrome DevTools → **Network** 탭
2. `embed/4qnXyIdzYC8` 항목 클릭
3. **Headers** → **Response Headers** 섹션 캡처

**특히 확인할 헤더**:
- `X-Frame-Options`
- `Content-Security-Policy`
- `Status Code` (200 OK vs 404 Not Found)

### 3. YouTube Studio 설정 스크린샷

1. YouTube Studio → **설정** → **채널** → **고급 설정**
2. "다른 웹사이트에서 내 콘텐츠 게시 허용" 옵션 캡처

---

## 🚀 빠른 테스트: 다른 YouTube 영상으로 확인

GLEC 영상의 문제인지, 전체 시스템의 문제인지 확인:

### 테스트 영상 ID: `dQw4w9WgXcQ` (확실히 임베드 가능한 공개 영상)

1. GLEC Admin → 지식센터 비디오 → **새 영상 생성**
2. 제목: `Test Embed Video`
3. YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
4. 저장 후 클라이언트 페이지에서 확인

**결과**:
- ✅ 테스트 영상 재생됨 → "GLEC AI DTG official" 영상만의 문제
- ❌ 테스트 영상도 차단됨 → GLEC 시스템 전체의 iframe 문제

---

## 📋 체크리스트

- [ ] Chrome DevTools → Console 탭 열기
- [ ] 빨간색 오류 메시지 확인
- [ ] 오류 메시지 전체 텍스트 복사
- [ ] Network 탭 → `embed/4qnXyIdzYC8` 헤더 확인
- [ ] `X-Frame-Options` 헤더 존재 여부 확인
- [ ] YouTube Studio → 채널 설정 → 고급 설정 확인
- [ ] 영상 공개 범위 확인 (공개/일부 공개)
- [ ] 연령 제한 확인
- [ ] 저작권 클레임 확인
- [ ] 테스트 영상 (`dQw4w9WgXcQ`)으로 비교 테스트

---

## 🔗 다음 단계

**스크린샷을 제공해 주시면**:
1. 정확한 오류 원인 파악
2. 맞춤형 해결책 제시
3. 필요 시 GLEC 코드 수정 (youtube-nocookie.com 등)

**필요한 정보**:
- Console 탭의 오류 메시지 (텍스트 또는 스크린샷)
- Network 탭의 Response Headers (X-Frame-Options, CSP)
- YouTube Studio 채널 고급 설정 (스크린샷)
