<template>
  <div class="text-to-image-app">
    <a-row :gutter="12">
      <!-- 左侧：提示词输入和配置 -->
      <a-col :xs="24" :sm="24" :md="8" :lg="7">
        <a-card class="panel-card" title="生成设置">
          <a-form layout="vertical">
            <a-form-item label="提示词 (Prompt)">
              <a-textarea
                v-model:value="prompt"
                :rows="4"
                placeholder="描述你想生成的图片，例如：一只可爱的橘猫坐在窗台上，阳光洒进来，水彩画风格"
                :maxlength="1000"
                show-count
              />
            </a-form-item>

            <a-form-item label="负面提示词 (可选)">
              <a-textarea
                v-model:value="negativePrompt"
                :rows="2"
                placeholder="不希望出现的元素，例如：模糊，低质量"
              />
            </a-form-item>

            <a-form-item label="图片尺寸">
              <a-select v-model:value="imageSize" style="width: 100%">
                <a-select-option value="1024x1024">1024×1024 (正方形)</a-select-option>
                <a-select-option value="1792x1024">1792×1024 (横版)</a-select-option>
                <a-select-option value="1024x1792">1024×1792 (竖版)</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="图片风格">
              <a-select v-model:value="style" style="width: 100%">
                <a-select-option value="vivid">鲜艳 (Vivid)</a-select-option>
                <a-select-option value="natural">自然 (Natural)</a-select-option>
              </a-select>
            </a-form-item>

            <a-alert
              type="warning"
              show-icon
              style="margin-bottom: 16px"
            >
              <template #message>AI 生成功能即将上线</template>
              <template #description>当前请先编辑提示词并复制到任意 AI 绘图工具（如即梦、Midjourney、DALL·E）使用。</template>
            </a-alert>

            <a-button
              type="primary"
              block
              size="large"
              disabled
            >
              <ThunderboltOutlined /> AI 生成（即将上线）
            </a-button>
          </a-form>
        </a-card>
      </a-col>

      <!-- 右侧：生成结果和提示词技巧 -->
      <a-col :xs="24" :sm="24" :md="16" :lg="17">
        <!-- 提示词预览 -->
        <a-card class="result-card" title="提示词预览">
          <div v-if="prompt" class="result-container">
            <div class="prompt-preview">
              <p>{{ prompt }}</p>
              <p v-if="negativePrompt" class="negative-preview">
                <strong>负面提示词：</strong>{{ negativePrompt }}
              </p>
            </div>
            <div class="result-actions">
              <a-button type="primary" @click="copyPrompt">
                <CopyOutlined /> 复制提示词
              </a-button>
              <a-button @click="clearPrompt">
                <ClearOutlined /> 清空
              </a-button>
            </div>
          </div>
          <div v-else class="empty-result">
            <a-empty description="输入提示词后，复制到 AI 绘图工具使用" />
          </div>
        </a-card>

        <!-- 提示词技巧 -->
        <a-card class="tips-card" title="文生图技巧" style="margin-top: 12px;">
          <a-collapse v-model:activeKey="activeTipPanels">
            <!-- 基础技巧 -->
            <a-collapse-panel key="basics" header="基础技巧">
              <div class="tip-section">
                <h4>提示词基本结构</h4>
                <div class="prompt-template">
                  [主体] + [场景/环境] + [风格] + [光线] + [构图] + [画质]
                </div>
                <p><strong>示例</strong>：一位穿着汉服的少女站在樱花树下，水彩画风格，柔和的自然光，特写镜头，8K高清</p>
              </div>
              <div class="tip-section">
                <h4>核心要素详解</h4>
                <a-table :columns="elementsColumns" :data="elementsData" :pagination="false" size="small" />
              </div>
            </a-collapse-panel>

            <!-- 小说封面风格 -->
            <a-collapse-panel key="novel" header="小说封面风格">
              <div class="tip-section">
                <h4>古风仙侠</h4>
                <a-tag color="blue" class="copy-tag" @click="useExample('一位白衣仙人立于云端之上，手持长剑，身后是万丈瀑布和苍翠群山，中国水墨画风格，仙气缭绕，史诗级构图，8K高清')">点击使用</a-tag>
                <p>一位白衣仙人立于云端之上，手持长剑，身后是万丈瀑布和苍翠群山，中国水墨画风格，仙气缭绕，史诗级构图，8K高清</p>
              </div>
              <div class="tip-section">
                <h4>都市言情</h4>
                <a-tag color="blue" class="copy-tag" @click="useExample('城市夜景下的咖啡馆窗边，一对男女相对而坐，暖黄色灯光，浪漫氛围，电影感构图，浅景深，唯美风格')">点击使用</a-tag>
                <p>城市夜景下的咖啡馆窗边，一对男女相对而坐，暖黄色灯光，浪漫氛围，电影感构图，浅景深，唯美风格</p>
              </div>
              <div class="tip-section">
                <h4>悬疑惊悚</h4>
                <a-tag color="blue" class="copy-tag" @click="useExample('雨夜的空荡街道，昏暗路灯下只有一个孤独的背影，黑色电影风格，高对比度，神秘氛围，冷色调')">点击使用</a-tag>
                <p>雨夜的空荡街道，昏暗路灯下只有一个孤独的背影，黑色电影风格，高对比度，神秘氛围，冷色调</p>
              </div>
              <div class="tip-section">
                <h4>玄幻奇幻</h4>
                <a-tag color="blue" class="copy-tag" @click="useExample('巨大的魔法阵悬浮在空中，周围环绕着发光的符文，一位法师正在施法，奇幻风格，绚丽的色彩，史诗级场景')">点击使用</a-tag>
                <p>巨大的魔法阵悬浮在空中，周围环绕着发光的符文，一位法师正在施法，奇幻风格，绚丽的色彩，史诗级场景</p>
              </div>
            </a-collapse-panel>

            <!-- 广告图片风格 -->
            <a-collapse-panel key="ads" header="广告图片风格">
              <div class="tip-section">
                <h4>产品广告</h4>
                <a-tag color="blue" class="copy-tag" @click="useExample('精致的香水瓶放置在大理石台面上，周围散落着玫瑰花瓣，柔和的侧光，高端奢侈品广告风格，简约优雅，8K高清')">点击使用</a-tag>
                <p>精致的香水瓶放置在大理石台面上，周围散落着玫瑰花瓣，柔和的侧光，高端奢侈品广告风格，简约优雅，8K高清</p>
              </div>
              <div class="tip-section">
                <h4>美食广告</h4>
                <a-tag color="blue" class="copy-tag" @click="useExample('新鲜出炉的披萨，融化的芝士拉丝，热气腾腾，俯拍角度，暖色调，商业美食摄影风格，细节丰富')">点击使用</a-tag>
                <p>新鲜出炉的披萨，融化的芝士拉丝，热气腾腾，俯拍角度，暖色调，商业美食摄影风格，细节丰富</p>
              </div>
              <div class="tip-section">
                <h4>科技产品</h4>
                <a-tag color="blue" class="copy-tag" @click="useExample('无线耳机悬浮在空中，周围环绕着蓝色光晕和数据流，未来科技感，黑色背景，产品广告风格，精致细节')">点击使用</a-tag>
                <p>无线耳机悬浮在空中，周围环绕着蓝色光晕和数据流，未来科技感，黑色背景，产品广告风格，精致细节</p>
              </div>
              <div class="tip-section">
                <h4>电商Banner</h4>
                <a-tag color="blue" class="copy-tag" @click="useExample('夏日清凉主题，冰镇饮料和新鲜水果，明亮的色彩，活力四射，扁平化设计风格，促销氛围')">点击使用</a-tag>
                <p>夏日清凉主题，冰镇饮料和新鲜水果，明亮的色彩，活力四射，扁平化设计风格，促销氛围</p>
              </div>
            </a-collapse-panel>

            <!-- 插画风格 -->
            <a-collapse-panel key="illustration" header="插画风格">
              <div class="tip-section">
                <h4>儿童绘本</h4>
                <a-tag color="blue" class="copy-tag" @click="useExample('可爱的小兔子在森林里采摘蘑菇，温暖的阳光透过树叶，童话插画风格，柔和的色彩，温馨治愈')">点击使用</a-tag>
                <p>可爱的小兔子在森林里采摘蘑菇，温暖的阳光透过树叶，童话插画风格，柔和的色彩，温馨治愈</p>
              </div>
              <div class="tip-section">
                <h4>二次元动漫</h4>
                <a-tag color="blue" class="copy-tag" @click="useExample('穿着校服的少女站在天台上，微风吹动她的长发，夕阳背景，日系动漫风格，精致的细节，青春气息')">点击使用</a-tag>
                <p>穿着校服的少女站在天台上，微风吹动她的长发，夕阳背景，日系动漫风格，精致的细节，青春气息</p>
              </div>
              <div class="tip-section">
                <h4>像素风</h4>
                <a-tag color="blue" class="copy-tag" @click="useExample('像素风格的中世纪城堡，周围有小人物在活动，复古游戏风格，16位色彩')">点击使用</a-tag>
                <p>像素风格的中世纪城堡，周围有小人物在活动，复古游戏风格，16位色彩</p>
              </div>
            </a-collapse-panel>

            <!-- 进阶技巧 -->
            <a-collapse-panel key="advanced" header="进阶技巧">
              <div class="tip-section">
                <h4>负面提示词</h4>
                <p><strong>通用</strong>：模糊，低质量，变形，丑陋，畸形，多余的手指，画质差，水印，文字</p>
                <p><strong>人物类</strong>：变形的脸，不对称的眼睛，多余的手臂，畸形的手指</p>
              </div>
              <div class="tip-section">
                <h4>权重控制</h4>
                <p>用 <code>(关键词:1.5)</code> 增加权重，<code>[关键词]</code> 降低权重</p>
                <p>示例：<code>(精细的面部细节:1.3)</code>，<code>[简单的背景]</code></p>
              </div>
              <div class="tip-section">
                <h4>常见问题解决</h4>
                <a-table :columns="problemColumns" :data="problemData" :pagination="false" size="small" />
              </div>
            </a-collapse-panel>

            <!-- 实用模板 -->
            <a-collapse-panel key="templates" header="实用模板">
              <div class="tip-section">
                <h4>人物类</h4>
                <div class="prompt-template">[人物描述] + [服装] + [姿势] + [场景] + [光线] + [风格] + [画质]</div>
              </div>
              <div class="tip-section">
                <h4>场景类</h4>
                <div class="prompt-template">[地点] + [时间/天气] + [氛围] + [风格] + [构图] + [画质]</div>
              </div>
              <div class="tip-section">
                <h4>产品类</h4>
                <div class="prompt-template">[产品] + [摆放] + [背景] + [光线] + [风格] + [画质]</div>
              </div>
            </a-collapse-panel>

            <!-- 优秀示例 -->
            <a-collapse-panel key="examples" header="优秀示例">
              <div class="examples-header">
                <a-button type="primary" size="small" @click="showAddExampleModal = true">
                  <PlusOutlined /> 添加示例
                </a-button>
              </div>
              <div class="examples-grid">
                <div v-for="(example, index) in exampleImages" :key="index" class="example-card">
                  <div class="example-image">
                    <img :src="example.image" :alt="example.title" />
                    <a-tag class="delete-tag" color="red" @click="deleteExample(index)">
                      删除
                    </a-tag>
                  </div>
                  <div class="example-info">
                    <h5>{{ example.title }}</h5>
                    <p class="example-prompt">{{ example.prompt }}</p>
                    <a-tag color="blue" class="use-prompt-btn" @click="useExample(example.prompt)">
                      使用此提示词
                    </a-tag>
                  </div>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </a-card>
      </a-col>
    </a-row>

    <!-- 添加示例弹窗 -->
    <a-modal
      v-model:open="showAddExampleModal"
      title="添加示例"
      @ok="addExample"
      @cancel="resetAddForm"
      width="600px"
    >
      <a-form layout="vertical">
        <a-form-item label="示例标题" required>
          <a-input v-model:value="newExample.title" placeholder="例如：古风仙境" />
        </a-form-item>
        <a-form-item label="图片" required>
          <div class="image-upload-area">
            <input
              ref="imageInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onImageSelect"
            />
            <div v-if="newExample.imagePreview" class="image-preview">
              <img :src="newExample.imagePreview" alt="预览" />
              <a-button size="small" @click="clearImage">重新选择</a-button>
            </div>
            <div v-else class="upload-placeholder" @click="triggerImageUpload">
              <PictureOutlined />
              <span>点击选择图片</span>
            </div>
          </div>
        </a-form-item>
        <a-form-item label="提示词" required>
          <a-textarea
            v-model:value="newExample.prompt"
            :rows="4"
            placeholder="输入生成此图片的提示词"
          />
        </a-form-item>
        
        <!-- 上传状态 -->
        <a-alert
          v-if="newExample.imagePreview && newExample.image"
          type="success"
          show-icon
          style="margin-bottom: 16px"
        >
          <template #message>
            图片已上传
          </template>
          <template #description>
            <p style="margin: 4px 0">图片已保存到：<code>{{ newExample.image }}</code></p>
          </template>
        </a-alert>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ThunderboltOutlined, CopyOutlined, PlusOutlined, PictureOutlined, ClearOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// 生成设置
