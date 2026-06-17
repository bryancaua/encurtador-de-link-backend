const express = require('express')
const Database = require('better-sqlite3')
const cors = require('cors')

const app = express()
const db = new Database('links.db')

app.use(cors())
app.use(express.json())

db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    url_original TEXT NOT NULL
  )
`)

function gerarCodigo() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let codigo = ''
  for (let i = 0; i < 6; i++) {
    codigo += chars[Math.floor(Math.random() * chars.length)]
  }
  return codigo
}

// Rota para encurtar link
app.post('/encurtar', (req, res) => {
  const { url } = req.body

  if (!url) {
    return res.status(400).json({ erro: 'URL não informada.' })
  }

  const codigo = gerarCodigo()

  db.prepare('INSERT INTO links (codigo, url_original) VALUES (?, ?)').run(codigo, url)

  res.json({ linkCurto: `https://encurtador-de-link-backend.onrender.com/${codigo}` })
})

app.get('/:codigo', (req, res) => {
  const { codigo } = req.params
 
  const link = db.prepare('SELECT url_original FROM links WHERE codigo = ?').get(codigo)

  if (!link) {
    return res.status(404).send('Link não encontrado.')
  }

  res.redirect(302, link.url_original)
})

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})