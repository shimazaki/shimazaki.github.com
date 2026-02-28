# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the static website for **neuralengine.org**, the academic website of Dr. Hideaki Shimazaki (Associate Professor, Kyoto University). It is a bilingual (English/Japanese) research portfolio covering publications, research tools, lectures, and educational resources in computational neuroscience.

## Hosting & Infrastructure

- **Domain**: https://www.neuralengine.org/
- **Server**: Apache HTTP on AWS, with HTTPS handled by AWS Load Balancer
- **No build step**: The site is plain HTML/CSS/JS served statically. There are no package managers, bundlers, or build tools.
- **Deployment**: Files are synced from this Dropbox directory to the server. There is no CI/CD pipeline.

## Key Files & Structure

- `index.html` — Language router (redirects to English or Japanese)
- `index_en.html` / `index_jp.html` — Main pages (English / Japanese)
- `activity_en.html` / `activity_jp.html` — News and activity feed
- `publications.html` — Publication list
- `.htaccess` — Apache config; protects `links.html` with Basic Auth (credentials in `.htpasswd`)
- `sitemap.xml` — SEO sitemap for neuralengine.org
- `res/css/tool.css` — Primary stylesheet used across pages
- `neuro.js` — Small Canvas-based neural network visualization

## Content Directories

- `res/book/` — Large LaTeX-generated HTML book (auto-generated, do not manually edit inner pages)
- `res/code/` — Research code samples in MATLAB, Python, Julia, R, Mathematica, IDL, JS
- `res/pdf/` — Research papers (PDF files)
- `res/sshist/`, `res/sskernel/`, `res/ssloglin/` — Research tool pages (histogram, kernel density, log-linear)
- `res/lecture/` — Teaching materials
- `res/people/` — Lab member profiles
- `ton/` — Personal content and photo galleries

## Conventions

- Pages are bilingual: content changes typically need updates in both `_en.html` and `_jp.html` variants.
- CSS is shared via `res/css/tool.css`; some pages also use `res/css/latex2html.css` (for book content).
- Google Analytics is embedded in main pages via gtag.js.
- The `.gitignore` excludes: `smzk`, `_notes`, `*~`, `*.log`, `*.asv`, `*.eps`, `*.DS_Store`.
