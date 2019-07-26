// JS Goes here - ES6 supported
//javascript file
var lozad = require('lozad')
const observer = lozad()

window.addEventListener('load', () => {
  observer.observe()
  
  let sidebar = document.getElementById('sidebar')
  let hamburger = document.getElementById('hamburger')
  let close = document.getElementById('close')
  hamburger.addEventListener('click', event => {
      event.preventDefault()
      sidebar.classList.toggle('transform-off')
  })
  close.addEventListener('click', event => {
      event.preventDefault()
      hamburger.style.transform = ''
      sidebar.classList.toggle('transform-off')
  })

  let url = window.location.href
  let title = document.title
  let shareul = document.getElementById('share')
  console.log(shareul, window.navigator.share)
  if (shareul && navigator.share) {
    let shareicon = document.createElement('li')
    let inner = `<span id="web-share" href="" class="link bg-white black db relative br-100 pa2" aria-label="Compartir">
    <svg width="16px" height="16px" class="db">
      <use xlink:href="/static/img/icons-share.svg"></use>
    </svg>
  </span>`
    shareicon.innerHTML = inner
    shareicon.classList.add('dib', 'ph2', 'raise')
    shareul.appendChild(shareicon)
    shareicon.addEventListener('click', event => {
      navigator.share({"url": url, "title": title})
      .then(console.log)
      .catch(console.log)
    })
  }
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'UA-141188337-1');

  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
  }


})
// if (window.netlifyIdentity) {
//   window.netlifyIdentity.on("init", user => {
//     if (!user) {
//       window.netlifyIdentity.on("login", () => {
//         document.location.href = "/admin/";
//       });
//     }
//   });
// }
// Check that service workers are registered

