// =====================================================
// 魔法陣データ（全魔法陣・正確な効果）
// =====================================================
const CIRCLES = [
  { name:'なし', excl:[], pveRank:0, pveDesc:'魔法陣なし', bestFor:[], tags:[], effects:{} },
  {
    name:'機巧魔法陣', excl:[], pveRank:7,
    bestFor:['yue'], tags:['mp_circle','shield'],
    pveDesc:'【URユエ専用】戦闘開始時にHPを50〜70%減少→その量×200〜400%のシールド獲得＋ユエの無詠唱魔法（スキル即発動）。URユエのHP50%以下覚醒（ATK+150%・速度+150・被ダメ50%回復）と完全に噛み合い、1ターン目から覚醒フルパワーでスキルを発動できる。6凸以上で最強ATKの場合にも追加スキル発動。',
    effects:{ '2凸':'HP-50%→シールド(減少量×200%)獲得、URユエの無詠唱魔法発動可','4凸':'HP-70%→シールド(×250%)獲得、行動制限無効2ターン','6凸':'HP-70%→シールド(×300%)、行動制限無効2ターン、最強ATKなら追加スキル発動(気力不要)','10凸':'HP-70%→シールド(×400%)、最強ATKなら追加スキル発動+ダメ+50%' }
  },
  {
    name:'剣の舞魔法陣', excl:[], pveRank:7,
    bestFor:['vand','myu','shizuku_plus'], tags:['revive'],
    pveDesc:'開幕に自身以外の最強ATK味方に剣の庇護（撃破時に復活）を付与。4凸以上でHP100%復活。自分を攻撃力最低にすることで、実質的に主力アタッカーに復活を与えられる。前列タンクに装備し、後列の主力（ユエ等）に復活を付与する運用が基本。',
    effects:{ '2凸':'開幕：自身以外の最強ATK1体に剣の庇護（撃破時HP30%で復活、デバフ解除）','4凸':'HP100%復活、会心率+30%','6凸':'HP100%復活、会心率+50%、復活時に敵全体を沈黙1ターン','10凸':'HP100%復活、会心率+100%、気力+100、敵全体沈黙2ターン' }
  },
  {
    name:'闘神魔法陣', excl:[], pveRank:9,
    bestFor:['yue','oscar','miledy','nointo'], tags:['skill_chain'],
    pveDesc:'装備者または最強ATK味方がスキル発動時に30〜60%でスキルを再発動【多重詠唱】。4凸以上で最強味方にも適用。ユエ・オスカーのスキルが高確率で2回以上発動する。10凸は2回まで再発動可能で実質3回連続発動も。',
    effects:{ '2凸':'全体HP+10%(2ターン)、装備者スキル発動時30%で再発動','4凸':'全体HP+20%(2ターン)、装備者または最強味方スキル発動時40%で再発動','6凸':'全体HP+35%(3ターン)、60%で再発動','10凸':'全体HP+50%(3ターン)、60%で再発動→さらに60%で再発動（最大2回）' }
  },
  {
    name:'武装魔法陣', excl:[], pveRank:8,
    bestFor:['vand','myu','shia_plus','meil_plus'], tags:['weapon','dmg_reduce'],
    pveDesc:'スキル発動時に倉庫の武器スキルも追加発動。4凸以上で開幕に武器スキルを気力消費なし発動。敵全体に被ダメ-10〜30%のデバフを2ターン付与。前列キャラに装備すると開幕の安定性が上がり、被ダメも継続的に下げられる。',
    effects:{ '2凸':'スキル発動時、倉庫Lv120+武器1つのスキルを追加発動、敵全体へ被直接ダメ-10%(2ターン)','4凸':'開幕に武器スキル1回発動(気力不要)、倉庫武器1つ追加、被直接ダメ-15%','6凸':'開幕発動、倉庫武器2つ追加、被直接ダメ-25%','10凸':'開幕発動＋Lv150+武器1本ごとに「犠牲」を全体で共有、倉庫武器3つ追加、被直接ダメ-30%' }
  },
  {
    name:'翡翠魔法陣', excl:[], pveRank:5,
    bestFor:['kaori','remia'], tags:['heal'],
    pveDesc:'スキル発動時に全体回復（装備者最大HP20〜30%相当）。同属性3体以上で装備者ATKの50〜70%を最強同属性味方に移転。6凸以上で初スキル時に同属性最強ATK味方の気力を100回復。同属性揃えた構成で翡翠を軸にするならあり。',
    effects:{ '2凸':'スキル発動時、全体HP回復(自分最大HP×20%)','4凸':'全体HP×30%回復、同属性3体以上でATK50%移転','6凸':'同属性UR以上3体でATK70%移転、初スキル時に同属性最強のMPを100回復','10凸':'基礎ステータス70%移転、初スキル時に同属性最強のMP100回復＋全デバフ解除' }
  },
  {
    name:'花蓮魔法陣', excl:[], pveRank:5,
    bestFor:['yue','oscar'], tags:['splash'],
    pveDesc:'単体攻撃時に追加でランダム敵2体に20〜50%の拡散ダメージ。4凸以上で受ける単発ダメの上限設定あり（生命値の70%以下）。単体特化アタッカーが複数敵にもダメを出せる。',
    effects:{ '2凸':'単体攻撃時、ランダム敵2体に20%拡散ダメ','4凸':'拡散30%、受ける単発ダメが最大HP70%以下に','6凸':'拡散40%、受ける単発ダメが最大HP50%以下に','10凸':'拡散50%、受ける単発ダメが最大HP30%以下に' }
  },
  {
    name:'虚像魔法陣', excl:[], pveRank:6,
    bestFor:['koga','meld','hiyama'], tags:['shield_stack','tank'],
    pveDesc:'通常攻撃のたびに最大HP15〜30%のシールドを獲得。3〜4回に1回ダメ1回無効化の盾を獲得。4凸以上で最高HP時に開幕スキル即発動。天之河光輝（虚像）と相性良い（最高HP条件で開幕スキル）。タンクの前列耐久をさらに強化。',
    effects:{ '2凸':'通常攻撃のたびにシールド(最大HP×15%)獲得、4回通常で盾(直接ダメ無効1回)獲得','4凸':'開幕シールド(HP×50%)＋最高HP時に開幕スキル発動(気力不要)、3回通常で盾獲得、シールド+20%','6凸':'開幕：盾1つ＋シールド(HP×100%)＋最高HP時に開幕スキル発動、3回通常で盾、シールド+25%','10凸':'開幕：盾2つ＋シールド(HP×200%)、3回通常で盾、シールド+30%、通常で敵撃破時にスキル再発動' }
  },
  {
    name:'雲翔魔法陣', excl:[], pveRank:5,
    bestFor:['naize','haruga'], tags:['dot_resist','fixed_dmg','cc'],
    pveDesc:'HP50%以上は白雲（灼熱〜全DoT耐性+100%）、50%未満は黒雲（HP回復）で自動切替。切替のたびに敵全体に最大HP比の固定ダメ＋確率目眩。耐性と固定ダメを兼ねる。DoTが刺さる前列タンク向き。',
    effects:{ '2凸':'50%以上→灼熱耐性+100%(白雲)、50%未満→HP+10%回復(黒雲)、形態切替時：敵全体最大HP×5%固定ダメ','4凸':'白雲：灼熱・出血耐性+100%、黒雲：HP+15%回復、固定ダメ×10%＋30%目眩','6凸':'白雲：灼熱・毒・出血耐性+100%、黒雲：HP+20%、固定ダメ×15%＋50%目眩','10凸':'全DoT耐性+100%、固定ダメ×20%＋100%目眩' }
  },
  {
    name:'魔眼魔法陣', excl:[], pveRank:9,
    bestFor:['vand','myu','elinalise','shia_plus'], tags:['crit_buff','mp_regen'],
    pveDesc:'装備者の気力が100のとき「集中」（装備者＋最強ATK味方の会心率+20〜50%・会心ダメ+20〜80%）。気力100未満のとき「収束」（毎ターン終了時に気力+30〜60・HP回復）。前列で殴られ続けるヴァンドゥルに特に相性良い。切替のたびに敵の気力を大幅削減。',
    effects:{ '2凸':'集中：装備者+最強ATK味方の会心率+20%・会心ダメ+20%、収束：毎ターン終了時気力+30、切替時：ランダム敵気力-20','4凸':'集中：会心率+30%・会心ダメ+40%、収束：気力+40・HP20%回復、切替時：ランダム敵気力-50','6凸':'集中：会心率+40%・会心ダメ+60%、収束：気力+50・HP20%回復、切替時：敵気力を0','10凸':'集中：会心率+50%・会心ダメ+80%、収束：気力+60・HP20%回復、切替時：最強ATK敵の気力を0' }
  },
  {
    name:'幻海魔法陣', excl:[], pveRank:6,
    bestFor:['nana','kam','sugawara'], tags:['cc_convert','cc_rate'],
    pveDesc:'装備者の行動制限命中率+40〜100%。付与した行動制限（目眩・凍結・沈黙等）が40〜100%の確率で睡眠に変換（受けるダメ+40〜100%、複数回の直接ダメで解除）。上位勢からは他の魔法陣でいいという意見もあるが、CCで睡眠に変換して被ダメを増やすシナジーはある。',
    effects:{ '2凸':'行動制限命中率+40%、行動制限→40%で睡眠(受けるダメ+40%、2回の直接ダメで解除)','4凸':'命中率+60%、60%で睡眠(+60%、3回で解除)','6凸':'命中率+80%、80%で睡眠(+80%、4回で解除)','10凸':'命中率+100%、100%で睡眠(+100%、5回で解除)' }
  },
  {
    name:'美女魔法陣', excl:[], pveRank:7,
    bestFor:['nana','kam','aiko_plus','aiko'], tags:['random_buff'],
    pveDesc:'毎ターン開始時、最速の味方にランダムバフを1〜3個付与（1ターン）。7種のバフから抽選：ユエの力（覚醒）・シアの力（固定ダメ）・ティオの力（ATK積み上げ）・白崎の力（回復）・雫の力（撃破時再発動）・レミアの力（回復+CC解除）・愛子の力（状態異常敵に+40%ダメ）。10000階層以降の主力編成でよく採用される。速度最速キャラに装備させることで自分がバフを受けられる。',
    effects:{ '2凸':'毎ターン開始時、最速の味方にランダムバフ1個(1ターン)','4凸':'ランダムバフ2個','6凸':'ランダムバフ3個','10凸':'ランダムバフ3個（内容は同上）' }
  },
  {
    name:'ゾンビ魔法陣', excl:['竜焔魔法陣'], pveRank:8,
    bestFor:['saeko','tio','tio_plus','sonobe','mao'], tags:['dot_stack','revive'],
    pveDesc:'毒/出血/灼熱を付与するたびに【ゾンビの力】+5%（継続ダメ+5%）を10〜40層蓄積。最大でスキルダメ+100〜200%。初めて致死ダメ時に【ゾンビ変身】（2ターン生存）。DoT特化キャラの火力を蓄積しながら死ねない構成に。竜焔と排他。',
    effects:{ '2凸':'DoT付与のたびにゾンビの力+5%(最大10層)、致死時：ゾンビ変身(2ターン生存、自身DoT+100%、吸収+30%)','4凸':'最大20層(スキルダメ+100%相当)、変身時の強化UP','6凸':'最大30層、変身強化','10凸':'最大40層(スキルダメ+200%相当)、変身強化最大' }
  },
  {
    name:'終末魔法陣', excl:[], pveRank:10,
    bestFor:['aiko_plus','aiko'], tags:['field_dmg'],
    pveDesc:'戦闘開始時に終末の陣を展開。装備者生存中は敵全体が受けるダメ+20〜50%・被回復効果-30〜100%が永続。装備者が倒れると陣が消えるため、倒れにくい畑山愛子（速度最遅調整）に装備するのが定番。愛子は通常攻撃で全デバフを撒くため後列で安全に生存し続け、終末の陣を永続維持できる。',
    effects:{ '2凸':'装備者生存中：敵全体の受けるダメ+20%・被回復-30%が永続','4凸':'受けるダメ+30%・被回復-60%','6凸':'受けるダメ+40%・被回復-80%','10凸':'受けるダメ+50%・被回復-100%（装備者倒れると消滅、10凸のみ2ターン後消滅）' }
  },
  {
    name:'炉神魔法陣', excl:[], pveRank:7,
    bestFor:['shia_plus','meil_plus','meil','hiyama'], tags:['counter_all','dmg_buff'],
    pveDesc:'装備者以外の全味方に炉神護衛（最終ダメ+15〜30%）を付与。装備者が攻撃を受けるたびに全護衛が反撃（敵最大HP3〜20%の固定ダメ）。前列タンクや挑発キャラに装備すると、被攻撃のたびに全味方が反撃する形になりDPS向上。',
    effects:{ '2凸':'開幕：装備者以外の全味方に炉神護衛(最終ダメ+15%)、装備者が攻撃受けると護衛が反撃(敵最大HP×3%固定ダメ)','4凸':'最終ダメ+20%、固定ダメ×8%','6凸':'最終ダメ+25%、固定ダメ×12%','10凸':'最終ダメ+30%、固定ダメ×20%' }
  },
  {
    name:'ハロウィン魔法陣', excl:['裁定魔法陣'], pveRank:10,
    bestFor:['yue','oscar','nointo','nointo_plus','will'], tags:['atk_stack','revive'],
    pveDesc:'直接ダメを与えるたびに【幽霊の力】+5%（最終ダメ+5%）が10〜40層蓄積。最大でスキルダメ+50〜200%。初めて致死ダメ時に【幽霊変身】（2ターン完全無敵・DoT無効・HP全回復）。スキルを連発するアタッカー全般に最適。上位勢の定番。裁定と排他。',
    effects:{ '2凸':'直接ダメを与えるたびに幽霊の力+5%(最大10層、スキルダメ+50%)、致死時：幽霊変身(2ターン完全無敵)','4凸':'最大20層(スキルダメ+100%)、変身強化','6凸':'最大30層(スキルダメ+150%)','10凸':'最大40層(スキルダメ+200%)、変身強化最大' }
  },
  {
    name:'蒼魔魔法陣', excl:['氷雪魔法陣'], pveRank:8,
    bestFor:['vand','altena','ryu'], tags:['elemental_buff','lethal_null'],
    pveDesc:'開幕に全体へ5種の元素バフ（ATK+20%・HP回復・速度+10%・被ダメ軽減+10%・CC耐性+20%）からランダム2〜5種を付与。致死ダメを受けるたびに元素バフを1つ消費して無効化。氷雪より汎用性が高く全体バフ付きの致死無効。氷雪と排他。',
    effects:{ '2凸':'全体に元素バフ2種付与、致死ダメ時に元素バフを1消費して無効化','4凸':'元素バフ3種','6凸':'元素バフ4種','10凸':'元素バフ5種（ATK+20%・毎ターンHP回復・速度+10%・被ダメ軽減+10%・CC耐性+20%）' }
  },
  {
    name:'竜焔魔法陣', excl:['ゾンビ魔法陣'], pveRank:9,
    bestFor:['yue_plus','tio_plus','tio','raus','freed'], tags:['dot_stack','revive','burn_convert'],
    pveDesc:'灼熱付与時に【竜焔】に変換（ダメの30〜50%を自己回復）。毒/出血/灼熱を付与するたびに【黒竜の力】+5%（最終ダメ+5%）が10〜40層蓄積。最大でスキルダメ+50〜200%。初めて致死ダメ時に【黒竜変身】（2ターン完全無敵）。ゾンビと効果は似ているが、スキルダメ+（ゾンビは継続ダメ+）のため、ユエ覇者の出血付与とスキル特化の場合に竜焔が向く。',
    effects:{ '2凸':'灼熱→竜焔変換(ダメの30%自己回復)、DoT付与のたびに黒竜の力+5%(最大10層)、致死時：黒竜変身(2ターン完全無敵)','4凸':'竜焔変換+回復40%、最大20層','6凸':'回復50%、最大30層','10凸':'回復50%、最大40層(スキルダメ+200%)' }
  },
  {
    name:'天使魔法陣', excl:[], pveRank:9,
    bestFor:['altena','remia','hestia'], tags:['revive_ally','lethal_null_self'],
    pveDesc:'装備者生存中、倒れた味方を次ターン全回復復活＋シールド付与（1〜4回）。開幕に自身へ2〜5層の【天使の庇護】を付与。各HP閾値（50/40/30/20/10%）で1層消費して全回復+敵全体沈黙2ターン付与。回復系キャラが生存し続けることで何度でも味方を復活させる。',
    effects:{ '2凸':'生存中：倒れた味方を次ターン全回復復活+シールド(HP×50%、1回)、天使の庇護2層','4凸':'シールド(HP×100%、2回)、天使の庇護3層','6凸':'シールド(HP×150%、3回)、天使の庇護4層','10凸':'シールド(HP×200%、4回)、天使の庇護5層' }
  },
  {
    name:'桜花魔法陣', excl:[], pveRank:10,
    bestFor:[], tags:['dmg_reduce_field'],
    pveDesc:'開幕から編成1〜5番位置に【桜域】を生成。6凸以上で戦闘終了まで持続。桜域中は受ける最終ダメ-20〜50%、ガード発動時に40〜70%でダメを無効化。8000階層以降のワンパン対策に必須級。誰に装備しても全員が恩恵を受ける非常に強力な魔法陣。',
    effects:{ '2凸':'1・2番に桜域(3ターン)：受けるダメ-20%、ガード時40%でダメ無効','4凸':'1〜3番に桜域(5ターン)：受けるダメ-30%、50%でダメ無効','6凸':'1〜4番に桜域(戦闘終了まで)：受けるダメ-40%、60%でダメ無効','10凸':'1〜5番に桜域(戦闘終了まで)：受けるダメ-50%、70%でダメ無効' }
  },
  {
    name:'豊穣魔法陣', excl:[], pveRank:5,
    bestFor:['meil','meil_plus'], tags:['shield_buff'],
    pveDesc:'開幕にランダム2〜5体の護衛シールドを+60〜120%強化。護衛シールド効果中は最終ダメ計算後にさらに-50〜80%軽減する追加効果あり。農場収穫確率ボーナスも。護衛シールドを元々持つキャラ（メイル等）との相性が特に良い。',
    effects:{ '2凸':'開幕：ランダム2体の護衛シールド+60%、護衛シールド中：最終ダメ-50%追加','4凸':'3体+80%、-60%','6凸':'4体+100%、-70%','10凸':'5体+120%、-80%' }
  },
  {
    name:'氷雪魔法陣', excl:['蒼魔魔法陣'], pveRank:7,
    bestFor:['myu'], tags:['elemental_buff','lethal_null'],
    pveDesc:'開幕に全体へ5種の寒氷魔法からランダム2〜5種を付与。致死ダメを受けるたびに寒氷魔法を1つ消費して無効化。ミュウ装備で氷像耐久値+2〜5。10凸で寒氷が残る間は装備者が受けるダメがすべて1になる破格の耐久。蒼魔と排他。',
    effects:{ '2凸':'全体に寒氷魔法2種付与、致死ダメ時に寒氷1消費で無効化、ミュウ装備時：氷像耐久+2','4凸':'寒氷3種、1回で受けるダメが自身HP上限の70%以下になる(装備者のみの場合は発動しない)、ミュウ：氷像+3','6凸':'寒氷4種、1回のダメがHP50%以下に、ミュウ：氷像+4','10凸':'寒氷5種全付与、装備者が受けるダメが全て1になる(寒氷が残る間)、ミュウ：氷像+5' }
  },
  {
    name:'裁定魔法陣', excl:['ハロウィン魔法陣'], pveRank:9,
    bestFor:['nointo_plus'], tags:['atk_stack','revive'],
    pveDesc:'直接ダメを与えるたびに【聖剣の力】+5%（最終ダメ+5%）を10〜40層蓄積。最大でスキルダメ+50〜200%。神鋭タイプは直接ダメ時に20〜70%で沈黙1ターン付与。初めて致死ダメ時に【聖剣の加護】（全回復＋2ターン無敵）。ハロウィンがチームにいると発動しない。ハロウィンとほぼ同効果だが神鋭タイプに沈黙付与のおまけがある。',
    effects:{ '2凸':'直接ダメのたびに聖剣の力+5%(最大10層)、神鋭は20%沈黙付与、致死時：聖剣の加護(HP80%回復→2ターン後戦闘不能)','4凸':'最大20層(スキルダメ+100%)、神鋭35%沈黙、加護強化','6凸':'最大30層(+150%、最大時スキルダメ追加+100%)、神鋭50%沈黙','10凸':'最大40層(+200%)、神鋭70%沈黙、加護中2ターン全ダメ無効' }
  },
  {
    name:'新年魔法陣', excl:[], pveRank:8,
    bestFor:['shia_plus','meil_plus','meil'], tags:['global_dmg_buff','skill_chain_on_hit'],
    pveDesc:'毎ターン全体に福運（最終ダメ+10〜20%、3ターン）を付与。装備者が攻撃を受けると最強ATK味方が30〜60%でスキルを気力消費なし発動（毎ターン最大2回）。挑発やタンクキャラに装備すると、被攻撃のたびに主力アタッカーのスキルを追加発動。6凸以上で致死ダメ時に復活＋味方全体の直接ダメを1ターン無効化。',
    effects:{ '2凸':'毎ターン全体に福運(最終ダメ+10%、3ターン)、攻撃を受けると最強ATK味方が30%でスキル無消費発動(毎ターン最大1回)','4凸':'福運+15%、40%でスキル発動(毎ターン最大2回)','6凸':'福運+20%、50%でスキル発動、致死時：復活(HP50%)+味方全体1ターン直接ダメ無効','10凸':'福運+20%、60%でスキル発動(最大2回)、致死時：復活+1ターン直接ダメ無効' }
  },
  {
    name:'鳳凰魔法陣', excl:[], pveRank:7,
    bestFor:['shia_plus','meil_plus','meil','hiyama'], tags:['skill_chain_on_guard','cc','tank'],
    pveDesc:'装備者がガード発動/CC付与/洗脳付与時に最強ATK味方が確率でスキルを気力消費なし発動。6凸以上でHP50%以下時に1回全回復+復讐の炎（敵全体に最大HP40%/ターンの固定ダメ5ターン）を付与。タンク・ガードキャラに装備して主力アタッカーのスキルを連発させる。',
    effects:{ '2凸':'ガード/CC付与時に最強ATK味方が40%でスキル無消費発動','4凸':'50%でスキル発動','6凸':'60%でスキル発動、HP50%以下で1回全回復+復讐の炎(敵全体に最大HP40%/ターン×5ターン固定ダメ)','10凸':'70%でスキル発動(最大2回)、復讐の炎強化' }
  },
  {
    name:'森の女神魔法陣', excl:[], pveRank:7,
    bestFor:['remia','altena','kaori'], tags:['guard_buff','mp_regen','revive'],
    pveDesc:'開幕に1〜5番目の味方にガード+30〜60%（6凸以上で戦闘終了まで）を付与。装備者生存中は守護された味方が毎ターン気力+20〜50回復。4凸以上で初めて致死ダメ時に1ターン無敵→次ターンHP100〜300%で復活（6凸以上は敵が行動するたびに通常攻撃を自動発動）。',
    effects:{ '2凸':'1〜2番にガード+30%(3ターン)、生存中：守護された味方が毎ターン気力+20','4凸':'1〜3番にガード+40%(5ターン)、気力+30、致死時：1ターン無敵→次ターンHP100%復活','6凸':'1〜4番にガード+50%(戦闘終了まで)、気力+40、復活時HP200%、無敵中に50%で通常攻撃自動発動','10凸':'1〜5番にガード+60%(戦闘終了まで)、気力+50、復活時HP300%、無敵中に全敵に通常攻撃自動発動' }
  },
  {
    name:'水流魔法陣', excl:[], pveRank:5,
    bestFor:['nana','kam','aiko_plus'], tags:['cc','self_atk_buff','heal'],
    pveDesc:'行動制限を付与するたびに自身HP回復+ATK+が蓄積（毎ターン1〜4回まで）。CC特化キャラが行動制限を頻繁に付与するほどATKが積み上がる。宮崎奈々のような頻繁にCCを付与するキャラに合う。',
    effects:{ '2凸':'行動制限付与のたびに自身HP+2%・ATK+2%(毎ターン1回まで)、戦闘終了まで蓄積','4凸':'HP+5%・ATK+5%(毎ターン2回まで)','6凸':'HP+8%・ATK+8%(毎ターン3回まで)','10凸':'HP+10%・ATK+10%(毎ターン4回まで)' }
  },
  {
    name:'重力魔法陣', excl:[], pveRank:4,
    bestFor:['nakamura','mona'], tags:['heal_on_hit','lethal_null'],
    pveDesc:'被ダメ時に20〜60%の確率で被ダメの30%を回復。6凸以上で初めてHP0になると1ターン無敵（HP1で生存）。受けたダメを部分的に回復する単純な耐久魔法陣。',
    effects:{ '2凸':'被ダメ時、20%の確率で被ダメ×30%分のHP回復','4凸':'40%の確率','6凸':'60%の確率、初めてHP0になると1ターン無敵(HP1で生存)','10凸':'60%の確率、初めてHP0で1ターン無敵(HP1)' }
  },
  {
    name:'魂魄魔法陣', excl:[], pveRank:5,
    bestFor:['yue','oscar','miledy'], tags:['cc','pen_debuff'],
    pveDesc:'スキル発動時に確率でランダム敵2〜全体に目眩/沈黙/凍結を付与。6凸以上で貫通耐性-30〜50%の追加デバフも。スキルを頻繁に発動するアタッカーに装備すると副次的なCC効果が得られる。',
    effects:{ '2凸':'スキル発動時、10%でランダム敵2体にCC付与(2ターン)','4凸':'20%でランダム3体','6凸':'50%でランダム4体+貫通耐性-30%','10凸':'50%で全体にCC+貫通耐性-50%' }
  },
  {
    name:'お月見魔法陣', excl:[], pveRank:6,
    bestFor:['saeko','tio_plus','tio'], tags:['shield','dot_up','stealth'],
    pveDesc:'開幕シールド(HP×30〜200%)。4凸以上で速度最速時にスキル即発動（気力不要）。DoT+10〜50%強化。6凸以上でスキル発動時に70〜100%でステルス（1ターン、攻撃の標的にならない）。DoT特化で速度最速に調整したキャラに装備すると開幕スキル発動＋DoT強化が刺さる。',
    effects:{ '2凸':'開幕シールド(HP×30%)','4凸':'開幕シールド(HP×50%)、1ターン目行動制限無効、DoT+10%、最速時スキル即発動(気力不要)','6凸':'開幕シールド(HP×100%)、2ターン行動制限無効、DoT+30%、最速時スキル即発動、スキル発動時70%でステルス1ターン(最大2回)','10凸':'シールド(HP×200%)、DoT+50%、最速時スキル即発動、100%ステルス(最大3回)' }
  },
  {
    name:'泥沼魔法陣', excl:[], pveRank:5,
    bestFor:[], tags:['cc','transform','drain'],
    pveDesc:'毎ターン【魔術マスタリ】を蓄積。スキル発動時に65〜100%でランダム敵に【変身術】（ウサギに変身、行動不可・3回の直接ダメで解除）を付与。マスタリはCC転移や吸収に使用。スキル発動頻度が高いほど変身術を多く付与できる。',
    effects:{ '2凸':'毎ターン終了時にマスタリ+1、スキル発動時65%でランダム敵1体に変身術付与','4凸':'毎ターン+2、100%で変身術付与','6凸':'毎ターン+2(スキル発動でも+1)、100%で変身術+50%で別1体にも付与','10凸':'毎ターン+2(スキル発動で+2)、100%で変身術+80%で別1体にも付与' }
  },
];

