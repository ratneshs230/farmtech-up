# Tool Building Prompt Template

This template is used by the Tool Builder agent to generate web applications.

## Variables

- `{{TOOL_NAME}}` - English name of the tool
- `{{TOOL_NAME_HINDI}}` - Hindi name of the tool
- `{{DESCRIPTION}}` - Short description
- `{{PAIN_POINT}}` - Problem it solves
- `{{TARGET_USERS}}` - Who will use it
- `{{KEY_FEATURES}}` - List of features
- `{{AI_FEATURES}}` - AI capabilities to simulate

## Base Prompt

Build a mobile-first web application for farmers with the following specifications:

### Tool Details
- Name: {{TOOL_NAME}}
- Hindi Name: {{TOOL_NAME_HINDI}}
- Description: {{DESCRIPTION}}

### Requirements
1. Mobile-first responsive design
2. Works on basic Android smartphones
3. Hindi and English bilingual UI
4. Large touch-friendly buttons (min 48px)
5. Fast loading, minimal dependencies
6. Offline-capable where possible

### Design Theme
- Primary: Green (#4CAF50)
- Secondary: Orange (#FF9800)
- Background: Light (#F5F5F5)
- Agricultural/farming aesthetic

### Files to Create
1. `index.html` - Main HTML structure
2. `style.css` - Mobile-first styles
3. `script.js` - Application logic

### AI Feature Simulation
Since this is a front-end demo, simulate AI responses with:
- Realistic delays (1-3 seconds)
- Pre-defined sample data
- Mock API responses
