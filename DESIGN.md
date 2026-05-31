# 我的工具集 (my-tools)

## 项目概述

整合多个独立工具的统一平台，单入口、单端口访问。

## 技术栈

- Vue 3 + Vite + TypeScript
- Vue Router 路由
- Pinia 状态管理
- Ant Design Vue 4.x UI
- hls.js（影视 HLS 播放）

## 路由结构

| 路径 | 标题 | 描述 |
|------|------|------|
| /photo-id | 证件照制作 | 上传照片，AI抠图换背景，自动裁剪调整 |
| /photo-gallery | 相册浏览 | 选择文件夹浏览本地图片，支持缩略图预览 |
| /watermark | 图片水印 | 添加文字或图片水印，支持批量处理 |
| /ai-knowledge | AI知识库 | AI 学习资源导航 |
| /movie | 影视搜索 | 搜索热播影视剧，在线选集播放 |
| /movie?id=X&source=Y | 影视详情 | 视频播放 + 剧集列表 + 简介 |

## 项目结构

```
my-tools/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── DESIGN.md
├── plugins/
│   ├── movie-api-plugin.ts        # Vite 插件：影视搜索/详情 API（CMS + 豆瓣）
│   └── generate-route-html.ts     # Vite 插件：GitHub Pages SPA 路由 fallback
├── server/
│   └── index.js                   # Express 相册后端（端口 3005，可选）
└── src/
    ├── main.ts                    # 入口：Pinia + Router + Ant Design
    ├── App.vue                    # 布局：侧边栏（桌面）/ Drawer（移动端）
    ├── env.d.ts                   # Vite 环境类型声明
    ├── router/
    │   └── index.ts               # 路由配置
    ├── styles/
    │   ├── variables.css          # CSS 变量（颜色、阴影、圆角）
    │   └── global.css             # 全局样式重置 + 字体
    └── apps/
        ├── Home.vue               # 首页
        ├── PhotoIdMaker/
        │   ├── index.vue          # 证件照制作
        │   ├── types.ts
        │   ├── stores/photoStore.ts
        │   ├── utils/imageProcessor.ts
        │   └── components/
        │       ├── PhotoUploader.vue
        │       ├── ImageEditor.vue
        │       ├── BackgroundPanel.vue
        │       ├── ImageAdjust.vue
        │       └── PreviewPanel.vue
        ├── PhotoGallery/
        │   ├── index.vue          # 相册浏览（需后端支持）
        │   ├── stores/galleryStore.ts
        │   └── components/
        │       ├── FolderSelector.vue
        │       ├── PhotoGrid.vue
        │       ├── PhotoViewer.vue
        │       └── Toast.vue
        ├── ImageWatermark/
        │   ├── index.vue          # 图片水印
        │   ├── types/
        │   └── components/
        │       ├── ImagePreview.vue
        │       └── WatermarkPanel.vue
        ├── AIKnowledge/
        │   └── index.vue          # AI 知识导航
        └── Movie/
            ├── index.vue          # 影视入口（路由分发 Search/Player）
            ├── types.ts
            ├── stores/movieStore.ts
            ├── utils/
            │   ├── movieApi.ts    # API 调用封装
            │   └── useHls.ts      # hls.js composable
            └── components/
                ├── SearchView.vue  # 搜索 + 热门剧集
                ├── PlayerView.vue  # 播放器 + 详情 Tab
                └── DramaCard.vue   # 搜索结果卡片
```

## 端口

- 前端：3000
- 相册后端：3005（可选，`node server/index.js`）

## 布局

### 桌面端（>= 768px）
- 左侧固定侧边栏（Ant Design Sider），深色主题
  - 展开 200px，折叠 80px
  - 可点击汉堡按钮切换
- 右侧标题栏（sticky，高度 48px）
- 主内容区域 margin-left 跟随侧边栏宽度

### 移动端（< 768px）
- 侧边栏隐藏，内容占满全宽
- Ant Design Drawer 从左侧滑出
- 汉堡按钮控制 drawer 开关
- 点击菜单项或遮罩层关闭 drawer
- resize 时自动切换模式

## 影视模块设计

### 搜索流程
1. 输入关键词 → 调用 `/api/movie/search`
2. 后端并行请求 CMS 资源站 + 豆瓣建议
3. 合并结果，按标题相似度匹配豆瓣信息（封面、评分、年份）
4. 搜索结果以 Grid 展示（响应式：桌面 auto-fill，移动端 2 列）

### 播放流程
1. 点击剧集 → 导航到 `/movie?id=X&source=Y`
2. 前端调用 `/api/movie/detail` 获取详情（含剧集列表）
3. 自动选中第一集，hls.js 加载播放
4. 简介 + 剧集列表以 Tab 展示（默认显示剧集列表）

### API 层
- 影视 API 通过 Vite 插件 `movie-api-plugin.ts` 内嵌
- CMS 源：非凡资源（ffzy），XML 接口
- 数据合并：CMS 提供播放地址，豆瓣提供元信息（封面、评分）
- 地区过滤：支持「仅大陆」开关，按 vod_area 过滤

### 热门剧集
- 豆瓣新搜索结果，按评分排序取 top 20
- Grid 布局（与搜索结果一致）
- 点击 → 搜索 CMS 同名剧 → 有结果进播放器，无结果跳豆瓣

### 搜索历史
- 最多保留 10 条，存储在 localStorage
- 去重：重复搜索的项移至顶部
- 支持单条删除和全部清空
- 与热门标签同行展示

## 样式系统

- CSS 变量：`variables.css` 定义颜色、阴影、圆角、间距
- 主色调：indigo (#6366f1)
- 全局样式：`global.css`（reset、字体 Plus Jakarta Sans）
- 组件作用域样式（scoped），无 CSS 框架

## 依赖

```json
{
  "vue": "^3.4.0",
  "vue-router": "^4.2.0",
  "pinia": "^2.1.0",
  "ant-design-vue": "^4.0.0",
  "hls.js": "^1.5.0",
  "chart.js": "^4.4.0",
  "vue-chartjs": "^5.3.0",
  "cropperjs": "^1.6.2",
  "@imgly/background-removal": "^1.5.0",
  "@ant-design/icons-vue": "^7.x"
}
```

## 启动

```bash
# 前端
cd my-tools
npm run dev

# 相册后端（可选）
cd my-tools/server
node index.js
```

访问 http://localhost:3000

## 构建

```bash
npm run build
# 输出到 dist/，部署到 GitHub Pages（/xixi-tools/ base path）
```