// =====================================================
// キャラクターDB（全キャラ・覚醒後前提）
// スキルを正確に読んだ上でpveNote・bestCirclesを設定
// =====================================================
const CHARS = [
// ===== UR+ =====
{ id:'tio_plus', name:'ティオ(黒竜化)', rarity:'ur+', type:'応援',
  roles:['atk','dot','tank'],
  tags:['dot_explode','burn_passive','revive_lethal','cc_resist'],
  pveScore:9,
  pveNote:'覚醒後は致死ダメ1回無効+全回復復活。ターン開始時に敵全体に灼熱を付与しDoTを蓄積させる。竜焔/ゾンビ魔法陣でDoT付与のたびにスキルダメ+5%を積み上げる。前列配置も可能。',
  bestCircles:['竜焔魔法陣','お月見魔法陣','ゾンビ魔法陣','ハロウィン魔法陣'],
  pairWith:['adoru'], synergy:['dot_team','tio_adoru'] },

{ id:'shizuku_plus', name:'八重樫雫(覇者)', rarity:'ur+', type:'強靭',
  roles:['atk','tank','buff'],
  tags:['counter_70','crit_stack_passive','dmg_reduce_buff_all'],
  pveScore:9,
  pveNote:'スキル発動のたびに味方全体のダメージ軽減+10%（最大5回で+50%）。70%の確率で反撃。ガードも高く前列として非常に堅い。美女魔法陣の八重樫雫の力（撃破時スキル再発動）とのシナジーもある。',
  bestCircles:['ハロウィン魔法陣','闘神魔法陣','桜花魔法陣','炉神魔法陣'],
  pairWith:[], synergy:['counter_team','buff_team'] },

{ id:'shia_plus', name:'シア(覇者)', rarity:'ur+', type:'神鋭',
  roles:['tank','buff'],
  tags:['taunt','guard','share_damage_60','revive_lethal'],
  pveScore:10,
  pveNote:'挑発で全攻撃を引き受けダメを60%肩代わり。致死1回無効化。スキル発動で味方ATK+10%。新年/鳳凰魔法陣装備で、被攻撃のたびに主力アタッカーのスキルが追加発動する。PVE前列最上位の一角。',
  bestCircles:['虚像魔法陣','新年魔法陣','蒼魔魔法陣'],
  pairWith:['sona'], synergy:['tank_front'] },

{ id:'yue_plus', name:'ユエ(覇者)', rarity:'ur+', type:'強靭',
  roles:['atk','tank'],
  tags:['revive_vampire','crit','bleed','dot_on_atk'],
  pveScore:9,
  pveNote:'HP0で吸血鬼変身→次ターン全回復復活。出血付与（DoT）で竜焔魔法陣と相性が良い。致死ダメージを受けることで本領を発揮。毎ターンスキルを打てる。',
  bestCircles:['竜焔魔法陣','ゾンビ魔法陣','闘神魔法陣','ハロウィン魔法陣'],
  pairWith:[], synergy:['atk_team'] },

{ id:'miledy_plus', name:'ミレディ(姫騎士)', rarity:'ur+', type:'勇猛',
  roles:['buff','atk'],
  tags:['knight_light_3','dmg_reduce_all_passive'],
  pveScore:5,
  pveNote:'スキルで後列の敵を攻撃しつつ味方3体に「騎士の光」（ダメ増加+シールド+速度）を付与。全体ダメ軽減も常時あり。後列から全体を強化するバッファー。',
  bestCircles:['武装魔法陣','闘神魔法陣','美女魔法陣','天使魔法陣','桜花魔法陣'],
  pairWith:[], synergy:['buff_team'] },

{ id:'hestia', name:'ヘスティア', rarity:'ur+', type:'調和',
  roles:['heal','buff','tank'],
  tags:['heal_all','dot_reflect','dmg_reduce_all_15'],
  pveScore:6,
  pveNote:'女神領域でDoTを無効化し反射。全体回復+ダメ軽減15%。進化後は戦闘開始即発動。後列で安全に回復し続ける。リューとのシナジーで前列が事実上不死に。',
  bestCircles:['クリスマス魔法陣','新年魔法陣'],
  pairWith:['ryu'], synergy:['heal_team','ryu_pair'] },

{ id:'ryu', name:'リュー', rarity:'ur+', type:'勇猛',
  roles:['atk','debuff','tank'],
  tags:['buff_erase','hp_ratio_dmg','lethal_immune_hestia','heal_seal'],
  pveScore:10,
  pveNote:'ヘスティア生存時に致死ダメを無効化しHP1で生き残る。ターン終了時に敵全体の最大HP比ダメ+回復封印。バフ剥がしも可能。ヘスティアとの2体でPVEの要になる。',
  bestCircles:['魔眼魔法陣','美女魔法陣'],
  pairWith:['hestia'], synergy:['ryu_pair'] },

{ id:'roxie', name:'ロキシー', rarity:'ur+', type:'応援',
  roles:['atk','debuff'],
  tags:['magic_mark_5','mp_drain','crit_stack','water_shadow'],
  pveScore:5,
  pveNote:'魔導刻印で被ダメ+10%（最大5重）。気力を吸収し敵のスキルを遅延。シルフィエットとの「無言の圧力」シナジーで全体がスキルを無消費発動できる。',
  bestCircles:['蒼魔魔法陣','魔眼魔法陣','桜花魔法陣'],
  pairWith:['sylph'], synergy:['roxie_sylph'] },

{ id:'sylph', name:'シルフィエット', rarity:'ur+', type:'調和',
  roles:['atk','cc','tank'],
  tags:['wind_bind','guard_40','kill_chain','mp_drain_passive'],
  pveScore:7,
  pveNote:'深淵の風縛でCC。ガード+40%・ダメ軽減+30%。撃破でHP回復+気力消費なし再発動。ロキシーとの専用シナジーで全体がスキルを50%確率で無消費発動できる。',
  bestCircles:['魔眼魔法陣','ハロウィン魔法陣','桜花魔法陣'],
  pairWith:['roxie'], synergy:['roxie_sylph'] },

{ id:'elinalise', name:'エリナリーゼ', rarity:'ur+', type:'勇猛',
  roles:['atk','tank','counter'],
  tags:['silver_shield','guard_40','shield_counter_760'],
  pveScore:9,
  pveNote:'毎ターン銀盾閃を積み、スキル/通常攻撃を受けるとシールドカウンター（攻撃力380%×2=760%）。ガード+40%でPVEの前列として最高クラスの耐久と反撃を両立。',
  bestCircles:['魔眼魔法陣','ハロウィン魔法陣','炉神魔法陣'],
  pairWith:[], synergy:['counter_team'] },

{ id:'ryutilis_plus', name:'リューティリス(覇者)', rarity:'ur+', type:'神鋭',
  roles:['debuff','cc'],
  tags:['thorn_bind_top3','buff_erase_2','speed_debuff_max'],
  pveScore:5,
  pveNote:'茨の足止めで速度順上位3体をバインド（行動不可）。通常攻撃で最強敵のバフを2つ剥がし根の封鎖を付与。速度デバフも強力。後列でデバフを撒くサポーター。',
  bestCircles:['桜花魔法陣','武装魔法陣','剣の舞魔法陣'],
  pairWith:[], synergy:['debuff_team'] },

{ id:'aiko_plus', name:'畑山愛子(豊穣神)', rarity:'ur+', type:'調和',
  roles:['buff','debuff','tank','cc'],
  tags:['all_debuff_20pct','guard_100','partner_immortal_source','debuff_bonus_dmg'],
  pveScore:9,
  pveNote:'ガード+100%・速度+100で非常に高い耐久。通常攻撃で全敵に6種のCC/DoTを各20%確率で付与（凍結・目眩・沈黙・灼熱・毒・出血）。ヴァンドゥルと組むと彼が不死身に。終末魔法陣を持たせて速度最遅調整が定番。',
  bestCircles:['終末魔法陣','天使魔法陣','美女魔法陣'],
  pairWith:['vand'], synergy:['dot_team','debuff_team','aiko_vand'] },

{ id:'meil_plus', name:'メイル(海の解放者)', rarity:'ur+', type:'恩寵',
  roles:['tank','buff','cc'],
  tags:['shield_all_hp100','freeze_on_hit','guard_40','atk_debuff_all_30'],
  pveScore:10,
  pveNote:'進化2で開幕即スキル発動→全体に最大HP100%のシールド付与。敵全体ATK-30%常時。ガード+40%。PVE前列の最上位候補。新年/鳳凰/炉神装備で被攻撃のたびに主力アタッカーのスキルを追加発動させる。',
  bestCircles:['蒼魔魔法陣','闘神魔法陣','終末魔法陣'],
  pairWith:[], synergy:['shield_team','freeze_team'] },

{ id:'nointo_plus', name:'ノイント(UR+)', rarity:'ur+', type:'神鋭',
  roles:['atk','cc','buff'],
  tags:['cc_skill_x2_high','crit_high','atk_buff_ally'],
  pveScore:6,
  pveNote:'自分/敵がCC状態になるとスキルを高確率で再発動しつつ味方ATKもバフ。CCシナジーに最適。カム・宮崎奈々との組み合わせで爆発的な火力を叩き出す。',
  bestCircles:['裁定魔法陣','ハロウィン魔法陣','桜花魔法陣','花蓮魔法陣'],
  pairWith:['kam','nana'], synergy:['cc_team','atk_team'] },

{ id:'altena_plus', name:'アルテナ(覇者の礼装)', rarity:'ur+', type:'調和',
  roles:['tank','buff'], tags:['lethal_null_7times','revive_front','speed_swap','skill_dmg_immune','all_pen_resist'],
  pveScore:9, pveNote:'パッシブで致死ダメを7回まで無効化（毎ターン開始時にランダム記録と一致すると発動）。進化2で必ず発動。進化3で毎ターン最速敵と速度交換。進化4でスキルダメ1回完全耐性。前列1が倒れると100%（初回以外30%）で全回復復活。全体貫通耐性+30%。',
  bestCircles:['新年魔法陣','桜花魔法陣','武装魔法陣'], pairWith:[], synergy:['tank_front','buff_team'] },

{ id:'remia_plus', name:'レミア(覇者の礼装)', rarity:'ur+', type:'調和',
  roles:['heal','tank','buff','atk'], tags:['two_form','tidal_scale_8','lethal_null_scale','global_revive','fixed_dmg_hp_lost','judgement_debuff'],
  pveScore:8, pveNote:'HP50%以上は深海祈願形態（全体攻撃+全体デバフ/CC解除+祈願付与）、50%未満は深海審判形態（全体攻撃+審判デバフ=受ける回復-50%）。潮汐の鱗2層消費で致死ダメ無効+HP30%回復（毎ターン1回）。ミュウ編成時ミュウも1回のダメージがHP50%超えない効果獲得。進化2で開幕スキル発動。',
  bestCircles:['桜花魔法陣','天使魔法陣','森の女神魔法陣'], pairWith:['myu'], synergy:['heal_team'] },

{ id:'myu_plus', name:'ミュウ(雪のお姫様)', rarity:'ur+', type:'応援',
  roles:['atk','cc','tank'], tags:['freeze_extreme','freeze_chain','ice_statue_15hit','freeze_dmg_bonus_100','ice_shield_2'],
  pveScore:9, pveNote:'全体攻撃+凍結2種（極寒=HP回復不可、枷鎖=気力増減不可）を付与。氷像の耐久値が15回に増加。進化2で凍結状態の敵への全ダメ+100%。進化3で開幕全体に氷霜シールド2層（直接ダメ1回ずつ防ぐ）。進化5で氷像が攻撃受けると100%で攻撃者に凍結付与。通常攻撃でも30%凍結付与。',
  bestCircles:['氷雪魔法陣','闘神魔法陣','桜花魔法陣','武装魔法陣','天使魔法陣'], pairWith:['remia_plus'], synergy:['freeze_team'] },

{ id:'kaori_plus', name:'白崎香織(二大女神)', rarity:'ur+', type:'調和',
  roles:['heal','dot','buff','tank'], tags:['poison_200pct','bankiten_jokai','all_debuff_clear','hankei','sei_ten_3','atk_debuff_minus50','guard_40'],
  pveScore:7, pveNote:'全体攻撃+全体に毒（200%/ターン）付与。その後全体の異常状態を解除し看破（次の行動制限無効化）を付与する万天浄界を付与。生存中に全体の追加ダメ-50%（防御結界）。通常攻撃後に全体に聖典（貫通耐性+10%、最大5層）を付与。毒耐性デフォルト100%+ガード40%+ダメ軽減30%。HP20%以下で全回復+ATK+20%。',
  bestCircles:['蒼魔魔法陣','桜花魔法陣','終末魔法陣'], pairWith:['saeko','ryutilis'], synergy:['dot_team','heal_team'] },

{ id:'riria_plus', name:'リリアーナ(聖なる女王)', rarity:'ur+', type:'勇猛',
  roles:['atk','buff','tank'], tags:['shield_huge','kihaku_5','shield_break','taunt_ketsusen','atk_buff_all'],
  pveScore:7, pveNote:'後列攻撃+敵シールド破壊+全体に攻撃力600%のシールド付与。シールド獲得のたびに全体に鼓舞（ダメ+5%・軽減+5%、最大5層）を付与。進化3で鼓舞効果が+10%。進化5で全体に自身最大HP300%のシールド付与。進化2で出血/毒/灼熱耐性+100%。シールドを盾に前列でも戦える。',
  bestCircles:['武装魔法陣','桜花魔法陣','美女魔法陣'], pairWith:[], synergy:['shield_team','buff_team'] },

// ===== UR =====
{ id:'oscar', name:'オスカー', rarity:'ur', type:'応援',
  roles:['atk'],
  tags:['skill_dmg_stack_self','atk_stack_self_per_turn','drain_heal_all','pen_debuff'],
  pveScore:5,
  pveNote:'毎ターン自身ATK+20%蓄積。他のキャラがスキル発動するたびに自身スキルダメ+20%蓄積（自身のパッシブ）。全体攻撃で回復も兼ねる。10000階層以降のメインアタッカーとしてユエを上回る火力になる。ハロウィン魔法陣で一度倒れても蓄積ダメを維持して戦い続ける。',
  bestCircles:['ハロウィン魔法陣','闘神魔法陣','蒼魔魔法陣'],
  pairWith:[], synergy:['atk_team'] },

{ id:'myu', name:'ミュウ', rarity:'ur', type:'応援',
  roles:['atk','cc','tank'],
  tags:['freeze','ice_statue_10hit','heal_all_on_expire','guard'],
  pveScore:8,
  pveNote:'HP0で氷像に変身（ダメージ量に関わらず10回の攻撃に耐える）→5ターン後に残耐久×10%で復活＋全体回復。死亡時に99%で敵全体凍結。前列の盾として最優秀。氷雪魔法陣で氷像耐久値+2〜5。',
  bestCircles:['闘神魔法陣','氷雪魔法陣','桜花魔法陣','蒼魔魔法陣'],
  pairWith:[], synergy:['freeze_team'] },

{ id:'remia', name:'レミア', rarity:'ur', type:'調和',
  roles:['heal','debuff'],
  tags:['heal_all','debuff_clear_all','cc_resist','dmg_reduce_50_on_low_hp'],
  pveScore:5,
  pveNote:'全体回復＋全デバフ解除。HP80%以下でダメ軽減+50%（5ターン）。通常攻撃でHP低い味方2体を回復+デバフ解除。森の女神魔法陣で全体ガードを付与しつつ自身は毎ターン復活できる構成もある。',
  bestCircles:['桜花魔法陣','天使魔法陣','森の女神魔法陣'],
  pairWith:[], synergy:['heal_team'] },

{ id:'meil', name:'メイル', rarity:'ur', type:'恩寵',
  roles:['tank','cc','buff'],
  tags:['shield_all_hp30','freeze','guard_50','atk_up_20'],
  pveScore:9,
  pveNote:'開幕全体に最大HP30%シールド。ガード+50%・ATK+20%。前列凍結+速度デバフ。前列として優秀。新年/炉神/鳳凰魔法陣で被攻撃のたびに主力のスキルを追加発動させられる。',
  bestCircles:['新年魔法陣','炉神魔法陣','鳳凰魔法陣'],
  pairWith:[], synergy:['shield_team','freeze_team'] },

{ id:'koga', name:'天之河光輝(虚像)', rarity:'ur', type:'恩寵',
  roles:['atk','tank'],
  tags:['transform_3skill','dmg_reduce_share_30','heal_40_on_atk'],
  pveScore:9,
  pveNote:'スキル3回で変身。最もHP低い味方のダメ30%を自身が負担（覚醒後）。変身後は全体攻撃＋攻撃時HP40%回復。虚像魔法陣（最高HP時開幕スキル）と相性抜群。',
  bestCircles:['虚像魔法陣','魔眼魔法陣','炉神魔法陣'],
  pairWith:[], synergy:['tank_front'] },

{ id:'aiko', name:'畑山愛子', rarity:'ur', type:'応援',
  roles:['buff','debuff'],
  tags:['debuff_bonus_dmg_60','partner_immortal_source'],
  pveScore:4,
  pveNote:'状態異常1種類につき自身ダメ+60%（最大6種で+360%）。ヴァンドゥルを不死にする。UR+畑山愛子の方が耐久・速度が高く終末魔法陣との相性も良いが、こちらもヴァンドゥルの不死を発動できる。',
  bestCircles:['終末魔法陣','桜花魔法陣','美女魔法陣','天使魔法陣'],
  pairWith:['vand'], synergy:['dot_team','debuff_team','aiko_vand'] },

{ id:'altena', name:'アルテナ', rarity:'ur', type:'調和',
  roles:['tank','buff'],
  tags:['revive_front_char','cc_resist_all_70','position_buff'],
  pveScore:6,
  pveNote:'アルテナ生存中に前列が倒れると次ターン全回復で復活。味方全体のCC耐性+70%（覚醒後）。各ポジションにボーナス付与。天使魔法陣と組み合わせると非常に強力な復活サポーター。',
  bestCircles:['天使魔法陣','桜花魔法陣','蒼魔魔法陣'],
  pairWith:[], synergy:['buff_team'] },

{ id:'nointo', name:'ノイント', rarity:'ur', type:'神鋭',
  roles:['atk','cc'],
  tags:['skill_x2_on_cc_77pct','crit_stack','heal_on_crit'],
  pveScore:4,
  pveNote:'自分か敵がCC状態になると77%でスキルを2回発動（最大7回）。UR+ノイントとは別キャラ。後列から爆発的な火力。CCキャラと組み合わせて真価を発揮する。',
  bestCircles:['ハロウィン魔法陣','魔眼魔法陣','裁定魔法陣'],
  pairWith:[], synergy:['cc_team','atk_team'] },

{ id:'kaori', name:'白崎香織', rarity:'ur', type:'調和',
  roles:['heal','dot','buff'],
  tags:['heal_atk_3low','poison_dmg_convert','poison_immunity','debuff_clear'],
  pveScore:5,
  pveNote:'通常攻撃でHP低い味方3体に攻撃力500%相当を分配回復。毒状態の敵への回復量→ダメ変換。毒耐性デフォルト100%でエセアルラウネ戦に必須。スキルで味方の毒を解除できる。',
  bestCircles:['桜花魔法陣','翡翠魔法陣','天使魔法陣'],
  pairWith:['saeko','ryutilis'], synergy:['heal_team','dot_team'] },

{ id:'saeko', name:'毒島冴子', rarity:'ur', type:'応援',
  roles:['atk','dot'],
  tags:['poison_x5','dot_trigger_all','dot_stack_plus100','crit_debuff'],
  pveScore:4,
  pveNote:'見切りで毒×5回付与（覚醒後）。通常攻撃で全DoT即時発動。毒付与のたびに継続ダメ+100%・自身ATK+6%蓄積。ゾンビ/竜焔でDoT付与のたびにスキルダメも積み上がる。',
  bestCircles:['ゾンビ魔法陣','竜焔魔法陣','ハロウィン魔法陣'],
  pairWith:['kaori','ryutilis'], synergy:['dot_team','poison_team'] },

{ id:'takajo', name:'高城沙那', rarity:'ur', type:'調和',
  roles:['debuff','buff'],
  tags:['rand_debuff2_skill','rand_debuff2_normal','speed_debuff_all_20'],
  pveScore:4,
  pveNote:'スキルで敵全体にランダムデバフ2種。通常攻撃でも敵全体にランダムデバフ2種。全体速度-20%常時。多くのデバフを撒くことで畑山愛子(UR)のダメージを底上げできる。',
  bestCircles:['桜花魔法陣','蒼魔魔法陣','武装魔法陣'],
  pairWith:['aiko'], synergy:['debuff_team'] },

{ id:'miledy', name:'ミレディ', rarity:'ur', type:'勇猛',
  roles:['buff','atk'],
  tags:['dmg_buff_all_stack_6','silence_chance','atk_debuff_chance'],
  pveScore:5,
  pveNote:'スキル/通常攻撃のたびに全体ダメ+6%（彩属性キャラがいれば+3%追加）が重複蓄積。確率で敵に沈黙+ATK-20%付与。全体バッファーとしてPVEで最重要な1人。',
  bestCircles:['闘神魔法陣','桜花魔法陣','武装魔法陣'],
  pairWith:[], synergy:['buff_team'] },

{ id:'vand', name:'ヴァンドゥル', rarity:'ur', type:'勇猛',
  roles:['atk','dot','tank'],
  tags:['bleed','freeze_15pct','stun_15pct','immortal_with_aiko','atk_up_on_stun_ally'],
  pveScore:10,
  pveNote:'★27覚醒後、畑山愛子（URまたはUR+）生存中は致死ダメでもHP1で生き残る（不死）。出血+凍結/目眩付与。味方が目眩を付与するたびに自身ATK+14%蓄積。前列不死身運用がPVEの定番。魔眼魔法陣で気力管理をしながら会心ダメも積み上げる。',
  bestCircles:['魔眼魔法陣','桜花魔法陣','蒼魔魔法陣'],
  pairWith:['aiko','aiko_plus'], synergy:['dot_team','aiko_vand'] },

{ id:'ryutilis', name:'リューティリス', rarity:'ur', type:'神鋭',
  roles:['debuff','dot'],
  tags:['mp_drain_64','poison','def_debuff_50','crit_pen_debuff_on_death'],
  pveScore:3,
  pveNote:'気力-64%+毒付与（スキル）。通常攻撃で防御-50%・ダメ軽減-30%付与。戦闘不能時に敵全体気力-100+会心/貫通-50%。後列デバッファーとして活躍。PVPでの活躍が特に大きい。',
  bestCircles:['桜花魔法陣','蒼魔魔法陣','ゾンビ魔法陣'],
  pairWith:['kaori','saeko'], synergy:['debuff_team','poison_team'] },

{ id:'naize', name:'ナイズ', rarity:'ur', type:'恩寵',
  roles:['atk','tank'],
  tags:['guard','burn_on_guard','atk_debuff_on_guard','fixed_dmg_on_3guard'],
  pveScore:7,
  pveNote:'ガード+30%。ガードのたびに敵3体に灼熱+ATK-5%付与。ガード3回で自己回復+全体固定ダメ。前列タンクとして安定した耐久とDPS補助を両立。雲翔魔法陣でDoT耐性も得られる。',
  bestCircles:['魔眼魔法陣','炉神魔法陣','雲翔魔法陣'],
  pairWith:[], synergy:['tank_front','dot_team'] },

{ id:'tio', name:'ティオ', rarity:'ur', type:'応援',
  roles:['atk','dot'],
  tags:['burn_global','burn_explode_50pct','atk_stack_on_burn','heal_on_burn_expire'],
  pveScore:4,
  pveNote:'スキルで全体に灼熱付与。通常攻撃で50%確率で灼熱爆発。灼熱付与のたびATK+蓄積。黒竜化とは別キャラ。竜焔/ゾンビ魔法陣でDoT付与のたびにスキルダメも積み上がる。',
  bestCircles:['竜焔魔法陣','ゾンビ魔法陣','ハロウィン魔法陣'],
  pairWith:[], synergy:['dot_team'] },

{ id:'raus', name:'ラウス', rarity:'ur', type:'恩寵',
  roles:['atk','dot','tank'],
  tags:['burn_fixed_life','burn_passive','shield_on_dot_10pct'],
  pveScore:6,
  pveNote:'生命値依存の固定灼熱付与。DoTを受けるたびに最大HP10%のシールドを積み上げ。生命値+45%で耐久がある。竜焔魔法陣で灼熱を竜焔に変換すると自己回復しながら火力積み上げができる。',
  bestCircles:['竜焔魔法陣','ゾンビ魔法陣','虚像魔法陣'],
  pairWith:[], synergy:['dot_team'] },

{ id:'riria', name:'リリアーナ', rarity:'ur', type:'勇猛',
  roles:['buff','atk'],
  tags:['global_buff_on_enter','global_buff_on_death'],
  pveScore:4,
  pveNote:'戦闘開始時と戦闘不能時に全体ダメ増加+軽減を付与する独特のバッファー。自分が倒れるたびにバフを撒けるため長期戦で有効。',
  bestCircles:['闘神魔法陣','桜花魔法陣','蒼魔魔法陣'],
  pairWith:[], synergy:['buff_team'] },

{ id:'yue', name:'ユエ', rarity:'ur', type:'強靭',
  roles:['atk','tank'],
  tags:['hp_under50_awaken','atk_150_awaken','drain_heal','bleed','mp_circle_compat'],
  pveScore:6,
  pveNote:'HP50%以下でATK+150%・速度+150・被ダメ50%回復の覚醒が発動。機巧魔法陣（★2以上）で1ターン目から覚醒状態でスキルを発動できる。PVE序〜中盤の主力。',
  bestCircles:['機巧魔法陣','ハロウィン魔法陣','闘神魔法陣'],
  pairWith:[], synergy:['atk_team'] },

{ id:'shia_ur', name:'シア', rarity:'ur', type:'神鋭',
  roles:['atk','dot','tank'], tags:['debuff_bonus_200','random_dot_30pct','guard_40','fixed_dmg_10pct','heal_45pct'],
  pveScore:6, pveNote:'スキルでランダム3体に攻撃+デバフ1個につき追加ダメ最大1000%。通常攻撃でランダム3体にランダム継続ダメ付与。攻撃時に相手最大HP10%固定ダメ+与ダメの45%自己回復。ガード+40%・命中+40%。前列でも戦える耐久アタッカー。シア(覇者)とは別キャラ。',
  bestCircles:['ハロウィン魔法陣','竜焔魔法陣','ゾンビ魔法陣'], pairWith:[], synergy:['dot_team','atk_team'] },

{ id:'shizuku', name:'八重樫雫', rarity:'ur', type:'強靭',
  roles:['atk','tank'], tags:['atk_strongest','skill_dmg_stack_120','revive_on_kill','self_heal','cc_resist'],
  pveScore:7, pveNote:'最強ATK敵に特化した単体高火力アタッカー。スキルを発動するたびに次のスキルダメが前回×120%に。撃破するとスキルを再発動。通常攻撃で自己回復。CC耐性+20%。八重樫雫(覇者)とは別キャラ。',
  bestCircles:['ハロウィン魔法陣','闘神魔法陣','裁定魔法陣'], pairWith:[], synergy:['atk_team'] },

// ===== SSR =====
{ id:'will', name:'ウィル', rarity:'ssr', type:'勇猛',
  roles:['atk'],
  tags:['front_600pct','atk_stack_self_2t','crit_on_low_hp'],
  pveScore:5,
  pveNote:'前列に600%の分散ダメ。通常攻撃でATK+20%（2ターン）。HP閾値で会心率+10%×4段階。命中+60%で安定。前列配置も可能。',
  bestCircles:['花蓮魔法陣','魔眼魔法陣'],
  pairWith:[], synergy:['atk_team'] },

{ id:'erihi', name:'エリヒド', rarity:'ssr', type:'調和',
  roles:['buff'],
  tags:['mp_ally_50pct','mp_on_death'],
  pveScore:3,
  pveNote:'通常攻撃で50%確率で味方1体に気力+50。戦闘不能時に全体気力+14（50%で+36）。純粋なMP補助サポーター。森の女神魔法陣で自身も毎ターン気力を受け取り行動を加速できる。',
  bestCircles:['森の女神魔法陣','桜花魔法陣','美女魔法陣'],
  pairWith:[], synergy:['buff_team'] },

{ id:'hospin', name:'ホセ', rarity:'ssr', type:'調和',
  roles:['debuff','buff'],
  tags:['def_down_all_44','atk_up_all_10','guard','dmg_reduce_8_on_low_hp'],
  pveScore:4,
  pveNote:'通常攻撃で敵全体防御力-44%（3ターン）。スキルで敵ATK-8%+味方ATK+10%。HP50%以下で全体ダメ軽減+8%(5ターン)。通常攻撃で防御デバフを維持し続けることが重要。',
  bestCircles:['闘神魔法陣','蒼魔魔法陣','武装魔法陣'],
  pairWith:[], synergy:['debuff_team'] },

{ id:'sona', name:'ソーナ', rarity:'ssr', type:'神鋭',
  roles:['atk','debuff','cc','dot'],
  tags:['mp_drain_36','bleed','cc_immune_with_shia','speed_30'],
  pveScore:4,
  pveNote:'スキルで気力-36+出血。通常攻撃でランダム敵1体を攻撃+気力-50+出血。シアがいる場合はダメ軽減+10%＋CC完全免疫。守衛戦でスキルによる強力な全体攻撃を完封できる。',
  bestCircles:['武装魔法陣'],
  pairWith:['shia_plus'], synergy:['debuff_team','dot_team'] },

{ id:'freed', name:'フリード', rarity:'ssr', type:'応援',
  roles:['atk','dot'],
  tags:['burn_3body','heal_reduce','skill_dmg_60','hp50_atk_bonus'],
  pveScore:4,
  pveNote:'スキルでランダム3体に灼熱+被回復効果-15%。通常攻撃で後列の敵を攻撃+灼熱。自身スキルダメ+60%（パッシブ）。HP50%以下でATK+20%・スキルダメ+20%・気力+50。',
  bestCircles:['美女魔法陣'],
  pairWith:[], synergy:['dot_team'] },

{ id:'nana', name:'宮崎奈々', rarity:'ssr', type:'応援',
  roles:['atk','cc'],
  tags:['freeze_75pct_normal','freeze_40pct_skill','freeze_on_low_hp'],
  pveScore:5,
  pveNote:'通常攻撃で75%確率で凍結（2ターン）。スキルで前列の敵に攻撃+40%凍結。HP50%以下で最強敵に凍結2ターン付与。PVE階層攻略の定番CC役。水流魔法陣で凍結付与のたびにATK積み上げも可能。',
  bestCircles:['幻海魔法陣','美女魔法陣'],
  pairWith:['sarze'], synergy:['freeze_team'] },

{ id:'katrea', name:'カトレア', rarity:'ssr', type:'応援',
  roles:['atk','dot'],
  tags:['burn_50pct_all','mp_self_50pct','mihail_synergy_cc_resist','burn_cc_17pct'],
  pveScore:3,
  pveNote:'スキルで全体に50%で灼熱付与。通常攻撃で50%確率で自身気力+50。ミハイルがいる場合、自身とミハイルの命中+100%。ミハイルと組むと互いのCC耐性が+100%になる。',
  bestCircles:['美女魔法陣','武装魔法陣'],
  pairWith:['mihail'], synergy:['dot_team'] },

{ id:'kam', name:'カム', rarity:'ssr', type:'恩寵',
  roles:['atk','dot','cc'],
  tags:['poison_290pct','stun_75pct','regen_260pct','poison_back_low_hp'],
  pveScore:4,
  pveNote:'スキルで単体に毒付与（毎ターン45%ダメ、6ターン）。通常攻撃で75%確率で目眩（2ターン）。与ダメの260%分HP回復。HP50%以下で後列に毒4ターン付与。妨害役として汎用ボス戦に非常に優秀。',
  bestCircles:['美女魔法陣','幻海魔法陣','蒼魔魔法陣'],
  pairWith:[], synergy:['dot_team','cc_team'] },

{ id:'alfre', name:'アルフレリック', rarity:'ssr', type:'調和',
  roles:['atk','dot','cc','buff'],
  tags:['burn','freeze_target','speed','pen_buff_all','cc_resist'],
  pveScore:4,
  pveNote:'スキルで最強敵に灼熱+凍結+速度-（ターン数不明）付与。全体貫通バフ付与。行動制限無効も持つ多機能なサポートアタッカー。',
  bestCircles:['幻海魔法陣','美女魔法陣'],
  pairWith:[], synergy:['dot_team','freeze_team'] },

{ id:'adoru', name:'アドゥル', rarity:'ssr', type:'恩寵',
  roles:['atk','tank'],
  tags:['hp_recover_50pct','tio_synergy_passive','dmg_reduce_with_tio'],
  pveScore:6,
  pveNote:'ティオ(黒竜化)と組むとダメ軽減+ATK+20%を獲得。HP50%以下で最大HP50%回復。毒耐性あり。ティオ(黒竜化)との2体シナジーが強力で前列でも戦える。',
  bestCircles:['花蓮魔法陣','闘神魔法陣','幻海魔法陣'],
  pairWith:['tio_plus'], synergy:['tio_adoru'] },

{ id:'hiyama', name:'檜山大介', rarity:'ssr', type:'強靭',
  roles:['tank','cc','buff'],
  tags:['guard_50','stun_on_guard','guard_buff_all_30'],
  pveScore:8,
  pveNote:'ガード+50%。通常攻撃受けるとガード+10%（3ターン）蓄積。戦闘開始時に全体ガード+30%（5ターン）付与。前列タンクとして全体のガード率を引き上げる。桜花魔法陣との組み合わせで高確率でダメを無効化できる。',
  bestCircles:['新年魔法陣','鳳凰魔法陣','炉神魔法陣'],
  pairWith:[], synergy:['tank_front','buff_team'] },

{ id:'meld', name:'メルド', rarity:'ssr', type:'恩寵',
  roles:['atk','heal','tank'],
  tags:['dmg_reduce_50','atk_stack_self_minus_reduce','regen_all'],
  pveScore:7,
  pveNote:'ダメ軽減+50%。毎ターンATK+10%蓄積（代わりに自身ダメ軽減-10%、解除不可）。毎ターン全体回復。前列で長期戦に強い。虚像魔法陣（最高HP時開幕スキル）との相性も良い。',
  bestCircles:['桜花魔法陣','虚像魔法陣','天蠍魔法陣'],
  pairWith:[], synergy:['tank_front'] },

{ id:'ranzui', name:'ランズィ', rarity:'ssr', type:'神鋭',
  roles:['atk','cc'],
  tags:['silence','crit_50','skill_chain_50'],
  pveScore:3,
  pveNote:'50%でスキル再発動。沈黙付与',
  bestCircles:['幻海魔法陣','闘神魔轟神','魔眼魔法陣'],
  pairWith:[], synergy:['atk_team'] },

{ id:'sakagami', name:'坂上龍太郎', rarity:'ssr', type:'強靭',
  roles:['atk','tank'],
  tags:['shield_self_atk100','crit_dmg_stack_18'],
  pveScore:6,
  pveNote:'通常攻撃でATK100%相当のシールドと会心ダメ+18%蓄積。撃破で気力+HP33%+会心ダメ+30%。前列でシールドを積みながら火力も出せる。',
  bestCircles:['魔眼魔法陣','武装魔法陣','桜花魔法陣'],
  pairWith:[], synergy:['atk_team'] },

{ id:'taniguchi', name:'谷口鈴', rarity:'ssr', type:'調和',
  roles:['heal','debuff'],
  tags:['heal_all','speed_debuff_15','dmg_reduce_all_10','stun_35_on_normal'],
  pveScore:5,
  pveNote:'スキルで全体回復+速度-15%。通常攻撃で前列に35%目眩。開幕全体ダメ軽減+10%。汎用的なサポーター。',
  bestCircles:['翡翠魔法陣','桜花魔法陣','蒼魔魔法陣'],
  pairWith:[], synergy:['heal_team'] },

{ id:'nakamura', name:'中村恵里', rarity:'ssr', type:'神鋭',
  roles:['atk'],
  tags:['all_atk_self_dmg','drain_heal_on_low_hp','crit'],
  pveScore:3,
  pveNote:'通常攻撃で全体攻撃するが自身HPの30%固定ダメを受ける。HP70%以下で与ダメの40%回復。スキルでも自傷。ハロウィン/裁定魔法陣で一度倒れても無敵で戦い続ける運用に。',
  bestCircles:[],
  pairWith:[], synergy:['atk_team'] },

{ id:'sarze', name:'サルゼ', rarity:'ssr', type:'調和',
  roles:['atk','cc','tank','buff'],
  tags:['freeze','atk_swap_best','revive_full','burn_immunity_default'],
  pveScore:5,
  pveNote:'凍結+相手ATK-10%+最強ATK味方ATK+10%。灼熱耐性デフォルト100%（黒竜・ティオ戦で重宝）。HP0で全回復復活（1回）。非常に器用なバッファー。',
  bestCircles:['闘神魔法陣','美女魔法陣'],
  pairWith:['nana'], synergy:['freeze_team'] },

{ id:'sugawara', name:'菅原妙子', rarity:'ssr', type:'勇猛',
  roles:['atk','cc'],
  tags:['silence_50_normal','silence_all_on_low_hp','mp_50pct_normal'],
  pveScore:3,
  pveNote:'通常攻撃で50%確率で沈黙2ターン。HP50%以下で敵全体に沈黙2ターン。通常50%で自身気力+50。相手のスキルを封じる妨害特化。裁定魔法陣の神鋭タイプ沈黙効果と重複する。',
  bestCircles:['桜花魔法陣','幻海魔法陣'],
  pairWith:[], synergy:['cc_team'] },

{ id:'sonobe', name:'園部優花', rarity:'ssr', type:'応援',
  roles:['atk','dot'],
  tags:['poison_multi','atk_stack_on_poison','back_atk'],
  pveScore:3,
  pveNote:'後列に毒を広域付与。毒付与のたびATK+3%蓄積。スキルダメ+80%。後列DoTアタッカー。ゾンビ/竜焔でDoT付与のたびにスキルダメを積み上げる。',
  bestCircles:['お月見魔法陣'],
  pairWith:['kaori','saeko'], synergy:['dot_team'] },

{ id:'haruga', name:'ハルガ', rarity:'ssr', type:'恩寵',
  roles:['atk','dot','tank'],
  tags:['burn_3body','def_debuff_on_hit','dmg_reduce_30_on_low_hp','hp_def_buff'],
  pveScore:6,
  pveNote:'HP+20%・防御+20%で耐久がある。スキルでランダム3体に灼熱。攻撃受けるたびに相手防御-4%。HP80%以下で全体ダメ軽減+30%（2ターン）。前列でもそこそこ戦える。',
  bestCircles:['武装魔法陣'],
  pairWith:[], synergy:['dot_team'] },

{ id:'tenriv', name:'天之川光輝', rarity:'ssr', type:'勇猛',
  roles:['atk'],
  tags:['back_atk_280','crit_stack_normal','skill_chain_on_kill'],
  pveScore:3,
  pveNote:'後列に280%ダメ、撃破でスキル再発動。通常攻撃で後列攻撃+会心率+20%（3ターン）。会心+20%・会心ダメ+50%（パッシブ）。後列アタッカー。虚像UR版とは別キャラ。',
  bestCircles:[],
  pairWith:[], synergy:['atk_team'] },

{ id:'fos', name:'フォス', rarity:'ssr', type:'強靭',
  roles:['tank','dot'],
  tags:['guard','bleed_on_guard','regen_on_guard','front_atk'],
  pveScore:7,
  pveNote:'ガード+30%。通常攻撃でガード+10%（3ターン）蓄積。ガードのたびに出血付与+自己回復。スキルで前列攻撃+出血。前列タンクとして出血でDoTも出せる。',
  bestCircles:[],
  pairWith:[], synergy:['tank_front'] },

{ id:'mihail', name:'ミハイル', rarity:'ssr', type:'強靭',
  roles:['atk','buff'],
  tags:['atk_crit_on_ally_death','cc_resist_with_katrea'],
  pveScore:4,
  pveNote:'味方戦闘不能時に会心+12%・ATK+22%蓄積。カトレアと組むと互いのCC耐性+100%。後列アタッカー。',
  bestCircles:[],
  pairWith:['katrea'], synergy:['buff_team'] },

{ id:'kuze', name:'クゼ', rarity:'ssr', type:'強靭',
  roles:['atk','cc'],
  tags:['stun_highest_hp','fixed_dmg_highest_hp','crit'],
  pveScore:3,
  pveNote:'最もHP高い敵に固定ダメ+50%目眩。通常攻撃でも最高HP敵を狙い50%目眩。ヒュドラ（凍結耐性900%）対策で活躍。後列向き。',
  bestCircles:['桜花魔法陣','魔眼魔法陣','幻海魔法陣'],
  pairWith:[], synergy:['cc_team'] },

{ id:'mona', name:'モナ', rarity:'ssr', type:'恩寵',
  roles:['atk','tank'],
  tags:['heal_on_hit','atk_debuff_on_hit','debuff_clear_on_low_hp','pen_resist'],
  pveScore:4,
  pveNote:'攻撃受けるたびに相手ATK-10%+自己HP4%回復。HP50%以下でデバフ解除。貫通耐性+30%。前列でもある程度戦える。',
  bestCircles:['桜花魔法陣','重力魔法陣','蒼魔魔法陣'],
  pairWith:[], synergy:['tank_front'] },

{ id:'mao', name:'マオ', rarity:'ssr', type:'神鋭',
  roles:['atk','dot','debuff'],
  tags:['bleed','silence','atk_debuff_20_on_normal','back_atk'],
  pveScore:3,
  pveNote:'スキルで後列に出血+ATK-20%。通常攻撃で後列攻撃+37%沈黙。スキルダメ+20%・貫通+10%。後列デバフアタッカー。裁定魔法陣の神鋭沈黙効果と相性が良い。',
  bestCircles:[],
  pairWith:[], synergy:['dot_team'] },

{ id:'ishtar', name:'イシュタル', rarity:'ssr', type:'神鋭',
  roles:['debuff','cc'],
  tags:['mp_drain_15_skill','stun_35_normal','atk_stack_on_hit_self'],
  pveScore:3,
  pveNote:'スキルで全体に175%ダメ+15%で気力-15。通常攻撃で気力-50+35%目眩。攻撃受けるたびに自身ATK+3%蓄積。気力ドレイン+目眩で敵の行動を遅らせる後列デバッファー。',
  bestCircles:['幻海魔法陣','桜花魔法陣'],
  pairWith:[], synergy:['debuff_team'] },
];

