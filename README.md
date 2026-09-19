# SurakshaMap — Community Safety Reporting & Risk Intelligence

**Hackathon prototype · Community safety reporting, moderation, mapping and risk intelligence**

SurakshaMap is a responsive web application for reporting public-space safety and maintenance issues such as broken streetlights, open manholes, unsafe crossings, broken footpaths, obstructions and waterlogging.

The latest workflow separates **public reporting** from **administrative moderation**:

> **Citizen submits → Pending approval → Admin approves → Report becomes public → Public can only mark it Resolved → Admin can manage all supported statuses**

The project is designed to avoid unnecessary personal information. Public users do not need to create an account, provide a name, phone number or email address, or log in to submit a report.

---

## 1. Problem

Everyday public-space problems can remain unnoticed or unreported because people may not have a simple way to record them.

Examples include:

- Broken or inadequate street lighting
- Open manholes
- Unsafe crossings
- Broken footpaths
- Obstructions
- Waterlogging
- Other public-space hazards

A useful reporting system should make submission simple while providing a moderation workflow so that unverified public submissions are not immediately displayed as confirmed public issues.

---

## 2. Solution

SurakshaMap provides a simple reporting and moderation workflow:

1. A public user submits an issue.
2. The report receives a unique tracking token.
3. The report initially has **Pending approval** status.
4. Pending reports are hidden from the public Safety Map and Dashboard.
5. An administrator reviews the submitted report.
6. The administrator can **Approve** the report.
7. Approval changes the report to **Open** and makes it visible on the public map and dashboard.
8. A public user can track their report using its token.
9. A public user can change an approved report to **Resolved**.
10. The administrator can change an approved report to any supported administrative status.
11. Risk scoring and hotspot clustering help summarize approved public reports.

This workflow keeps the public-facing interface simple while giving the administrator control over moderation and status management.

---

## 3. Latest Approval and Status Workflow

### Public user permissions

Public users can:

- Submit a report
- Receive a tracking token
- Track their own report using the token
- View approved reports on the public map/dashboard
- Mark their own approved report as **Resolved**

Public users cannot:

- Approve reports
- Reject reports
- Change a report to **Open**
- Change a report to **Under review**
- Change a report to **Closed**
- Change a report to **Rejected**
- Access the administrator controls

### Report lifecycle

```text
                    ┌──────────────────────┐
                    │  Public user submits │
                    │       a report       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Pending approval   │
                    │  Hidden from public  │
                    └──────────┬───────────┘
                               │
                       Admin approves
                               │
                               ▼
                    ┌──────────────────────┐
                    │         Open         │
                    │ Visible to public    │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
          Public can mark              Admin can change
             Resolved                  to supported status
                 │                           │
                 ▼                           ▼
          ┌──────────────┐       ┌────────────────────────┐
          │   Resolved   │       │ Open / Under review /  │
          └──────────────┘       │ Resolved / Closed /    │
                                 │ Rejected                │
                                 └────────────────────────┘
```

### Supported statuses

| Status | Meaning | Public can set? | Admin can set? |
|---|---|---:|---:|
| `pending` | Waiting for moderation approval | No | No direct status selection; approval is used |
| `open` | Approved and active | No | Yes |
| `under_review` | Being reviewed/processed | No | Yes |
| `resolved` | Issue has been marked resolved | Yes, for the user's approved report | Yes |
| `closed` | Administrative closure | No | Yes |
| `rejected` | Administrative rejection | No | Yes |

---

## 4. Public Reporting

The public reporting form does not require:

- Name
- Phone number
- Email address
- Public account creation
- Public login

A report contains:

- Issue category
- Severity
- Description
- Approximate latitude
- Approximate longitude
- Optional photo
- Submission time
- Generated tracking token
- Approval/status information

### Issue categories

The current interface includes:

- Broken streetlight
- Open manhole
- Unsafe crossing
- Broken footpath
- Obstruction
- Waterlogging
- Other

### Severity levels

- Low
- Medium
- High
- Critical

---

## 5. Location Handling

Users can:

- Enter latitude and longitude manually
- Use the browser's **Use my location** option

The browser Geolocation API is used when permission is granted.

Coordinates are rounded before being stored by the prototype.

Geolocation generally requires a secure context such as HTTPS or localhost in modern browsers.

---

## 6. Optional Photo

A user can optionally attach an image to a report.

The application:

1. Accepts an image file.
2. Displays a preview.
3. Resizes the image in the browser when appropriate.
4. Stores the resulting image data with the browser-local report data.

The current prototype does not implement a centralized image-storage service.

---

## 7. Tracking Tokens

Every submitted report receives a tracking token.

Example:

```text
SM-AB12-CD34
```

The token can be entered on the **Track report** page.

Tracking allows the user to see:

- Current status
- Issue category
- Severity
- Description
- Submission time
- Risk information
- Recommendation
- Approval state

For a pending report, the tracking view explains that the report is waiting for administrator approval and is not yet public.

For an approved report that is not already resolved/closed/rejected, the tracking view provides the public **Mark as Resolved** action.

---

## 8. Explainable Risk Scoring

SurakshaMap uses a custom explainable risk-scoring system rather than presenting an unexplained machine-learning prediction.

The risk calculation considers factors including:

- Severity
- Issue category
- Recency
- Time of day
- Nearby/repeated reports

The output uses:

- Low
- Medium
- High
- Critical

The implementation is contained in:

```text
surakshamap-risk.js
```

The scoring system is intended for hackathon demonstration and should not be interpreted as a definitive real-world safety prediction.

---

## 9. Hotspot Clustering

Approved public reports can be grouped geographically to identify concentrated areas of reported issues.

The current prototype uses a:

**200 metre grouping radius**

Hotspot analysis can incorporate:

- Number of nearby reports
- Dominant category
- Severity/risk information
- Recent reports
- Time-of-day information
- Explanation
- Recommended action

Only approved reports are included in the public map/dashboard analysis.

Pending reports remain outside the public hotspot calculations until approved.

---

## 10. Safety Map

The Safety Map uses:

- **Leaflet**
- **OpenStreetMap**

Approved reports are displayed as map markers.

The map supports filtering by:

- Category
- Status

Opening a marker can show:

- Issue category
- Description
- Severity
- Current status
- Risk level
- Risk score
- Recommendation
- Optional report photo

Pending reports are not displayed on the public Safety Map.

---

## 11. Public Dashboard

The public Dashboard summarizes **approved reports only**.

It includes:

- Total approved reports
- Open reports
- Under-review reports
- High-risk hotspots
- Resolved reports
- Priority hotspots
- Reports by category
- Approved report information

Pending reports are intentionally excluded from the public dashboard.

The public dashboard does not contain status-editing controls.

The public user's status-changing action is provided through the tracking workflow, where an approved report can be marked **Resolved**.

---

## 12. Admin Moderation

The project includes a separate:

```text
admin.html
```

page.

The admin interface is responsible for moderation and status management.

### Admin capabilities

The administrator can:

- Sign in
- Sign out
- View pending reports
- View approved reports
- Approve pending reports
- Change approved reports to:
  - Open
  - Under review
  - Resolved
  - Closed
  - Rejected
- View report details
- See moderation statistics

When an administrator approves a pending report:

```text
approved = true
status = open
```

The approval time and approving administrator marker are also recorded in the browser-local report object.

### Demo administrator login

The current hackathon prototype uses a frontend demo login.

The current demo credentials in `admin.js` are:

```text
Username: admin
Password: suraksha2026
```

**These credentials are not suitable for production.**

They are included only for the hackathon prototype.

Do not use this authentication approach for a real public safety deployment.

---

## 13. Privacy

The project includes a separate:

```text
privacy.html
```

page.

The public workflow is designed to avoid unnecessary personal information.

The report form does not ask for:

- Name
- Phone number
- Email
- Account registration

The prototype uses browser-local storage for report data.

The privacy page explains the project's data-handling approach and responsible-use considerations.

---

