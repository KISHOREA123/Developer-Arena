# Task4 — Business Website (Week 4)

This folder contains a complete, responsive business website sample built for Week 4.

Files:

- `index.html` — Home / hero / service previews
- `about.html` — About page
- `services.html` — Services details
- `contact.html` — Contact page with client-side validation
- `css/style.css` — Mobile-first responsive stylesheet
- `js/script.js` — Navigation toggle and form validation

How to preview locally:

1. Open `Task4` in VS Code and open `index.html` in your browser.
2. Or use a simple local server, for example with Python 3:

```bash
python -m http.server 8000
# then open http://localhost:8000/Task4/
```

Deployment:

- GitHub Pages: push the `Task4` folder to a repository and enable Pages from the `main` branch (root or `/docs`).
- Netlify: drag the repository or folder into Netlify and follow the deploy steps.

Notes on requirements:

- Includes 4 HTML pages and a `css/` and `js/` folder.
- Mobile-first responsive CSS implemented.
- Contact form uses client-side validation and stores a demo message in `localStorage`.
- Images can be added to an `images/` folder; the layout uses emoji placeholders for quick demo.