// 排他マップ
const EXCL_MAP = {'竜焔魔法陣':'ゾンビ魔法陣','ゾンビ魔法陣':'竜焔魔法陣','蒼魔魔法陣':'氷雪魔法陣','氷雪魔法陣':'蒼魔魔法陣','ハロウィン魔法陣':'裁定魔法陣','裁定魔法陣':'ハロウィン魔法陣'};
const CIRCLE_NAMES = CIRCLES.map(c=>c.name);

// シナジー
const SYNERGIES = [
  { id:'ryu_pair', label:'リュー＆ヘスティア（不死コンビ）', check:p=>p.some(c=>c.id==='ryu')&&p.some(c=>c.id==='hestia'), desc:'リューはヘスティア生存時に致死ダメを無効化しHP1で生き残る。ヘスティアのDoT無効+全体回復と組み合わさり前列が崩壊しにくい最強シナジーの一つ。' },
  { id:'roxie_sylph', label:'ロキシー＆シルフィエット（無言の圧力）', check:p=>p.some(c=>c.id==='roxie')&&p.some(c=>c.id==='sylph'), desc:'味方全体がメインスキル発動時に50%の確率で気力を消費しない。CCと気力ドレインで相手スキルを封じながら自分たちはスキルを連発できる。' },
  { id:'aiko_vand', label:'畑山愛子＆ヴァンドゥル（不死の前列・★27必須）', check:p=>(p.some(c=>c.id==='aiko')||p.some(c=>c.id==='aiko_plus'))&&p.some(c=>c.id==='vand'), desc:'ヴァンドゥル★27覚醒後、畑山愛子生存中は致死ダメでもHP1残存（不死）。8000階層以降のPVEで最も安定する前列構成。終末魔法陣を愛子に装備で敵受けるダメ+50%が永続。' },
  { id:'tio_adoru', label:'ティオ(黒竜化)＆アドゥル', check:p=>p.some(c=>c.id==='tio_plus')&&p.some(c=>c.id==='adoru'), desc:'アドゥルがティオ(黒竜化)と編成時にダメ軽減+ATK+20%を獲得。ティオの灼熱を最大限活かす組み合わせ。' },
  { id:'mihail_katrea', label:'ミハイル＆カトレア（CC完全免疫）', check:p=>p.some(c=>c.id==='mihail')&&p.some(c=>c.id==='katrea'), desc:'互いのCC耐性+100%を獲得しCC系の妨害を完全無視できる安定アタッカーコンビ。' },
  { id:'shia_sona', label:'シア(覇者)＆ソーナ', check:p=>p.some(c=>c.id==='shia_plus')&&p.some(c=>c.id==='sona'), desc:'ソーナはシア(覇者)がいる場合にダメ軽減+10%＋CC完全免疫を獲得。守衛戦ではソーナでスキルを完封しながらシアが前列の壁になる。' },
  { id:'freeze_team', label:'凍結シナジー', check:p=>p.filter(c=>c.tags.some(t=>['freeze','freeze_75pct_normal','freeze_on_low_hp','freeze_40pct_skill'].includes(t))).length>=2, desc:'凍結付与キャラが複数おり行動を継続的に制限できる。宮崎奈々の75%凍結はPVE階層攻略で特に優秀。' },
  { id:'dot_team', label:'継続ダメージシナジー', check:p=>p.filter(c=>c.tags.some(t=>['burn_passive','poison_x5','burn_global','bleed','burn_3body'].includes(t))).length>=2, desc:'DoTキャラが複数おり毒・灼熱・出血が継続的に蓄積する。ゾンビ/竜焔魔法陣と組み合わせると爆発的な火力になる。' },
  { id:'cc_team', label:'CCシナジー', check:p=>p.filter(c=>c.roles.includes('cc')).length>=2, desc:'複数のCCキャラがおり行動を頻繁に制限できる。ノイント（URまたはUR+）はCC状態になるたびにスキルを再発動し、CCシナジーと抜群の相性。' },
  { id:'buff_team', label:'バフシナジー', check:p=>p.filter(c=>c.roles.includes('buff')).length>=2, desc:'バフキャラが複数おり全体ステータスを大幅底上げできる。ミレディの全体ダメ+蓄積＋ホセの防御-44%が特に強力な組み合わせ。' },
  { id:'tank_front', label:'タンク前列シナジー', check:p=>p.filter(c=>c.roles.includes('tank')&&c.pveScore>=7).length>=2, desc:'高耐久キャラが複数おり前列が倒れてもすぐ次の壁が立てられる。PVEでは前列耐久が最重要。' },
];

