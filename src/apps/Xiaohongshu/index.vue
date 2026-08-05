<template>
  <div class="xhs-generator">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <a-space>
        <a-button type="primary" @click="addDrama">
          <template #icon><PlusOutlined /></template>
          添加剧集
        </a-button>
        <a-button @click="loadPreset">加载预设</a-button>
        <a-button @click="clearAll">清空</a-button>
      </a-space>
      <a-space>
        <a-select v-model:value="cardStyle" style="width: 120px">
          <a-select-option value="ranking">排行榜风格</a-select-option>
          <a-select-option value="recommend">推荐风格</a-select-option>
          <a-select-option value="contrast">对比风格</a-select-option>
        </a-select>
        <a-button type="primary" ghost @click="copyAll">复制全部文案</a-button>
      </a-space>
    </div>

    <div class="main-content">
      <!-- 左侧：编辑区 -->
      <div class="editor-panel">
        <div class="panel-header">
          <h3>📝 编辑内容</h3>
        </div>

        <!-- 封面设置 -->
        <div class="section">
          <div class="section-title">封面设置</div>
          <a-form layout="vertical" size="small">
            <a-form-item label="主标题">
              <a-input v-model:value="coverTitle" placeholder="2026上半年古装剧红黑榜" />
            </a-form-item>
            <a-form-item label="副标题">
              <a-input v-model:value="coverSubtitle" placeholder="第1名没人反对吧？" />
            </a-form-item>
          </a-form>
        </div>

        <!-- 剧集列表 -->
        <div class="section">
          <div class="section-title">剧集列表</div>
          <div class="drama-list">
            <div v-for="(drama, index) in dramas" :key="index" class="drama-item">
              <div class="drama-rank">{{ index + 1 }}</div>
              <div class="drama-fields">
                <a-input
                  v-model:value="drama.title"
                  placeholder="剧名"
                  size="small"
                />
                <a-input
                  v-model:value="drama.desc"
                  placeholder="一句话推荐/评价"
                  size="small"
                />
              </div>
              <div class="drama-actions">
                <a-button type="text" size="small" @click="moveUp(index)" :disabled="index === 0">
                  <template #icon><UpOutlined /></template>
                </a-button>
                <a-button type="text" size="small" @click="moveDown(index)" :disabled="index === dramas.length - 1">
                  <template #icon><DownOutlined /></template>
                </a-button>
                <a-button type="text" size="small" danger @click="removeDrama(index)">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 正文设置 -->
        <div class="section">
          <div class="section-title">正文开头</div>
          <a-textarea
            v-model:value="introText"
            :rows="3"
            placeholder="2026上半年古装剧大战结束，有人封神，有人翻车。&#10;我直接说结论👇"
          />
        </div>

        <!-- 标签设置 -->
        <div class="section">
          <div class="section-title">标签</div>
          <a-input
            v-model:value="tags"
            placeholder="#2026古装剧 #古装剧推荐 #热播剧 #剧评"
          />
        </div>
      </div>

      <!-- 右侧：预览区 -->
      <div class="preview-panel">
        <div class="panel-header">
          <h3>👁️ 预览效果</h3>
        </div>

        <!-- 封面预览 -->
        <div class="preview-section">
          <div class="preview-label">封面图</div>
          <div class="card-preview cover-preview" :class="cardStyle">
            <div class="cover-content">
              <div class="cover-title">{{ coverTitle || '2026上半年古装剧红黑榜' }}</div>
              <div class="cover-subtitle">{{ coverSubtitle || '第1名没人反对吧？' }}</div>
            </div>
          </div>
        </div>

        <!-- 内容卡片预览 -->
        <div class="preview-section">
          <div class="preview-label">内容卡片</div>
          <div class="cards-container">
            <div
              v-for="(drama, index) in dramas"
              :key="index"
              class="card-preview drama-card"
              :class="cardStyle"
            >
              <div class="card-rank">{{ getRankEmoji(index) }}</div>
              <div class="card-title">《{{ drama.title || '剧名' }}》</div>
              <div class="card-desc">{{ drama.desc || '一句话描述' }}</div>
            </div>
          </div>
        </div>

        <!-- 完整文案预览 -->
        <div class="preview-section">
          <div class="preview-label">完整文案</div>
          <div class="text-preview">
            <pre>{{ generatedText }}</pre>
          </div>
          <a-button type="primary" block @click="copyText" style="margin-top: 12px">
            <template #icon><CopyOutlined /></template>
            复制文案到剪贴板
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  UpOutlined,
  DownOutlined,
  DeleteOutlined,
  CopyOutlined
} from '@ant-design/icons-vue'

interface Drama {
  title: string
  desc: string
}

const coverTitle = ref('2026上半年古装剧红黑榜')
const coverSubtitle = ref('第1名没人反对吧？')
const cardStyle = ref<'ranking' | 'recommend' | 'contrast'>('ranking')
const introText = ref('2026上半年古装剧大战结束，有人封神，有人翻车。\n我直接说结论👇')
const tags = ref('#2026古装剧 #古装剧推荐 #热播剧 #剧评 #白鹿 #冯绍峰 #灵魂摆渡')

const dramas = ref<Drama[]>([
  { title: '莫离', desc: '白鹿这次终于选对剧本了。权谋线不降智，女主不圣母，4集登顶飙升榜不是没原因的。' },
  { title: '大唐迷雾', desc: '冯绍峰的狄仁杰不算惊艳，但胜在"稳"。25集不注水，每个案件都讲清楚了。' },
  { title: '灵魂摆渡·十年', desc: '等了十年，DNA动了。赛博冥界的设定很敢，但情怀分占了一半。' },
  { title: '唐宫奇案', desc: '热度破万，但口碑两极分化。唐风美学绝了，推理逻辑拉了。' },
  { title: '成何体统', desc: '穿书喜剧，反套路出圈。全员人设在线，笑点密集，最适合下饭。' },
])

