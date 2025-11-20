import express from 'express'
import path from 'node:path'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import { runGeneration } from './core/generator.js'

const app = express()
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/', async (req, res) => {
  res.send(`<!doctype html>
<html>
<head>
<meta charset='utf-8'/>
<title>Code Generator</title>
<style>body{font-family:system-ui,Segoe UI,Arial;padding:24px}label{display:block;margin-top:12px}input,select,textarea{width:100%;padding:8px}button{padding:8px 12px;margin-top:12px}hr{margin:16px 0}</style>
</head>
<body>
<h2>前端代码生成器</h2>
<p>填写模块信息或粘贴YAML配置。</p>
<details open>
<summary>快速生成</summary>
<form id='genForm'>
<label>顶级菜单key（如admin）<input name='topKey' value='admin'/></label>
<label>顶级菜单名称<input name='topLabel' value='admin'/></label>
<label>模块名称<input name='moduleName' placeholder='例如 Category'/></label>
<label>模块中文名<input name='moduleComment' placeholder='例如 商品分类'/></label>
<label>路由基路径<input name='routeBase' placeholder='例如 categories'/></label>
<label>生成API方法（逗号分隔）<input name='apis' value='GET,LIST,POST,PUT,DELETE'/></label>
<label>查询字段JSON<textarea name='queryFields' rows='4' placeholder='例如 [{"name":"status","type":"Integer","comment":"状态"}]'></textarea></label>
<button type='submit'>生成</button>
</form>
</details>

<details>
<summary>通过YAML</summary>
<form id='yamlForm'>
<label>YAML文本<textarea name='yaml' rows='14'></textarea></label>
<button type='submit'>从YAML生成</button>
</form>
</details>

<pre id='resp'></pre>

<script>
const resp = document.getElementById('resp')
document.getElementById('genForm').addEventListener('submit', async (e)=>{
  e.preventDefault()
  const fd = new FormData(e.target)
  const topKey = fd.get('topKey')
  const topLabel = fd.get('topLabel')
  const moduleName = fd.get('moduleName')
  const moduleComment = fd.get('moduleComment')
  const routeBase = fd.get('routeBase')
  const apis = String(fd.get('apis')||'').split(',').map(s=>s.trim()).filter(Boolean)
  const queryFields = fd.get('queryFields') ? JSON.parse(fd.get('queryFields')) : []
  const mod = { name: moduleName, comment: moduleComment, routeBase, apis, menu: { topKey, topLabel }, fields: queryFields }
  const cfg = { modules: [mod] }
  const r = await fetch('/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(cfg) })
  const t = await r.text(); resp.textContent = t
})
document.getElementById('yamlForm').addEventListener('submit', async (e)=>{
  e.preventDefault()
  const fd = new FormData(e.target)
  const yamlText = fd.get('yaml')
  const r = await fetch('/generate-from-yaml', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ yaml: yamlText }) })
  const t = await r.text(); resp.textContent = t
})

</script>
</body>
</html>`)
})

app.post('/generate', async (req, res) => {
  try {
    const cfg = req.body
    const out = await runGeneration(cfg)
    res.send(JSON.stringify(out))
  } catch (e) {
    res.status(500).send(e.message || String(e))
  }
})

app.post('/generate-from-yaml', async (req, res) => {
  try {
    const text = req.body.yaml
    const cfg = yaml.load(text)
    const out = await runGeneration(cfg)
    res.send(JSON.stringify(out))
  } catch (e) {
    res.status(500).send(e.message || String(e))
  }
})



const port = process.env.PORT || 4399
app.listen(port, () => {
  console.log('Generator UI http://localhost:' + port)
})