// ボス
// 階層帯タブ
const FLOOR_TIERS = [
  { id:'under9000', label:'9000階層未満' },
  { id:'10000plus', label:'10000階層以降' },
];
 
// ボスごとの「詰まる原因」を選択式に変換したもの
// need: チェックした場合の対策方針 / counters: 実際に対策となるキャラのid（参考。空でも判定可）
const BOSS_THREAT_LIBRARY = {
  guard: [
    { id:'heal', label:'高い回復能力を持つ', need:'妨害(沈黙・CC)役か高火力で押し切る必要があります。', counters:['sona','sugawara','shia_plus'] },
    { id:'atk_down', label:'攻撃力低下デバフを使う', need:'影響は軽微です。耐久があれば無視して問題ありません。', counters:[] },
    { id:'time_limit', label:'時間制限（ターン数）で失敗しやすい', need:'高火力アタッカーを増やして決着を早める必要があります。', counters:['oscar','yue','yue_plus'] },
    { id:'single_target', label:'非常に高威力のスキルを単体に放つ', need:'前列適性の高いタンクに攻撃を集中させる必要があります。', counters:['vand','meil_plus','shia_plus'] },
    { id:'partial_aoe', label:'一部個体は前列以外も攻撃してくる', need:'宮崎奈々などのCC役で行動を縛ると安定します。', counters:['nana','kam'] },
  ],
  dragon: [
    { id:'burn_dot', label:'灼熱の蓄積によるスリップダメージがある', element:'burn', need:'灼熱耐性100%のキャラがいると安定します。', counters:['sarze','tio_plus'] },
    { id:'burn_on_hit', label:'攻撃時に灼熱を付与してくる(凍結ハメ不可)', element:'burn', need:'凍結ハメが効かないため、灼熱耐性100%で受け切る必要があります。', counters:['sarze'] },
    { id:'bleed_variant', label:'出血を付与してくる個体がいる', element:'bleed', need:'出血耐性100%のキャラがいると安定します。', counters:['tio_plus'] },
  ],
  alraune: [
    { id:'poison_dot', label:'毒の蓄積によるスリップダメージがある', element:'poison', need:'毒耐性100%のキャラがいると安定します。', counters:['kaori','kaori_plus'] },
    { id:'poison_aoe', label:'ターン開始時に全体へ毒を付与する(凍結ハメ不可)', element:'poison', need:'凍結ハメが効かないため、毒耐性100%で受け切る必要があります。', counters:['kaori','kaori_plus'] },
  ],
  hydra: [
    { id:'poison_dot_hydra', label:'毒の蓄積がある', element:'poison', need:'毒耐性100%のキャラがいると安定します。', counters:['kaori','kaori_plus'] },
    { id:'burn_dot_hydra', label:'灼熱の蓄積がある', element:'burn', need:'灼熱耐性100%のキャラがいると安定します。', counters:['sarze','tio_plus'] },
    { id:'revive_once', label:'戦闘不能後に1度復活する個体がいる', need:'長期戦を見据えた持続火力が必要です。', counters:['oscar'] },
    { id:'cc_resist_high', label:'高い凍結・行動制限耐性を持つ', need:'凍結ではなく目眩(クゼ等)や毒で対応する必要があります。', counters:['kuze','kam'] },
  ],
  general: [
    { id:'no_dot', label:'継続ダメージ(毒/灼熱/出血)を持たない', need:'特別な耐性は不要です。通常のCC・妨害で十分対応できます。', counters:['nana','kam'] },
    { id:'standard', label:'特殊な耐性を持たない一般的な敵', need:'宮崎奈々・カムの妨害で十分です。', counters:['nana','kam'] },
    { id:'specific_known', label:'カトレア・ノイント・ミレディ等の特定ボスである', need:'出血付与等の癖がある場合は黒竜対策編成も参考にしてください。', counters:[] },
  ],
  late: [
    { id:'low_dps', label:'URユエ単体では火力が不足する', need:'オスカーなど高火力アタッカーへの切り替えを検討してください。', counters:['oscar'] },
    { id:'dot_mgmt', label:'継続ダメージ(毒/灼熱/出血)の耐性管理が必要', need:'毒/灼熱/出血のいずれかに耐性を持つキャラを編成に入れると安定します。', counters:['sarze','kaori','kaori_plus','tio_plus'] },
  ],
};
 