const prompt = ref('')
const negativePrompt = ref('')
const imageSize = ref('1024x1024')
const style = ref('vivid')

// 折叠面板
const activeTipPanels = ref(['basics'])

// 核心要素表格
const elementsColumns = [
  { title: '要素', dataIndex: 'name', key: 'name' },
  { title: '说明', dataIndex: 'desc', key: 'desc' },
  { title: '常用词', dataIndex: 'examples', key: 'examples' }
]

const elementsData = [
  { key: '1', name: '主体', desc: '画面核心对象', examples: '人物、动物、建筑、物品' },
  { key: '2', name: '风格', desc: '艺术表现形式', examples: '写实、油画、水彩、赛博朋克、动漫、极简' },
  { key: '3', name: '光线', desc: '氛围营造', examples: '自然光、逆光、霓虹灯、黄金时刻、戏剧性光影' },
  { key: '4', name: '构图', desc: '画面布局', examples: '特写、全景、俯视、仰视、对称构图' },
  { key: '5', name: '画质', desc: '清晰度', examples: '8K、高清、细节丰富、专业摄影' }
]

// 问题解决表格
const problemColumns = [
  { title: '问题', dataIndex: 'problem', key: 'problem' },
  { title: '解决方案', dataIndex: 'solution', key: 'solution' }
]

