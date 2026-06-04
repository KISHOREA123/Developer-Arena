const themeToggle = document.querySelector('[data-theme-toggle]');
const themeLabel = document.querySelector('[data-theme-label]');
const bioToggle = document.querySelector('[data-bio-toggle]');
const bioContent = document.querySelector('[data-bio]');
const sliderTrack = document.querySelector('[data-slider-track]');
const slides = Array.from(document.querySelectorAll('[data-slide]'));
const prevSlideButton = document.querySelector('[data-prev-slide]');
const nextSlideButton = document.querySelector('[data-next-slide]');
const todoForm = document.querySelector('[data-todo-form]');
const todoInput = document.getElementById('todo-input');
const todoList = document.querySelector('[data-todo-list]');
const contactForm = document.getElementById('contact-form');
const formStatus = document.querySelector('[data-form-status]');
const fields = ['name', 'email', 'subject', 'message'];

const sliderState = {
  currentIndex: 0,
};

const todoItems = [
  'Set up script.js and connect it to the page',
  'Build the interactive gallery controls',
  'Validate the contact form before submit',
];

function applyTheme(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeLabel.textContent = isDark ? 'Dark mode' : 'Light mode';
  themeToggle.querySelector('.theme-toggle-icon').textContent = isDark ? '☾' : '☀';
  localStorage.setItem('darkMode', String(isDark));
}

function initTheme() {
  const savedTheme = localStorage.getItem('darkMode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme ? savedTheme === 'true' : prefersDark);
}

function toggleBio() {
  const isHidden = bioContent.hasAttribute('hidden');
  bioContent.hidden = !isHidden;
  bioToggle.textContent = isHidden ? 'Hide extra details' : 'Show more about me';
}

function setSlide(index) {
  const slideCount = slides.length;
  sliderState.currentIndex = (index + slideCount) % slideCount;
  sliderTrack.style.transform = `translateX(-${sliderState.currentIndex * 100}%)`;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === sliderState.currentIndex);
  });
}

function showNextSlide() {
  setSlide(sliderState.currentIndex + 1);
}

function showPreviousSlide() {
  setSlide(sliderState.currentIndex - 1);
}

function renderTodoList() {
  todoList.innerHTML = '';

  todoItems.forEach((item, index) => {
    const listItem = document.createElement('li');
    listItem.className = 'todo-item';

    const text = document.createElement('span');
    text.textContent = item;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      todoItems.splice(index, 1);
      renderTodoList();
    });

    listItem.append(text, removeButton);
    todoList.append(listItem);
  });
}

function addTodoItem(event) {
  event.preventDefault();

  const value = todoInput.value.trim();
  if (!value) {
    todoInput.focus();
    return;
  }

  todoItems.unshift(value);
  todoInput.value = '';
  renderTodoList();
}

function setFieldError(fieldName, message) {
  const errorNode = document.querySelector(`[data-error-for="${fieldName}"]`);
  const fieldInput = document.getElementById(fieldName);
  errorNode.textContent = message;
  fieldInput.setAttribute('aria-invalid', String(Boolean(message)));
}

function showFormStatus(message, type) {
  formStatus.textContent = message;
  formStatus.classList.remove('is-success', 'is-error');
  if (type) {
    formStatus.classList.add(type === 'success' ? 'is-success' : 'is-error');
  }
}

function validateContactForm(event) {
  event.preventDefault();

  let isValid = true;
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  setFieldError('name', '');
  setFieldError('email', '');
  setFieldError('subject', '');
  setFieldError('message', '');

  if (name.length < 2) {
    setFieldError('name', 'Please enter your full name.');
    isValid = false;
  }

  if (!email.includes('@') || !email.includes('.')) {
    setFieldError('email', 'Please enter a valid email address.');
    isValid = false;
  }

  if (subject.length < 3) {
    setFieldError('subject', 'Subject must be at least 3 characters.');
    isValid = false;
  }

  if (message.length < 10) {
    setFieldError('message', 'Message must be at least 10 characters.');
    isValid = false;
  }

  if (!isValid) {
    showFormStatus('Please fix the highlighted fields.', 'error');
    return;
  }

  showFormStatus('Message sent successfully!', 'success');
  contactForm.reset();
}

function validateField(event) {
  const fieldName = event.target.id;
  if (!fields.includes(fieldName)) {
    return;
  }

  const value = event.target.value.trim();
  if (fieldName === 'name' && value.length < 2) {
    setFieldError(fieldName, 'Name must be at least 2 characters.');
    return;
  }

  if (fieldName === 'email' && value && (!value.includes('@') || !value.includes('.'))) {
    setFieldError(fieldName, 'Enter a valid email address.');
    return;
  }

  if (fieldName === 'subject' && value.length > 0 && value.length < 3) {
    setFieldError(fieldName, 'Subject must be at least 3 characters.');
    return;
  }

  if (fieldName === 'message' && value.length > 0 && value.length < 10) {
    setFieldError(fieldName, 'Message must be at least 10 characters.');
    return;
  }

  setFieldError(fieldName, '');
}

function wireUpInteractions() {
  themeToggle.addEventListener('click', () => {
    applyTheme(!document.body.classList.contains('dark-mode'));
  });

  bioToggle.addEventListener('click', toggleBio);
  nextSlideButton.addEventListener('click', showNextSlide);
  prevSlideButton.addEventListener('click', showPreviousSlide);
  todoForm.addEventListener('submit', addTodoItem);
  contactForm.addEventListener('submit', validateContactForm);
  fields.forEach((fieldName) => {
    document.getElementById(fieldName).addEventListener('input', validateField);
  });
}

initTheme();
renderTodoList();
wireUpInteractions();
setSlide(0);
showFormStatus('');
console.log('Task3 interactive portfolio loaded');