// 10000階層以降で共通して気にすべき注意点（ボスに関わらず常時表示）
const TIER_NOTES = {
  '10000plus': {
    title:'10000階層以降 共通の注意点',
    desc:'URユエ単体の火力では不足しがちです。オスカーをメインアタッカーに切り替え、装備・アーティファクトを引き継ぐ運用を検討してください。継続ダメージ(毒/灼熱/出血)への耐性管理がそれまでの階層より重要になります。',
  },
};
 
let currentBossTier = 'under9000';
let currentBoss = null;
let bossThreatState = {};

// 灼熱／毒／出血耐性100%が確認できているキャラ（手動メンテ用。編集しやすいよう配列のみ）
const RESIST_100 = {
  burn:   ['sarze','tio_plus','riria_plus'],
  poison: ['kaori','kaori_plus','tio_plus','riria_plus'],
  bleed:  ['yue','tio_plus','riria_plus'],
};
 
let bossResistSelect = {};

const BOSSES = [
  { id:'guard', name:'守衛', icon:'🛡', tiers:['under9000','10000plus'], threats:['高い回復能力','攻撃力低下デバフ','時間制限','非常に高い威力のスキル（単体攻撃）'], tip:'守衛の通常攻撃・スキルは全て単体攻撃のためスロット1に耐久役を置けば全ての攻撃をそこに集中させられます。8000階層超えるとユエがワンパンされやすくなります。一部先頭以外も攻撃してくる個体は宮崎奈々で凍結させましょう。',
    parties:[
      { title:'ヴァンドゥル不死パーティ（★27以上）', members:['1: ヴァンドゥル★27+ / 魔眼魔法陣','2: リューティリス / 武装魔法陣','3: 畑山愛子（速度最遅）/ 終末魔法陣','4: ミレディ / 闘神魔法陣','5: URユエ★30 / 機巧魔法陣'], note:'ヴァンドゥルが全攻撃を受ける。一部先頭以外を攻撃する個体は宮崎奈々で凍結させる。' },
      { title:'守衛対策（毒島冴子あり・10000階層以降）', members:['1: ヴァンドゥル★27+ / 武装魔法陣','2: 毒島冴子 / 魔眼魔法陣','3: 畑山愛子 / 終末魔法陣','4: ミレディ / 闘神魔法陣','5: オスカー / ハロウィン魔法陣'], note:'' },
      { title:'守衛対策（毒島冴子なし・10000階層以降）', members:['1: ヴァンドゥル★27+ / 魔眼魔法陣','2: 白崎香織 / 武装魔法陣','3: 畑山愛子 / 終末魔法陣','4: ミレディ / 闘神魔法陣','5: オスカー / ハロウィン魔法陣'], note:'' },
    ] },
  { id:'dragon', name:'黒竜・ティオ', icon:'🐉', tiers:['under9000','10000plus'], threats:['灼熱の蓄積によるスリップダメージ','攻撃時に灼熱を付与してくる個体は凍結ハメが効かない'], tip:'灼熱を無効化するサルゼ（灼熱耐性デフォルト100%）をバッファーとして編成するのが有効。リロールや宝石で灼熱耐性100%をつけると安定します。出血を付与してくる黒竜も同パーティで対応可。',
    parties:[
      { title:'灼熱耐性100%用意できる場合', members:['1: ヴァンドゥル★27+ / 魔眼魔法陣','2: ソーナ（灼熱耐性100%必須）/ 武装魔法陣','3: 畑山愛子（灼熱耐性100%必須）/ 終末魔法陣','4: ミレディ / 闘神魔法陣','5: URユエ★30 / 機巧魔法陣'], note:'ソーナで全体スキル攻撃を防ぎ畑山愛子を守ります。' },
      { title:'灼熱耐性100%用意できない場合', members:['1: ヴァンドゥル★27+ / 魔眼魔法陣','2: ミュウ / 武装魔法陣','3: 畑山愛子 / 終末魔法陣','4: サルゼ（灼熱耐性デフォルト100%）/ 闘神魔法陣','5: URユエ★30 / 機巧魔法陣'], note:'道中の攻撃をヴァンドゥルで防ぎミュウをボス戦まで温存。ミュウの氷像でユエを守ります。サルゼは灼熱耐性100%で優秀なバッファー。' },
    ] },
  { id:'alraune', name:'エセアルラウネ', icon:'🌿', tiers:['under9000','10000plus'], threats:['毒の蓄積によるスリップダメージ','ターン開始時に全体へ毒を付与する個体は凍結ハメが効かない'], tip:'毒を無効化し、ユエの毒を解除できる白崎香織が有効。毒耐性100%をつけると安定します。',
    parties:[
      { title:'毒耐性100%用意できる場合', members:['1: ヴァンドゥル★27+ / 魔眼魔法陣','2: ソーナ（毒耐性100%必須）/ 武装魔法陣','3: 畑山愛子（毒耐性100%必須）/ 終末魔法陣','4: 白崎香織（毒耐性デフォルト100%・ユエの毒除去）/ 闘神魔法陣','5: URユエ★30 / 機巧魔法陣'], note:'白崎香織はデフォルトで毒耐性100%を持ちスキルでユエの毒を除去できます。' },
      { title:'毒耐性100%用意できない場合', members:['1: ヴァンドゥル★27+ / 魔眼魔法陣','2: ミュウ / 武装魔法陣','3: 畑山愛子 / 終末魔法陣','4: 白崎香織 / 闘神魔法陣','5: URユエ★30 / 機巧魔法陣'], note:'ミュウの氷像でボス以外の攻撃からユエを守ります。白崎香織でユエの毒を解除します。' },
    ] },
  { id:'hydra', name:'ヒュドラ', icon:'🐍', tiers:['under9000','10000plus'], threats:['毒・灼熱の蓄積','一部個体は戦闘不能後に1度復活','高い凍結耐性または行動制限耐性を持つ個体がいる'], tip:'基本は宮崎奈々の凍結で行動を封じて攻略。凍結耐性が高い個体はカム（目眩75%）で対応します。',
    parties:[
      { title:'凍結耐性900%・ガード100%パターン', members:['1: ヴァンドゥル★27+ / 魔眼魔法陣','2: カム / 武装魔法陣','3: 畑山愛子 / 終末魔法陣','4: クゼ（目眩で行動制限）/ 闘神魔法陣','5: URユエ★30 / 機巧魔法陣'], note:'ヴァンドゥルの固有アーティファクト「魔人のマフラー」で命中を上げてガードを減らすと有効。' },
      { title:'行動制限耐性50%パターン', members:['1: ヴァンドゥル★27+ / 魔眼魔法陣','2: カム / 武装魔法陣','3: 畑山愛子 / 終末魔法陣','4: 宮崎奈々 / 幻海魔法陣','5: URユエ★30 / 機巧魔法陣'], note:'宮崎奈々・カムに行動制限率増加の宝石を装備させると安定します（★15以上）。' },
      { title:'凍結耐性900%（10000階層以降）', members:['1: ヴァンドゥル★27+ / 魔眼魔法陣','2: カム / 武装魔法陣','3: 畑山愛子 / 終末魔法陣','4: クゼ / 闘神魔法陣','5: オスカー / ハロウィン魔法陣'], note:'' },
    ] },
  { id:'general', name:'汎用・その他ボス', icon:'⚔', tiers:['under9000','10000plus'], threats:['カトレア・ノイント・サソリもどき・ミレディ等','継続ダメージを持たない黒竜・エセアルラウネも含む'], tip:'宮崎奈々・カムで行動を封じれば比較的簡単に突破できます。ノイントが出血を付与してくる場合は黒竜の対策パーティを参考にしてください。',
    parties:[
      { title:'汎用パーティ（ヴァンドゥル★27以上）', members:['1: ヴァンドゥル★27+ / 魔眼魔法陣','2: カム / 武装魔法陣','3: 畑山愛子 / 終末魔法陣','4: 宮崎奈々 / 幻海魔法陣','5: URユエ★30 / 機巧魔法陣'], note:'カムと宮崎奈々の妨害でボスの行動を封じながらユエで攻撃。' },
    ] },
  { id:'late', name:'10000階層以降', icon:'🔥', tiers:['10000plus'], threats:['URユエでは火力が不十分','継続ダメージへの耐性管理が重要'], tip:'無課金の場合、オスカーをメインアタッカーとして採用。装備・アーティファクトをユエから引き継いでください。9600階層あたりからこの編成が必要になる可能性があります。',
    parties:[
      { title:'10000階層以降・基本パーティ', members:['1: ヴァンドゥル★27+ / 魔眼魔法陣','2: カム / 武装魔法陣','3: 畑山愛子（速度最遅・氷槍突き魔獣）/ 美女魔法陣','4: 宮崎奈々 / 闘神魔法陣','5: オスカー / ハロウィン魔法陣'], note:'※畑山愛子を速度最遅に調整し氷槍突きスキルを持つ2凸以上の氷属性魔獣を装備。\n※100階層毎のボス（単体）ではヴァンドゥルを最遅にし氷槍突き魔獣装備。\n※武器：火力重視→オルカン+メツェライ / 行動制限重視→パイルバンカー+シュラゲーン\n※神術：結界→灼熱or猛毒（ボスのDoTに耐性を付与できる方を選択）' },
    ] },
];

