import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const CONTENT_KEY = 'meimei:content';
const WISHLIST_KEY = 'meimei:wishlist';
const MESSAGES_KEY = 'meimei:messages';
const TEST_KEY = 'meimei:test-format';

const contentPayload = {
  originalWishes: [
    { text: '每天都可以睡懒觉' },
    { text: '在平凡的一天收到一束花' },
    { text: '有很多零花钱' },
    { text: '买到喜欢的沐浴露，香薰都是自己喜欢的味道' },
    { text: '所有的小猫小狗都愿意靠近我' },
    { text: '看雪', capsule: 0 },
    { text: '看夕阳' },
    { text: '在喜欢的城市散步', capsule: 1 },
    { text: '出门遇到的人都超级好' },
    { text: '在下雨天在房间吃零食追剧，可以的话打王者荣耀也行' },
    { text: '翻看相册' },
    { text: '一个人出远门旅游', capsule: 2 },
    { text: '自己在高级酒店睡一晚' },
    { text: '微醺之后有人照顾我' },
    { text: '20块彩票中50' },
    { text: '和好朋友蛋仔派对上分' },
    { text: '大家都很喜欢我，愿意和我做朋友' },
    { text: '暴雨天在家睡觉' },
    { text: '化很漂亮的妆' },
    { text: '喜欢的东西说买就买' },
    { text: '发在抖音的作品都有人看和评论' },
    { text: '吃小蛋糕小甜品' },
    { text: '冬天手脚不冰凉' },
    { text: '每次拍照都能出片' },
    { text: '不脱妆不卡粉' },
    { text: '好天气' },
    { text: '发呆' },
    { text: '有一只可爱的小猫，一只毛茸茸的大狗狗' },
    { text: '有人看完了我的幸福清单并默默记下', pretagDone: '✓ 他做到了' },
    { text: '有人陪我一起完成', pretagDone: '✓ 我们一起' },
  ],
  wish31: {
    text: 'We wrote our own destiny, and this would always happen…',
    special: true,
    tag: '✦ 第三十一条',
  },
  capsules: [
    {
      trigger: 5,
      label: '当你勾选「看雪」时开启',
      title: '给看到雪的你',
      content: '手手冷吗\n记得做好保暖哟！',
    },
    {
      trigger: 7,
      label: '当你勾选「在喜欢的城市散步」时开启',
      title: '给在城市里散步的你',
      content: '此刻的你在哪儿呢？\n几个人吖？',
    },
    {
      trigger: 11,
      label: '当你勾选「一个人出远门旅游」时开启',
      title: '给出发去远方的你',
      content: '玩得开心吗？\n一定要注意安全！\n照顾好自己！及时报备！',
    },
  ],
  wishRewards: {
    14: { emoji: '🎰', text: '你彩票中50了！\n奖励你现实里的100块，来找我兑换~' },
    18: { emoji: '🎂', text: '化了漂亮的妆！\n奖励你去吃小蛋糕小甜品，你来选在哪儿！' },
    22: { emoji: '🍲', text: '冬天手脚不冰凉了！\n奖励你一顿火锅，你来定去哪儿吃！' },
  },
  milestones: {
    10: { emoji: '🍽️', text: '完成了10条心愿！\n奖励你一顿你想吃的饭，你来定餐厅，我来买单~' },
    20: { emoji: '📚', text: '完成了20条心愿！\n奖励你一本你喜欢的书，告诉我想要哪本！' },
    30: { emoji: '🎁', text: '完成了30条心愿！\n奖励你一个礼物盲盒，充满惊喜，等你来拆！' },
  },
  quotes: [
    { w: '愿懒觉绵长，梦里皆温柔', q: '每个人都有潜在的能量，只是很容易被习惯所掩盖，被时间所迷离。', s: '— 三毛' },
    { w: '愿那束花，在平凡的午后抵达', q: '我将于茫茫人海中，访我唯一灵魂之伴侣。', s: '— 徐志摩' },
    { w: '愿口袋装满，心事也装满', q: '岁月不饶人，我亦未曾饶过岁月。', s: '— 木心' },
    { w: '愿所有香气都对你温柔', q: '不要害怕，走出去，世界比你想象的要宽广。', s: '— 三毛' },
    { w: '愿小猫小狗都向你奔来', q: '从前慢，一生只够爱一个人。', s: '— 木心' },
    { w: '愿你看见的雪，又轻又白', q: '每想你一次，天上飘落一粒沙，从此形成了撒哈拉。', s: '— 三毛' },
    { w: '愿夕阳恰好，你也恰好在场', q: '记得当时年纪小，你爱谈天我爱笑。', s: '— 方令孺' },
    { w: '愿每一条街都像是为你铺开的', q: '流浪是一种心境，不一定要走很远的路。', s: '— 三毛' },
    { w: '愿出门遇见的都是好人', q: '你是四月早天里的云烟，黄昏吹着风的软。', s: '— 林徽因' },
    { w: '愿雨声替你挡住所有烦扰', q: '轻轻的我走了，正如我轻轻的来。', s: '— 徐志摩' },
    { w: '愿相册里每一张都让你微笑', q: '我爱你，与你无关。', s: '— 木心' },
    { w: '愿远行时，风也顺着你走', q: '一个人至少拥有一个梦想，有一个理由去坚强。', s: '— 三毛' },
    { w: '愿那一晚，睡得格外香甜', q: '读书多了，容颜自然改变。', s: '— 三毛' },
    { w: '愿微醺之后，有人把你护好', q: '一个人隐居，两个人热闹。', s: '— 木心' },
    { w: '愿好运悄悄跟着你', q: '生命不在于长短，而在于是否精彩。', s: '— 三毛' },
    { w: '愿和好友一起胜利的欢呼声传得很远', q: '青春是一本太仓促的书，我们含着泪，一读再读。', s: '— 席慕蓉' },
    { w: '愿世界对你报以同等的温柔', q: '如果有来生，要做一棵树，站成永恒。', s: '— 三毛' },
    { w: '愿暴雨声成为最好的催眠曲', q: '心若没有栖息的地方，到哪里都是在流浪。', s: '— 三毛' },
    { w: '愿镜子里的你让自己心动', q: '你是人间四月天。', s: '— 林徽因' },
    { w: '愿喜欢的东西都能拥有', q: '生命里有一些人与一些事，你明知意义不大，但仍然要热情认真地去做。', s: '— 三毛' },
    { w: '愿每条视频都有人驻足停留', q: '岁月不饶人，我亦未曾饶过岁月。', s: '— 木心' },
    { w: '愿甜品永远甜，热量永远不算', q: '快乐是人生中最重要的事，其他的可以慢慢来。', s: '— 三毛' },
    { w: '愿冬天对你格外温柔', q: '愿你在被打击时记起你的珍贵，抵抗恶意。', s: '— 董卿' },
    { w: '愿每一张照片都是惊喜', q: '美丽的女人，美在眼睛里透出来的那股子劲。', s: '— 董卿' },
    { w: '愿妆容精致，从早到晚', q: '优雅不是穿衣打扮，是从内心散发出来的东西。', s: '— 董卿' },
    { w: '愿天气配合你所有的心情', q: '好天气让人觉得活着真好。', s: '— 木心' },
    { w: '愿发呆时，心里住满了好风景', q: '从前慢，一生只够爱一个人。', s: '— 木心' },
    { w: '愿那只猫和那只狗都等着你回家', q: '家，是心里最柔软的地方。', s: '— 三毛' },
    { w: '✦ 这一条，他已默默记下', q: '顺利时要敬畏，不顺时要坚守。', s: '— 送给你' },
    { w: '✦ 这一条，你们一起完成', q: '余生，请多指教。', s: '— 他' },
  ],
};

