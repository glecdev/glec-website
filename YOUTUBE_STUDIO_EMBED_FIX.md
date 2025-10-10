# YouTube Studio 임베드 설정 확인 가이드

## 🚨 문제 상황

**증상**: GLEC 웹사이트에서 YouTube 영상이 "이 콘텐츠는 차단되어 있습니다" 오류로 재생되지 않음

**원인 분석 결과**:
- ✅ GLEC API: 올바른 video ID 반환 (`youtubeVideoId: "4qnXyIdzYC8"`)
- ✅ YouTube oEmbed API: "Embeddable: YES" 응답
- ✅ HTTP 헤더: `X-Frame-Options` 없음 (차단 헤더 없음)
- ❌ 실제 브라우저: iframe 차단 발생

**결론**: YouTube Studio의 **임베드 허용 설정이 비활성화**되어 있을 가능성 99%

---

## ✅ YouTube Studio에서 임베드 허용하는 방법

### 1단계: YouTube Studio 접속

1. 브라우저에서 [YouTube Studio](https://studio.youtube.com) 접속
2. GLEC 계정으로 로그인

### 2단계: 영상 선택

1. 왼쪽 메뉴에서 **콘텐츠** 클릭
2. 영상 목록에서 **"GLEC AI DTG official"** (또는 "GLEC ATG(AI TACHOGRAPH)") 찾기
3. 영상 썸네일 클릭하여 상세 화면 진입

### 3단계: 임베드 설정 확인

#### 방법 A: 고급 설정 (권장)

1. 영상 상세 화면 → **표시** 탭 클릭
2. 하단의 **고급 설정** 확장
3. **"임베드 허용"** 체크박스 찾기
4. ✅ **체크되어 있는지 확인** (체크 해제되어 있으면 **체크**)
5. 우측 상단 **저장** 버튼 클릭

#### 방법 B: 빠른 확인 (API 활용)

YouTube Data API v3를 통해 현재 설정 확인:

```bash
# YouTube Data API로 embed 설정 확인
curl "https://www.googleapis.com/youtube/v3/videos?id=4qnXyIdzYC8&part=status&key=YOUR_API_KEY"
```

응답에서 `"embeddable": true` 확인

### 4단계: 영상 공개 범위 확인

임베드는 **공개** 또는 **일부 공개** 영상에서만 작동합니다.

1. 영상 상세 화면 → **표시** 탭
2. **공개 설정** 확인:
   - ✅ **공개**: 모든 사람이 볼 수 있음 (임베드 가능)
   - ✅ **일부 공개**: 링크가 있는 사람만 볼 수 있음 (임베드 가능)
   - ❌ **비공개**: 본인만 볼 수 있음 (임베드 불가능)

3. 만약 **비공개**라면 → **일부 공개** 또는 **공개**로 변경
4. **저장** 클릭

---

## 🔧 설정 후 테스트

### 1. 설정 변경 후 대기 시간

YouTube 설정 변경 후 **5-10분** 대기 (CDN 캐시 갱신 시간)

### 2. GLEC 웹사이트에서 확인

**테스트 URL**: https://glec-website.vercel.app/knowledge/videos/f983ef8b-632b-4151-8980-9b01cf49647d

1. 브라우저 캐시 완전 삭제:
   - `Ctrl + Shift + Del` (Windows)
   - `Cmd + Shift + Del` (Mac)
   - "쿠키 및 기타 사이트 데이터" + "캐시된 이미지 및 파일" 선택
   - **전체 기간** 선택
   - **데이터 삭제** 클릭

2. 시크릿 모드로 테스트:
   - `Ctrl + Shift + N` (Windows)
   - `Cmd + Shift + N` (Mac)
   - 테스트 URL 접속

3. 예상 결과:
   - ✅ YouTube 영상 정상 재생
   - ✅ 썸네일 정상 표시
   - ✅ "YouTube에서 열기" 버튼 작동

### 3. 자동 검증 스크립트

GLEC 개발 환경에서 실행:

```bash
cd d:/GLEC-Website/glec-website
node scripts/check-youtube-embed.js 4qnXyIdzYC8
```

**기대 출력**:
```
Test 1: YouTube oEmbed API
✅ Status: 200
✅ Embeddable: YES
✅ Title: GLEC AI DTG official
```

---

## 🛠️ 문제가 계속되는 경우

### A. YouTube Studio 설정이 정확한데도 차단되는 경우

1. **연령 제한 확인**:
   - YouTube Studio → 영상 상세 → **제한** 탭
   - "연령 제한" 설정이 있으면 일부 브라우저에서 임베드 차단 가능
   - 연령 제한 **해제** 권장

2. **저작권 클레임 확인**:
   - YouTube Studio → 영상 상세 → **저작권** 탭
   - 저작권 클레임이 있으면 임베드가 차단될 수 있음
   - 클레임 해결 또는 이의 제기

3. **YouTube Premium 전용 콘텐츠**:
   - Premium 전용 콘텐츠는 임베드 불가능
   - 일반 공개 콘텐츠로 설정

### B. Chrome DevTools로 정확한 오류 확인

1. 테스트 페이지 열기: https://glec-website.vercel.app/knowledge/videos/f983ef8b-632b-4151-8980-9b01cf49647d
2. `F12` 키로 개발자 도구 열기
3. **Console** 탭 선택
4. 오류 메시지 확인:

   **Case 1: X-Frame-Options 오류**
   ```
   Refused to display 'https://www.youtube.com/embed/...' in a frame because it set 'X-Frame-Options' to 'deny'.
   ```
   → YouTube Studio에서 임베드 허용 설정 필요

   **Case 2: CSP 오류**
   ```
   Refused to frame 'https://www.youtube.com/embed/...' because it violates the following Content Security Policy directive: "frame-ancestors 'none'".
   ```
   → YouTube 측 CSP 정책 문제 (연령 제한/저작권 클레임 확인)

   **Case 3: CORS 오류**
   ```
   Access to fetch at 'https://www.youtube.com/embed/...' from origin 'https://glec-website.vercel.app' has been blocked by CORS policy.
   ```
   → GLEC iframe 설정 문제 (이미 수정 완료)

### C. 대체 솔루션: YouTube 직접 링크

iframe 차단이 계속되면 **YouTube 직접 링크** 사용 (이미 구현됨):

1. 영상 플레이어 우측 하단의 **"YouTube에서 열기"** 빨간 버튼 클릭
2. 또는 영상 아래의 **"YouTube에서 직접 보기"** 링크 클릭

---

## 📋 체크리스트

설정 확인 전 이 체크리스트를 완료하세요:

- [ ] YouTube Studio 접속 (GLEC 계정)
- [ ] "GLEC AI DTG official" 영상 찾기
- [ ] **표시** 탭 → **고급 설정** 확장
- [ ] ✅ **"임베드 허용"** 체크박스 활성화
- [ ] **공개 설정**: "공개" 또는 "일부 공개" 확인
- [ ] **저장** 버튼 클릭
- [ ] 5-10분 대기 (CDN 캐시 갱신)
- [ ] 브라우저 캐시 완전 삭제
- [ ] 시크릿 모드로 테스트
- [ ] ✅ 영상 정상 재생 확인

---

## 🔗 참고 링크

- [YouTube 임베드 문제 해결 공식 가이드](https://support.google.com/youtube/answer/171780)
- [YouTube Studio 도움말](https://support.google.com/youtube/topic/9257530)
- [YouTube Data API - Videos](https://developers.google.com/youtube/v3/docs/videos)

---

## 📞 추가 지원

문제가 계속되면 다음 정보를 제공해 주세요:

1. Chrome DevTools Console 탭의 **정확한 오류 메시지** 스크린샷
2. YouTube Studio에서 "GLEC AI DTG official" 영상의 **고급 설정** 스크린샷
3. 영상의 **공개 설정** 스크린샷 (공개/일부 공개/비공개)
4. `check-youtube-embed.js` 스크립트 실행 결과

이 정보가 있으면 더 정확한 진단이 가능합니다.
