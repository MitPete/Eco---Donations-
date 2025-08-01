# Frontend Reorganization Plan

## Current Issues
- Loose files scattered throughout the root directory
- Outdated backup files and test artifacts
- Inconsistent file naming and organization
- Mix of development and production files
- Duplicate functionality across different files

## New Structure

```
frontend/
├── public/                     # Static public assets
│   ├── index.html             # Main entry point
│   ├── assets/                # Images, icons, fonts
│   └── contracts/             # Contract JSONs for production
├── src/                       # Source code
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Page-specific components
│   ├── services/              # Business logic and API calls
│   ├── utils/                 # Utility functions
│   ├── styles/                # CSS/SCSS files
│   └── config/                # Configuration files
├── tests/                     # All test files
├── scripts/                   # Build and utility scripts
├── docs/                      # Documentation
├── archive/                   # Historical files (cleaned)
└── dist/                      # Built production files
```

## Actions Required
1. Move HTML files to appropriate locations
2. Consolidate and organize CSS files
3. Reorganize JavaScript modules
4. Clean up outdated files
5. Standardize naming conventions
6. Update build configuration
