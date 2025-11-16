# Prize Panda Design Guidelines

## Design Approach
**System-Based Approach** - Drawing from fintech and dashboard design patterns (Stripe, PayPal, Coinbase) emphasizing trust, clarity, and efficiency. This rewards platform prioritizes usability and professional credibility over visual flair.

## Core Design Elements

### Typography
- **Primary Font**: Inter or DM Sans via Google Fonts
- **Headings**: Font weight 600-700, sizes: text-3xl (dashboard titles), text-2xl (section headers), text-xl (card headers)
- **Body**: Font weight 400-500, text-base for primary content, text-sm for labels and metadata
- **Numerical Data**: Tabular numbers (font-feature-settings: "tnum"), weight 600 for emphasis on balances and amounts

### Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 consistently
- Component padding: p-4 to p-8
- Section spacing: space-y-6 to space-y-8
- Container margins: mx-4 to mx-8
- Grid gaps: gap-4 to gap-6

**Page Structure**:
- Maximum content width: max-w-6xl for admin panels, max-w-2xl for forms and dashboards
- Consistent horizontal padding: px-4 md:px-8
- Vertical rhythm: py-6 to py-8 between major sections

## Component Library

### Navigation
- **Top Bar**: Fixed header with logo left, user info/logout right, h-16, subtle bottom border
- **Admin Sidebar**: w-64 fixed left sidebar for admin panel with navigation items, hidden on mobile (drawer pattern)

### Authentication Pages (Login/Register)
- **Layout**: Centered card on clean background, max-w-md
- **Card Structure**: p-8, rounded-lg, subtle shadow
- **Form Elements**: Stacked vertically with space-y-4
- **Input Fields**: h-12, px-4, rounded-md, full-width with clear labels above
- **Submit Button**: w-full, h-12, rounded-md, weight 600 text

### Dashboard (Main User Interface)
- **Hero Section**: Compact welcome banner with username, h-24, px-6
- **Gift Code Card**: Prominent card at top, p-6, contains input field + redeem button in horizontal layout (flex)
- **Balance Display**: Large numerical display (text-4xl, weight 700) in dedicated card, p-8, centered
- **Withdraw Button**: Full-width within card, h-14, prominent positioning below balance

### Withdrawal Page
- **Form Container**: Centered card, max-w-lg, p-8
- **Amount Input**: Large text input with ₹ prefix indicator, h-14
- **UPI ID Input**: Standard input field, h-12
- **Validation Message**: text-sm positioned above submit button when balance < 5₹
- **Submit Button**: w-full, h-14

### Admin Panel (/secret)
- **Password Gate**: Full-screen centered form, max-w-sm
- **Dashboard Layout**: Two-column on desktop (sidebar + main content)
- **User Table**: Full-width table with alternating row backgrounds, px-4 py-3 cells
- **Table Columns**: Username, Balance, Join Date, Actions (view/edit icons)
- **Request Cards**: Grid of withdrawal requests, grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- **Gift Code Manager**: Form section + active codes table below

### Cards & Containers
- **Primary Cards**: p-6 to p-8, rounded-lg, subtle shadow
- **Compact Cards**: p-4, rounded-md (for lists/grids)
- **Section Dividers**: border-t with my-8 spacing

### Forms
- **Labels**: text-sm, weight 500, mb-2, positioned above inputs
- **Input Fields**: h-12, px-4, rounded-md, border focus states
- **Select Dropdowns**: Same dimensions as inputs, with chevron icon
- **Buttons**: h-12 standard, h-10 for secondary actions, px-6, rounded-md

### Data Display
- **Balance/Prize Numbers**: text-4xl to text-5xl, weight 700, tabular numerals
- **Currency Symbol**: text-2xl, weight 600, positioned inline before number
- **Status Badges**: px-3 py-1, rounded-full, text-xs, weight 600 (for pending/approved/declined)
- **Info Rows**: flex justify-between, py-3, border-b except last child

### Admin Features
- **Create Gift Code Modal**: Fixed overlay (z-50), centered card max-w-lg
- **Form Fields**: Code input, Prize amount (₹), User limit (number), Expiry (datetime-local)
- **Action Buttons**: Approve (primary), Decline (secondary outline), Cancel (text-only)
- **Data Tables**: Responsive, scroll-x on mobile, sticky header row

### Home/Landing (Minimal)
- **Header**: Simple top bar with logo and subscribe button, h-20
- **Hero**: Centered content, py-20, max-w-2xl with headline (text-5xl) and subscribe CTA
- **Subscribe Button**: Large CTA button, h-14, px-8

## Animations
**None** - Static, reliable interface prioritizing performance and trust

## Images
**No hero images** - This is a functional dashboard application. Use geometric patterns or subtle gradients in login/landing backgrounds only if needed for visual interest. Focus remains on clarity and data presentation.