// ステータス
const STATS = [
  ['攻撃力','敵に与える基礎ダメージ量'],['防御力','ダメージ軽減（最大70%）'],['生命値','耐えられるダメージ量。0で戦闘不能'],
  ['速度','行動順を決める。同速は攻撃側が先'],['命中','敵のガード発生確率を相殺'],['ガード','発動時にダメージが1/3減少'],
  ['会心率','発動時に150%のダメージ'],['会心ダメージ','会心ダメを増加（150%に上乗せ）'],['会心ダメージ軽減','敵の会心ダメを打ち消す'],
  ['会心耐性','敵の会心発生確率を相殺'],['貫通','防御による軽減を相殺（上限70%）'],['耐性貫通','敵の貫通を相殺'],
  ['スキルダメージ増加','スキルダメージ増加（最大500%）'],['スキルダメージ軽減','敵スキルダメを相殺'],
  ['ダメージ増加','与える最終ダメージ増加'],['ダメージ軽減','受ける最終ダメ減少（最大70%）'],
  ['行動制限率増加','CC確率を増加させ敵CC耐性を相殺'],['行動制限耐性','沈黙/凍結/目眩に適用。各耐性とは別計算'],
  ['凍結耐性','行動制限耐性とは別計算（どちらか有効で凍結しない）'],['目眩耐性','行動制限耐性とは別計算'],
  ['沈黙耐性','行動制限耐性とは別計算'],['出血耐性','受ける出血確率を減少'],['灼熱耐性','受ける灼熱確率を減少'],['毒耐性','受ける毒確率を減少'],
  ['回復強化','回復効果・吸収等も対象'],['気力回復','気力回復効果が強化（被ダメ時等も含む）'],
  ['出血命中','敵の出血耐性を相殺'],['毒命中','敵の毒耐性を相殺'],['灼熱命中','敵の灼熱耐性を相殺'],
  ['絶対殲滅','与える絶対ダメージ（直接・継続・固定・追加）を増加'],['絶対守護','受ける絶対ダメージを減少（最大99%）'],
];