function getRankEmoji(index: number): string {
  const emojis = ['🏆', '🥈', '🥉', '📌', '📌', '📌', '📌', '📌', '📌', '📌']
  return emojis[index] || '📌'
}

function addDrama() {
  dramas.value.push({ title: '', desc: '' })
}

function removeDrama(index: number) {
  dramas.value.splice(index, 1)
}

function moveUp(index: number) {
  if (index > 0) {
    const temp = dramas.value[index]
    dramas.value[index] = dramas.value[index - 1]
    dramas.value[index - 1] = temp
  }
}

function moveDown(index: number) {
  if (index < dramas.value.length - 1) {
    const temp = dramas.value[index]
    dramas.value[index] = dramas.value[index + 1]
    dramas.value[index + 1] = temp
  }
}

function clearAll() {
  dramas.value = []
  coverTitle.value = ''
  coverSubtitle.value = ''
  introText.value = ''
  tags.value = ''
}

function loadPreset() {
  coverTitle.value = '2026上半年古装剧红黑榜'
  coverSubtitle.value = '第1名没人反对吧？'
  introText.value = '2026上半年古装剧大战结束，有人封神，有人翻车。\n我直接说结论👇'
  tags.value = '#2026古装剧 #古装剧推荐 #热播剧 #剧评 #白鹿 #冯绍峰 #灵魂摆渡'
  dramas.value = [
    { title: '莫离', desc: '白鹿这次终于选对剧本了。权谋线不降智，女主不圣母，4集登顶飙升榜不是没原因的。' },
    { title: '大唐迷雾', desc: '冯绍峰的狄仁杰不算惊艳，但胜在"稳"。25集不注水，每个案件都讲清楚了。' },
    { title: '灵魂摆渡·十年', desc: '等了十年，DNA动了。赛博冥界的设定很敢，但情怀分占了一半。' },
    { title: '唐宫奇案', desc: '热度破万，但口碑两极分化。唐风美学绝了，推理逻辑拉了。' },
    { title: '成何体统', desc: '穿书喜剧，反套路出圈。全员人设在线，笑点密集，最适合下饭。' },
    { title: '低智商犯罪', desc: '豆瓣8.0，但热度不高。紫金陈这次玩黑色幽默，被严重低估。' },
    { title: '黑夜告白', desc: '社会派悬疑，双时空叙事。逻辑严谨，氛围压抑，适合硬核悬疑粉。' },
    { title: '逐玉', desc: '市井逆袭爽剧，设定新颖，播放量一路走高。但后期有点拖。' },
    { title: '佳偶天成', desc: '先婚后爱甜宠，周也+王星越CP感拉满。下饭神器，但别带脑子看。' },
    { title: '炽夏', desc: '豆瓣5.1，编剧和演员被骂上热搜。唯一的优点是：让我知道了什么是"烂剧天花板"。' },
  ]
}

const generatedText = computed(() => {
  let text = introText.value + '\n\n'
  dramas.value.forEach((drama, index) => {
    text += `${getRankEmoji(index)} 第${index + 1}名：《${drama.title}》\n${drama.desc}\n\n`
  })
  text += '---\n\n你今年追了哪几部？第1名你同意吗？👇\n\n'
  text += tags.value
  return text
})

async function copyText() {
  try {
    await navigator.clipboard.writeText(generatedText.value)
    message.success('文案已复制到剪贴板')
  } catch {
    message.error('复制失败，请手动复制')
  }
}

async function copyAll() {
  await copyText()
}
</script>

<style scoped>
.xhs-generator {
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--gray-200);
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  flex: 1;
  overflow: hidden;
}

@media (max-width: 960px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

.editor-panel,
.preview-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  margin-bottom: 16px;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.drama-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.drama-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: var(--gray-50, #f9fafb);
  border-radius: var(--radius-sm);
}

.drama-rank {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.drama-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drama-actions {
  display: flex;
  gap: 2px;
}

/* 卡片预览样式 */
.preview-section {
  margin-bottom: 24px;
}

.preview-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.card-preview {
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: transform 0.2s;
}

.card-preview:hover {
  transform: scale(1.02);
}

/* 封面预览 */
.cover-preview {
  aspect-ratio: 3/4;
  max-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

.cover-preview.ranking {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.cover-preview.recommend {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}

.cover-preview.contrast {
  background: linear-gradient(135deg, #0891b2, #0e7490);
}

.cover-content {
  color: white;
}

.cover-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.3;
}

.cover-subtitle {
  font-size: 16px;
  opacity: 0.9;
}

/* 剧集卡片预览 */
.drama-card {
  padding: 16px;
  text-align: center;
}

.drama-card.ranking {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fecaca;
}

.drama-card.recommend {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border: 1px solid #c7d2fe;
}

.drama-card.contrast {
  background: linear-gradient(135deg, #ecfeff, #cffafe);
  border: 1px solid #a5f3fc;
}

.card-rank {
  font-size: 32px;
  margin-bottom: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 文案预览 */
.text-preview {
  background: var(--gray-50, #f9fafb);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm);
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.text-preview pre {
  margin: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 滚动条美化 */
.drama-list::-webkit-scrollbar,
.text-preview::-webkit-scrollbar {
  width: 6px;
}

.drama-list::-webkit-scrollbar-track,
.text-preview::-webkit-scrollbar-track {
  background: transparent;
}

.drama-list::-webkit-scrollbar-thumb,
.text-preview::-webkit-scrollbar-thumb {
  background: var(--gray-300, #d1d5db);
  border-radius: 3px;
}
</style>
