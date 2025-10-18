# GLEC 원본 콘텐츠 복구 가이드

## 📋 상황 요약

**문제**: 2025-10-01 경 GLEC 공식 소스(블로그/YouTube/보도자료)에서 복제한 원본 콘텐츠가 2025-10-04 Prisma 초기 마이그레이션 시 삭제됨

**현재 상태**:
- Neon DB에 실제 GLEC 콘텐츠 0개
- 모든 콘텐츠가 2025-10-18 생성된 샘플 데이터
- YouTube ID: `dQw4w9WgXcQ` (Rick Astley) - 가짜 데이터
- 보도자료 external_url: 없음
- 자료실 file_url: `storage.glec.io` - 존재하지 않는 URL

---

## 🔍 1단계: Neon Console에서 브랜치/백업 확인

### 1-1. Neon Console 접속
```
URL: https://console.neon.tech
로그인 후 프로젝트 선택
```

### 1-2. Branches 확인
```
1. 좌측 메뉴에서 "Branches" 클릭
2. 2025-10-01 ~ 2025-10-03 사이 브랜치 존재 여부 확인
3. 있다면 해당 브랜치 선택 후 "Connect" 클릭
4. Connection string 복사
```

### 1-3. 브랜치에서 데이터 확인 (psql)
```bash
# 브랜치 connection string으로 접속
psql 'postgresql://...'

# 실제 GLEC YouTube 영상이 있는지 확인
SELECT title, youtube_video_id, created_at
FROM videos
WHERE youtube_video_id != 'dQw4w9WgXcQ'
ORDER BY created_at DESC
LIMIT 10;

# 실제 보도자료 외부 링크가 있는지 확인
SELECT title, media_outlet, external_url, created_at
FROM presses
WHERE external_url IS NOT NULL
  AND external_url NOT LIKE '%example.com%'
ORDER BY created_at DESC
LIMIT 10;

# 긴 블로그 콘텐츠가 있는지 확인
SELECT title, LENGTH(content) as content_length, created_at
FROM blogs
WHERE LENGTH(content) > 5000
ORDER BY created_at DESC
LIMIT 10;
```

### 1-4. 데이터 Export (브랜치에 데이터가 있다면)
```bash
# 브랜치에서 데이터를 CSV로 export
psql 'postgresql://[branch-connection-string]' -c "
COPY (SELECT * FROM blogs WHERE LENGTH(content) > 5000) TO STDOUT WITH CSV HEADER
" > blogs_backup.csv

psql 'postgresql://[branch-connection-string]' -c "
COPY (SELECT * FROM videos WHERE youtube_video_id != 'dQw4w9WgXcQ') TO STDOUT WITH CSV HEADER
" > videos_backup.csv

psql 'postgresql://[branch-connection-string]' -c "
COPY (SELECT * FROM presses WHERE external_url IS NOT NULL) TO STDOUT WITH CSV HEADER
" > presses_backup.csv
```

### 1-5. 현재 DB에 Import
```bash
# 샘플 데이터 삭제
psql 'postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' -c "
DELETE FROM blogs WHERE LENGTH(content) <= 5000;
DELETE FROM videos WHERE youtube_video_id = 'dQw4w9WgXcQ';
DELETE FROM presses WHERE external_url IS NULL;
"

# CSV 파일에서 복원
psql 'postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' -c "
\COPY blogs FROM 'blogs_backup.csv' WITH CSV HEADER;
\COPY videos FROM 'videos_backup.csv' WITH CSV HEADER;
\COPY presses FROM 'presses_backup.csv' WITH CSV HEADER;
"
```

---

## 🌐 2단계: GLEC 공식 소스에서 재수집

### 2-1. 필요한 정보
사용자가 17일 전 크롤링한 소스 URL을 제공해주세요:

```
1. GLEC 공식 블로그 URL: ?
   예: https://glec.io/blog
   예: https://blog.glec.io

2. GLEC YouTube 채널 URL: ?
   예: https://www.youtube.com/@GLECOfficial

3. GLEC 보도자료 페이지 URL: ?
   예: https://glec.io/press
   예: https://glec.io/news
```

