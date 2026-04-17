---
name: asset-consistency
description: 게임 에셋 폴더를 검사해 (1) 같은 캐릭터의 여러 포즈가 동일 인물로 보이는지, (2) 모든 에셋이 기획서의 art-style 한 가지만 따르는지 확인. 디자이너 검수 단계와 리뷰어 📌 G 항목에서 사용.
---

# 에셋 일관성 감사

스팀 인디 수준 완성도의 핵심: **한 캐릭터는 여러 포즈에도 같은 사람처럼 보이고, 모든 에셋은 한 스타일로 수렴**해야 한다.

## 사용 시점

- 디자이너 단계의 에셋 검수
- 리뷰어 단계의 `📌 G. 에셋 일관성`

## 절차

### 1. 기획서의 art-style 확인

```bash
grep -E "art-style:" docs/game-specs/cycle-N-spec.md public/games/<game-id>/assets/manifest.json
```

두 값이 일치하는가? 기획서와 manifest의 art-style 불일치 → FAIL.

### 2. 캐릭터 변형 페어 식별

manifest.json 에서 `ref` 필드를 가진 에셋 목록 추출:

```bash
node -e "const m=require('./public/games/<game-id>/assets/manifest.json'); for (const [k,v] of Object.entries(m.assets)) if (v.ref) console.log(k, '←ref←', v.ref);"
```

예: `player-attack ← ref ← player` / `player-hurt ← ref ← player`

각 페어에 대해 base 이미지와 variation 이미지가 **실제로 디스크에 존재**하는지 확인.

### 3. 크기·포맷 sanity

모든 PNG/SVG 의 해상도가 manifest의 `size` 필드와 일치하는가:

```bash
for f in public/games/<game-id>/assets/*.png; do
  node -e "const sharp=require('sharp'); sharp('$f').metadata().then(m=>console.log('$f', m.width+'x'+m.height))"
done
```

### 4. 캐릭터 일관성 휴리스틱

Vision API 없이 할 수 있는 기본 체크:

- **크기 일치**: base 와 variation 의 width, height 가 동일해야 함 (기획서 강제)
- **평균 색상**: sharp 로 base.channels 평균과 variation.channels 평균 비교.
  30% 이상 벗어나면 "다른 캐릭터일 가능성" 경고.

```bash
node -e "
const sharp=require('sharp');
async function avg(p){
  const {data,info}=await sharp(p).raw().resize(64,64).toBuffer({resolveWithObject:true});
  const n=data.length/info.channels; let r=0,g=0,b=0;
  for(let i=0;i<data.length;i+=info.channels){r+=data[i];g+=data[i+1];b+=data[i+2]}
  return [r/n,g/n,b/n];
}
(async()=>{
  const a=await avg('public/games/<game-id>/assets/player.png');
  const b=await avg('public/games/<game-id>/assets/player-attack.png');
  const diff=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
  console.log('mean color diff:', diff.toFixed(1), '(>60 → 의심)');
})();
"
```

mean color diff > 60 이면 **별개 캐릭터일 가능성**. 재생성 권고.

### 5. 스타일 혼재 검증

화면에 동시에 보이는 에셋들이 같은 art-style 인가? 플래너·디자이너가 육안 검토 (LLM 에게 직접 에셋 이미지 읽기를 요청).

특히 주의:
- 배경은 페인터리 2D인데 캐릭터는 픽셀아트 → 스타일 혼재
- UI 아이콘만 플랫 벡터 → OK (UI는 의도적으로 다를 수 있지만 같은 컬러 팔레트 유지 필수)

### 6. 보고 양식

```
## 에셋 일관성 감사

### 1. art-style 일치
- spec: "pixel-art-16bit"
- manifest: "Crisp 16-bit pixel art, limited palette..."
- → ✅ 일치

### 2. 캐릭터 변형 페어 (3쌍)
- player → player-attack: mean diff = 18.2 ✅
- player → player-hurt: mean diff = 22.5 ✅
- enemy → enemy-boss: mean diff = 71.3 ⚠️ 의심

### 3. 크기 일치
- 모든 PNG 가 manifest size 와 ±5% 이내 ✅

### 4. 스타일 혼재
- 육안: 배경/캐릭터/UI 모두 픽셀아트 통일 ✅

### 최종 판정
- 경고 1건 (enemy vs enemy-boss 재생성 권고)
- 전체: PASS (경고는 향후 라운드에서 개선)
```

## 체크리스트

- [ ] spec ↔ manifest art-style 일치
- [ ] 모든 ref 페어의 base+variation 실재
- [ ] 크기가 기획서와 일치
- [ ] 캐릭터 평균 색상 diff < 60
- [ ] 육안: 스타일 혼재 없음
