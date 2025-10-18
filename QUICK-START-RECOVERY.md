# 🚀 GLEC 콘텐츠 복구 빠른 시작 가이드

## 📋 현재 상황

✅ **확인 완료**:
- Neon DB 용량: 11 MB / 512 MB (2.05%) - 용량 문제 아님
- Neon 브랜치: 2025-10-04 이후만 존재 (이전 데이터 없음)
- 현재 DB 콘텐츠: 모두 샘플 데이터 (실제 GLEC 콘텐츠 0개)
- 중복 데이터: 3-4배 중복 (43개 → 실제 10-12개)

❌ **복구 불가능**:
- Neon 브랜치에서 복구: 2025-10-01 ~ 2025-10-03 브랜치 없음
- Git 히스토리에서 복구: 실제 GLEC 데이터를 삽입한 스크립트 없음

✅ **복구 방법**:
- GLEC 공식 소스(블로그/YouTube/보도자료)에서 **재수집**

---

## 🎯 즉시 실행: 중복 데이터 정리

### Step 1: psql 접속

```bash
psql 'postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

### Step 2: 중복 확인

```sql
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
```

예상 결과:
```
              title               | duplicates
----------------------------------+-----------
 ISO 14083 탄소배출 측정 표준...  |          4
 GLEC Cloud 소개 - 물류 탄소...  |          4
 ...
```

### Step 3: 중복 제거 (가장 최신 1개만 유지)

**⚠️ 주의**: 이 작업은 되돌릴 수 없습니다. Neon Console에서 Snapshot 생성 권장.

```sql
BEGIN;

-- 블로그 중복 제거
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM blogs
)
DELETE FROM blogs
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 영상 중복 제거
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM videos
)
DELETE FROM videos
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 자료실 중복 제거
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM libraries
)
DELETE FROM libraries
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 보도자료 중복 제거
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM presses
)
DELETE FROM presses
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 공지사항 중복 제거
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM notices
)
DELETE FROM notices
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

COMMIT;
```

예상 결과:
```
DELETE 24  (블로그 12개 → 3개로 정리, 9개 삭제)
DELETE 12  (영상 8개 → 2개로 정리, 6개 삭제)
DELETE 9   (자료실 12개 → 3개로 정리, 9개 삭제)
...
```

### Step 4: 정리 후 확인

```sql
-- 전체 콘텐츠 개수 확인
SELECT
  (SELECT COUNT(*) FROM blogs) as blogs,
  (SELECT COUNT(*) FROM videos) as videos,
  (SELECT COUNT(*) FROM libraries) as libraries,
  (SELECT COUNT(*) FROM presses) as presses,
  (SELECT COUNT(*) FROM notices) as notices;
```

예상 결과:
```
 blogs | videos | libraries | presses | notices
-------+--------+-----------+---------+---------
     3 |      2 |         3 |       2 |       1
```

### Step 5: 샘플 데이터 제거 (선택 사항)

```sql
-- Rick Astley 영상 삭제 (샘플 데이터)
DELETE FROM videos WHERE youtube_video_id = 'dQw4w9WgXcQ';

-- storage.glec.io 가짜 URL 자료실 삭제
DELETE FROM libraries WHERE file_url LIKE '%storage.glec.io%';

-- 외부 링크가 없는 보도자료 삭제
DELETE FROM presses WHERE external_url IS NULL OR external_url = '';
```

### Step 6: 최종 확인

```sql
-- 실제 GLEC 콘텐츠 개수 확인
SELECT
  'videos' as type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE youtube_video_id != 'dQw4w9WgXcQ') as real_glec
FROM videos
UNION ALL
SELECT
  'libraries',
  COUNT(*),
  COUNT(*) FILTER (WHERE file_url NOT LIKE '%storage.glec.io%')
FROM libraries
UNION ALL
SELECT
  'presses',
  COUNT(*),
  COUNT(*) FILTER (WHERE external_url IS NOT NULL AND external_url != '')
FROM presses;
```

예상 결과:
```
   type    | total | real_glec
-----------+-------+-----------
 videos    |     0 |         0  ← 모두 샘플 데이터 (삭제됨)
 libraries |     0 |         0  ← 모두 가짜 URL (삭제됨)
 presses   |     0 |         0  ← 외부 링크 없음 (삭제됨)
