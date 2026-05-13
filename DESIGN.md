# 我的工具集 (my-tools)

## 项目概述

整合多个独立工具的统一平台，提供单入口、单端口访问。

## 技术栈

- Vue 3 + Vite + TypeScript
- Vue Router 路由
- Pinia 状态管理
- Ant Design Vue 4.x UI

## 路由结构

| 路径 | 标题 | 描述 |
|------|------|------|
| /stock | 股票监控 | 实时监控股票走势，快速添加指数或个股 |
| /photo-id | 证件照制作 | 上传照片，AI抠图换背景，自动裁剪调整 |
| /photo-gallery | 相册浏览 | 选择文件夹浏览本地图片，支持缩略图预览 |
| /watermark | 图片水印 | 添加文字或图片水印，支持批量处理 |

## 项目结构

```
my-tools/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.ts           # 路由 + Pinia + Ant Design
    ├── App.vue         # 固定侧边栏 + 标题栏
    ├── types/
    │   └── watermark.ts
    └── apps/
        ├── StockMonitor.vue       # 股票监控
        ├── StockMonitor/
        │   ├── components/
        │   │   ├── StockCard.vue
        │   │   └── StockChart.vue
        │   ├── stores/
        │   │   └── stockStore.ts
        │   ├── utils/
        │   │   └── stockApi.ts
        │   └── types.ts
        ├── PhotoIdMaker.vue      # 证件照制作
        ├── PhotoIdMaker/
        │   ├── components/
        │   │   ├── PhotoUploader.vue
        │   │   ├── ImageEditor.vue
        │   │   ├── BackgroundPanel.vue
        │   │   ├── ImageAdjust.vue
        │   │   └── PreviewPanel.vue
        │   ├── stores/
        │   │   └── photoStore.ts
        │   ├── utils/
        │   │   └── imageProcessor.ts
        │   └── types.ts
        ├── PhotoGallery.vue     # 相册浏览
        ├── PhotoGallery/
        │   ├── components/
        │   │   ├── FolderSelector.vue
        │   │   ├── PhotoGrid.vue
        │   │   ├── PhotoViewer.vue
        │   │   └── Toast.vue
        │   └── stores/
        │       └── galleryStore.ts
        └── ImageWatermark.vue  # 图片水印
        └── ImageWatermark/
            ├── components/
            │   ├── ImagePreview.vue
            │   └── WatermarkPanel.vue
            └── types/
```

## 端口

- 前端：3000
- 相册后端：3005（可选，需要单独启动）

## 设计特点

### 布局
- 左侧固定侧边栏（可折叠：展开 200px / 折叠 80px）
- 右侧标题栏（高度 48px，显示标题 + 描述）
- 主内容区域自适应

### 样式
- 统一 CSS 变量系统（颜色、阴影、圆角）
- Plus Jakarta Sans 字体
- 主色调：indigo (#6366f1)

### 组件
- 所有按钮使用渐变背景 + 悬浮动画
- 统一的紧凑间距

## 依赖

```json
{
  "vue": "^3.4.0",
  "vue-router": "^4.2.0",
  "pinia": "^2.1.0",
  "ant-design-vue": "^4.0.0",
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