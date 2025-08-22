# Design UI

_UI/UX strategy, design system, and component patterns._

<!-- AI_QUICK_REF
Overview: Comprehensive UI/UX design strategy with mobile-first principles, dark theme, multi-step wizard patterns
Key Rules: Mobile-first design principles, Dark theme color palette, Multi-step wizard patterns
Avoid: Desktop-first decisions, Deviating from dark theme, Breaking wizard navigation, Non-CSS Modules styling
-->

<!-- RELATED_DOCS
Implementation: db-forms.md (Form patterns), react-patterns.md (Component patterns)
Technical: technical-stack.md (Next.js config), code-structure.md (CSS organization)
Requirements: feature-requirements.md (UI requirements), business-context.md (User needs)
-->

## Strategic Overview

This document serves as the authoritative source for all UI/UX design decisions, component patterns, and implementation strategies for the Specification Builder project.

## Core UI/UX Philosophy

### Mobile-First Design Philosophy

- **Primary Design Target**: Mobile devices
- All UX decisions prioritize mobile user experience
- Desktop experience as enhancement of mobile design
- Touch-friendly UI elements throughout
- Progressive enhancement for larger screens
- Performance optimized for mobile

### Design Principles

- **Simplicity**: Clear, intuitive interfaces
- **Consistency**: Standardized patterns across the application
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Efficient rendering and minimal resource usage

## Styling Strategy

### CSS Modules Implementation

- **Approach**: Component-scoped styling with CSS Modules
- **Rationale**: Plain CSS, zero runtime overhead, clear separation of concerns, built into Next.js, automatic style scoping
- **Implementation**: Global CSS variables for theme colors, component-specific `.module.css` files, mobile-first responsive design

### Component Organization Philosophy

- **Single Responsibility**: Each component with one clear purpose
- **Composition Over Inheritance**: Build complex UIs from simple components
- **Feature-Based Organization**: Group related components by functionality

## User Experience Patterns

### Navigation Strategy

- **Simple Structure**: Clear, intuitive navigation hierarchy
- **Mobile-Friendly**: Touch-friendly navigation
- **Consistent Patterns**: Standardized behaviors

### Interaction Patterns

- **Immediate Feedback**: Visual feedback for user actions
- **Loading States**: Clear indication of async operations
- **Error Handling**: User-friendly error messages
- **Progressive Disclosure**: Show information as needed

## App Navigation Structure

### Left-Hand Navigation Panel

- Fixed left nav with main sections: Specifications, Products, New Specification, Admin (admin users only)
- Collapsible on mobile for maximum screen space
- Shows progress stats (e.g., "245/600 products reviewed")

## Specifications List View

### Grouped by Status Layout

- Sections: Draft, Published, Needs Revision, Under Review
- Each section collapsible with count badge
- Within sections: product title, date, and star rating
- Swipe actions for quick edit/delete (draft only)
- Filter system: Product brand (dropdown), Product title (search box)

## Specification Form Layout: Multi-Step Wizard

### Wizard Approach

- Multi-step wizard for specification forms
- Reduces cognitive load on small screens
- Clear progress indication
- Better error handling per step

### Wizard Steps Structure

#### Step 1: Product Selection

- Filter by brand dropdown
- Type-ahead search box
- **Excludes products already reviewed by user**
- Shows product image and name in results

#### Step 2: Product Characteristics 1

- Product type - segmented control
- Experience level
- Tobacco types (multi-select)

#### Step 3: Product Characteristics 2

- Cures (multi-select)
- Grind - segmented control
- Boolean flags - toggle switches

#### Step 4: Sensory Profile

- Tasting notes (multi-select, minimum 1)
- Nicotine level - segmented control
- Moisture level - segmented control

#### Step 5: Review & Rating

- Review text
- Star rating
- Rating boost

### Wizard Navigation Pattern

- Swipe gestures for step navigation
- Swipe left/right between steps with visual hints

## Mobile-Optimized UI Components

### Component Choices

- **Segmented controls**: For enum selections (3-5 options)
- **Toggle switches**: For boolean fields
- **Compact design**: Each wizard step fits on screen
- **Touch targets**: Minimum 48px height for interactive elements

### Multi-Select Field Pattern

- Search + chips pattern for multi-select fields
- Search box to filter available options
- Selected items as chips below search
- Chips have 'x' to remove selection

## Form Validation Pattern

### Step Validation

- Validate when swiping to next step
- All errors for current step shown at once
- Prevents progression until step is valid

## Visual Design Style

### Dark Theme Design

- Card-based design with dark theme
- **Color Palette**:
  - Content Background: #1E2128
  - Card Background: #252831 with #343741 border
  - Text: #FFFFFF
  - Link: #4693D1
  - Primary Button: #1878B9
  - Success Button: #469B3B

### Card Layout Implementation

- Cards with both border and lighter background
- Each form section in its own card
- Consistent spacing using 8px grid

## Multi-Step Form Wizard UI Design

### Wizard Structure and Navigation

- Progress bar showing completed/current/remaining steps
- Step numbers and titles visible throughout
- Previous step navigation always available
- Next step blocked until validation passes

### Form Field Organization

- Card-based layout with section headers
- Related fields grouped visually
- Inline error messages below each field
- Clear required field indicators

### Progress and State Management

- Multi-level progress indication
- Auto-save indicators and status
- Draft resume prompts
- Loading indicators for async operations

### Mobile-First Wizard Considerations

- Large tap targets for step navigation
- Gesture support between steps
- Optimized spacing for mobile screens
- Proper focus management

### Error Handling and Validation UI

- Block progression with clear error summary
- Immediate validation feedback
- Clear path to fix validation errors
- Positive feedback for completed sections

Technical Implementation: See db-forms.md for React Hook Form integration, validation patterns, and state management strategies.
