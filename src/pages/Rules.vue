<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search } from '@lucide/vue'
import PageHero from '@/components/PageHero.vue'

const query = ref('')

type RuleArticle = {
  category: string
  title: string
  body: string[]
  items?: string[]
}

const rules = [
  {
    category: '第1条',
    title: '目的',
    body: ['本大会は、参加者同士がMinecraft内で探索・建築・戦闘・外交・略奪を行い、期間終了時点で最も多くのポイントを獲得したプレイヤーまたはチームを決定することを目的とします。'],
  },
  {
    category: '第2条',
    title: '大会期間',
    body: ['大会は7日間・24時間連続で開催されます。', '大会開始および終了時刻は運営が別途定めます。'],
  },
  {
    category: '第3条',
    title: 'PvP',
    body: ['PvP解禁前に他プレイヤーへ攻撃する行為を禁止します。', 'PvP解禁後は、プレイヤーへの攻撃・キルを自由に行うことができます。', '運営が指定した保護期間・保護エリアではPvPは禁止です。'],
  },
  {
    category: '第4条',
    title: '略奪・拠点襲撃',
    body: ['プレイヤーが所有するチェスト・設備・建築物への略奪を認めます。', '拠点への侵入・襲撃・資源の持ち出しを認めます。', 'バグや不具合を利用した侵入は禁止します。'],
  },
  {
    category: '第5条',
    title: '同盟・外交',
    body: ['チームの結成・解散は自由です。', '他チームとの同盟・不可侵条約・取引・交渉を認めます。', '裏切り行為もゲームの戦略として認めます。'],
  },
  {
    category: '第6条',
    title: '戦闘中のログアウト',
    body: ['戦闘中の意図的なログアウト（Combat Logout）を禁止します。', '違反した場合は死亡・ポイント減点・失格などの処分を行う場合があります。', '通信切断など、やむを得ない事情については運営が個別に判断します。'],
  },
  {
    category: '第7条',
    title: 'ワールドボーダー',
    body: ['大会期間中、World Borderは段階的に縮小します。', 'ボーダー外にログアウトしていたプレイヤーは、ログイン時に安全な位置へ自動転送されます。', 'ボーダー外へ意図的に退避する行為は禁止です。'],
  },
  {
    category: '第8条',
    title: 'イベント',
    body: ['大会期間中は、補給物資・ボス・特殊イベントなどがランダムに開催されます。', 'イベント内容は運営の判断により変更される場合があります。'],
  },
  {
    category: '第9条',
    title: 'ランキング',
    body: ['ランキングはリアルタイムで更新されます。', '大会終盤は順位またはポイントを非公開とする場合があります。', '最終結果は大会終了時点の記録をもって確定します。'],
  },
  {
    category: '第10条',
    title: '配信・録画',
    body: ['配信・録画・動画投稿は自由です。', 'ゴースティング防止のため、配信ディレイを推奨します。', '運営は大会の様子を録画・配信・公開できるものとします。'],
  },
  {
    category: '第11条',
    title: '禁止事項',
    body: ['参加者は以下の行為を行ってはなりません。'],
    items: ['チート・ハッククライアントの使用', 'X-Ray・透視機能の使用', 'マクロ・自動操作・クリック連打ツールの使用', 'バグ・不具合の悪用', 'DDoS・サーバーへの妨害行為', '運営の指示に従わない行為', '大会運営を妨害する行為', 'その他、運営が不適切と判断した行為'],
  },
  {
    category: '第12条',
    title: '運営権限',
    body: ['運営は大会の公平性を維持するため、必要に応じて以下を行うことができます。'],
    items: ['プレイヤーの調査', 'ログの確認', 'ポイントの修正', '警告・一時停止・失格処分', 'イベント内容の変更', '不具合発生時のロールバック等'],
  },
  {
    category: '第13条',
    title: '免責事項',
    body: ['サーバー障害・通信障害・Minecraft本体またはプラグインの不具合などにより発生した損害について、運営は可能な限り対応しますが、その結果を保証するものではありません。'],
  },
  {
    category: '第14条',
    title: '規約の変更',
    body: ['運営は必要に応じて本規約を変更できるものとします。', '変更内容は公式Discordまたは大会サイトにて告知された時点で効力を生じます。'],
  },
] satisfies RuleArticle[]

const filtered = computed(() => {
  const text = query.value.toLowerCase()
  return rules.filter((rule) => [rule.category, rule.title, ...rule.body, ...(rule.items ?? [])].join(' ').toLowerCase().includes(text))
})
</script>

<template>
  <PageHero eyebrow="Rules / Official" title="奈落鯖サバイバルカップ Summer 2026 大会規約" description="探索、建築、戦闘、外交、略奪を楽しむための公式ルール。参加前に必ず確認してください。" />
  <section class="section-shell pb-24">
    <label class="glass mb-6 flex min-h-14 items-center gap-3 rounded-2xl px-5 text-slate-300">
      <Search :size="20" />
      <input v-model="query" class="w-full bg-transparent outline-none" placeholder="PvP / 略奪 / 配信 / 禁止事項..." />
    </label>
    <div class="grid gap-4">
      <details v-for="rule in filtered" :key="rule.title" class="glass rounded-3xl p-5 open:shadow-neon">
        <summary class="cursor-pointer list-none">
          <span class="mr-3 rounded-full bg-cyan-300/15 px-3 py-1 text-xs font-black text-cyan-100">{{ rule.category }}</span>
          <span class="text-lg font-black">{{ rule.title }}</span>
        </summary>
        <div class="mt-4 grid gap-3 leading-8 text-slate-300">
          <p v-for="paragraph in rule.body" :key="paragraph">{{ paragraph }}</p>
          <ul v-if="rule.items" class="grid gap-2 pl-5">
            <li v-for="item in rule.items" :key="item" class="list-disc">{{ item }}</li>
          </ul>
        </div>
      </details>
    </div>
  </section>
</template>
