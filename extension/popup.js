// Configure your deployed URL here
const BASE_URL = 'https://your-app.up.railway.app'

const urlInput    = document.getElementById('urlInput')
const aliasInput  = document.getElementById('aliasInput')
const shortenBtn  = document.getElementById('shortenBtn')
const resultEl    = document.getElementById('result')
const shortUrlEl  = document.getElementById('shortUrl')
const copyBtn     = document.getElementById('copyBtn')
const openBtn     = document.getElementById('openBtn')
const errorEl     = document.getElementById('error')

// Pre-fill with the current tab URL
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  if (tabs[0]?.url) urlInput.value = tabs[0].url
})

shortenBtn.addEventListener('click', async () => {
  const url   = urlInput.value.trim()
  const alias = aliasInput.value.trim()
  if (!url) return

  shortenBtn.disabled = true
  shortenBtn.textContent = 'Shortening…'
  hide(resultEl)
  hide(errorEl)

  try {
    const res = await fetch(`${BASE_URL}/api/urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, alias: alias || null }),
    })
    const data = await res.json()

    if (!res.ok) {
      showError(data.error ?? 'Something went wrong.')
    } else {
      shortUrlEl.textContent = data.shortUrl
      openBtn.href = data.shortUrl
      show(resultEl)
    }
  } catch (e) {
    showError('Network error — is the backend reachable?')
  } finally {
    shortenBtn.disabled = false
    shortenBtn.textContent = 'Shorten →'
  }
})

copyBtn.addEventListener('click', async () => {
  const text = shortUrlEl.textContent
  try {
    await navigator.clipboard.writeText(text)
    copyBtn.textContent = '✓ Copied!'
    setTimeout(() => { copyBtn.textContent = 'Copy' }, 2000)
  } catch {
    // Fallback for older Chromium
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copyBtn.textContent = '✓ Copied!'
    setTimeout(() => { copyBtn.textContent = 'Copy' }, 2000)
  }
})

function showError(msg) {
  errorEl.textContent = msg
  show(errorEl)
}
function show(el) { el.classList.remove('hidden') }
function hide(el) { el.classList.add('hidden') }
