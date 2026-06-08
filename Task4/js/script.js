// Basic interactivity and form validation
document.addEventListener('DOMContentLoaded',function(){
  // year in footer
  var y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();

  // nav toggle for mobile
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  if(navToggle && nav){
    navToggle.addEventListener('click',function(){
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
      nav.style.display = expanded ? 'none' : 'flex';
    });
  }

  // Contact form validation and feedback
  var form = document.getElementById('contactForm');
  if(form){
    var feedback = document.getElementById('formFeedback');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var errors = [];
      if(name.length < 2) errors.push('Please enter your name (2+ characters).');
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('Please enter a valid email.');
      if(message.length < 10) errors.push('Message should be at least 10 characters.');
      if(errors.length){
        feedback.textContent = errors.join(' ');
        feedback.style.color = 'crimson';
      } else {
        feedback.textContent = 'Thanks — your message has been received (demo).';
        feedback.style.color = 'green';
        form.reset();
        // store a simple local copy for offline demo
        try{ localStorage.setItem('lastContact', JSON.stringify({name,email,message,date:new Date().toISOString()})); }catch(e){}
      }
    });
  }
});
