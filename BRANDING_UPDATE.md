# Branding Update - Remove Lovable & Rename to Hiring Pipeline

## Changes Made

### 1. ✅ Removed Lovable App Icon from Title Bar

**File Changed:** `index.html`

**What was done:**
- Added an empty favicon to prevent any default icon from showing
- This removes the Lovable logo from the browser tab

**Code Added:**
```html
<link rel="icon" href="data:," />
```

This creates an invisible favicon, ensuring no Lovable or default browser icon appears in the tab.

---

### 2. ✅ Renamed "Kanban Project" to "Hiring Pipeline"

All instances of "Kanban Project" have been renamed to "Hiring Pipeline" throughout the application.

**Files Changed (9 files):**

1. **`src/components/dashboard/ApplicantTable.tsx`**
   - Button text: "Create Hiring Pipeline"
   - Mobile: "Create Pipeline"

2. **`src/components/dashboard/CreateProjectDialog.tsx`**
   - Dialog title: "Create Hiring Pipeline"
   - Description: "Create a new hiring pipeline with..."
   - Label: "Pipeline Name"
   - Placeholder: "e.g., Q1 2026 Hiring Pipeline"
   - Button: "Create Pipeline"

3. **`src/components/dashboard/DataSourceTabs.tsx`**
   - Tab label: "Hiring Pipelines"
   - Mobile: "Pipelines"

4. **`src/components/dashboard/KanbanProjectsList.tsx`**
   - Empty state: "No Hiring Pipelines"
   - Instructions: "click 'Create Hiring Pipeline' to get started"

5. **`src/hooks/useKanbanProjects.ts`**
   - Error messages: "Failed to load hiring pipelines" / "Failed to create hiring pipeline"

6. **`src/services/api.ts`**
   - API comments updated to "Hiring Pipelines Management"
   - All function comments updated

7. **`src/pages/Index.tsx`**
   - Comments updated: "Navigate to hiring pipelines tab" / "viewing a specific hiring pipeline"

8. **`index.html`**
   - Added empty favicon

---

## Visual Changes

### Before:
- **Browser Tab:** Lovable icon 🎨
- **Tab Label:** "Kanban Projects"
- **Button:** "Create Kanban Project"
- **Dialog:** "Create Kanban Project"
- **Empty State:** "No Kanban Projects"

### After:
- **Browser Tab:** No icon (clean) ✓
- **Tab Label:** "Hiring Pipelines"
- **Button:** "Create Hiring Pipeline"
- **Dialog:** "Create Hiring Pipeline"
- **Empty State:** "No Hiring Pipelines"

---

## Text Replacements Summary

| Location | Old Text | New Text |
|----------|----------|----------|
| Tab | Kanban Projects | Hiring Pipelines |
| Tab (Mobile) | Kanban | Pipelines |
| Button | Create Kanban Project | Create Hiring Pipeline |
| Button (Mobile) | Create Project | Create Pipeline |
| Dialog Title | Create Kanban Project | Create Hiring Pipeline |
| Dialog Label | Project Name | Pipeline Name |
| Dialog Button | Create Project | Create Pipeline |
| Empty State | No Kanban Projects | No Hiring Pipelines |
| Description | kanban project | hiring pipeline |
| Error Messages | Kanban project | hiring pipeline |
| API Comments | Kanban Projects | Hiring Pipelines |

---

## Terminology Update

**Old Terminology:**
- Kanban Project
- Project
- Kanban Projects

**New Terminology:**
- Hiring Pipeline
- Pipeline
- Hiring Pipelines

---

## Benefits of "Hiring Pipeline" Naming

1. **More Descriptive:** Clearly indicates it's for managing hiring processes
2. **Industry Standard:** "Hiring Pipeline" is a recognized term in HR/recruitment
3. **Professional:** Sounds more enterprise and purpose-driven
4. **Clear Purpose:** Users immediately understand what it's for
5. **Better SEO:** "Hiring Pipeline" is a commonly searched term

---

## Deployment

```bash
cd c:\Users\mohda\devbroz\devbroz-applicant-management

git add .

git commit -m "Remove Lovable icon and rename Kanban to Hiring Pipeline

- Add empty favicon to remove Lovable branding
- Rename all 'Kanban Project' references to 'Hiring Pipeline'
- Update button text, labels, and descriptions
- Update error messages and API comments
- Improve professional terminology"

git push
```

Railway will auto-deploy in 1-2 minutes.

---

## Testing Checklist

- [ ] Browser tab shows no icon (or blank icon)
- [ ] No Lovable logo visible anywhere
- [ ] Tab shows "Hiring Pipelines" instead of "Kanban Projects"
- [ ] Button says "Create Hiring Pipeline"
- [ ] Dialog title says "Create Hiring Pipeline"
- [ ] Dialog label says "Pipeline Name"
- [ ] Empty state says "No Hiring Pipelines"
- [ ] Mobile shows "Pipelines" in tab
- [ ] Mobile button says "Create Pipeline"
- [ ] Error messages say "hiring pipeline"

---

## Notes

- The internal variable names and file names (e.g., `KanbanProject`, `kanban-projects`) remain unchanged to avoid breaking existing functionality
- Only user-facing text has been updated
- The backend API endpoints remain the same (`/api/projects`)
- The database collection name remains `kanban_projects`

This is intentional to ensure:
- No breaking changes
- Backward compatibility
- Smooth deployment
- Focus on user-facing improvements

---

## Result

✅ **Clean, professional branding**
- No Lovable references
- Industry-standard terminology
- Clear, purposeful naming
- Better user understanding
