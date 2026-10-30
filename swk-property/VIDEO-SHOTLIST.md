# SWK Property — AI video shot list (Google Flow / Gemini Veo)

Generate these in **Google Flow** (labs.google/flow) or the **Gemini app → Create video** with your Google One AI plan.
Upload the finished MP4s back to the chat (or put them in Google Drive and tell me the folder). I compress them,
cut them into a scroll-scrubbed sequence and wire them under the floor content and level counter.

## How to keep the building identical across shots
1. Generate **Shot 01** first. Pick the best frame and save it as a still ("hero tower").
2. In Flow use **Frames to video** (start frame) or **Ingredients to video** (upload the hero still plus your
   SWK logo `assets/brand/swk-logo-white.png`) for every following shot. This is what keeps the same tower,
   facade lattice and logo from shot to shot.
3. Always: 16:9, 8 seconds, no on-screen text except where stated, no people looking at camera, smooth slow camera, no cuts.
4. Style line to append to every prompt: `photorealistic, cinematic architectural visualization, golden-hour dusk,
   85mm lens look, volumetric light, real-world materials, no cartoon, no CGI look, 4K`.

## Shots (in scroll order)

| # | Scroll beat | Prompt (paste, then append the style line) | Camera |
|---|---|---|---|
| 01 | Street / hero | A 50-storey glass tower on Sheikh Zayed Road, Dubai, beside Emirates Towers and an elevated Dubai Metro station with a silver arched roof. The tower has a glowing diagonal white-steel exoskeleton lattice and a curved illuminated podium canopy with the sign "SWK PROPERTY". Busy highway with light trails at dusk. | Low angle, slow push-in and tilt up the tower |
| 02 | Walk-in | Continuous move from the plaza under the curved glass canopy, through the glass doors into a double-height marble lobby: curved walnut reception desk, large illuminated SWK logo wall, a crystal bulb chandelier, a gold supercar on a display plinth. | Steady walk-in dolly |
| 03 | Level 01 Developers | Cutaway view of a luxury meeting floor seen through floor-to-ceiling glass from outside: long walnut conference table, wall-size screen of developer logos, city lights beyond. | Slow lateral drift + rise |
| 04 | Level 02 Projects | Luxury sales gallery seen through glass: illuminated architectural scale model of a city on a round table, three large framed project renders on the wall. | Slow rise to the next floor |
| 05 | Levels 03–05 | Same glass facade rising past three floors: consultation rooms, a data wall with animated charts, a lounge with bar and warm lighting. | Continuous vertical climb |
| 06 | Level 06 Team | Open-plan sales floor seen through glass at dusk, five professionals standing casually in small groups, laptops and coffee, city skyline behind. | Gentle push-in |
| 07 | Ascent | Fast glass-elevator style ascent up the outside of the lattice tower from street to rooftop, city lights falling away. | Vertical climb, slight rotation |
| 08 | Roof | Rooftop infinity pool in a circular ring around a helipad drum with an eVTOL air taxi, glowing turquoise water, sky lounge loungers, Dubai skyline at dusk. | Slow orbit |
| 09 | Lift-off | Camera rises from the rooftop helipad through a thin cloud layer, breaks out into golden-hour light. | Rise + tilt down |
| 10 | SWK Village (reuse your Veo clip) | Aerial descent through clouds over a futuristic waterfront city master plan with curved white landmark buildings, canals, parks and fountains, finishing on large gold 3D letters "SWK VILLAGE" on a plaza. | Your uploaded clip works as-is |

## Hand-off format
Send MP4s named `01-street.mp4 … 10-village.mp4`. 720p–1080p is fine; I re-encode for web (scroll-scrub friendly
all-keyframe H.264 plus a poster frame) and keep the file size mobile-friendly.