// =====================================================
// 状態管理
// =====================================================
let party = [null,null,null,null,null];
let partyCircles = ['なし','なし','なし','なし','なし'];
let partyRanks = ['2凸','2凸','2凸','2凸','2凸'];
let currentFilter = 'all';
const BUILD_STORAGE_KEY = 'ariribe_party_build_v1';
 
// 現在の編成・魔法陣・凸数をlocalStorageに保存
function saveBuildToStorage() {
  try {
    const data = {
      partyIds: party.map(c => c ? c.id : null),
      partyCircles: partyCircles.slice(),
      partyRanks: partyRanks.slice(),
    };
    localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // プライベートブラウズ等でlocalStorageが使えない場合は何もしない
  }
}
 
// 保存されている編成を読み込んでpartyなどに反映
function loadBuildFromStorage() {
  try {
    const raw = localStorage.getItem(BUILD_STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.partyIds)) return;
 
    party = data.partyIds.map(id => id ? (CHARS.find(c => c.id === id) || null) : null);
    while (party.length < 5) party.push(null);
    party = party.slice(0, 5);
 
    if (Array.isArray(data.partyCircles)) {
      partyCircles = data.partyCircles.slice(0, 5);
      while (partyCircles.length < 5) partyCircles.push('なし');
    }
    if (Array.isArray(data.partyRanks)) {
      partyRanks = data.partyRanks.slice(0, 5);
      while (partyRanks.length < 5) partyRanks.push('2凸');
    }
  } catch (e) {
    // 保存データが壊れていた場合は無視して通常起動する
  }
}

function init() {
  loadBuildFromStorage();
  renderSlots();
  renderCharPool();
  renderBossTierTabs();
  renderBossGrid();
  renderCircleList();
  renderStatTable();
  analyze();
}

function switchMain(id, btn) {
  document.querySelectorAll('#main-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.content-column .tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('main-'+id).classList.add('active');
}

// ---- キャラプール ----
function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderCharPool();
}

function renderCharPool() {
  const pool = document.getElementById('char-pool');
  pool.innerHTML = '';
  CHARS.filter(c=>currentFilter==='all'||c.rarity===currentFilter).forEach(c=>{
    const btn = document.createElement('button');
    btn.className = `char-btn rarity-${c.rarity.replace('+','-plus')}`;
    btn.textContent = c.name;
    if (party.includes(c)) btn.classList.add('selected');
    btn.onclick = ()=>toggleChar(c);
    pool.appendChild(btn);
  });
}