const problemData = [
  { key: '1', problem: '人物手指畸形', solution: '添加负面提示词"多余的手指，畸形的手"' },
  { key: '2', problem: '画面模糊', solution: '添加"8K高清，细节丰富，锐利对焦"' },
  { key: '3', problem: '构图不佳', solution: '明确指定构图方式"三分法构图，黄金比例"' },
  { key: '4', problem: '风格不符', solution: '强化风格描述，或使用更具体的风格词' }
]

// 优秀示例图片
const exampleImages = ref<any[]>([])

// 从 API 加载示例
async function loadExamples() {
  try {
    const res = await fetch('/api/text-to-image/examples')
    if (res.ok) {
      exampleImages.value = await res.json()
    }
  } catch (error) {
    console.error('加载示例失败:', error)
  }
}

// 初始化加载
loadExamples()

// 添加示例相关
const showAddExampleModal = ref(false)
const imageInputRef = ref<HTMLInputElement | null>(null)
const newExample = ref({
  title: '',
  image: '',
  imagePreview: '',
  prompt: ''
})

function triggerImageUpload() {
  imageInputRef.value?.click()
}

async function onImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    message.warning('请选择图片文件')
    return
  }
  
  // 读取文件为 base64
  const reader = new FileReader()
  reader.onload = async (e) => {
    const imageData = e.target?.result as string
    newExample.value.imagePreview = imageData
    
    // 上传到服务器
    try {
      const res = await fetch('/api/text-to-image/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          fileName: generateFileName()
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        newExample.value.image = data.filePath
        message.success('图片上传成功')
      } else {
        message.error('图片上传失败')
      }
    } catch (error) {
      message.error('图片上传失败')
    }
  }
  reader.readAsDataURL(file)
  
  target.value = ''
}

