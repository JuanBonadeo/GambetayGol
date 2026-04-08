# Design System Document

## 1. Overview & Creative North Star: "The Stadium Noir"

This design system is a high-octane, editorial interpretation of football culture. It moves away from the "bright and grassy" cliches of sports retail, instead embracing a **"Stadium Noir"** aesthetic—a fusion of high-end streetwear minimalism and the raw, nocturnal energy of a night match under the floodlights.

By utilizing a pure black base (`surface: #131313`) and a surgical application of Electric Blue (`secondary_fixed_dim: #34b5fa`), we create a vacuum where the product imagery—the jerseys—become the sole protagonists. The experience is defined by **Atmospheric Brutalism**: a rigid, sharp-edged layout (0px radius) that feels architectural, intentional, and premium. We break the template by using extreme typographic scale contrasts and "floating" elements that bleed into the darkness.

---

## 2. Colors & Tonal Depth

In this system, color is not a decoration; it is a signal. We operate in a "Zero White" environment to preserve eye comfort and reinforce the premium dark-mode aesthetic.

### Surface Hierarchy & Nesting
We strictly prohibit the use of 1px borders to separate content. Hierarchy is achieved through **Tonal Layering**:
*   **Base Layer:** `surface` (#131313) is used for the primary background.
*   **Secondary Sections:** `surface_container_low` (#1b1b1b) is used for wide sections (e.g., product carousels) to create a subtle shift in ground.
*   **Interactive Containers:** `surface_container` (#1f1f1f) or `surface_container_high` (#2a2a2a) are used for cards and floating menus to pull them "forward" toward the user.

### The "No-Line" Rule
Section boundaries must be defined solely through background shifts or white space. If two sections feel merged, increase the contrast between `surface` and `surface_container_low` rather than adding a divider.

### Signature Textures & Accents
*   **The Single Accent:** `secondary_fixed_dim` (#34b5fa) is our "Cyan Floodlight." Use it sparingly for active states, primary CTAs, and price highlights.
*   **Glassmorphism:** For navigation bars or floating action menus, use `surface` at 70% opacity with a `20px` backdrop-blur. This ensures the vibrant colors of the football jerseys "ghost" behind the UI as the user scrolls.

---

## 3. Typography: Editorial Authority

We use **Inter** exclusively, treated with a heavy, uppercase editorial bias to mimic streetwear brand lookbooks.

*   **Display & Headlines:** Must always be `font-weight: 900` (Black) and `text-transform: uppercase`. Use `letter-spacing: -0.02em` to create a dense, powerful block of text.
    *   *Display-LG (3.5rem):* Reserved for hero slogans.
    *   *Headline-LG (2.0rem):* Category titles (e.g., "RETRO EUROPA").
*   **Titles & Body:** Used for product names and descriptions.
    *   *Title-MD (1.125rem):* Product titles, uppercase, medium weight.
    *   *Body-MD (0.875rem):* Technical specs and pricing. Use `on_surface_variant` (#c6c6c6) for secondary metadata to maintain visual hierarchy.
*   **Labels:** `label-sm` (0.6875rem) with `letter-spacing: 0.1em` for "New Drop" tags or micro-navigation.

---

## 4. Elevation & Depth

We reject traditional shadows. In a pure black environment, shadows are physically impossible. Depth is communicated through **Luminance and Blur**.

*   **The Layering Principle:** To lift a product card, do not use a black shadow. Instead, use a "Inner Glow" or a "Ghost Border."
*   **The "Ghost Border":** For high-priority UI elements (like a selected size button), use `outline_variant` (#474747) at 20% opacity. This creates a "barely-there" structural hint.
*   **Ambient Glow:** For the primary CTA button, a very soft, diffused drop shadow using the `surface_tint` (#7bd0ff) at 10% opacity can mimic the glow of a stadium screen.

---

## 5. Components

### Buttons
*   **Primary:** Background: `on_primary_fixed` (#ffffff) | Text: `on_primary` (#001e2c). Sharp corners (0px). All caps. This provides the highest possible contrast against the black background.
*   **Secondary:** Background: `transparent` | Border: `outline` (#919191) at 30% | Text: `on_surface`.
*   **Tertiary (Accent):** Text: `secondary_fixed_dim` (#34b5fa). No background. For "View All" links.

### Input Fields
*   **Default:** Background: `surface_container_highest` (#353535). No border. Label sits above in `label-md` uppercase.
*   **Focus:** Border-bottom: 2px solid `secondary_fixed_dim` (#34b5fa).

### Product Cards
*   **Architecture:** Zero padding on the image container. The image should bleed to the edges of the card.
*   **Information:** Text is center-aligned below the image. Use `title-sm` for the jersey name and `secondary_fixed_dim` for the price.
*   **Dividers:** Explicitly forbidden. Use `24px` or `32px` of vertical space to separate the product name from the price.

### Chips (Filters/Sizes)
*   Unselected: `surface_container_high` (#2a2a2a) background, `on_surface` text.
*   Selected: `secondary_fixed_dim` (#34b5fa) background, `on_secondary` (#001e2f) text.

---

## 6. Do's and Don'ts

### Do
*   **DO** use oversized product photography. The jersey textures (mesh, embroidery) should be visible.
*   **DO** use asymmetric layouts for hero sections (e.g., text left-aligned, product image partially cut off on the right).
*   **DO** maintain a 0px border-radius across every single element.
*   **DO** use "Pure Black" (`#131313`) for the main canvas to make the light blue accent pop.

### Don't
*   **DON'T** use white backgrounds for any section.
*   **DON'T** use standard 1px grey dividers. They clutter the streetwear aesthetic.
*   **DON'T** use icons with rounded terminals. Use sharp, geometric iconography only.
*   **DON'T** use lowercase for headlines. It softens the brand voice too much for this specific aesthetic.