// ---- スロット ----
function renderSlots() {
  const grid = document.getElementById('slot-grid');
  grid.innerHTML = '';
  const RANK_OPTIONS = ['2凸','4凸','6凸','10凸'];

  for (let i=0; i<5; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'slot-wrap' + (party[i]?' has-char':'');

    // スロット本体
    const slot = document.createElement('div');
    const c = party[i];
    const isFront = i===0;
    if (c) {
      slot.className = `slot filled${isFront?' is-front':''}`;
      slot.innerHTML = `<span class="slot-remove" onclick="removeFromSlot(${i})">✕</span><span class="slot-rar">${c.rarity.toUpperCase()}</span><span class="slot-name">${c.name}</span><span class="slot-pos">${isFront?'【前列】':'後列 '+i}</span>`;
    } else {
      slot.className = `slot${isFront?' is-front':''}`;
      slot.innerHTML = `<span class="slot-pos">${isFront?'前列(1)':i+1}</span>`;
    }
    wrap.appendChild(slot);

    // 魔法陣選択UI（キャラがいる場合のみ）
    if (c) {
      const circleUI = document.createElement('div');
      circleUI.className = 'circle-ui';

      // 検索
      const search = document.createElement('input');
      search.className = 'circle-search';
      search.placeholder = '魔法陣を検索...';
      search.value = '';
      search.oninput = ()=>{
        const q = search.value.trim().toLowerCase();
        Array.from(sel.options).forEach(opt=>{
          opt.style.display = (!q || opt.value.toLowerCase().includes(q) || opt.value==='なし') ? '' : 'none';
        });
      };
      circleUI.appendChild(search);

      // 魔法陣プルダウン
      const sel = document.createElement('select');
      sel.className = 'circle-select';
      CIRCLE_NAMES.forEach(name=>{
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        if (partyCircles[i]===name) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.onchange = ()=>{ partyCircles[i]=sel.value; checkExclusives(); analyze(); };
      circleUI.appendChild(sel);

      // 凸数
      const rankRow = document.createElement('div');
      rankRow.className = 'circle-rank-row';
      const rankLabel = document.createElement('span');
      rankLabel.className = 'circle-rank-label';
      rankLabel.textContent = '凸:';
      const rankSel = document.createElement('select');
      rankSel.className = 'circle-rank';
      RANK_OPTIONS.forEach(r=>{
        const opt = document.createElement('option');
        opt.value = r; opt.textContent = r;
        if (partyRanks[i]===r) opt.selected = true;
        rankSel.appendChild(opt);
      });
      rankSel.onchange = ()=>{ partyRanks[i]=rankSel.value; analyze(); };
      rankRow.appendChild(rankLabel);
      rankRow.appendChild(rankSel);
      circleUI.appendChild(rankRow);

      wrap.appendChild(circleUI);
    }

    grid.appendChild(wrap);
  }
  checkExclusives();
}

function toggleChar(c) {
  if (party.includes(c)) { party[party.indexOf(c)]=null; }
  else { const e=party.indexOf(null); if(e===-1){alert('5体すでに選択中です。');return;} party[e]=c; }
  renderSlots(); renderCharPool(); analyze();
}
function removeFromSlot(i) { party[i]=null; partyCircles[i]='なし'; renderSlots(); renderCharPool(); analyze(); }
function clearParty() {
  party=[null,null,null,null,null]; partyCircles=['なし','なし','なし','なし','なし']; partyRanks=['2凸','2凸','2凸','2凸','2凸'];
  renderSlots(); renderCharPool();
  document.getElementById('analysis-area').innerHTML='<p class="empty-msg">キャラを選択すると分析結果が表示されます。</p>';
  document.getElementById('excl-warnings').innerHTML='';
  saveBuildToStorage();
}

// ---- 排他チェック ----
function checkExclusives() {
  const warns = [];
  const used = partyCircles.filter(n=>n!=='なし');
  Object.entries(EXCL_MAP).forEach(([a,b])=>{ if(used.includes(a)&&used.includes(b)&&!warns.some(w=>w.includes(a))) warns.push(`⚠ 「${a}」と「${b}」は同時に装備できません（排他）。`); });
  party.forEach((c,i)=>{ if(c&&c.id==='yue_plus'&&partyCircles[i]==='機巧魔法陣') warns.push('⚠ ユエ(覇者)に機巧魔法陣はあまりお勧めできません（URユエ専用）。'); });
  document.getElementById('excl-warnings').innerHTML = warns.map(w=>`<div class="excl-warn">${w}</div>`).join('');
}

// ---- 分析 ----
function analyze() {
  saveBuildToStorage();
  if (currentBoss) renderBossDetail();
  const filled = party.filter(Boolean);
  if (!filled.length) { document.getElementById('analysis-area').innerHTML='<p class="empty-msg">キャラを選択すると分析結果が表示されます。</p>'; return; }

  const frontChar = party[0];
  const roleCounts = {};
  ['atk','heal','buff','debuff','tank','cc','dot'].forEach(r=>{ roleCounts[r]=filled.filter(c=>c.roles.includes(r)).length; });
  const activeSyn = SYNERGIES.filter(s=>s.check(filled));

  const checks = [];

  // 前列チェック
  if (frontChar) {
    const sc = frontChar.pveScore;
    const cls = sc>=8?'ok':sc>=6?'warn':'bad';
    checks.push({cls, title:`${cls==='ok'?'✓':cls==='warn'?'△':'⚠'} 前列「${frontChar.name}」（適性${sc}/10）`, desc:frontChar.pveNote});
    const highInBack = party.slice(1).filter(c=>c&&c.pveScore>=8&&c.pveScore>sc+1);
    if (highInBack.length) checks.push({cls:'warn',title:'💡 前列入れ替え候補あり',desc:`${highInBack.map(c=>c.name).join('・')}はPVE前列適性が高いです。スロット1への移動を検討してください。`});
  } else { checks.push({cls:'warn',title:'⚠ 前列が空です',desc:'スロット1にキャラを配置してください。'}); }

  // ヴァンドゥル不死
  const hasVand = filled.some(c=>c.id==='vand');
  const hasAiko = filled.some(c=>c.id==='aiko');
  if (hasVand&&hasAiko) checks.push({cls:'ok',title:'✓ ヴァンドゥル不死が成立（★27以上必須）',desc:'畑山愛子が生存している限りヴァンドゥルは致死ダメでもHP1で生き残ります。前列配置で特に効果的です。'});
  else if (hasVand&&!hasAiko) checks.push({cls:'warn',title:'⚠ ヴァンドゥルの不死が未成立',desc:'畑山愛子（UR)がいないためヴァンドゥルの不死スキルが発動しません。前列に置く場合は注意してください。'});

  // 火力（PVEでは過多でも問題なし）
  const atkChars = filled.filter(c=>c.roles.includes('atk'));
  if (!atkChars.length) checks.push({cls:'bad',title:'⚠ 火力キャラ不在',desc:'PVEでは火力が最重要です。攻撃役を追加してください。'});
  else checks.push({cls:'ok',title:`✓ 火力 ${atkChars.length}人`,desc:`PVEでは火力過多でも問題ありません。${atkChars.map(c=>c.name).join('・')}が攻撃担当です。`});

  // バフ/デバフ
  const buffCount = roleCounts.buff + roleCounts.debuff;
  if (buffCount===0) checks.push({cls:'warn',title:'△ バフ/デバフなし',desc:'PVEではバフ・デバフが火力に直結します。ミレディ（全体ダメ+蓄積）やホセ（防御-44%）の追加を検討してください。'});
  else checks.push({cls:'ok',title:`✓ バフ${roleCounts.buff}人・デバフ${roleCounts.debuff}人`,desc:'補助が充実しています。'});

  // 魔法陣チェック（全魔法陣対応版）
  party.forEach((c,i)=>{
    if (!c) return;
    const circleName = partyCircles[i];
    const rank = partyRanks[i];
    if (circleName==='なし') return;
    const circleData = CIRCLES.find(cd=>cd.name===circleName);
    if (!circleData) return;
 
    // 凸数に応じた効果テキスト（未定義の凸があればpveDescにフォールバック）
    const effectText = (circleData.effects && circleData.effects[rank])
      ? circleData.effects[rank]
      : circleData.pveDesc;
 
    // このキャラにとっての推薦度（bestCirclesの中での位置）
    const bestList = c.bestCircles || [];
    const bestIndex = bestList.indexOf(circleName);
 
    // ハードルール①：機巧魔法陣はURユエ専用
    if (circleName==='機巧魔法陣' && c.id!=='yue') {
      checks.push({
        cls:'warn',
        title:`⚠ 機巧魔法陣を「${c.name}」が装備（${rank}）`,
        desc:`機巧魔法陣の【無詠唱魔法即時発動】はURユエ専用効果です。「${c.name}」が装備した場合、シールド獲得や行動制限無効などの効果（${effectText}）は発動しますが、スキル即時発動の恩恵は得られません。`
      });
    }
    // ハードルール②：終末魔法陣は装備者の生存が前提
    else if (circleName==='終末魔法陣' && c.id!=='aiko_plus' && c.id!=='aiko') {
      checks.push({
        cls:'warn',
        title:`△ 終末魔法陣を「${c.name}」が装備（${rank}）`,
        desc:`${effectText} 終末の陣は装備者が戦闘不能になると消滅します（10凸のみ2ターン後）。倒れにくいキャラ、特に畑山愛子（速度最遅運用）に持たせると雑魚〜ボスまで効果が永続しやすくなります。`
      });
    }
    // 第1推薦の魔法陣
    else if (bestIndex===0) {
      checks.push({
        cls:'ok',
        title:`✓ ${circleName}×${c.name}（${rank}）最推薦の組み合わせ`,
        desc:effectText
      });
    }
    // 候補にあがっている魔法陣（第1推薦ではないがbestCirclesに含まれる）
    else if (bestIndex>0) {
      checks.push({
        cls:'ok',
        title:`✓ ${circleName}×${c.name}（${rank}）相性良好な候補`,
        desc:effectText
      });
    }
    // 推薦リストに入っていない組み合わせ（効果自体は発動するので情報提示のみ）
    else {
      checks.push({
        cls:'warn',
        title:`△ ${circleName}を「${c.name}」が装備（${rank}）`,
        desc:`${effectText} このキャラの推薦魔法陣（${bestList.length?bestList.join('・'):'特になし。桜花魔法陣などの汎用枠が無難'}）からは外れていますが、上記の効果自体は通常通り発動します。`
      });
    }
  });


  // UR+覇気チェック
  const urpCount = filled.filter(c=>c.rarity==='ur+').length;
  if (urpCount>=2) checks.push({cls:'ok',title:`✓ UR+ ${urpCount}体（覇気重複）`,desc:`覇気（最終ダメ軽減+8%×2）が重複。`});

  // HTML生成
  const rLabels = {atk:'攻撃',heal:'回復',buff:'バフ',debuff:'デバフ',tank:'タンク',cc:'CC',dot:'DoT'};
  let html = '';
  html += `<div class="counter-grid">
    <div class="counter-box"><div class="counter-label">編成数</div><div class="counter-val ${filled.length===5?'green':'amber'}">${filled.length}/5</div></div>
    <div class="counter-box"><div class="counter-label">前列スコア</div><div class="counter-val ${frontChar?(frontChar.pveScore>=8?'green':frontChar.pveScore>=6?'amber':'red'):''}">${frontChar?frontChar.pveScore+'/10':'—'}</div></div>
    <div class="counter-box"><div class="counter-label">火力</div><div class="counter-val green">${roleCounts.atk}</div></div>
    <div class="counter-box"><div class="counter-label">バフ+デバフ</div><div class="counter-val ${buffCount>=2?'green':buffCount===0?'amber':''}">${buffCount}</div></div>
  </div>`;

  html += `<div style="margin-bottom:12px">`;
  filled.forEach((c,i)=>{
    const cn = partyCircles[i]!=='なし'?partyCircles[i]:null;
    const rk = partyRanks[i];
    html += `<div class="char-member-row">${i===0?'<span class="front-label">前列</span>':''}<strong>${c.name}</strong> `;
    c.roles.forEach(r=>{ html+=`<span class="role-badge role-${r}">${rLabels[r]||r}</span>`; });
    if (cn) html += `　<span style="font-size:.72rem;color:#2a6644">🔮${cn}（${rk}）</span>`;
    html += `</div>`;
  });
  html += `</div>`;

  html += `<div class="tab-btns" id="result-tabs">
    <button class="tab-btn active" onclick="switchResult('balance',this)">バランス</button>
    <button class="tab-btn" onclick="switchResult('synergy',this)">シナジー</button>
    <button class="tab-btn" onclick="switchResult('circle-rec',this)">魔法陣推薦</button>
  </div>`;

  // バランスタブ
  html += `<div id="tab-balance" class="tab-panel active">`;
  checks.forEach(c=>{ html+=`<div class="check-box ${c.cls}"><div class="check-title">${c.title}</div><div class="check-desc">${c.desc}</div></div>`; });
  html += `</div>`;

  // シナジータブ
  html += `<div id="tab-synergy" class="tab-panel">`;
  if (!activeSyn.length) html += `<p class="empty-msg">シナジーが検出されませんでした。同系統・ペアキャラを追加するとシナジーが発生します。</p>`;
  else activeSyn.forEach(s=>{ html+=`<div class="synergy-card"><div class="synergy-title">★ ${s.label}</div><div class="synergy-desc">${s.desc}</div></div>`; });
  html += `</div>`;

  // 魔法陣推薦タブ
  html += `<div id="tab-circle-rec" class="tab-panel">`;
  html += `<p style="font-size:.8rem;color:var(--muted);margin-bottom:10px">各キャラのスキルを踏まえた魔法陣推薦です。編成の方針に合わせて選んでください。</p>`;
  filled.forEach((c,i)=>{
    html += `<div class="rec-item${c.bestCircles&&c.bestCircles[0]?' best':''}">`;
    html += `<div class="rec-name">${i===0?'<span class="front-label">前列</span>':''}${c.name}</div>`;
    if (c.bestCircles&&c.bestCircles.length) {
      html += `<div class="rec-reason" style="margin-top:4px">`;
      c.bestCircles.forEach((bc,bi)=>{
        const cd = CIRCLES.find(x=>x.name===bc);
        const badge = bi===0?'<span style="background:var(--accent);color:#fff;font-size:.7rem;padding:1px 7px;border-radius:2px;margin-right:4px">第1推薦</span>':'<span style="background:#e8ecfd;color:#2a4099;font-size:.7rem;padding:1px 7px;border-radius:2px;margin-right:4px">候補</span>';
        html += `<div style="margin-bottom:5px">${badge}<strong>${bc}</strong>`;
        if (cd) html += ` <span style="font-size:.72rem;color:var(--muted)">${cd.pveDesc.substring(0,60)}...</span>`;
        html += `</div>`;
      });
      html += `</div>`;
    } else {
      html += `<div class="rec-reason">特定の推薦魔法陣はありません。<strong>桜花魔法陣</strong>が汎用的に有効です。</div>`;
    }
    html += `</div>`;
  });
  html += `</div>`;

  document.getElementById('analysis-area').innerHTML = html;
}

function switchResult(id, btn) {
  document.querySelectorAll('#analysis-area .tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('#result-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  btn.classList.add('active');
}

// ---- ボス対策 ----
// ---- 階層帯タブ ----
function renderBossTierTabs() {
  const el = document.getElementById('boss-tier-tabs');
  if (!el) return;
  el.innerHTML = FLOOR_TIERS.map(t=>
    `<button class="filter-btn${currentBossTier===t.id?' active':''}" onclick="setBossTier('${t.id}',this)">${t.label}</button>`
  ).join('');
}
 
function setBossTier(tierId, btn) {
  currentBossTier = tierId;
  document.querySelectorAll('#boss-tier-tabs .filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  currentBoss = null;
  document.getElementById('boss-detail').innerHTML = '<p class="empty-msg">ボスを選択すると対策が表示されます。</p>';
  renderBossGrid();
}
 
// ---- ボス選択グリッド（階層帯でフィルタ） ----
function renderBossGrid() {
  const grid = document.getElementById('boss-grid');
  grid.innerHTML = '';
  BOSSES.filter(b => !b.tiers || b.tiers.includes(currentBossTier)).forEach(b=>{
    const btn = document.createElement('button');
    btn.className = 'boss-btn';
    btn.textContent = b.icon+' '+b.name;
    btn.onclick = ()=>selectBoss(b,btn);
    grid.appendChild(btn);
  });
}
 
// ---- ボス選択 ----
function selectBoss(boss, btn) {
  document.querySelectorAll('.boss-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  currentBoss = boss;
  renderBossDetail();
}
 
// ---- ボス詳細（特徴チェックボックス＋適合判定＋既存の読み物） ----
function renderBossDetail() {
  const boss = currentBoss;
  if (!boss) return;
  const lib = BOSS_THREAT_LIBRARY[boss.id] || [];
 
  let html = `<div class="boss-card"><div class="boss-card-title">${boss.icon} ${boss.name}</div><div class="boss-card-body">`;
  html += `<strong>該当する特徴にチェックしてください</strong>`;
  html += `<div style="margin:8px 0">`;
  lib.forEach(item=>{
    const checked = bossThreatState[boss.id+'__'+item.id] ? 'checked' : '';
    html += `<label style="display:block;font-size:.85rem;margin-bottom:4px;cursor:pointer"><input type="checkbox" ${checked} onchange="toggleBossThreat('${boss.id}','${item.id}',this.checked)"> ${item.label}</label>`;
    html += buildResistSelectHtml(boss.id, item);
  });
  const unknownChecked = bossThreatState[boss.id+'__unknown'] ? 'checked' : '';
  html += `<label style="display:block;font-size:.85rem;margin-top:6px;color:var(--muted);cursor:pointer"><input type="checkbox" ${unknownChecked} onchange="toggleBossThreat('${boss.id}','unknown',this.checked)"> 不明（このボスの特徴がよく分からない）</label>`;
  html += `</div>`;
  html += `<strong>突破のポイント（一般情報）</strong><br>${boss.tip}</div></div>`;
 
  html += `<div class="section-header" style="margin-top:14px"><h2 class="section-title" style="font-size:1.1rem"><span>FIT</span>現在の編成との適合判定</h2></div>`;
  html += `<div id="boss-fit-result">${evaluateBossFit(boss)}</div>`;
 
  html += `<div class="section-header" style="margin-top:14px"><h2 class="section-title" style="font-size:1.1rem"><span>TEAM</span>推奨編成例</h2></div>`;
  boss.parties.forEach(p=>{
    html += `<div class="boss-party"><div class="boss-party-title">◆ ${p.title}</div><ol>`;
    p.members.forEach(m=>{ html+=`<li>${m}</li>`; });
    html += `</ol>`;
    if (p.note) { p.note.split('\n').forEach(n=>{ if(n) html+=`<div class="boss-note">${n}</div>`; }); }
    html += `</div>`;
  });
 
  document.getElementById('boss-detail').innerHTML = html;
}
 
// ---- チェックボックス変更時 ----
function toggleBossThreat(bossId, threatId, checked) {
  bossThreatState[bossId+'__'+threatId] = checked;
  const result = document.getElementById('boss-fit-result');
  if (result && currentBoss) result.innerHTML = evaluateBossFit(currentBoss);
}

// 耐性100%キャラの選択UIを生成（element指定がある項目にだけ表示される）
function buildResistSelectHtml(bossId, item) {
  if (!item.element) return '';
  const filled = party.filter(Boolean);
  if (!filled.length) {
    return `<div style="margin:0 0 6px 22px;font-size:.78rem;color:var(--muted)">※編成チェッカーでキャラを選択すると、ここで耐性100%キャラを選べるようになります。</div>`;
  }
 
  const stateKey = bossId + '__resist__' + item.id;
  let current = bossResistSelect[stateKey];
 
  if (current && current !== 'none' && !filled.some(c => c.id === current)) {
    current = undefined;
  }
  if (current === undefined) {
    const innate = RESIST_100[item.element] || [];
    const auto = filled.find(c => innate.includes(c.id));
    current = auto ? auto.id : 'none';
  }
  bossResistSelect[stateKey] = current;
 
  const elementLabel = { burn:'灼熱', poison:'毒', bleed:'出血' }[item.element] || item.element;
  let html = `<div style="margin:0 0 6px 22px;font-size:.78rem;color:var(--muted)">${elementLabel}耐性100%のキャラ（リロール・宝石で確保した場合も含む）：`;
  html += `<select onchange="setResistSelect('${bossId}','${item.id}',this.value)" style="font-size:.76rem;padding:1px 3px;border:1px solid var(--line-dark)">`;
  html += `<option value="none"${current === 'none' ? ' selected' : ''}>いない</option>`;
  filled.forEach(c => {
    const innateTag = (RESIST_100[item.element] || []).includes(c.id) ? '（標準で100%）' : '';
    html += `<option value="${c.id}"${current === c.id ? ' selected' : ''}>${c.name}${innateTag}</option>`;
  });
  html += `</select></div>`;
  return html;
}
 
// プルダウン変更時
function setResistSelect(bossId, itemId, value) {
  bossResistSelect[bossId + '__resist__' + itemId] = value;
  const result = document.getElementById('boss-fit-result');
  if (result && currentBoss) result.innerHTML = evaluateBossFit(currentBoss);
}
 
// ---- 適合判定本体 ----
function evaluateBossFit(boss) {
  const filled = party.filter(Boolean);
  const lib = BOSS_THREAT_LIBRARY[boss.id] || [];
  const unknown = !!bossThreatState[boss.id+'__unknown'];
  const tierNote = (currentBossTier==='10000plus') ? TIER_NOTES['10000plus'] : null;
 
  let html = '';
  if (tierNote) {
    html += `<div class="check-box warn"><div class="check-title">⚠ ${tierNote.title}</div><div class="check-desc">${tierNote.desc}</div></div>`;
  }
 
  if (!filled.length) {
    html += `<div class="check-box"><div class="check-title">編成チェッカーでキャラを選択してください</div><div class="check-desc">「🗡 編成チェッカー」タブでキャラを選ぶと、ここでボスとの適合判定が表示されます。</div></div>`;
    return html;
  }
 
  if (unknown) {
    const frontChar = party[0];
    html += `<div class="check-box"><div class="check-title">？ 特徴不明として判定</div><div class="check-desc">特徴が分からない場合は、毒・灼熱・出血への耐性と高い火力を兼ね備えた汎用編成（ヴァンドゥル＋畑山愛子の不死コンビ、オスカー等の高火力アタッカー）で安定して挑むのが無難です。${frontChar?`現在の前列「${frontChar.name}」は前列適性${frontChar.pveScore}/10です。`:''}</div></div>`;
    return html;
  }
 
  const checkedItems = lib.filter(t=>bossThreatState[boss.id+'__'+t.id]);
  if (!checkedItems.length) {
    html += `<p class="empty-msg">該当する特徴にチェックを入れると、現在の編成との適合判定が表示されます。</p>`;
    return html;
  }
 
  checkedItems.forEach(item=>{
    if (item.element) {
      const stateKey = boss.id+'__resist__'+item.id;
      const selected = bossResistSelect[stateKey] || 'none';
      const elementLabel = {burn:'灼熱',poison:'毒',bleed:'出血'}[item.element] || item.element;
      if (selected !== 'none') {
        const rc = CHARS.find(x=>x.id===selected);
        html += `<div class="check-box ok"><div class="check-title">✓ 「${item.label}」への対策あり</div><div class="check-desc">${rc?rc.name:selected}が${elementLabel}耐性100%でこの脅威に対応できます。</div></div>`;
      } else {
        const innateNames = (RESIST_100[item.element]||[]).map(id=>CHARS.find(c=>c.id===id)).filter(Boolean).map(c=>c.name).join('・');
        html += `<div class="check-box warn"><div class="check-title">△ 「${item.label}」への${elementLabel}耐性100%キャラが編成内にいません</div><div class="check-desc">${item.need} リロール・宝石でいずれかのキャラに${elementLabel}耐性100%を確保するか、${innateNames?innateNames+'のように標準で100%になるキャラを編成すると楽です。':'対応できるキャラを編成してください。'}</div></div>`;
      }
      return;
    }
    const counterChars = (item.counters||[]).map(id=>CHARS.find(c=>c.id===id)).filter(Boolean);
    const present = counterChars.filter(c=>filled.includes(c));
    if (present.length) {
      html += `<div class="check-box ok"><div class="check-title">✓ 「${item.label}」への対策あり</div><div class="check-desc">${present.map(c=>c.name).join('・')}が編成にいます。${item.need}</div></div>`;
    } else if (counterChars.length) {
      html += `<div class="check-box warn"><div class="check-title">△ 「${item.label}」への対策が編成内に見当たりません</div><div class="check-desc">${item.need} 候補：${counterChars.map(c=>c.name).join('・')}</div></div>`;
    } else {
      html += `<div class="check-box"><div class="check-title">・「${item.label}」について</div><div class="check-desc">${item.need}</div></div>`;
    }
  });
 
  return html;
}

// ---- 魔法陣一覧 ----
function renderCircleList() {
  const q = (document.getElementById('circle-search')||{value:''}).value.trim().toLowerCase();
  const el = document.getElementById('circle-list');
  el.innerHTML = '';
  CIRCLES.filter(c=>c.name!=='なし').filter(c=>!q||c.name.toLowerCase().includes(q)||c.pveDesc.toLowerCase().includes(q)).forEach(data=>{
    const rankClass = data.pveRank>=9?'s-rank':data.pveRank>=7?'a-rank':'b-rank';
    const rankBadge = data.pveRank>=9?'S':'A';
    const exclHtml = data.excl&&data.excl.length?`<div class="circle-excl">⚠ 排他：${data.excl.join('・')}</div>`:'';
    const bestHtml = data.bestFor&&data.bestFor.length?`<div class="circle-best">相性◎：${data.bestFor.map(id=>CHARS.find(c=>c.id===id)?.name||id).join('・')}</div>`:'';
    let effectHtml = '';
    if (data.effects) {
      effectHtml = `<table class="circle-effect-table">`;
      Object.entries(data.effects).forEach(([rank,eff])=>{ effectHtml+=`<tr><td>${rank}</td><td>${eff}</td></tr>`; });
      effectHtml += `</table>`;
    }
    el.innerHTML += `<div class="circle-card ${rankClass}">
      <div class="circle-name">${data.name}<span class="circle-rank-badge ${rankClass==='s-rank'?'s-badge':rankClass==='a-rank'?'a-badge':'b-badge'}">PVE ${data.pveRank>=9?'S（最強）':data.pveRank>=7?'A（強い）':'B（状況次第）'}</span></div>
      ${exclHtml}
      <div class="circle-desc">${data.pveDesc}</div>
      ${bestHtml}
      ${effectHtml}
    </div>`;
  });
}

// ---- ステータス ----
function renderStatTable() {
  const tbody = document.getElementById('stat-tbody');
  tbody.innerHTML = '';
  STATS.forEach(([name,desc])=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><strong>${name}</strong></td><td>${desc}</td>`;
    tbody.appendChild(tr);
  });
}

init();