const wishlistPayload = {
  done: [28, 29],
  userWishes: [],
  baseWishOverrides: {},
  capsuleOpened: [],
  sealClicks: 0,
  history: {},
  shownMilestones: [],
  togetherWishes: [],
  himWishes: [],
  muyuCount: 0,
  updatedAt: 0,
};

const messagesPayload = [];

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const rawValue = trimmed.slice(eq + 1).trim();
    const value = rawValue.replace(/^"(.*)"$/, '$1');
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function loadEnv() {
  readEnvFile(path.join(rootDir, '.env.local'));
  readEnvFile(path.join(rootDir, '.env'));
}

function getRequiredEnv(name) {
  const value = (process.env[name] || '').trim().replace(/^"(.*)"$/, '$1');
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function getKvConfig() {
  return {
    url: getRequiredEnv('KV_REST_API_URL'),
    headers: {
      Authorization: `Bearer ${getRequiredEnv('KV_REST_API_TOKEN')}`,
      'Content-Type': 'application/json',
    },
  };
}

async function kvSet(key, value) {
  const { url, headers } = getKvConfig();
  const response = await fetch(`${url}/set/${key}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(value),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`KV SET failed: ${response.status} ${text}`);
  }
}

async function kvDelete(key) {
  const { url, headers } = getKvConfig();
  const response = await fetch(`${url}/del/${key}`, {
    method: 'POST',
    headers,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`KV DEL failed: ${response.status} ${text}`);
  }
}

async function main() {
  loadEnv();
  console.log('[reset] rewriting meimei KV data...');
  await kvSet(CONTENT_KEY, contentPayload);
  await kvSet(WISHLIST_KEY, wishlistPayload);
  await kvSet(MESSAGES_KEY, messagesPayload);
  await kvDelete(TEST_KEY);
  console.log(
    `[reset] done. content=${contentPayload.originalWishes.length}/${contentPayload.capsules.length}/${contentPayload.quotes.length}, wishlist=empty, messages=0`
  );
}

main().catch((error) => {
  console.error('[reset] failed:', error.message || error);
  process.exitCode = 1;
});
