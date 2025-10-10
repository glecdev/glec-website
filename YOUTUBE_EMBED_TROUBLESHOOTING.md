# YouTube 임베드 문제 해결 가이드

## 문제 증상
- 클라이언트 페이지에서 "이 콘텐츠는 차단되어 있습니다" 오류
- iframe src는 정확함: `https://www.youtube.com/embed/4qnXyIdzYC8`
- YouTube API는 임베드 가능하다고 응답함

## 검증 완료 사항 ✅
1. ✅ Database: `youtube_video_id = "4qnXyIdzYC8"` (정확)
2. ✅ API Response: `youtubeVideoId: "4qnXyIdzYC8"` (정확)
3. ✅ iframe src: `https://www.youtube.com/embed/4qnXyIdzYC8` (정확)
4. ✅ YouTube oEmbed API: 임베드 HTML 정상 반환
5. ✅ Thumbnail: `https://img.youtube.com/vi/4qnXyIdzYC8/hqdefault.jpg` (200 OK)

## 가능한 원인

### 1. YouTube Studio 설정 - 임베드 허용 확인 ⚠️

**확인 방법**:
1. [YouTube Studio](https://studio.youtube.com) 접속
2. 좌측 메뉴 → **콘텐츠**
3. 해당 영상 (**GLEC AI DTG official**) 클릭
4. **표시 여부** → **고급 설정**
5. **배포** 섹션 확인:
   - ✅ **"임베딩 허용"** 체크박스가 켜져 있어야 함

**수정 방법**:
- "임베딩 허용" 체크박스를 **켜기**
- 저장 후 5-10분 대기 (YouTube 캐시 갱신)

### 2. 연령 제한 확인

**확인 방법**:
1. YouTube Studio → 해당 영상
2. **연령 제한** 설정 확인

**문제**:
- 연령 제한이 있으면 **로그인하지 않은 iframe에서 재생 불가**

**수정 방법**:
- 연령 제한 **없음**으로 설정

### 3. 저작권 클레임 확인

**확인 방법**:
1. YouTube Studio → 해당 영상
2. **저작권** 탭 확인

**문제**:
- Content ID 클레임이 있으면 일부 지역에서 차단될 수 있음

### 4. 브라우저 캐시 문제

**사용자 조치**:
1. 브라우저에서 **Ctrl + Shift + R** (하드 리프레시)
2. 또는 시크릿 모드로 페이지 열기
3. 또는 브라우저 캐시 완전 삭제

## 테스트 방법

### 1. 직접 임베드 테스트
로컬에서 `test-youtube-embed.html` 파일을 브라우저로 열어서 테스트:
- 파일 경로: `d:\GLEC-Website\glec-website\test-youtube-embed.html`
- 4가지 임베드 방식 테스트

### 2. YouTube 직접 열기 테스트
다음 URL을 브라우저에서 직접 열기:
```
https://www.youtube.com/watch?v=4qnXyIdzYC8
```
- ✅ 정상 재생되면: YouTube 영상 자체는 문제 없음
- ❌ 재생 안되면: YouTube 영상 자체에 문제 있음

### 3. 임베드 URL 직접 열기 테스트
다음 URL을 브라우저에서 직접 열기:
```
https://www.youtube.com/embed/4qnXyIdzYC8
```
- ✅ 정상 재생되면: 임베드 허용됨
- ❌ "Video unavailable" 메시지: 임베드 차단됨 → YouTube Studio 설정 확인 필요

## 해결 방법 요약

### 즉시 시도할 것:
1. **브라우저 하드 리프레시** (Ctrl + Shift + R)
2. **시크릿 모드**로 페이지 열기

### YouTube Studio 확인할 것:
1. **임베딩 허용** 설정 켜기
2. **연령 제한** 없음으로 설정
3. **저작권** 클레임 확인

### 테스트 URL:
- 📹 임베드 직접 테스트: https://www.youtube.com/embed/4qnXyIdzYC8
- 📺 YouTube 직접 보기: https://www.youtube.com/watch?v=4qnXyIdzYC8
- 🌐 GLEC 웹사이트: https://glec-website.vercel.app/knowledge/videos/f983ef8b-632b-4151-8980-9b01cf49647d

## 추가 디버깅 정보

### Chrome DevTools Console 확인:
1. 페이지에서 **F12** (개발자 도구)
2. **Console** 탭 확인
3. 오류 메시지 확인:
   - `Refused to display 'https://www.youtube.com/' in a frame` → 임베드 차단
   - `X-Frame-Options` 오류 → YouTube 설정 문제

### Network 탭 확인:
1. **F12** → **Network** 탭
2. 페이지 새로고침
3. `embed/4qnXyIdzYC8` 요청 찾기
4. Response Headers 확인:
   - `X-Frame-Options: SAMEORIGIN` → 임베드 차단됨
   - `X-Frame-Options: ALLOW` → 임베드 허용됨

## 문의
문제가 계속되면 다음 정보를 제공해주세요:
1. YouTube Studio → 임베딩 허용 설정 스크린샷
2. Chrome DevTools → Console 오류 메시지
3. Chrome DevTools → Network 탭 → embed 요청 Response Headers