## 14. Data Architecture — Important Prototype Limitation

The current project is a **browser-local hackathon prototype**.

Report data is stored using:

```text
localStorage
```

The admin interface reads and modifies the same browser-local report store.

This means the current implementation does **not** provide a centralized multi-user backend.

### What this means in practice

If:

```text
Citizen submits on Phone A
```

and:

```text
Admin opens admin.html on Laptop B
```

the admin on Laptop B will not automatically receive the Phone A report because the prototype stores data locally in each browser.

For a real deployment, the architecture should be changed to a centralized backend such as:

```text
Citizen device
      ↓
Secure backend / database
      ↓
Central report store
      ↓
Authenticated admin
      ↓
Moderation
      ↓
Public map/dashboard
```

A production implementation should also enforce the public/admin permissions on the server or database security layer, not only in JavaScript.

---

## 15. Responsive Design

The website is designed to remain responsive across:

- Small mobile phones
- Large mobile phones
- Tablets
- Laptops
- Desktop screens

Responsive behavior covers:

- Mobile navigation
- Report form
- Location controls
- Photo controls
- Tracking page
- Safety map
- Dashboard cards
- Tables
- Admin moderation table
- Footer
- Horizontal overflow prevention

The main responsive styling is in:

```text
styles.css
```

The responsive implementation also keeps the mobile navigation above Leaflet map layers so the map does not cover the opened navigation menu.

### Important

The approval/status update does **not require replacing `styles.css`**.

The latest status workflow changes are in the HTML and JavaScript files.

---

## 16. Technology Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript

No frontend framework is required.

### Mapping

- Leaflet
- OpenStreetMap

### Browser APIs

- Geolocation API
- File API / FileReader
- localStorage
- sessionStorage

### Risk intelligence

Custom JavaScript:

```text
surakshamap-risk.js
```

### Deployment

The project is suitable for static hosting such as GitHub Pages.

---

## 17. Project Structure

```text
SurakshaMap/
│
├── index.html
├── styles.css
├── app.js
├── surakshamap-risk.js
│
├── admin.html
├── admin.js
├── privacy.html
│
├── SurakshaMap_logo.png
└── README.md
```

### File responsibilities

| File | Purpose |
|---|---|
| `index.html` | Public SurakshaMap interface, reporting, tracking, map and dashboard views |
| `styles.css` | Main visual design and responsive/mobile layout |
| `app.js` | Public reporting, tracking, approval visibility, public resolution, map and dashboard logic |
| `surakshamap-risk.js` | Explainable risk scoring and hotspot clustering |
| `admin.html` | Administrator login and moderation interface |
| `admin.js` | Demo admin authentication, report approval and administrator status management |
| `privacy.html` | Privacy policy |
| `SurakshaMap_logo.png` | Project logo |
| `README.md` | Project documentation |

---

## 18. Local Development

There is no frontend build step.

From the project folder, run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Using a local server is recommended instead of opening the HTML file directly with:

```text
file://
```

This is especially useful when testing:

- Geolocation
- External JavaScript libraries
- External map tiles
- Browser storage

---

## 19. GitHub Pages Deployment

A typical deployment process is:

1. Open the GitHub repository.
2. Upload or replace the latest project files.
3. Commit the changes.
4. Open **Settings**.
5. Open **Pages**.
6. Select deployment from the required branch.
7. Select the repository root as the folder if the files are stored in the root.
8. Save the Pages configuration.
9. Wait for GitHub Pages to publish.
10. Open the published URL.

Make sure these files are committed:

```text
index.html
styles.css
app.js
surakshamap-risk.js
admin.html
admin.js
privacy.html
SurakshaMap_logo.png
README.md
```

### If the CSS appears missing

If the published website shows HTML without styling:

1. Open the published website in an incognito/private window.
2. Check the direct stylesheet URL:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/styles.css
```

3. Confirm that the stylesheet is being served.
4. Confirm that `styles.css` is in the same directory as `index.html`.
5. Check GitHub Pages deployment status.
6. Refresh after the latest deployment finishes.

The HTML uses:

```html
<link rel="stylesheet" href="styles.css" />
```

---

## 20. Security Considerations

This project is a hackathon prototype.

The current admin authentication is intentionally simple and frontend-based. It must not be treated as secure production authentication.

For production deployment, implement:

- Server-side authentication
- Role-based authorization
- Database security rules
- Server-side validation
- Rate limiting
- Spam/abuse protection
- Image validation
- Secure image storage
- Audit logs
- Secure sessions
- Data retention/deletion controls
- Monitoring
- Error reporting
- Appropriate privacy and consent controls

Most importantly:

> Never rely on hiding buttons in frontend JavaScript as the security boundary.

A production system must enforce:

```text
Public user
    → submit report
    → track own report
    → resolve approved report

Admin
    → approve/reject
    → change administrative statuses
```

at the backend/database authorization layer as well.

---

## 21. Responsible Use

SurakshaMap is a community reporting and public-space visibility tool.

It does not:

- Predict crime
- Identify people
- Profile individuals
- Establish that a person is dangerous
- Guarantee that a report is true
- Guarantee official action
- Replace human verification or responsible authorities

Risk levels and hotspots are indicators generated from submitted reports and the project's documented rules.

Reports should be appropriately reviewed before real-world action is taken.

---

## 22. Hackathon Demonstration Flow

### Step 1 — Public Home

Open the SurakshaMap homepage.

Explain:

- The community safety problem
- Minimal information collection
- Reporting workflow
- Map and risk intelligence

### Step 2 — Submit a report

Open:

**Report an issue**

Enter:

- Category
- Severity
- Description
- Location
- Optional photo

Submit the report.

The system generates a tracking token.

The report should now show:

**Pending approval**

### Step 3 — Demonstrate public tracking

Open:

**Track report**

Enter the tracking token.

Show that the report is:

**Pending approval**

and explain that it is not yet visible on the public map/dashboard.

### Step 4 — Admin approval

Open:

```text
admin.html
```

Sign in using the demo administrator credentials.

Find the pending report and click:

**Approve**

The report becomes:

**Open**

and is now eligible for public display.

### Step 5 — Public dashboard/map

Return to the public site.

Open:

- Safety map
- Dashboard

The approved report should now appear.

### Step 6 — Public resolution

Open:

**Track report**

using the same token.

Use:

**Mark as Resolved**

The public user can perform this status change without receiving access to the administrator controls.

### Step 7 — Admin status control

Return to the admin page.

Demonstrate that the administrator can select:

- Open
- Under review
- Resolved
- Closed
- Rejected

This demonstrates the separation between public and administrative status permissions.

---

## 23. Project Status

SurakshaMap is a **hackathon prototype** demonstrating:

- Minimal-information community reporting
- Anonymous-style public reporting
- Tracking without public accounts
- Administrator moderation
- Approval-before-public-visibility
- Public resolution workflow
- Administrator-controlled statuses
- Explainable risk scoring
- Geographic hotspot clustering
- Interactive map visualization
- Responsive mobile/tablet/desktop design
- Privacy-aware reporting concepts

### Current architectural limitation

The current implementation uses browser-local storage rather than a centralized backend.

Therefore, it is suitable for demonstrating the workflow in a controlled hackathon environment, but it is not yet a production multi-user reporting platform.

---

## 24. External Services and Libraries

The project uses:

### Leaflet

Used for the interactive Safety Map.

### OpenStreetMap

Used for map tiles and geographic visualization.

These services have their own terms, attribution requirements and usage policies.

---

## 25. Future Improvements

Potential next-stage improvements include:

- Centralized backend/database
- Secure admin authentication
- Server-side role authorization
- Real-time moderation updates
- Multi-device report synchronization
- Secure cloud image storage
- Report audit history
- Notification system
- Advanced geospatial analysis
- Abuse/spam prevention
- Production-grade privacy controls
- Administrative activity logs

---

## 26. License

No separate open-source license is currently specified for the project.

If the project is released as open source, add an appropriate `LICENSE` file and update this section.
