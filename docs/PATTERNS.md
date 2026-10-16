# Design patterns used in the frontend

| Pattern | Where | Why |
|---|---|---|
| Facade | `src/api/index.ts` (`hotelApi`) | Screens call one object; they do not know whether the real server or the mock answers. |
| Adapter | `src/api/adapters.ts` | Converts server responses into view models (labels in Spanish, formatted money and dates) so components stay simple. |
| Strategy | real vs mock `HotelApi` implementations | Same interface, interchangeable behavior, chosen by `VITE_USE_MOCK`. |
| Provider / Observer | `AuthContext` | Components subscribe to the session and re-render when it changes. |
| Custom hooks | `useAsync`, `useAuth` | Reusable loading, error and data handling. |

The backend patterns (Strategy, State, Factory, Builder, Observer) are described in the backend repo `docs/PATTERNS.md`.
