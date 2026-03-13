# Vite + React + Bootstrap + Gemini 2.5 Flash

This project is a React app created with Vite, styled with Bootstrap, and connected to Gemini `gemini-2.5-flash`.

## 1) Install

```bash
npm install
```

## 2) Configure API key

Create a `.env` file in the project root and add:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

You can copy from `.env.example`.

## 3) Run development server

```bash
npm run dev
```

## 4) Build for production

```bash
npm run build
```

## Notes

- The Gemini API key is read in the browser via Vite environment variables.
- For production apps, use a backend proxy so your key is not exposed client-side.
