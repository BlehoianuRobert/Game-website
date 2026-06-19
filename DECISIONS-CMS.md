# DECISIONS-CMS.md — Admin Panel decisions

Document at least 3 decisions specific to the CMS.
Topics: technology choice, connecting to DB vs API, UI framework.

## Format

```
Decision: [what you chose]
Why: [the reason]
Rejected alternative: [what you considered and why not]
```

## Decisions

---

Decision: React 19 + Vite as the frontend foundation
Why: React 19 offers the latest performance optimizations (React Compiler) and a declarative way to build complex UIs. Vite provides near-instant HMR (Hot Module Replacement), which is essential for rapid prototyping. TypeScript ensures that complex data models (Games, Items, Player Profiles) are handled with strict type safety across all components.
Rejected alternative: Next.js — while powerful, its Server-Side Rendering (SSR) features were unnecessary for a purely client-side Admin Panel, and it would have added unnecessary complexity to the build process.

---

Decision: API-Centric Architecture (Decoupled from DB)
Why: The CMS communicates exclusively via the Laravel REST API. This ensures that the Admin Panel respects all business logic, authorization rules (JWT), and data transformations defined in the backend. It also allows the CMS and API to be developed and scaled independently.
Rejected alternative: Direct Database Access — connecting the frontend directly to PostgreSQL would bypass the API's security layer and lead to logic duplication between the PHP backend and the JS frontend.

---

Decision: Tailwind CSS 4 with a Custom "Grid Forge" Design System
Why: Tailwind 4's new engine allowed us to build a high-fidelity, "dark mode" dashboard that feels like a professional gaming platform. By using utility classes, we achieved a unique aesthetic (glassmorphism, glow effects, emerald accents) faster than we could have customized a component library like MUI or Bootstrap.
Rejected alternative: Component Libraries (MUI / Ant Design) — these often lead to a "generic" look. Given the "Grid Forge" branding, a custom-styled UI was prioritized to make the platform stand out visually.

---

Decision: Zod for Runtime Type Validation
Why: Zod acts as the bridge between the untrusted API data and the TypeScript environment. By validating API responses at the service layer, we catch "contract breaks" immediately at the edge of the application, providing clear error messages instead of cryptic "undefined" crashes in deep component trees.
Rejected alternative: Manual Type Casting (as Type) — this provides no runtime protection. If the API returns a null where the UI expects a string, the app would crash without Zod's defensive layer.

---

Decision: React Context API for Global State & Auth Management
Why: For the scope of this CMS, the built-in React Context API is perfect for handling Authentication state. It avoids the boilerplate of Redux while providing a clean, hook-based API (`useAuth`) that is easy to consume across the dashboard.
Rejected alternative: Redux Toolkit — unnecessary overhead for a project where state is mostly local or easily managed through a single Auth provider.

---

## What I learned

## 1. Collaboration Dynamics
The collaboration was extremely natural and productive. Although I worked with people I had just met, the team integration was fluid and fast . The atmosphere was based on mutual support, with each member actively contributing to common goals . This open environment facilitated communication and turned our diverse perspectives into a competitive advantage .

## 2. Mutual Support and Mentorship
Moments where I encountered technical blocks were solved through the exchange of expertise within the team:
* **Robert:** Provided crucial support in understanding the API architecture, facilitating the correct integration between backend and frontend components .
* **Alina:** Played an essential role in the frontend decision-making process. Validating my technical choices gave me the confidence needed to implement scalable and aesthetic solutions .

## 3. Conflict Management and Leadership
We approached the decision-making process through a horizontal structure:
* **Decision-making:** There was no formal "leader" hierarchy . We functioned as a collective entity, where decisions were made by unanimity after each member had the opportunity to argue their point of view .
* **Development:** Disagreements were rare and constructive . When opinions diverged, we used technical and logical arguments to identify the best path forward, avoiding tension and maintaining focus on the final product's quality .

## 4. Knowledge Evolution
This experience provided me with new perspectives, transforming uncertainty into competence:
* **SDK Architecture:** I realized that developing an SDK is a logical process that can be approached with confidence if good abstraction practices are followed .
* **Frontend UX:** I learned fundamental details about how a frontend interface should be structured to provide the smoothest possible user experience . Attention to detail at this stage is crucial for the success of any modern web application .