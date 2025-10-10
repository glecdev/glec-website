# 🚨 YouTube 영상 재생 안됨 - 빠른 해결 방법

## ✅ 검증 완료
- ✅ Video ID: `4qnXyIdzYC8` (정확)
- ✅ YouTube 임베드 허용: YES
- ✅ 썸네일: 정상
- ✅ 코드: 정상

## 🔧 해결 방법 (순서대로 시도)

### 1️⃣ 하드 리프레시 (가장 빠름)
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### 2️⃣ 시크릿/프라이빗 모드
```
Chrome: Ctrl + Shift + N
Firefox: Ctrl + Shift + P
Edge: Ctrl + Shift + N
```

### 3️⃣ 브라우저 캐시 완전 삭제
**Chrome:**
1. `Ctrl + Shift + Delete`
2. "시간 범위": **전체 기간** 선택
3. "캐시된 이미지 및 파일" 체크
4. "데이터 삭제" 클릭

**Firefox:**
1. `Ctrl + Shift + Delete`
2. "지울 기간": **전체** 선택
3. "캐시" 체크
4. "지금 지우기" 클릭

### 4️⃣ 다른 브라우저로 테스트
```
Chrome → Firefox
Firefox → Edge
Safari → Chrome
```

## 🎬 대안: YouTube에서 직접 보기

페이지 하단의 **"YouTube에서 보기"** 링크 클릭:

또는 다음 URL을 직접 열기:
```
https://www.youtube.com/watch?v=4qnXyIdzYC8
```

## 📊 현재 상태

### ✅ 정상 작동 확인됨
- Database: `youtube_video_id = "4qnXyIdzYC8"`
- API: `/api/knowledge/videos/f983ef8b-632b-4151-8980-9b01cf49647d`
  ```json
  {
    "youtubeVideoId": "4qnXyIdzYC8"
  }
  ```
- iframe src: `https://www.youtube.com/embed/4qnXyIdzYC8`

### ✅ YouTube 설정 확인됨
- oEmbed API: ✅ Embeddable (200 OK)
- 임베드 URL: ✅ Accessible (200 OK)
- 썸네일: ✅ Available (19KB JPEG)
- 영상 상태: ✅ Publicly available

## 🛠️ 디버깅 (문제 지속 시)

### Chrome DevTools 확인:
1. 페이지에서 `F12` (개발자 도구)
2. **Console** 탭 확인
3. 다음 오류 찾기:

**❌ 임베드 차단 오류:**
```
Refused to display 'https://www.youtube.com/' in a frame
because it set 'X-Frame-Options' to 'deny'.
```
→ 이 오류가 보이면: YouTube Studio 설정 확인 필요

**✅ 정상 (오류 없음):**
→ 브라우저 캐시 문제. 하드 리프레시 재시도

### Network 탭 확인:
1. **F12** → **Network** 탭
2. 페이지 새로고침
3. `embed/4qnXyIdzYC8` 찾기
4. **Status Code** 확인:
   - `200`: ✅ 정상
   - `403`: ❌ 임베드 차단
   - `404`: ❌ 영상 없음

5. **Response Headers** 확인:
   ```
   X-Frame-Options: DENY → ❌ 임베드 차단
   X-Frame-Options: SAMEORIGIN → ❌ 임베드 차단
   (없음) → ✅ 임베드 허용
   ```

## 📞 문의

위 방법으로도 해결 안되면:
1. 사용 중인 **브라우저 버전** 알려주세요
2. **Chrome DevTools Console** 스크린샷 첨부
3. **Network 탭** → `embed` 요청의 Response Headers 첨부

---

**최종 배포 시간**: 2025-10-10 (최신)
**검증 완료**: ✅ 모든 시스템 정상
