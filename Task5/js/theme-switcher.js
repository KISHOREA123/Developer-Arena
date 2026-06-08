document.addEventListener('DOMContentLoaded',function(){
  var btn = document.getElementById('themeToggle');
  var body = document.body;
  var stored = null;
  try{ stored = localStorage.getItem('pref-theme'); } catch(e){}
  if(stored === 'dark') body.classList.add('dark-theme');
  updateButton();

  btn && btn.addEventListener('click',function(){
    var isDark = body.classList.toggle('dark-theme');
    try{ localStorage.setItem('pref-theme', isDark ? 'dark' : 'light'); }catch(e){}
    updateButton();
  });

  function updateButton(){
    if(!btn) return;
    var isDark = body.classList.contains('dark-theme');
    btn.textContent = isDark ? 'Switch to light' : 'Switch to dark';
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }

  // populate footer year if present
  var y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();
});
