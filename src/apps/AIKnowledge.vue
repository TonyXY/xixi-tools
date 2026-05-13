<template>
  <div id="app">
    <div class="category-tabs">
      <button 
        v-for="cat in categories" 
        :key="cat.key"
        class="tab-btn"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>
    
    <div class="resource-list">
      <div 
        v-for="item in filteredItems" 
        :key="item.name"
        class="resource-card"
        @click="openLink(item.url)"
      >
        <div class="resource-icon">{{ item.icon }}</div>
        <div class="resource-info">
          <h3 class="resource-name">{{ item.name }}</h3>
          <p class="resource-desc">{{ item.desc }}</p>
          <div class="resource-tags">
            <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        <span class="resource-link">→</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type ComputedRef } from 'vue'

interface Resource {
  name: string
  desc: string
  url: string
  icon: string
  tags: string[]
}

interface Category {
  key: string
  label: string
}

const categories: Category[] = [
  { key: 'all', label: '全部' },
  { key: '模型', label: '模型' },
  { key: '工具', label: '工具' },
  { key: '学习', label: '学习' },
  { key: '资讯', label: '资讯' }
]

const resources: Resource[] = [
  // 模型
  { name: 'OpenAI', desc: 'GPT-4o 最强对话模型', url: 'https://openai.com/', icon: '🤖', tags: ['模型'] },
  { name: 'ChatGPT', desc: 'AI对话机器人', url: 'https://chatgpt.com/', icon: '💬', tags: ['模型'] },
  { name: 'Claude', desc: 'Anthropic 出品，长文本强', url: 'https://claude.ai/', icon: '🧠', tags: ['模型'] },
  { name: 'Gemini', desc: 'Google 多模态模型', url: 'https://gemini.google.com/', icon: '🌟', tags: ['模型'] },
  { name: 'DeepSeek', desc: '国产开源模型，性能强', url: 'https://deepseek.com/', icon: '🔵', tags: ['模型'] },
  { name: 'Qwen', desc: '阿里通义千问', url: 'https://qwen.ai/', icon: '🐳', tags: ['模型'] },
  { name: 'Kimi', desc: '月之暗面，长上下文', url: 'https://kimi.com/', icon: '🌙', tags: ['模型'] },
  
  // 工具
  { name: 'Cursor', desc: 'AI编程助手', url: 'https://cursor.sh/', icon: '💻', tags: ['工具'] },
  { name: 'Windsurf', desc: 'Codeium AI IDE', url: 'https://windsurf.com/', icon: '🌀', tags: ['工具'] },
  { name: 'Midjourney', desc: 'AI图像生成', url: 'https://www.midjourney.com/', icon: '🎨', tags: ['工具'] },
  { name: 'Runway', desc: 'AI视频生成', url: 'https://runway.com/', icon: '🎬', tags: ['工具'] },
  { name: 'Perplexity', desc: 'AI搜索引擎', url: 'https://www.perplexity.ai/', icon: '🔍', tags: ['工具'] },
  { name: 'Chatbox', desc: 'AI客户端对话工具', url: 'https://chatboxapp.com/', icon: '💬', tags: ['工具'] },
  { name: 'OpenCode', desc: '开源AI编程助手', url: 'https://opencode.ai/', icon: '⚡', tags: ['工具'] },
  
  // 学习
  { name: 'OpenAI Docs', desc: '官方API文档', url: 'https://developers.openai.com/api/docs', icon: '📚', tags: ['学习'] },
  { name: 'Anthropic Docs', desc: 'Claude API文档', url: 'https://docs.anthropic.com/', icon: '📖', tags: ['学习'] },
  { name: 'LangChain', desc: 'LLM应用开发框架', url: 'https://www.langchain.com/', icon: '🔗', tags: ['学习'] },
  { name: 'Vercel AI', desc: 'AI SDK for React', url: 'https://vercel.com/ai', icon: '⚡', tags: ['学习'] },
  { name: 'Hugging Face', desc: 'AI模型社区', url: 'https://huggingface.co/', icon: '🤗', tags: ['学习'] },
  { name: 'Pinecone', desc: '向量数据库', url: 'https://www.pinecone.io/', icon: '🌲', tags: ['学习'] },
  
  // 资讯
  { name: 'Hacker News', desc: '技术社区', url: 'https://news.ycombinator.com/', icon: '📰', tags: ['资讯'] },
  { name: 'Product Hunt', desc: '新产品发现', url: 'https://www.producthunt.com/', icon: '🏆', tags: ['资讯'] },
  { name: '36kr', desc: '科技资讯', url: 'https://36kr.com/', icon: '📊', tags: ['资讯'] }
]

const activeCategory = ref('all')

const filteredItems = computed(() => {
  if (activeCategory.value === 'all') return resources
  return resources.filter(r => r.tags.includes(activeCategory.value))
}) as ComputedRef<Resource[]>

function openLink(url: string) {
  window.open(url, '_blank')
}
</script>

<style scoped>
#app {
  max-width: 100%;
}

.category-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 4px 10px;
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--gray-200);
}

.tab-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.resource-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 8px;
}

.resource-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #fff;
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.resource-card:hover {
  border-color: var(--primary-light);
}

.resource-icon {
  font-size: 18px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-50);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.resource-info {
  flex: 1;
  min-width: 0;
}

.resource-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.resource-desc {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-tags {
  display: none;
}

.tag {
  padding: 1px 6px;
  background: var(--gray-100);
  border-radius: var(--radius-full);
  font-size: 9px;
  color: var(--text-muted);
}

.resource-link {
  font-size: 14px;
  color: var(--text-muted);
  flex-shrink: 0;
}
</style>