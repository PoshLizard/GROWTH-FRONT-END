# Growth

Growth is a React + TypeScript frontend for managing personal gardens and tracking plant health. It gives users a simple dashboard to create gardens, add plants, monitor plant condition, and get AI-driven support for plant care.

## What the app does

- Create and manage multiple gardens
- Add a location and cover image to each garden
- Add plants to a specific garden
- View a visual dashboard of all gardens and their health status
- Open a detailed garden view to see the plants inside
- Review plant health scores, growth logs, and recent scans
- Upload plant images for AI-based diagnosis and recommendations
- Use a chatbot to ask plant care questions and get guidance

This project is the front-end layer for a garden management app and expects a backend API running locally at `http://localhost:8080/api`.

## Main features

- Garden dashboard with carousel-style overview
- Garden detail screen for each planted area
- Plant modals for adding and inspecting plants
- Image upload support for garden and plant assets
- AI-powered plant scan workflow
- Responsive UI built with modern component styling

## Tech stack

- React
- TypeScript
- Vite
- React Router
- Tailwind-style utility classes and custom CSS
- Lucide icons
- Slick carousel

## Project structure

```text
src/
├── app/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── App.tsx
│   ├── data.ts
│   ├── routes.ts
│   ├── types.ts
│   └── ...
├── assets/
├── images/
├── styles/
├── main.tsx
├── declarations.d.ts
├── index.css
└── ...
```

### Key folders

- `src/app/pages` – homepage and garden detail screens
- `src/app/components` – reusable UI, modals, chatbot, plant cards
- `src/app/context` – state and API integration (`GardenContext`)
- `src/app/types.ts` – shared TypeScript models for gardens and plants

## How it works

The app loads garden data from the backend through the `GardenContext` provider. From there, users can:

1. Browse their gardens on the home dashboard
2. Visit a specific garden detail page
3. Add plants and upload scan images
4. Review health data and AI recommendations
5. Delete or manage gardens and plants as needed

## Getting started

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Then open the local Vite URL in your browser.

## Notes

- This repo is the frontend only.
- It depends on a separate backend service that exposes the garden and plant API endpoints.
- The app is configured to call `http://localhost:8080/api` for its data layer.

## License

This project does not currently include a repository license file.
