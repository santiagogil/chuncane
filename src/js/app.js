// JS Goes here - ES6 supported
//javascript file
var lozad = require('lozad')
const observer = lozad()
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-141188337-1');


window.addEventListener('load', () => {
  requestIdleCallback(sidebar)
  requestIdleCallback(observer.observe)
  requestIdleCallback(sharebutton)
  requestIdleCallback(registerworker)
})
function sharebutton () {
  let url = window.location.href
  let title = document.title
  let shareul = document.getElementById('share')
  if (shareul && navigator.share) {
    let shareicon = document.createElement('li')
    let inner = `<span id="web-share" href="" class="link bg-primary white db relative br-100 pa2" aria-label="Compartir">
    <svg width="16px" height="16px" class="db">
      <use xlink:href="#icons-share"></use>
    </svg>
  </span>`
    shareicon.innerHTML = inner
    shareicon.classList.add('dib', 'ph2', 'raise')
    shareul.appendChild(shareicon)
    shareicon.addEventListener('click', event => {
      navigator.share({"url": url, "title": title})
    })
  }
}
function sidebar () {
  let sidebar = document.getElementById('sidebar')
  let hamburger = document.getElementById('hamburger')
  let close = document.getElementById('close')
  hamburger.addEventListener('click', event => {
      event.preventDefault()
      requestAnimationFrame(transformoff)
  })
  close.addEventListener('click', event => {
      event.preventDefault()
      hamburger.style.transform = ''
      requestAnimationFrame(transformoff)
  })
  function transformoff () {
    sidebar.classList.toggle('transform-off')
  }
}

function registerworker () {
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
  }
}