function clearImage() {
  newExample.value.image = ''
  newExample.value.imagePreview = ''
}

async function addExample() {
  if (!newExample.value.title || !newExample.value.image || !newExample.value.prompt) {
    message.warning('请填写完整信息')
    return
  }
  
  try {
    const res = await fetch('/api/text-to-image/examples', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newExample.value.title,
        image: newExample.value.image,
        prompt: newExample.value.prompt
      })
    })
    
    if (res.ok) {
      const data = await res.json()
      exampleImages.value.push(data.example)
      resetAddForm()
      message.success('示例添加成功')
    } else {
      message.error('添加失败')
    }
  } catch (error) {
    message.error('添加失败')
  }
}

async function deleteExample(index: number) {
  try {
    const res = await fetch(`/api/text-to-image/examples/${index}`, {
      method: 'DELETE'
    })
    
    if (res.ok) {
      exampleImages.value.splice(index, 1)
      message.success('示例已删除')
    } else {
      message.error('删除失败')
    }
  } catch (error) {
    message.error('删除失败')
  }
}

function resetAddForm() {
  showAddExampleModal.value = false
  newExample.value = { title: '', image: '', imagePreview: '', prompt: '' }
}

// 使用示例
function useExample(text: string) {
  prompt.value = text
  message.success('已填入提示词')
}