### 2-2. 크롤링 스크립트 작성
URL 제공 시 다음 스크립트를 작성하겠습니다:

```javascript
// scripts/scrape-glec-blog.js
// GLEC 공식 블로그에서 게시물 제목, 내용, 이미지 크롤링

// scripts/scrape-glec-youtube.js
// YouTube Data API로 채널 영상 목록 가져오기
// 필요: YOUTUBE_API_KEY 환경 변수

// scripts/scrape-glec-press.js
// 보도자료 페이지에서 기사 제목, 언론사, 링크 크롤링
```

### 2-3. 재수집 프로세스
```bash
# 1. 블로그 크롤링
DATABASE_URL=$DATABASE_URL GLEC_BLOG_URL="https://glec.io/blog" node scripts/scrape-glec-blog.js

# 2. YouTube 영상 크롤링
DATABASE_URL=$DATABASE_URL YOUTUBE_API_KEY=$YOUTUBE_API_KEY GLEC_CHANNEL_ID="UCxxxxx" node scripts/scrape-glec-youtube.js

# 3. 보도자료 크롤링
DATABASE_URL=$DATABASE_URL GLEC_PRESS_URL="https://glec.io/press" node scripts/scrape-glec-press.js

# 4. 데이터 확인
node search-glec-traces.js
```

---

## 🔧 3단계: Git 히스토리에서 seed 스크립트 확인

### 3-1. 2025-10-01 ~ 2025-10-03 사이 seed 스크립트 검색
```bash
# seed, insert, blog, video 관련 커밋 검색
git log --all --since="2025-09-28" --until="2025-10-04" --grep="seed\|insert\|blog\|video" -i --oneline

# 각 커밋의 변경 파일 확인
git log --all --since="2025-09-28" --until="2025-10-04" --name-only -- "*.js" "*.ts" | grep -i "seed\|insert"
```

### 3-2. 발견된 seed 스크립트 실행
```bash
# 예: 과거 seed 스크립트가 발견된 경우
git show <commit-hash>:scripts/seed-real-glec-content.js > temp-seed.js
DATABASE_URL=$DATABASE_URL node temp-seed.js
```

---

## 📊 4단계: 현재 데이터 정리 (중복 제거)

현재 DB에 중복 데이터가 3-4배 존재하므로 정리가 필요합니다.

### 4-1. 중복 확인 SQL
```sql
-- psql 접속 후 실행
psql 'postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'

-- 블로그 중복 확인
SELECT title, COUNT(*) as duplicates
FROM blogs
GROUP BY title
HAVING COUNT(*) > 1
ORDER BY duplicates DESC;

-- 영상 중복 확인
SELECT title, COUNT(*) as duplicates
FROM videos
GROUP BY title
HAVING COUNT(*) > 1
ORDER BY duplicates DESC;

-- 자료실 중복 확인
SELECT title, COUNT(*) as duplicates
FROM libraries
GROUP BY title
HAVING COUNT(*) > 1
ORDER BY duplicates DESC;

-- 보도자료 중복 확인
SELECT title, COUNT(*) as duplicates
FROM presses
GROUP BY title
HAVING COUNT(*) > 1
ORDER BY duplicates DESC;
```

### 4-2. 중복 제거 SQL (가장 최신 1개만 유지)
```sql
-- 블로그 중복 제거 (created_at이 가장 최신인 것만 유지)
DELETE FROM blogs
WHERE id NOT IN (
  SELECT DISTINCT ON (title) id
  FROM blogs
  ORDER BY title, created_at DESC
);

-- 영상 중복 제거
DELETE FROM videos
WHERE id NOT IN (
  SELECT DISTINCT ON (title) id
  FROM videos
  ORDER BY title, created_at DESC
);

-- 자료실 중복 제거
DELETE FROM libraries
WHERE id NOT IN (
  SELECT DISTINCT ON (title) id
  FROM libraries
  ORDER BY title, created_at DESC
);

-- 보도자료 중복 제거
DELETE FROM presses
WHERE id NOT IN (
  SELECT DISTINCT ON (title) id
  FROM presses
  ORDER BY title, created_at DESC
);

-- 공지사항 중복 제거
DELETE FROM notices
WHERE id NOT IN (
  SELECT DISTINCT ON (title) id
  FROM notices
  ORDER BY title, created_at DESC
);
```

