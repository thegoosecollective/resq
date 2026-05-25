# Res-Q — Real-Time Emergency Communication for Residential Buildings



## User Journeys

### 🏠 Resident — Reporting Your Status

1. Visit the homepage and enter your building's access code
2. Select **"I'm a Resident"** on the building page
3. Fill in the report form:
   - Select your floor and unit from the dropdowns
   - Enter how many people are/were in your unit
   - Select how many have already made it out
   - Choose your status — the options available adapt based on your occupant counts (e.g. if everyone is out, only "All evacuated" shows)
   - If you need help, select your resource requests (mobility aid, pet evacuation, medical assistance)
   - Add any notes for responders (e.g. "oxygen tank in bedroom", "non-ambulatory")
4. Submit → you're taken to a confirmation page showing your submitted report
5. From the confirmation page you can:
   - **Edit your report** — form reloads pre-populated with your existing submission
   - **Wrong unit?** — start fresh with a clean form

The form has real-time validation — required fields highlight in red if you try to submit without filling them in. If you try to submit for a different unit than your original report, you'll see a warning first.

---

### 👨‍👩‍👧 Family Member — Monitoring a Loved One

1. Enter the building access code on the homepage
2. Select **"I'm a Family Member"**
3. You'll see the building dashboard — a colour-coded grid of every unit:
   - ⬜ Grey — no report submitted yet
   - 🟢 Green — everyone out safely
   - 🔵 Blue — all people out, but pet rescue needed
   - 🟡 Yellow — needs assistance evacuating
   - 🔴 Red — life-threatening emergency
4. Use the floor dropdown to filter by floor
5. Click any unit to see its detail view:
   - Current status and label
   - Occupant counts (e.g. 2 of 3 evacuated)
   - Resource requests
   - Last updated timestamp
   - Responder update (if a first responder has attended — deceased status is shown as "In progress" to protect family members)

---

### 🚒 First Responder — Full Dashboard Access

1. Navigate to `/responder`
2. Enter the building access code (distributed via QR code during building onboarding)
3. You're taken to the full responder dashboard:
   - Colour-coded unit grid (same as family, but with responder status overlays)
   - Unit count — X/Y units reporting
   - Critical count — how many emergency and assistance units at a glance
   - Floor filter dropdown
   - Status filter dropdown — filter by Critical, Assistance, Evacuated, Pet rescue, In progress, No report, Deceased
4. Colours update for responders based on operational status:
   - 🟠 Orange — responder has marked unit as in progress
   - 🟢 Green — responder has confirmed evacuation
   - ⬛ Dark grey — deceased (responder view only)
5. Click any unit for full details:
   - Everything the family sees, plus resident notes
   - Current responder status displayed clearly
   - Buttons to update responder status: In progress / All evacuated / Deceased
   - Status updates save instantly and refresh the page

---

## Pages

| Page | Route | Purpose |
|---|---|---|
| Homepage | `/` | Building code entry for residents and family |
| Responder entry | `/responder` | Building code entry for first responders |
| Role selection | `/building/[id]` | Choose resident or family member |
| Report form | `/building/[id]/report` | Resident status submission and editing |
| Confirmation | `/building/[id]/report/confirmation` | Post-submission summary with edit options |
| Dashboard | `/building/[id]/dashboard` | Unit grid — limited view for family, full view for responders |
| Unit detail | `/building/[id]/unit/[unitId]` | Individual unit info — role-aware display |

---

## Key Design Decisions

**No authentication** — the system is trust-based. Residents access via building code, responders via a separate access-code-guarded route. This keeps the flow fast during emergencies — no login friction.

**Occupant-aware status** — residents report total occupants and how many have evacuated. The status options adapt dynamically (e.g. "everyone out safely" only appears when evacuated count matches total occupants).

**Role-aware display** — the same unit detail page shows different information depending on role. Family members never see notes or the word "deceased." First responders see everything.

**Deceased masking** — if a responder marks a unit as deceased, family members see "In progress" instead. This is intentional — families shouldn't learn this information through a dashboard before being officially notified.

**Pet rescue as its own status** — evacuated units with a pet evacuation resource request display in blue on the dashboard, distinguishing them from fully clear green units.

**Overwrite warning** — if a resident tries to submit for a different unit than their original report, they see a warning with the original submission timestamp before proceeding.

---

## Known Limitations

- **No real-time push updates** — the dashboard reflects data at page load. Users need to refresh to see updates. Server-sent events or WebSockets are planned for a future iteration.
- **No authentication** — a determined user could access the responder dashboard by guessing the URL pattern. Mitigated by the access code requirement, but not bulletproof.
- **Accidental overwrites** — without auth, there's no way to prevent one resident from accidentally submitting for another's unit. The overwrite warning helps, but doesn't fully solve this.
- **Email notifications** — planned but not yet implemented. Resend integration is the next development milestone.

---

## Tech Stack

- **Next.js 15** — App Router, server components, server actions
- **PostgreSQL + Prisma 7** — database with PrismaPg adapter
- **Tailwind CSS** — utility-first styling
- **TypeScript** — full type safety throughout
- **Docker + Nginx** — VPS deployment