```

---

## 🌐 다음 단계: GLEC 공식 소스에서 재수집

### 필요한 정보 (사용자 제공 필요)

17일 전 크롤링한 GLEC 공식 소스 URL을 알려주세요:

```
1. GLEC 공식 블로그 URL: ?
   예: https://glec.io/blog
   예: https://blog.glec.io
   예: https://www.glec.io/ko/blog

2. GLEC YouTube 채널 URL: ?
   예: https://www.youtube.com/@GLECOfficial
   예: https://www.youtube.com/c/GLECOfficial
   예: https://www.youtube.com/channel/UCxxxxx

3. GLEC 보도자료 페이지 URL: ?
   예: https://glec.io/press
   예: https://glec.io/news
   예: https://www.glec.io/ko/press-release

4. (선택) GLEC 자료실 페이지 URL: ?
   예: https://glec.io/resources
   예: https://glec.io/library
```

### URL 확인 후 진행 작업

1. **크롤링 스크립트 작성**
   - `scripts/scrape-glec-blog.js` - 블로그 크롤링
   - `scripts/scrape-glec-youtube.js` - YouTube 영상 크롤링
   - `scripts/scrape-glec-press.js` - 보도자료 크롤링

2. **실행**
   ```bash
   DATABASE_URL=$DATABASE_URL GLEC_BLOG_URL="https://glec.io/blog" node scripts/scrape-glec-blog.js
   DATABASE_URL=$DATABASE_URL YOUTUBE_API_KEY=$YOUTUBE_API_KEY node scripts/scrape-glec-youtube.js
   DATABASE_URL=$DATABASE_URL GLEC_PRESS_URL="https://glec.io/press" node scripts/scrape-glec-press.js
   ```

3. **검증**
   ```bash
   node search-glec-traces.js
   ```

---

## 📊 진행 상황

- [x] Neon DB 용량 분석
- [x] 데이터 손실 원인 파악 (2025-10-04 Prisma 마이그레이션)
- [x] 현재 DB 콘텐츠 분석 (샘플 데이터만 존재)
- [x] Neon 브랜치 히스토리 확인 (복구 불가능)
- [x] 복구 가이드 작성
- [x] 중복 데이터 정리 SQL 작성
- [ ] **중복 데이터 정리 실행** ← 현재 단계
- [ ] GLEC 공식 URL 확인 ← **사용자 제공 필요**
- [ ] 크롤링 스크립트 작성
- [ ] 실제 GLEC 콘텐츠 재수집
- [ ] 최종 검증

---

## ⏱️ 예상 소요 시간

| 작업 | 소요 시간 |
|------|----------|
| 중복 데이터 정리 (psql) | 10분 |
| GLEC URL 확인 | 5분 (사용자) |
| 크롤링 스크립트 작성 | 2시간 |
| 블로그 크롤링 실행 | 30분 |
| YouTube 크롤링 실행 | 30분 (API Key 필요) |
| 보도자료 크롤링 실행 | 30분 |
| 최종 검증 | 10분 |
| **총합** | **약 4시간** |

---

## 🆘 필요한 환경 변수

YouTube 크롤링을 위해 필요:

```bash
# .env.local에 추가
YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxx
```

YouTube API Key 발급:
1. https://console.cloud.google.com
2. 프로젝트 생성
3. YouTube Data API v3 활성화
4. API Key 생성

---

## 📞 다음 단계

**즉시 실행**:
1. psql로 DB 접속
2. Step 3 중복 제거 SQL 실행
3. Step 4 정리 확인
4. GLEC 공식 URL 제공

**GLEC URL 제공 후**:
1. 크롤링 스크립트 자동 생성
2. 실행 및 검증
3. 어드민/웹사이트에서 정상 출력 확인

---

## 📌 요약

✅ **완료**:
- 데이터 손실 원인 파악: 2025-10-04 Prisma 초기 마이그레이션
- Neon 브랜치 복구 불가능 확인
- 중복 데이터 정리 SQL 준비 완료

⏳ **진행 중**:
- 중복 데이터 정리 (psql 실행 대기)

❌ **블로킹**:
- GLEC 공식 URL 미확인 (사용자 제공 필요)

🎯 **최종 목표**:
- 실제 GLEC 블로그/YouTube/보도자료 콘텐츠 복구
- 어드민/웹사이트에서 정상 출력 확인
- 중복 데이터 0개, 샘플 데이터 0개
