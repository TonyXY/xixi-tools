import { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

const EXAMPLES_FILE = join(process.cwd(), 'src/apps/TextToImage/examples.json')
const IMAGES_DIR = join(process.cwd(), 'public/images')

// 确保 images 目录存在
if (!existsSync(IMAGES_DIR)) {
  mkdirSync(IMAGES_DIR, { recursive: true })
}

function sendJson(res: ServerResponse, data: any, status = 200) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

function readExamples() {
  try {
    const content = readFileSync(EXAMPLES_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

function writeExamples(examples: any[]) {
  writeFileSync(EXAMPLES_FILE, JSON.stringify(examples, null, 2), 'utf-8')
}

async function getExamples(req: IncomingMessage, res: ServerResponse) {
  const examples = readExamples()
  sendJson(res, examples)
}

async function addExample(req: IncomingMessage, res: ServerResponse) {
  try {
    let body = ''
    for await (const chunk of req) {
      body += chunk
    }
    const newExample = JSON.parse(body)
    
    if (!newExample.title || !newExample.image || !newExample.prompt) {
      return sendJson(res, { error: '缺少必填字段' }, 400)
    }
    
    const examples = readExamples()
    examples.push(newExample)
    writeExamples(examples)
    
    sendJson(res, { success: true, example: newExample })
  } catch (error) {
    sendJson(res, { error: '添加失败' }, 500)
  }
}

async function uploadImage(req: IncomingMessage, res: ServerResponse) {
  try {
    let body = ''
    for await (const chunk of req) {
      body += chunk
    }
    
    const { imageData, fileName } = JSON.parse(body)
    
    if (!imageData || !fileName) {
      return sendJson(res, { error: '缺少图片数据' }, 400)
    }
    
    // 解析 base64 数据
    const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!matches) {
      return sendJson(res, { error: '无效的图片数据' }, 400)
    }
    
    const ext = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, 'base64')
    
    // 生成安全文件名（防止路径遍历）
    const sanitized = (fileName || '').replace(/[^a-zA-Z0-9._-]/g, '').replace(/\.\.+/g, '.')
    const hash = createHash('md5').update(buffer).digest('hex').slice(0, 8)
    const finalFileName = sanitized && !sanitized.startsWith('.') && sanitized.includes('.')
      ? sanitized
      : `image-${hash}.${ext}`
    
    // 保存文件
    const filePath = join(IMAGES_DIR, finalFileName)
    writeFileSync(filePath, buffer)
    
    sendJson(res, { 
      success: true, 
      filePath: `/xixi-tools/images/${finalFileName}` 
    })
  } catch (error) {
    sendJson(res, { error: '上传失败' }, 500)
  }
}

async function deleteExample(req: IncomingMessage, res: ServerResponse, index: number) {
  try {
    const examples = readExamples()
    if (index < 0 || index >= examples.length) {
      return sendJson(res, { error: '索引无效' }, 400)
    }
    
    examples.splice(index, 1)
    writeExamples(examples)
    
    sendJson(res, { success: true })
  } catch (error) {
    sendJson(res, { error: '删除失败' }, 500)
  }
}

export function textToImagePlugin(): Plugin {
  return {
    name: 'text-to-image-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (!url.startsWith('/api/text-to-image/')) return next()
        
        const path = url.replace('/api/text-to-image', '').split('?')[0]
        
        try {
          if (path === '/examples' && req.method === 'GET') {
            await getExamples(req, res)
          } else if (path === '/examples' && req.method === 'POST') {
            await addExample(req, res)
          } else if (path === '/upload' && req.method === 'POST') {
            await uploadImage(req, res)
          } else if (path.startsWith('/examples/') && req.method === 'DELETE') {
            const index = parseInt(path.split('/')[2])
            await deleteExample(req, res, index)
          } else {
            next()
          }
        } catch (e) {
          sendJson(res, { error: 'Internal error' }, 500)
        }
      })
    }
  }
}
