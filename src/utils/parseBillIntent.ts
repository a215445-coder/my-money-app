import type { Category, TransactionType } from '../types';

export type ParsedBillIntent = {
  amount: number;
  category: Category;
  note: string;
  type: TransactionType;
};

const CATEGORY_KEYWORDS: { category: Category; keywords: string[] }[] = [
  {
    category: '收入',
    keywords: [
      '工资', '薪水', '发薪', '奖金', '红包', '到账', '入账', '收款', '兼职',
      '理财收益', '投资收益', '利息', '返现', '报销到账',
      'salary', 'income', 'paycheck', 'bonus',
    ],
  },
  {
    category: '餐饮',
    keywords: [
      '吃', '喝', '餐', '饭', '肯德基', '麦当劳', 'kfc', 'mcdonald',
      '火锅', '奶茶', '咖啡', '星巴克', 'starbucks', '外卖', '美团', '饿了么',
      '餐厅', '饭店', '早餐', '午餐', '晚餐', '夜宵', '零食', '水果', '超市买菜',
      '面包', '蛋糕', '烧烤', '麻辣烫', '拉面', '汉堡', '披萨', '寿司',
      'lunch', 'dinner', 'breakfast', 'restaurant', 'food', 'cafe',
    ],
  },
  {
    category: '交通',
    keywords: [
      '打车', '滴滴', '出租', '网约车', '地铁', '公交', '巴士', '高铁', '火车', '充值',
      '机票', '飞机', '加油', '油费', '停车', '过路费', 'etc', '共享单车',
      '摩拜', '哈啰', 'uber', 'taxi', 'metro', 'bus', 'fuel', 'gas',
    ],
  },
  {
    category: '购物',
    keywords: [
      '买衣服', '鞋子', '球鞋', '包包', '化妆品', '护肤', '口红',
      '逛街', '淘宝', '京东', '拼多多', 'amazon', 'shopping', 'mall',
      '衣服', '服饰', '优衣库', 'zara', '手机壳', '数码配件',
    ],
  },
  {
    category: '娱乐',
    keywords: [
      '电影', '影院', 'ktv', '唱歌', '游戏', 'steam', '会员', '视频会员',
      '旅游', '门票', '景点', '酒吧', '剧本杀', 'netflix', 'entertainment',
    ],
  },
  {
    category: '医疗',
    keywords: [
      '药', '医药', '医院', '看病', '挂号', '体检', '牙科', '手术', '诊所',
      'pharmacy', 'hospital', 'medical',
    ],
  },
  {
    category: '教育',
    keywords: [
      '书', '课程', '培训', '学费', '考试', '文具', '网课', '教育',
      'school', 'tuition', 'course',
    ],
  },
];

/** 时态、语气、金额量词等 — 不进备注 */
const NOTE_NOISE_PATTERNS: RegExp[] = [
  /今天|昨天|前天|明天|后天|上午|中午|下午|晚上|早上|晚间|凌晨|清晨|今晚|今早|昨夜/gi,
  /本周|上周|下周|这个月|上个月|最近|刚刚|刚才|现在/gi,
  /花了|花费|支出|收入|共计|一共|总共|总共是|付了|支付|付款|买单|结账|消费/gi,
  /买了|买过|买了些|去|去了|在|是在|我|我们|你|他|她|它/gi,
  /元|块钱|元钱|块|钱|人民币|rmb|yen|usd|\$/gi,
  /please|today|yesterday|tomorrow|morning|noon|afternoon|evening|spent|paid|cost|for|about/gi,
];

const LEADING_VERB_PATTERN = /^(吃|喝|买|购|去|在|到|跟|和|与|点了|吃了|喝了|买了)\s*/i;

function normalizeText(input: string): string {
  return input.replace(/\s+/g, '').trim();
}

export function extractAmount(text: string): number {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  return Number.isFinite(value) ? value : 0;
}

export function detectCategory(text: string): Category {
  const lower = text.toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return category;
    }
  }
  return '其他';
}

export function extractCleanNote(raw: string, amount: number): string {
  let note = raw;

  if (amount > 0) {
    note = note.replace(
      new RegExp(
        `(?:共|一共|总共|共计|花了|付了|支付)?\\s*${amount}(?:\\.\\d+)?\\s*(?:元|块|块钱|元钱|刀)?`,
        'gi'
      ),
      ''
    );
    note = note.replace(/\d+(?:\.\d+)?/g, '');
  }

  for (const pattern of NOTE_NOISE_PATTERNS) {
    note = note.replace(pattern, '');
  }

  note = note.replace(LEADING_VERB_PATTERN, '');
  note = note.replace(/^(吃|喝)(?=[\u4e00-\u9fa5]{2,})/, '');
  note = normalizeText(note);

  return note;
}

export function parseBillIntent(text: string, fallbackNote = '记账'): ParsedBillIntent {
  const trimmed = text.trim();
  const amount = extractAmount(trimmed);
  const category = detectCategory(trimmed);
  const type: TransactionType = category === '收入' ? 'income' : 'expense';

  let note = extractCleanNote(trimmed, amount);
  if (!note) {
    const merchant = pickMerchantHint(trimmed, category);
    note = merchant || fallbackNote;
  }

  return { amount, category, note, type };
}

/** 从原文中捞品牌/店名类残留（分类关键词命中时） */
function pickMerchantHint(text: string, category: Category): string {
  const entry = CATEGORY_KEYWORDS.find((c) => c.category === category);
  if (!entry) return '';
  const lower = text.toLowerCase();
  const hit = entry.keywords.find(
    (kw) => kw.length >= 2 && lower.includes(kw.toLowerCase()) && !isGenericFoodVerb(kw)
  );
  return hit ?? '';
}

function isGenericFoodVerb(kw: string): boolean {
  return ['吃', '喝', '餐', '饭', 'food', 'lunch', 'dinner'].includes(kw);
}