### 4-3. 정리 후 확인
```sql
-- 전체 콘텐츠 개수 확인
SELECT
  (SELECT COUNT(*) FROM blogs) as blogs_count,
  (SELECT COUNT(*) FROM videos) as videos_count,
  (SELECT COUNT(*) FROM libraries) as libraries_count,
  (SELECT COUNT(*) FROM presses) as presses_count,
  (SELECT COUNT(*) FROM notices) as notices_count;

-- 중복 여부 재확인
SELECT
  'blogs' as table_name,
  COUNT(*) - COUNT(DISTINCT title) as duplicates
FROM blogs
UNION ALL
SELECT 'videos', COUNT(*) - COUNT(DISTINCT title) FROM videos
UNION ALL
SELECT 'libraries', COUNT(*) - COUNT(DISTINCT title) FROM libraries
UNION ALL
SELECT 'presses', COUNT(*) - COUNT(DISTINCT title) FROM presses;
```

---

## 🚀 권장 복구 순서

### 우선순위 1: Neon Console 브랜치 확인 (가장 빠름)
```
1. Neon Console 로그인
2. Branches 탭에서 2025-10-01 ~ 2025-10-03 브랜치 확인
3. 있다면 해당 브랜치에서 데이터 export → import
4. 없다면 우선순위 2로 이동
```

### 우선순위 2: GLEC 공식 소스 재수집 (확실함)
```
1. GLEC 공식 블로그/YouTube/보도자료 URL 확인
2. 크롤링 스크립트 작성 및 실행
3. 수집된 데이터 검증
4. DB에 insert
```

### 우선순위 3: 중복 데이터 정리 (필수)
```
1. 현재 중복 데이터 확인 (3-4배)
2. 가장 최신 1개만 유지하고 나머지 삭제
3. 정리 후 검증
```

---

## 📝 체크리스트

### Neon Console 브랜치 복구
- [ ] Neon Console 로그인 완료
- [ ] Branches 탭 확인
- [ ] 2025-10-01 ~ 2025-10-03 브랜치 존재 확인
- [ ] 브랜치에서 실제 GLEC 데이터 확인 (psql)
- [ ] 데이터 export (CSV)
- [ ] 현재 DB에 import
- [ ] 복구 검증

### GLEC 공식 소스 재수집
- [ ] GLEC 공식 블로그 URL 확인
- [ ] GLEC YouTube 채널 URL 확인
- [ ] GLEC 보도자료 페이지 URL 확인
- [ ] 크롤링 스크립트 작성
- [ ] 블로그 크롤링 실행
- [ ] YouTube 크롤링 실행 (YouTube API Key 필요)
- [ ] 보도자료 크롤링 실행
- [ ] 수집 데이터 검증
- [ ] DB에 저장
- [ ] 최종 검증 (`search-glec-traces.js`)

### 중복 데이터 정리
- [ ] psql로 DB 접속
- [ ] 중복 확인 SQL 실행
- [ ] 중복 제거 SQL 실행
- [ ] 정리 후 검증
- [ ] 최종 개수 확인

---

## 🆘 긴급 연락처

- Neon Support: https://neon.tech/docs/introduction/support
- Neon Community: https://discord.gg/neon
- PostgreSQL 공식 문서: https://www.postgresql.org/docs/

---

## 📌 다음 단계

**즉시 실행 권장**:
1. Neon Console 접속 → Branches 확인
2. 브랜치가 없다면 → GLEC 공식 URL 제공
3. 중복 데이터 정리 (4-2 SQL 실행)

**작업 시간 예상**:
- Neon 브랜치 복구: 30분 ~ 1시간
- GLEC 재수집: 2 ~ 4시간 (크롤링 스크립트 작성 포함)
- 중복 데이터 정리: 10분

**최종 목표**:
✅ 실제 GLEC YouTube 영상 ID (dQw4w9WgXcQ 아닌 것)
✅ 실제 보도자료 외부 링크 (example.com 아닌 것)
✅ 실제 블로그 콘텐츠 (5000자 이상 긴 글)
✅ 중복 데이터 0개