// 生成唯一文件名
function generateFileName() {
  return `image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
}

// 清空提示词
function clearPrompt() {
  prompt.value = ''
  negativePrompt.value = ''
}

// 复制提示词
function copyPrompt() {
  if (!prompt.value) {
    message.warning('请先输入提示词')
    return
  }
  let text = prompt.value
  if (negativePrompt.value) {
    text += `\n\n[负面提示词] ${negativePrompt.value}`
  }
  navigator.clipboard.writeText(text)
  message.success('提示词已复制')
}
</script>

<style scoped>
.text-to-image-app {
  min-height: calc(100vh - 80px);
}

.panel-card,
.result-card,
.tips-card {
  height: fit-content;
}

.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.prompt-preview {
  width: 100%;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
}

.prompt-preview p {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.prompt-preview .negative-preview {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #d9d9d9;
  font-size: 13px;
  color: #666;
}

.result-actions {
  display: flex;
  gap: 12px;
}

.empty-result {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* 技巧部分样式 */
.tip-section {
  margin-bottom: 16px;
}

.tip-section:last-child {
  margin-bottom: 0;
}

.tip-section h4 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.tip-section p {
  margin: 4px 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.prompt-template {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
}

.copy-tag {
  cursor: pointer;
  margin-bottom: 4px;
}

.copy-tag:hover {
  opacity: 0.8;
}

/* 优秀示例样式 */
.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.example-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.example-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.example-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f5f5f5;
}

.example-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.example-info {
  padding: 12px;
}

.example-info h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.example-prompt {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.use-prompt-btn {
  cursor: pointer;
}

.use-prompt-btn:hover {
  opacity: 0.8;
}

/* 优秀示例头部 */
.examples-header {
  margin-bottom: 12px;
  display: flex;
  justify-content: flex-end;
}

/* 删除标签 */
.delete-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.example-card:hover .delete-tag {
  opacity: 1;
}

/* 上传提示 */
.upload-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 图片上传区域 */
.image-upload-area {
  width: 100%;
}

.upload-placeholder {
  width: 100%;
  min-height: 150px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  background: #fafafa;
}

.upload-placeholder:hover {
  border-color: #1890ff;
}

.upload-placeholder span {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}

.image-preview {
  width: 100%;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 12px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .panel-card {
    margin-bottom: 12px;
  }
}
</style>
