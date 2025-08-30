export function pastelPinkFromString(...parts: readonly string[]): string {
  const str = parts.join("|");

  // FNV-1a 32-bit 哈希（稳定）
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }

  // 简单可重复 PRNG（mulberry32）
  function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
      let t = (a += 0x6d2b79f5) | 0;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(h);

  // ---- 配置：越小差异越大（默认 8 => 每 45° 一档）----
  const HUE_BUCKETS = 3;
  const bucketSize = 360 / HUE_BUCKETS;

  // 先用取模确保均匀落桶，再在桶内给一点点抖动（±6°）
  const bucketIndex = h % HUE_BUCKETS;
  const jitter = (rand() - 0.5) * 12; // -6° ~ +6°
  const hue = (bucketIndex * bucketSize + jitter + 360) % 360;

  // 低-中等饱和 + 高明度：确保浅色、黑字清晰
  // 做成离散档位，避免产生过多“相近色”
  const SAT_LEVELS = [28, 32, 36, 40]; // %
  const LIGHT_LEVELS = [88, 90, 92]; // %
  const sat = SAT_LEVELS[Math.floor(rand() * SAT_LEVELS.length)];
  const light = LIGHT_LEVELS[Math.floor(rand() * LIGHT_LEVELS.length)];

  return `hsl(${Math.round(hue)}, ${sat}%, ${light}%)`;
}
