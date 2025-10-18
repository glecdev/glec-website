# 🌐 GLEC 공식 소스 URL 제공 요청

## 📊 현재 DB 상태

✅ **정리 완료**:
- 중복 데이터 제거: 완료
- 샘플 데이터 제거: 완료

📦 **현재 콘텐츠**:
- ✅ 블로그: 3개 (실제 데이터일 가능성, 하지만 짧은 콘텐츠)
- ✅ 공지사항: 2개
- ❌ 영상: 0개 (모두 샘플 데이터로 삭제됨)
- ❌ 자료실: 0개 (모두 가짜 URL로 삭제됨)
- ❌ 보도자료: 0개 (외부 링크 없어서 삭제됨)

---

## 🎯 복구를 위해 필요한 정보

17일 전 GLEC 공식 소스에서 콘텐츠를 복제하셨다고 하셨습니다.
다음 **4가지 URL**을 제공해주시면 크롤링 스크립트를 자동으로 생성하겠습니다.

### 1️⃣ GLEC 공식 블로그 URL (필수)

**예시**:
```
https://glec.io/blog
https://www.glec.io/ko/blog
https://blog.glec.io
https://glec.io/insights
```

**확인 방법**:
1. GLEC 공식 웹사이트 접속
2. 메뉴에서 "블로그", "인사이트", "뉴스" 등 찾기
3. 블로그 목록 페이지 URL 복사

**현재 DB 블로그 제목 (참고)**:
- ISO 14083 탄소배출 측정 표준 완벽 가이드
- GLEC Cloud 플랫폼 업데이트 - 2025년 로드맵
- DHL GoGreen 파트너십 - 글로벌 물류 탄소중립 여정

→ 이 제목들이 실제 GLEC 블로그에 있는지 확인해주세요.

---

### 2️⃣ GLEC YouTube 채널 URL (필수)

**예시**:
```
https://www.youtube.com/@GLECOfficial
https://www.youtube.com/c/GLECOfficial
https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx
```

**확인 방법**:
1. YouTube에서 "GLEC" 또는 "글렉" 검색
2. 공식 채널 찾기
3. 채널 URL 복사 (채널 페이지에서 주소창 복사)

**필요한 정보**:
- 채널 URL
- (선택) YouTube API Key - YouTube Data API v3로 영상 메타데이터 가져오기 위해 필요
  - 없으면 수동으로 영상 정보 입력 가능

**API Key 발급 방법** (선택):
1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성 (예: "GLEC Scraper")
3. "API 및 서비스" → "라이브러리" 클릭
4. "YouTube Data API v3" 검색 및 사용 설정
5. "사용자 인증 정보" → "사용자 인증 정보 만들기" → "API 키" 선택
6. 생성된 API 키 복사

---

### 3️⃣ GLEC 보도자료 페이지 URL (필수)

**예시**:
```
https://glec.io/press
https://glec.io/news
https://www.glec.io/ko/press-release
https://glec.io/media
```

**확인 방법**:
1. GLEC 공식 웹사이트 접속
2. 메뉴에서 "보도자료", "뉴스", "미디어" 등 찾기
3. 보도자료 목록 페이지 URL 복사

**현재 DB 보도자료 제목 (참고 - 삭제됨)**:
- GLEC, ISO 14083 국제표준 인증 획득
- GLEC, DHL GoGreen과 전략적 파트너십 체결

→ 이 제목들이 실제 GLEC 보도자료 페이지에 있는지 확인해주세요.

---

### 4️⃣ GLEC 자료실 페이지 URL (선택)

**예시**:
```
https://glec.io/resources
https://glec.io/library
https://www.glec.io/ko/downloads
https://glec.io/whitepapers
```

**확인 방법**:
1. GLEC 공식 웹사이트 접속
2. 메뉴에서 "자료실", "다운로드", "리소스" 등 찾기
3. 자료실 목록 페이지 URL 복사

**현재 DB 자료실 제목 (참고 - 삭제됨)**:
- ISO 14083 가이드북 - 물류 탄소배출 측정 표준
- GLEC DTG Series5 제품 카탈로그
- Carbon API 개발자 가이드

→ 이 파일들이 실제 GLEC 자료실에 있는지 확인해주세요.

---

## 📝 응답 형식 (복사 후 작성)

다음 형식으로 URL을 제공해주세요:

```
1. GLEC 블로그 URL: [URL을 여기에 입력]

2. GLEC YouTube 채널 URL: [URL을 여기에 입력]
   - YouTube API Key (선택): [있으면 여기에 입력, 없으면 "없음"]

3. GLEC 보도자료 페이지 URL: [URL을 여기에 입력]

4. GLEC 자료실 페이지 URL (선택): [URL을 여기에 입력, 없으면 "없음"]

5. 복구 범위:
   - 블로그: 최근 [N]개 또는 "전체"
   - YouTube: 최근 [N]개 또는 "전체"
   - 보도자료: 최근 [N]개 또는 "전체"
   - 자료실: 최근 [N]개 또는 "전체"

6. (선택) 17일 전 크롤링 당시 기억나는 콘텐츠 제목:
   - 블로그: [제목 1], [제목 2], ...
   - YouTube: [제목 1], [제목 2], ...
   - 보도자료: [제목 1], [제목 2], ...
```

---

## 🚀 URL 제공 후 진행 프로세스

### 자동 진행 (Claude AI)
1. ✅ URL 검증 (접근 가능 여부 확인)
2. ✅ 페이지 구조 분석 (HTML 파싱)
3. ✅ 크롤링 스크립트 자동 생성
   - `scripts/scrape-glec-blog.js`
   - `scripts/scrape-glec-youtube.js`
   - `scripts/scrape-glec-press.js`
   - `scripts/scrape-glec-library.js` (선택)
4. ✅ 실행 및 데이터 수집
5. ✅ 데이터베이스 저장
6. ✅ 최종 검증

### 예상 소요 시간
- URL 검증: 5분
- 스크립트 생성: 1시간
- 크롤링 실행: 30분 ~ 1시간
- DB 저장: 10분
- 최종 검증: 10분
- **총합: 약 2~3시간**

---

## 🔍 URL 찾기 팁

### GLEC 공식 웹사이트 확인
1. Google 검색: "GLEC 공식 사이트"
2. GLEC 메인 도메인 확인 (예: glec.io, glec.kr, glec.com)
3. 메뉴 구조 확인 (블로그, 보도자료, 자료실 등)

### 17일 전 기억 되살리기
1. 브라우저 히스토리 확인 (2025-09-28 ~ 2025-10-03)
2. 북마크 확인
3. 다운로드 폴더에 GLEC 관련 파일 확인

### GLEC 관련 키워드
- "GLEC blog"
- "GLEC YouTube"
- "GLEC press release"
- "GLEC resources"
- "글렉 블로그"
- "글렉 유튜브"

---

## ⏰ 대기 중

URL을 제공해주시면 즉시 크롤링 스크립트 작성 및 실행을 진행하겠습니다.

**현재 상태**: ⏸️ URL 제공 대기 중

**다음 단계**: URL 제공 → 크롤링 → 복구 완료 → 어드민/웹사이트 정상 출력 확인
