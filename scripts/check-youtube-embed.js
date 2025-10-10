/**
 * YouTube Embed Checker
 *
 * This script checks if the YouTube video can be embedded
 * by testing various URLs and configurations.
 */

const videoId = '4qnXyIdzYC8'; // GLEC ATG

async function checkEmbed() {
  console.log('=== YouTube Embed Check ===\n');
  console.log(`Video ID: ${videoId}\n`);

  // Test 1: YouTube oEmbed API
  console.log('Test 1: YouTube oEmbed API');
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('✅ Embeddable:', data.type === 'video' ? 'YES' : 'NO');
    console.log('✅ Title:', data.title);
    console.log('✅ Thumbnail:', data.thumbnail_url);
    console.log();
  } catch (err) {
    console.error('❌ oEmbed API failed:', err.message);
    console.log();
  }

  // Test 2: Check if embed URL is accessible
  console.log('Test 2: Embed URL accessibility');
  try {
    const response = await fetch(`https://www.youtube.com/embed/${videoId}`, { method: 'HEAD' });
    console.log('✅ Status:', response.status);
    console.log('✅ Headers:');
    response.headers.forEach((value, key) => {
      if (key.toLowerCase().includes('frame') || key.toLowerCase().includes('content')) {
        console.log(`   ${key}: ${value}`);
      }
    });
    console.log();
  } catch (err) {
    console.error('❌ Embed URL check failed:', err.message);
    console.log();
  }

  // Test 3: Check thumbnail
  console.log('Test 3: Thumbnail availability');
  try {
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const response = await fetch(thumbnailUrl, { method: 'HEAD' });
    console.log('✅ Thumbnail URL:', thumbnailUrl);
    console.log('✅ Status:', response.status);
    console.log('✅ Content-Type:', response.headers.get('content-type'));
    console.log('✅ Content-Length:', response.headers.get('content-length'));
    console.log();
  } catch (err) {
    console.error('❌ Thumbnail check failed:', err.message);
    console.log();
  }

  // Test 4: Get video info from YouTube
  console.log('Test 4: YouTube video info');
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();

    // Check if video is available
    if (html.includes('Video unavailable')) {
      console.log('❌ Video is unavailable');
    } else if (html.includes('This video is private')) {
      console.log('❌ Video is private');
    } else if (html.includes('Age-restricted')) {
      console.log('⚠️  Video is age-restricted (may block embed)');
    } else {
      console.log('✅ Video is publicly available');
    }

    // Check embed settings
    if (html.includes('"isEmbeddingAllowed":true')) {
      console.log('✅ Embedding is allowed');
    } else if (html.includes('"isEmbeddingAllowed":false')) {
      console.log('❌ Embedding is DISABLED (Root Cause!)');
    } else {
      console.log('⚠️  Could not determine embed settings');
    }
    console.log();
  } catch (err) {
    console.error('❌ Video info check failed:', err.message);
    console.log();
  }

  console.log('=== Summary ===');
  console.log('');
  console.log('If embedding is disabled:');
  console.log('1. Go to https://studio.youtube.com');
  console.log('2. Select the video "GLEC AI DTG official"');
  console.log('3. Click "Visibility" → "Advanced settings"');
  console.log('4. Check "Allow embedding"');
  console.log('5. Save and wait 5-10 minutes');
  console.log('');
  console.log('Test URLs:');
  console.log(`- Direct: https://www.youtube.com/watch?v=${videoId}`);
  console.log(`- Embed: https://www.youtube.com/embed/${videoId}`);
  console.log(`- GLEC: https://glec-website.vercel.app/knowledge/videos/f983ef8b-632b-4151-8980-9b01cf49647d`);
}

checkEmbed().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
