# FabianAGI

Platforma AI z asystentem konwersacyjnym Fabian.

## Uruchomienie

```bash
npm install
cp .env.example .env
# wklej swój klucz GROQ_API_KEY do .env
npm start
```

Aplikacja działa pod adresem `http://localhost:3000`.

## Struktura

- `/` - strona główna FabianAGI
- `/fabian` - aplikacja czatu Fabian
- `/wyniki` - przykładowe wyniki (dane demonstracyjne)
- `/prywatnosc` - informacje o prywatności
- `POST /api/chat` - serwerowy endpoint proxy do Groq (stream SSE)

## Architektura

```
Fabian UI → POST /api/chat → server.js → Groq API (stream) → przeglądarka → localStorage
```

- Klucz `GROQ_API_KEY` nigdy nie trafia do przeglądarki.
- Rozmowy zapisywane są lokalnie w przeglądarce pod kluczem `fabian_chats`.
- Do API wysyłane są wyłącznie wiadomości bieżącej rozmowy.
- Model: `groq/compound-mini` (narzędzia: web search, code interpreter, visit website).

## Bezpieczeństwo

Endpoint `/api/chat` waliduje treść żądania, ogranicza długość wiadomości
i rozmów, stosuje prosty rate limiting per IP oraz zwraca bezpieczne
komunikaty błędów bez szczegółów providera.

## Ustawienia czatu

W aplikacji Fabian (przycisk zębatki) użytkownik może podać własny klucz API
(Groq lub dowolne API zgodne z OpenAI) i opcjonalny adres API (base URL).
Klucz zapisywany jest wyłącznie w localStorage przeglądarki i wysyłany
jedynie w zapytaniach do wybranego API. Bez własnego klucza używany jest
klucz platformy z GROQ_API_KEY.

Wiadomości użytkownika są ograniczone do 100 znaków (UI i serwer).

## Panel administracyjny (/admin)

Ustaw zmienną ADMIN_TOKEN (min. 20 znaków) w Railway. Wejdź na /admin,
zaloguj się hasłem - zobaczysz logi zapytań: IP, model, persona, fragment
ostatniej wiadomości, czas odpowiedzi i błędy. Logi trzymane lokalnie
w data/events.jsonl (poza katalogiem public - nie są serwowane),
retencja 30 dni, opisane na stronie Prywatność.
