/**
 * Keyword master data for AI image generation
 * Comprehensive tag collection for prompt building
 *
 * Rule: No 'any' type allowed - strict type safety enforced
 */

import type { KeywordCategory } from '../types';

/**
 * Positive prompt keyword categories
 */
export const keywordCategories: ReadonlyArray<KeywordCategory> = [
  // ===== Character =====
  {
    categoryName: 'キャラクター基本',
    keywords: [
      { ja: '女の子1人', en: '1girl' },
      { ja: '男の子1人', en: '1boy' },
      { ja: '一人', en: 'solo' },
      { ja: '複数の女の子', en: 'multiple girls' },
      { ja: '女の子2人', en: '2girls' },
      { ja: '少女 (幼女)', en: 'loli' },
     
      { ja: 'ティーンエイジャー', en: 'teen' },
      { ja: '大人', en: 'adult' },
      { ja: '筋肉質', en: 'muscular' },
      { ja: 'スリム', en: 'slim' },
      { ja: '曲線美', en: 'curvy' },
      { ja: '巨乳', en: 'large breasts' },
      { ja: '並乳', en: 'medium breasts' },
      { ja: '貧乳', en: 'small breasts' },
      { ja: '無乳・絶壁', en: 'flat chest' },
   
      { ja: 'エルフ', en: 'elf' },
      { ja: '悪魔', en: 'demon' },
      { ja: '天使', en: 'angel' },
      { ja: '吸血鬼', en: 'vampire' },
      { ja: '猫耳', en: 'nekomimi' },
      { ja: '狐', en: 'kitsune' },
      { ja: 'サイボーグ', en: 'cyborg' },
      { ja: 'アンドロイド', en: 'android' },
    ],
  },

  // ===== Expression =====
  {
    categoryName: '表情',
    keywords: [

      { ja: '笑顔', en: 'smile' },
      { ja: '泣いている', en: 'crying' },
      { ja: '赤面', en: 'blushing' },
      { ja: '困惑・恥ずかしい', en: 'embarrassed' },
      { ja: 'こちらを見ている', en: 'looking at viewer' },
      { ja: '視線をそらす', en: 'looking away' },
      { ja: '振り返る', en: 'looking back' },
      { ja: '目を閉じる', en: 'eyes closed' },
      { ja: '半目', en: 'half-closed eyes' },
      { ja: '目を見開く', en: 'wide eyes' },
      { ja: 'よだれ', en: 'drooling' },
      { ja: '唾液', en: 'saliva' },
      { ja: 'あえぎ', en: 'panting' },
      { ja: '唇に指をあてる', en: 'finger to mouth' },
      { ja: '目尻が下がる', en: 'narrowed eyes, downturned eyes' },
      { ja: '口をわずかに開ける', en: 'parted lips' },
      { ja: '舌を出す', en: 'tongue out, open mouth' },
      { ja: 'トロ顔', en: 'torogao' },
      { ja: '我慢する顔', en: 'closed eyes, clenched teeth, furrowed brow' },
      { ja: '身悶える顔', en: 'squinting, open mouth wide, saliva trail' },
      { ja: '妖艶・魅惑的な表情', en: 'sensual expression' },
      { ja: '頭を傾ける', en: 'head tilt' },
      { ja: '上目づかい', en: 'upturned eyes' },
      { ja: '髪を触る', en: 'running fingers through hair' },
      { ja: '伏し目', en: 'downward gaze' },
      { ja: '襟を掴む', en: 'collar grab' },
    ],
  },

  // ===== Hair =====
  {
    categoryName: '髪型・髪色',
    keywords: [
     // 髪の長さ (Length)
{ ja: 'センターパートロングレイヤー', en: 'center parted long hair, parted bangs, honey blonde, face-framing highlights, sleek and silky, soft layered ends, glossy' },
{ ja: '前髪ぱっつんロング', en: 'long hair with blunt bangs, caramel pink, soft gradient, sleek and glossy, gentle inward tips' },
{ ja: 'エクステ付きロング', en: 'long hair with light purple extensions, platinum silver hair, pearly glossy sheen, ultra smooth texture, soft inward curl at hem' },

// 髪型・カット (Style / Cut)
{ ja: 'Cカールロング', en: 'long hair, smoky greige blonde, cool tone, airy layered structure, soft C-curl ends, glossy finish, small rhinestone hair pin' },
{ ja: '大きめカールのハイポニー', en: 'high ponytail, platinum blonde, shadow roots, extra-large barrel curls at ends, sleek crown, reflective glossy strands, oversized satin ribbon' },
{ ja: 'ゆるカールのサイドポニー', en: 'voluminous ends, ribbon hair accessory, glossy finish' }, // ロブ (lob)
{ ja: '縦スジ盛りアップ', en: 'teased voluminous hair, golden blonde, bold highlights, structured vertical strands, high crown, extra glossy, rhinestone embellished headband' },
{ ja: '編み込みクラウンハーフアップ', en: 'half up braided crown, champagne blonde, pearl highlights, soft waves, glossy layered strands, pearl hair pins along braid' },
{ ja: 'ハイカールツイン', en: 'high twin tails, ash blonde, light blonde streaks, curled and voluminous, shiny defined strands, colorful satin scrunchies' },

// 前髪・分け目 (Bangs / Parting)
{ ja: '前髪なし', en: 'no bangs' },
{ ja: 'ぱっつん前髪', en: 'blunt bangs' },
{ ja: '流し前髪', en: 'swept bangs' }, // side-swept bangs
{ ja: 'センター分け', en: 'center part' }, // middle part
{ ja: 'サイドパート', en: 'side part' },
{ ja: 'シースルーバング', en: 'see-through bangs' },
{ ja: 'ショートバング', en: 'short bangs' },

// 結び方・アレンジ (Arrangement)
{ ja: 'ポニーテール', en: 'ponytail' },
{ ja: 'ツインテール', en: 'twintails' },
{ ja: 'サイドテール', en: 'side ponytail' },
{ ja: 'ハーフアップ', en: 'half up-do' },
{ ja: 'お団子ヘア', en: 'hair bun' },
{ ja: 'ツインお団子', en: 'double bun' }, // space buns
{ ja: '編み込み', en: 'braided hair' }, // plait
{ ja: 'フィッシュボーン', en: 'fishtail braid' },
{ ja: '編み込みカチューシャ', en: 'braided crown' },
{ ja: '夜会巻き', en: 'french twist' }, // chignon


// 細部の特徴 (Detailed Features)
{ ja: '片側を耳にかける', en: 'hair tucked behind one ear' },
{ ja: '両側を耳にかける', en: 'hair tucked behind both ears' },

{ ja: '触覚', en: 'hair tendrils' }, // 顔の横の細い毛束
{ ja: 'アホ毛', en: 'ahoge' }, // ぴょこんと出た毛

// 髪色 (Color - 基本)
{ ja: '黒髪', en: 'black hair' },
{ ja: '茶髪', en: 'brown hair' },
{ ja: '金髪', en: 'blonde hair' },
{ ja: '赤髪', en: 'red hair' },{ ja: '銀髪', en: 'silver hair' },
{ ja: 'ピンク髪', en: 'pink hair' },{ ja: 'オレンジ髪', en: 'orange hair' },
// 髪色のバリエーション (Color Variation)
{ ja: '濡れた髪', en: 'wet hair' },
{ ja: '乱れた髪', en: 'messy hair' },
{ ja: 'ボサボサの髪', en: 'disheveled hair' },
{ ja: '風になびく髪', en: 'windblown hair' },
    ],
  },

  // ===== Eyes =====
  {
    categoryName: '目・瞳',
    keywords: [
      { ja: '垂れ目', en: 'droopy eyes' },
      { ja: '閉じた目', en: 'closed eyes' },
      { ja: '口を閉じている', en: 'mouth closed' },
      { ja: '口を開けている', en: 'mouth open' },
      { ja: 'ウィンク', en: 'wink' },
      { ja: '髪を一目にかける', en: 'hair over one eye' },
      { ja: 'オッドアイ', en: 'heterochromia' },
      { ja: 'ハートの瞳', en: 'heart-shaped pupils' },
      { ja: '縦長の瞳孔', en: 'slit pupils' },
      { ja: '光る目', en: 'glowing eyes' },
    ],
  },

  // ===== Clothing =====
  {
    categoryName: '服装',
    keywords: [
      { ja: 'キャバ嬢', en: 'Lucy Heartfilia、Smile Yan、Blonde、H cup、Slim、maid clothes、mini skirt、Knee-High Stockings、high heels、Fantasy World、Lean forward、focus on the upper body、' },
      { ja: 'バニーガール', en: '	show bunny girl outfit, black leotard, fishnet stockings, bunny ears headband, playful and sexy style' },
      { ja: 'CA', en: 'female flight attendant uniform, navy blue fitted suit, neck scarf, welcoming smile, elegant and professional atmosphere' },
      { ja: 'バスガイド', en: 'cheerful bus guide uniform, colorful jacket, mini skirt, holding a microphone, lively and friendly aura' },
      { ja: '巫女', en: '	modern shrine maiden outfit, short hakama skirt, decorative hair accessories, energetic and cute vibe' },
      { ja: 'くノ一', en: '	female ninja outfit, black short kimono, thigh-high boots, kunai belt, stealthy and agile pose' },
      { ja: '花魁', en: 'oiran outfit, luxurious layered kimono, elaborate hair ornaments, bold and alluring look' },
      { ja: '科学者', en: '	female scientist outfit, lab coat over casual shirt, glasses, holding a test tube, curious and lively vibe' },
      { ja: '魔法つかい', en: '	female mage robe, star-patterned cloak, wizard staff, pointed hat, mystical and wise atmosphere' },
      { ja: 'ナース', en: '	nurse uniform, white dress, nurse cap, short skirt, white thigh-high stockings, clean and soft atmosphere' },
      { ja: 'ネグリジェ', en: 'nightgown' },
      { ja: '教師', en: '	female teacher, glasses, fitted blazer, pencil skirt, holding a pointer, mature and intelligent atmosphere' },
      { ja: '着物', en: 'kimono' },
      { ja: 'メイド服', en: 'maid outfit' },
      { ja: '修道女の服', en: 'nun outfit' },
      { ja: '水着', en: 'swimsuit' },
      { ja: 'ビキニ', en: 'bikini' },
      { ja: '下着', en: 'underwear' },
      { ja: '紫色のメッシュパンツ', en: 'mesh pants' },
      { ja: '紫色のメッシュブラ', en: 'Purple mesh bra' },
      { ja: 'ブラジャー', en: 'bra' },
      { ja: 'パンティー', en: 'panties' },
      { ja: 'ヌード', en: 'nude' },
    ],
  },

  // ===== Clothing State =====
  {
    categoryName: '服装の状態',
    keywords: [
      { ja: '破れた服', en: 'torn clothes' },
      { ja: '引き裂かれた服', en: 'ripped clothes' },
      { ja: 'ズタズタの服', en: 'shredded clothes' },
      { ja: '破れたシャツ', en: 'torn shirt' },
      { ja: '破れたスカート', en: 'torn skirt' },
      { ja: '戦闘ダメージ', en: 'battle damage' },
      { ja: '服を一部だけ着ている', en: 'partially clothed' },
      { ja: '服を脱ぎかけている', en: 'undressing' },
      { ja: '服がずれる', en: 'clothing slip' },
      { ja: '肩紐がずれる', en: 'shoulder strap slip' },
      { ja: 'ストラップがずれた', en: 'slipped strap' },
      { ja: '袖無し', en: 'sleeveless' },
      { ja: '半袖', en: 'short sleeve' },
      { ja: 'オフショルダー', en: 'off-shoulder' },
      { ja: 'ホルターショルダー', en: 'halter shoulder' },
      { ja: 'パンチラ', en: 'sitting, panties' },
      { ja: '風パンチラ', en: 'wind lift, panties' },
      { ja: 'スカートたくし上げ', en: 'skirt lift, panties' },
      { ja: 'パンツを脱いでいる状態', en: 'panties pull' },
    ],
  },

  // ===== Accessories =====
  {
    categoryName: 'アクセサリー・装飾',
    keywords: [
      { ja: 'ネックレス', en: 'necklace' },
      { ja: '首輪', en: 'collar' },
      { ja: 'チョーカー', en: 'choker' },
      { ja: 'イヤリング', en: 'earrings' },
      { ja: 'ブレスレット', en: 'bracelet' },
      { ja: 'リボン', en: 'ribbon' },
      { ja: '帽子', en: 'hat' },
      { ja: 'メガネ', en: 'glasses' },
      { ja: '手袋', en: 'gloves' },
      { ja: 'ニーソックス', en: 'knee socks' },
      { ja: 'ストッキング', en: 'stockings' },
    ],
  },

  // ===== Restraints (NSFW) =====
  {
    categoryName: '拘束・ボンデージ',
    keywords: [
      { ja: '拘束', en: 'restrained' },
      { ja: '緊縛', en: 'shibari' },
      { ja: 'ボンデージ', en: 'bondage' },
      { ja: 'サスペンション', en: 'suspension' },
      { ja: '足固定', en: 'separated legs' },
      { ja: 'ストラパド', en: 'strappado' },
      { ja: '腕を縛る', en: 'arms bound' },
      { ja: '脚を縛る', en: 'legs bound' },
      { ja: '後ろ手縛り', en: 'hands tied behind back' },
      { ja: '腕を吊るす', en: 'arms tied up' },
      { ja: '腕を頭上に固定', en: 'arms overhead' },
      { ja: '海老反り縛り', en: 'hogtied' },
      { ja: '腕固定', en: 'separated arms' },
      { ja: '大の字', en: 'spreadeagle' },
      { ja: 'ロープ', en: 'rope' },
      { ja: '鎖', en: 'chains' },
      { ja: '手錠', en: 'handcuffs' },
      { ja: '猿ぐつわ', en: 'gagged' },
      { ja: 'ボールギャグ', en: 'ball gag' },
      { ja: 'テープギャグ', en: 'tape gag' },
      { ja: 'ハーネス', en: 'harness' },
    ],
  },

  // ===== Basic Pose =====
  {
    categoryName: 'ポーズ基本',
    keywords: [
      { ja: '膝立ち反り開脚', en: 'kneeling, hip lift, legs apart wide, leaning back, arms behind back' },
      { ja: '膝立ち開脚', en: 'kneeling, arched back, hip lift, arms behind head, legs apart' },
      { ja: '腕を後ろにする前かがみ', en: '	leaning forward, arms behind back' },
      { ja: '膝に手をつく前かがみ', en: '	standing, leaning forward, hands on lap' },
      { ja: '胸を両腕で支える前かがみ', en: '	bent over, arms under breasts' },
      { ja: '胸チラを再現する前かがみ', en: 'bending over,slightly downblouse' },    
      { ja: '前屈みヒップ強調', en: 'standing, bent over, arched back, twisted torso, butt out, hands on lap, bent knees slightly' },
      { ja: '膝立ち', en: 'kneeling' },
      { ja: 'しゃがむ', en: 'crouching' },
      { ja: '腰ひねり', en: 'twisted torso, yokozuwari' },
      { ja: '腰に手を当てる', en: 'hands on hips' },
      { ja: '手を振る', en: 'waving' },
      { ja: 'ストレッチ・伸び', en: 'stretching' },
      { ja: '四つん這い', en: 'on all fours' },
      { ja: '猫ポーズの四つん這い', en: 'all fours, paw pose' },
      { ja: '腰を高く上げる四つん這い', en: 'all fours, hips raised' },
      { ja: '体をひねって後ろを見る四つん這い', en: 'all fours, looking back over shoulder, looking afar,twisted torso' },
      { ja: '股のぞき構図の四つん這い', en: '	all fours, looking through own legs' },
      { ja: '腕を交差させて床に置く四つん這い', en: 'all fours, crossed arms' },
      { ja: '開脚', en: 'legs spread' },
      { ja: '背中を反らす', en: 'arched back' },
      { ja: '頭の後ろで手を組む', en: 'hands behind head' },
      { ja: 'ダイナミックなポーズ', en: 'dynamic pose' },
      { ja: '脚を折りたたんだ', en: 'legs folded' },
      { ja: '頭を後ろに反らす', en: 'head tilted back' },
      { ja: '仰向けに寝る', en: 'lying on back' },
      { ja: '腕を上げる', en: 'arms raised' },
      { ja: 'シーツを掴む', en: 'grabbing sheets' },
      { ja: 'シーツを掴む', en: 'grabbing sheets' },
      { ja: '脇見せポーズ', en: 'visible armpit, armpit focus, arm on head, butt out, twisted torso' },
      { ja: '女豹', en: 'all fours, arched back, elbows on ground, bent knees, hip raised, head resting on ground' },
      { ja: '見返り美人', en: 'looking back, narrow waist, arm around waist, strap gap from behind'},
      { ja: 'S字ポーズで立つselfie', en: 'contrapposto, arched back, hand on hip, legs apart'},
      { ja: 'スクワットのM字開脚', en: '	squatting, spread legs, knees up, hands behind head'},
    ],
  },

  // ===== Composition =====
  {
    categoryName: '構図・アングル',
    keywords: [
      { ja: '全身', en: 'full body' },
      { ja: 'バストアップ', en: 'upper body' },
      { ja: 'クローズアップ', en: 'close-up' },
      { ja: '上から', en: 'from above' },
      { ja: '下から', en: 'from below' },
      { ja: '横から', en: 'from side' },
      { ja: '背後から', en: 'from behind' },
      { ja: '顔アップ', en: 'face focus' },
      { ja: 'ポートレート', en: 'portrait' },
      { ja: '動的アングル', en: 'dynamic angle' },
      { ja: '広角', en: 'wide shot' },
    ],
  },

  // ===== Background =====
  {
    categoryName: '背景',
    keywords: [
      { ja: 'シンプルな背景', en: 'simple background' },
      { ja: '白い背景', en: 'white background' },
      { ja: '黒い背景', en: 'black background' },
      { ja: '灰色の背景', en: 'grey background' },
      { ja: 'グラデーション背景', en: 'gradient background' },
      { ja: '模様の背景', en: 'patterned background' },
    ],
  },

  // ===== Location =====
  {
    categoryName: '場所・環境',
    keywords: [
      { ja: '屋内', en: 'indoors' },
      { ja: '屋外', en: 'outdoors' },
      { ja: '部屋', en: 'room' },
      { ja: '寝室', en: 'bedroom' },
      { ja: '学校', en: 'school' },
      { ja: '教室', en: 'classroom' },
      { ja: 'オフィス', en: 'office' },
      { ja: '図書館', en: 'library' },
      { ja: 'キッチン', en: 'kitchen' },
      { ja: 'バスルーム・浴室', en: 'bathroom' },
      { ja: '地下牢', en: 'dungeon' },
      { ja: '独房', en: 'cell' },
      { ja: '刑務所', en: 'prison' },
      { ja: '倉庫', en: 'warehouse' },
      { ja: '都市', en: 'city' },
      { ja: '通り', en: 'street' },
      { ja: '路地裏', en: 'alley' },
      { ja: '屋上', en: 'rooftop' },
      { ja: '夜', en: 'night' },
      { ja: '昼', en: 'day' },
      { ja: '空', en: 'sky' },
      { ja: '森', en: 'forest' },
      { ja: 'ビーチ', en: 'beach' },
      { ja: '公園', en: 'park' },
      { ja: 'ベッド', en: 'bed' },
      { ja: '椅子', en: 'chair' },
      { ja: 'ソファ', en: 'sofa' },
    ],
  },

  // ===== Art Style =====
  {
    categoryName: '性的な表現',
    keywords: [
      { ja: 'クンニリングス', en: 'cunnilingus' },
      { ja: 'オーガズム', en: 'orgasm' },
      { ja: 'よだれ', en: 'drooling' },
      { ja: '濡れている', en: 'wet' },
      { ja: 'クンニリングス', en: 'cunnilingus' },
      { ja: '授乳', en: 'nursing' },
      { ja: '乳首を舐める', en: 'nipple licking' },
      { ja: '足首をロックされた', en: 'ankles locked' }, // これはちょっとしたプレイの描写でしょうか？面白い
      { ja: '少女のパンティの中に手がある', en: 'hand in panties' },
      { ja: ' (男の子は髭、男の子は髭、浅黒い肌の男の子、男の子は私服)', en: '(1 faceless boy), (boy is beard, boy is beard, dark-skinned boy, boy is casual clothes)' },
      { ja: '後ろから股間に手', en: '(hand on crotch from behind)'},
      { ja: '少女の胸に手が置かれている', en: 'hand on breasts' }

    ],
  },

  // ===== Effects =====
  {
    categoryName: 'エフェクト',
    keywords: [
      { ja: '風', en: 'wind' },
      { ja: 'モーションライン (集中線)', en: 'motion lines' },
      { ja: 'モーションブラー (残像)', en: 'motion blur' },
      { ja: '被写界深度', en: 'depth of field' },
      { ja: '汗', en: 'sweat' },
      { ja: '汗の玉', en: 'sweatdrops' },
      { ja: '水滴', en: 'waterdrops' },
      { ja: '湯気', en: 'steam' },
      { ja: '濡れている', en: 'wet' },
      { ja: '震えている', en: 'trembling' },
      { ja: '吹き出し', en: 'speech_bubble' },
      { ja: '息切れ', en: 'breathing' },
      { ja: '痙攣・震え', en: 'trembling' },
      { ja: '効果音', en: 'plap' },
      { ja: '血', en: 'blood' },
    ],
  },

  // ===== Effects =====
  {
    categoryName: 'シーン',
    keywords: [
      { ja: '（両腕を上げ、両腕をロープで縛られている）跪いている（複数の実体のない手が胸を掴んでいる、実体のない手が指を入れている）', en: 'Kneeling, (both arms raised and bound by rope), (multiple incorporeal hands gripping the chest, an incorporeal hand inserting fingers).' },
      { ja: '(両手を鎖付きの手錠で拘束され、腕を上げて立っている)、(複数の実体のない手が胸を掴み、実体のない手が指で弄る:1.5)、(口を開けている:1.6)、(オーガズムの表情、目を閉じ、汗、よだれ、愛液、潮吹き:1.3)、(震えている:1.4)', en: '(Restrain both hands with cuffs and chain, arms up, standing), (multiple disembodied hands grab breast, disembodied hand fingering:1.5), (open mouth:1.6), (orgasm face, closed eyes, sweat, drooling, pussy juice, female ejaculation:1.3), (trembling:1.4),' },
      { ja: '立位、(後ろ手、革ベルトで拘束、縛られた腕、縛られた胸)、(太った男1人、乳首を吸う、指で膣を弄る:1.3)、(開いた口:1.6)、(絶頂顔、閉じた目、よだれ、汗:1.3)、地下の拷問部屋、BDSM', en: 'standing, (arms behind back, restrained with leather belts, bound arms, bound breasts), (1 fat man, sucking nipples, fingering pussy:1.3), (open mouth:1.6), (orgasm face, closed eyes, drooling, sweat:1.3), underground torture room, BDSM' },
      { ja: '(目隠し、セクシーなメイド、ミニスカート、乳首:1.4)、(老人1人)、(男性との性交)、(膣内挿入、正常位、ベッドに仰向け)、(開いた口:1.6)、(絶頂顔、閉じた目、汗、よだれ、愛液:1.3)、(モーションブラー:1.3)、(緊縛、乳房縛り、後ろ手縛り:1.2)', en: '(blindfold, sexy maid, mini skirt, nipples:1.4), (1 old man), (intercourse with a man), (vaginal penetration, missionary, lying on back on bed), (open mouth:1.6), (orgasm face, closed eyes, sweat, drooling, pussy juice:1.3), (motion blur:1.3), (shibari, breast bondage, arms tied behind back:1.2)' },
      { ja: '(円形の石のテーブルにロープで縛られた四肢、腕を広げ、脚を広げ、テーブルの上に仰向けに寝ている:1.3)、(もう一人の女の子の手が陰部を弄る)、(開いた口:1.4)、(オーガズムの顔、閉じた目、汗、よだれ、愛液、女性射精:1.2)、モーションブラー、カウボーイショット、視聴者を見る、(震えている:1.3)', en: '(Limbs bound with ropes on a circular stone table, arms spread, legs spread, lying on back on the table:1.3), (another girl\'s hand fingering pussy), (open mouth:1.4), (orgasm face, closed eyes, sweat, drooling, pussy juice, female ejaculation:1.2), motion blur, cowboy shot, looking at viewer, (trembling:1.3)' }, 
      { ja: '', en: '' },
      { ja: '', en: '' },
      { ja: '', en: '' },
      { ja: '', en: '' },
      { ja: '', en: '' },
      { ja: '', en: '' },    ],
  },
  {
    categoryName: 'ファッションセット',
    keywords: [
      { ja: '白リンガーTシャツと迷彩ミニスカート', en: 'white crop ringer t-shirt with light pink collar and sleeve trim, hibiscus chest logo print, camouflage mini skirt with front button and zipper, belt loops, flap cargo pockets, metal ring detail, black pendant chain necklace, leopard fur keychain, platform boots, navel' },
      { ja: 'レオパードチューブトップとダメージデニムショートパンツ', en: 'leopard patterned strapless tube top with black lace-up side panels and fitted corset shape, light-wash denim shorts with heavy frayed hem and deep side slits, thin gold belly chain at waist, colorful long fingernails, colorful thin bead necklace, silver glitter platform wedge mules' },
      { ja: 'ボーダータンクとレオパードミニスカート', en: 'navy and black striped fitted tank top with double shoulder straps, black leather harness straps, wide brown leather grommet belt worn low, leopard patterned mini skirt in soft woven fabric, layered silver necklaces with small cross pendant and bead details, black choker strap, mixed silver chain bracelets and a brown leather wrist cuff, white loose socks, black platform rubber clogs' },
      { ja: '白Vネックタンクと赤ミニスカート', en: 'white fitted sleeveless V-neck top, dark red bodycon micro skirt with side pockets and slit, wide metallic silver leather belt with oversized oval buckle, gold jewelry set with small drop earrings thin bangle and delicate pendant necklace, white sunglasses worn on head, red high heels' },
      { ja: '平成コギャル制服風ファッション', en: 'white button-up shirt with rolled-up sleeves and loosely knotted burgundy striped tie, gray plaid pleated mini skirt (uniform style), beige knit cardigan tied around waist, light pink scrunchie, white loose socks scrunched to calves, black leather loafers, navy school bag with flowers key charm' },
      { ja: 'ハイビスカス柄ロングカーディガンと黒ミニスカート', en: 'brown cowboy hat, long brown open-front cardigan with pink hibiscus floral pattern and pink cuffs, pastel pink crop tank top, black bodycon micro mini skirt, beige knee-high platform boots with faux-fur cuff trim and chunky block heels, layered chokers combining a black cord tie and a beaded necklace, midriff, navel' },
      { ja: 'ミニスカポリス', en: 'police cap with silver badge, navy police shirt dress with collar and short sleeves, cleavage cutout, police patch and embroidery, black wide belt with silver buckle, short pleated mini skirt, holding handcuffs, sexy police costume' },
      { ja: '紺白セーラー校風', en: 'Japanese high school girl, white sailor uniform, collar is pure white with two thin navy blue stripes, not a navy collar, sleeves are also white with matching navy lines, black ribbon at the chest, short sleeves, navy pleated skirt, modest and classic school design' },
      { ja: 'アイボリーセーラー校風', en: 'Japanese high school girl, long-sleeved sailor uniform in ivory color, deep navy blue sailor collar with two white stripes, large glossy navy blue ribbon at the chest, cuffs are deep navy with two white stripes, matching deep navy pleated skirt, classic and elegant style, refined appearance, Wearing an ivory cardigan over the sailor uniform, gold front buttons, dark navy accent lines on the pockets and trim' },
      { ja: 'ボルドーブレザー進学校風', en: 'Japanese high school girl, wine red blazer jacket with gold buttons, white shirt underneath, chest ribbon in striped pattern of burgundy, navy, and white, pleated skirt in black with fine check pattern in burgundy and gray, a classical and elegant blazer-style school uniform' },
      { ja: '洗練ブレザー校風', en: 'Japanese high school girl, charcoal gray blazer jacket with two front buttons, worn over a burgundy V-neck knit vest and a white shirt, large ribbon at the chest with wide stripes in burgundy and dark brown, matching charcoal gray pleated skirt with a red stripe near the hem, a chic and refined blazer-style school uniform in calm tones' },
      { ja: 'セーラーワンピ女子校風', en: 'Japanese high school girl, white short-sleeved sailor-style blouse, black single stripe on collar and sleeves, front button design, pleated skirt in white with two black stripes at the hem, a fresh and elegant separate-style summer school uniform' },
    ],
  },
  // NOTE: 'シーンセット' category was removed due to complete duplication with 'エフェクト' category
];



