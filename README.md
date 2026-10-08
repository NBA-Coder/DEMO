# SafeEdge Apartments — GitHub Pages Gallery

A static, responsive SafeEdge Apartments photo gallery designed to run entirely on GitHub Pages.

## Features

- Responsive portrait gallery
- Automatic carousel sliding
- Previous / next controls
- Mobile swipe controls
- Keyboard arrow controls
- Animated SafeEdge background
- Progress bar
- SafeEdge logo
- Browser favicon
- No Node.js required
- No Express server required
- Gallery images are automatically discovered from the `images/` folder during GitHub Pages deployment

## How to publish

1. Create a GitHub repository.
2. Upload all files and folders from this project.
3. Make sure the default branch is named `main`.
4. Go to **Settings → Pages**.
5. Under **Build and deployment**, set **Source** to **GitHub Actions**.
6. Push the project to GitHub.
7. The workflow in `.github/workflows/pages.yml` will build and deploy the site.

## Adding new photos

Put JPG, JPEG, PNG, WEBP, GIF, or AVIF files inside:

```text
images/
```

Then commit and push to GitHub.

You do **not** need to edit `script.js` or `images.json`.

The GitHub Actions workflow scans the `images/` folder automatically and generates `images.json` during deployment.

## Local preview

Because this is a static GitHub Pages project, you can preview it with any local static server. For example, in VS Code you can use the Live Server extension.

No `npm install` or Node.js is required for the GitHub Pages version.