/**
 * Negative prompt keyword categories
 */
export const negativeKeywordCategories: ReadonlyArray<KeywordCategory> = [
  {
    categoryName: 'ネガティブ品質',
    keywords: [
      { ja: '低品質', en: 'low quality' },
      { ja: '最悪品質', en: 'worst quality' },
      { ja: 'ぼやけ', en: 'blurry' },
      { ja: 'ノイズ', en: 'noisy' },
      { ja: 'アーティファクト', en: 'artifacts' },
      { ja: '粗い', en: 'rough' },
      { ja: 'ピクセル化', en: 'pixelated' },
      { ja: '歪み', en: 'distorted' },
      { ja: '醜い', en: 'ugly' },
      { ja: '汚い', en: 'dirty' },
    ],
  },
  {
    categoryName: 'ネガティブ解剖学',
    keywords: [
      { ja: '悪い手', en: 'bad hands' },
      { ja: '欠けた指', en: 'missing fingers' },
      { ja: '余分な手足', en: 'extra limbs' },
      { ja: '変形した体', en: 'deformed' },
      { ja: '不自然な体', en: 'bad anatomy' },
      { ja: '歪んだ顔', en: 'bad face' },
      { ja: '余分な指', en: 'extra fingers' },
      { ja: '悪いプロポーション', en: 'bad proportions' },
      { ja: '欠けた手足', en: 'missing limbs' },
      { ja: '融合した指', en: 'fused fingers' },
    ],
  },
  {
    categoryName: 'ネガティブコンテンツ',
    keywords: [
      { ja: 'NSFW', en: 'nsfw' },
      { ja: 'グロテスク', en: 'grotesque' },
      { ja: '暴力的', en: 'violence' },
      { ja: '不快', en: 'disturbing' },
      { ja: '血', en: 'blood' },
      { ja: 'ゴア', en: 'gore' },
      { ja: 'ホラー', en: 'horror' },
    ],
  },
  {
    categoryName: 'ネガティブスタイル',
    keywords: [
      { ja: '単純すぎる', en: 'simple' },
      { ja: 'モノクロ', en: 'monochrome' },
      { ja: 'テキスト', en: 'text' },
      { ja: '透かし', en: 'watermark' },
      { ja: '署名', en: 'signature' },
      { ja: 'ロゴ', en: 'logo' },
      { ja: '日付', en: 'date' },
      { ja: 'ユーザー名', en: 'username' },
      { ja: '白黒', en: 'grayscale' },
    ],
  },
];
