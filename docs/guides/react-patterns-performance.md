---
complianceLevel: required
status: stable
tags: [react, hooks, optimization, performance, app-router, next.js]
id: NjQJhb5-
---

# React Patterns

*Comprehensive React patterns, performance optimization, and infinite loop prevention for the Specification Builder.*

<!-- AI_QUICK_REF
Overview: Critical anti-patterns to avoid
Key Rules: useCallback for event handlers (line 31), useMemo for derived state (line 48), React.memo for components (line 69), Server vs Client patterns (line 126)
Avoid: Object/array in dependency arrays, Dual data fetching, Functions in render without useCallback, Missing React.memo
-->


> **📋 Quick Navigation:**
> - **Essential Context**: 
>   - [🔥 Code Rules Quality](code-rules-quality.md "Context: TypeScript return types and ESLint rules") 
>   - [Database-Form Integration](database-patterns-forms.md "Context: React Hook Form patterns and database integration")
> - **UI Implementation**: 
>   - [Form Management](form-patterns-validation.md "Context: Form state management and validation patterns")
>   - [UI/UX Design Decisions](design-patterns-ui-ux.md "Context: Component styling and responsive design")
>   - [UI/UX Patterns](react-patterns-ui-ux.md "Context: Component architecture and interaction patterns")
> - **Technical Context**: 
>   - [Technical Stack](../project/technical-stack.md "Context: Next.js 15, React 18, and CSS Modules configuration")
>   - [API Design](api-patterns-design.md "Context: API integration patterns for React components")
>   - [Prevent React Effect Loops](react-prevent-effect-loops.md "Context: Debugging infinite loops in useEffect")
>   - [Authentication](api-patterns-auth.md "Context: User authentication in React components")

> **📋 This document consolidates React-specific guidance from multiple sources. For component organization and TypeScript standards, see [Code Rules Quality](code-rules-quality.md).**

## Executive Summary

This document defines core React patterns required across all application components to ensure performance, stability, and maintainability. It establishes mandatory practices for hooks usage (useCallback, useMemo, useEffect), component optimization with React.memo, and proper implementation of Next.js App Router architecture with server and client components. All developers must follow these patterns to prevent common performance issues and infinite render loops. Strict compliance with dependency array management and memoization practices is required.

## Key Principles

1. **Memoization First**: All event handlers must use useCallback and all computed values must use useMemo with appropriate dependency arrays to prevent unnecessary re-renders.

2. **Stable References**: Never create objects, arrays, or functions directly in render or dependency arrays; always memoize or extract them.

3. **Server-Client Separation**: Follow strict Next.js App Router patterns for server vs. client components to optimize performance and bundle size.

4. **Single Source of Truth**: Avoid duplicate data fetching across components and contexts; centralize data access patterns.

5. **Explicit Dependencies**: All hooks must have exhaustive, properly memoized dependency arrays with no unstable references.

6. **Strategic Optimization**: Apply React.memo selectively to pure components that render frequently or have expensive rendering logic.

7. **Effect Discipline**: Every useEffect must have a clearly defined purpose, proper cleanup, and carefully managed dependencies.

## ⚠️ **CRITICAL**: React Effect Loop Prevention

React useEffect hooks can cause infinite loops if not properly managed. These patterns are mandatory:

1. **⚠️ CRITICAL: Functions that update state must be wrapped in `useCallback`**
2. **⚠️ CRITICAL: Derived state must use `useMemo`**  
3. **🔥 HIGH: Context interactions must have clear ownership**

### ⚠️ **CRITICAL**: useCallback Pattern (Required)
```typescript
// ✅ Correct: Stable event handler
const handleSubmit = useCallback((data: FormData): void => {
  setSubmitting(true);
}, []);

// ❌ BLOCKS DEPLOYMENT: Creates new function on every render
const handleSubmit = (data: FormData): void => {
  setSubmitting(true);
};
```

### ⚠️ **CRITICAL**: useMemo Pattern (Required)
```typescript
// ✅ Correct: Memoized derived state
const filteredProducts = useMemo(() => 
  products.filter(product => product.brand === selectedBrand),
  [products, selectedBrand]
);

// ❌ BLOCKS DEPLOYMENT: Creates new array on every render
const filteredProducts = products.filter(product => product.brand === selectedBrand);
```

### 🔥 **HIGH**: Context Interaction Guidelines
- **Single Source of Truth**: One context should own data fetching
- **No Circular Dependencies**: Avoid circular dependencies between contexts
- **Clear Ownership**: Define which context is responsible for loading specific data
- **No Dual Fetching**: Never duplicate data fetching logic

## 🔥 **HIGH**: React Performance Optimization

### 🔥 **HIGH**: Component Optimization Patterns

#### 🔥 **HIGH**: React.memo Usage
```typescript
// ✅ Memoize components that receive stable props
const ProductCard = React.memo(({ product, onSelect }: ProductCardProps): JSX.Element => {
  return (
    <div>
      {/* component content */}
    </div>
  );
});
```

#### ⚙️ **MEDIUM**: Custom Hook Patterns
```typescript
// ✅ Extract complex state logic to custom hooks
const useFormWizard = (initialData: FormData) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);

  const nextStep = useCallback((): void => {
    setCurrentStep(prev => prev + 1);
  }, []);

  return { currentStep, formData, nextStep };
};
```

### 🛠️ **REFACTOR**: File Size Integration
When components approach the **⚠️ CRITICAL: 150-line limit**, apply these patterns:

- Extract complex `useState` and `useEffect` logic to custom hooks
- Keep component focused on rendering and event handling
- Use container/presentation pattern to separate concerns

```typescript
// Container (manages state and data)
const ProductsContainer = (): JSX.Element => {
  const { products, loading, error } = useProducts();
  
  return (
    <ProductsList 
      products={products}
      loading={loading}
      error={error}
    />
  );
};

// Presentation (pure rendering)
const ProductsList = React.memo(({ products, loading, error }: ProductsListProps): JSX.Element => {
  // Pure rendering logic only
});
```

## 🔥 **HIGH**: Next.js 15 App Router React Patterns

### ⚠️ **CRITICAL**: Server vs Client Component Hook Usage

**⚠️ CRITICAL: Server Components - Forbidden Patterns:**
```typescript
// ❌ BLOCKS DEPLOYMENT: NEVER in Server Components
'use client'; // Don't add this to Server Components
const [state, setState] = useState(); // Hooks not allowed
useEffect(() => {}, []); // Browser APIs not available
```

**✅ REQUIRED: Client Components - Required Patterns:**
```typescript
'use client';
// ✅ Required for any component using hooks
export default function InteractiveComponent(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const fetchProducts = async (): Promise<void> => {
      const data = await getProducts();
      setProducts(data);
    };
    
    fetchProducts();
  }, []);
  
  return <div>{/* render products */}</div>;
}
```

### ⚙️ **MEDIUM**: Component Composition Patterns

```typescript
// Server Component (default)
export default async function ProductPage({ params }: { params: { id: string } }): Promise<JSX.Element> {
  const product = await getProduct(params.id); // Server-side data fetching
  
  return (
    <div>
      {/* Server Component - static content */}
      <ProductDetails product={product} />
      
      {/* Client Component - interactive features */}
      <ProductInteractions productId={product.id} />
      
      {/* Server Component - more static content */}
      <RelatedProducts category={product.category} />
    </div>
  );
}
```

### 🔥 **HIGH**: Form Patterns with App Router

**✨ PREFERRED: Server Actions (Preferred for Forms):**
```typescript
// app/create-specification/actions.ts
'use server';
export async function createSpecification(formData: FormData): Promise<void> {
  const data = {
    productId: formData.get('productId') as string,
    // ... other fields
  };
  
  await prisma.specification.create({ data });
  redirect('/specifications');
}

// In component
export default function CreateForm(): JSX.Element {
  return (
    <form action={createSpecification}>
      <input name="productId" />
      <button type="submit">Create</button>
    </form>
  );
}
```

**🔥 HIGH: Client-Side Forms (When Validation Needed):**
```typescript
'use client';
export default function ValidatedForm(): JSX.Element {
  const { register, handleSubmit } = useForm<FormData>();
  
  const onSubmit = useCallback(async (data: FormData): Promise<void> => {
    await fetch('/api/specifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, []);
  
  return <form onSubmit={handleSubmit(onSubmit)}>{/* form fields */}</form>;
}
```

## 🔥 **HIGH**: React Performance Optimization Validation

### 🔥 **HIGH**: AI Validation for Performance Patterns

<!-- AI_VALIDATION
React Performance Patterns:

useCallback Requirements:
- Event handlers: /const\s+handle\w+\s*=\s*useCallback\(/
- Function props: Check for function props without useCallback
- Stable dependencies: Only primitives/memoized functions in deps

useMemo Requirements:
- Derived state: /const\s+\w+\s*=\s*useMemo\(/
- Complex computations: Object/array operations memoized
- Large dataset operations: filter/map use useMemo

React.memo Requirements:
- Component exports: /export.*React\.memo\(/
- Props comparison: Custom comparator for complex props

Critical Performance Anti-Patterns:
1. Functions passed as props without useCallback
2. Derived state not using useMemo  
3. Components receiving new objects every render
4. useEffect dependency arrays with unstable references
5. Missing React.memo on components with stable props
-->

## ⚠️ **CRITICAL**: Specific Anti-Patterns to Avoid

### ⚠️ **CRITICAL**: Effect Loop Anti-Patterns
- **⚠️ CRITICAL: Dual Fetching**: Don't fetch the same data from both component and context
- **⚠️ CRITICAL: Unstable Dependencies**: Avoid functions that return new objects/arrays in dependency arrays
- **🔥 HIGH: Cross-Context Updates**: One context update should not trigger another context cyclically
- **🔥 HIGH: Ignored Dependency Warnings**: Always address React Hook dependency warnings

### 🔥 **HIGH**: Performance Anti-Patterns
- **🔥 HIGH: Missing useCallback**: Event handlers not wrapped in useCallback
- **🔥 HIGH: Missing useMemo**: Derived state computed on every render
- **🔥 HIGH: Unnecessary Re-renders**: Components not memoized when receiving stable props
- **⚠️ CRITICAL: Large Component Files**: Components exceeding 150 lines without splitting

## ⚠️ **CRITICAL**: TypeScript Return Types (Required)

All React component and hook functions must have explicit return types:

```typescript
// ✅ Correct: Explicit return types
const MyComponent = (props: Props): JSX.Element => {
  return <div>{props.children}</div>;
};

const useCustomHook = (): { value: string; setValue: (v: string) => void } => {
  const [value, setValue] = useState('');
  return { value, setValue };
};

// ❌ BLOCKS DEPLOYMENT: Missing return types
const MyComponent = (props: Props) => {
  return <div>{props.children}</div>;
}
```

## 🔥 **HIGH**: Mandatory Performance Requirements

### 🔥 **CRITICAL**: ALL components must use React.memo
```typescript
// ✅ MANDATORY - React.memo wrapper
const ProductCard = ({ product }: Props): JSX.Element => {
  return <div>{product.name}</div>;
};
export default React.memo(ProductCard);
```

### 🔥 **CRITICAL**: ALL event handlers must use useCallback
```typescript
// ✅ MANDATORY - useCallback wrapper
const handleClick = useCallback(() => {
  setData(newData);
}, [newData]);
```

### 🔥 **CRITICAL**: ALL derived state must use useMemo
```typescript
// ✅ MANDATORY - useMemo wrapper
const filteredProducts = useMemo(() => 
  products.filter(p => p.category === selectedCategory),
  [products, selectedCategory]
);
```

## EXAMPLES

### Server vs Client Component Example

#### ✅ Correct: Proper Server/Client Component Separation

```typescript
// app/products/page.tsx - Server Component (no directive needed)
import ProductGrid from './ProductGrid';
import { getProducts } from '@/lib/data';

export default async function ProductsPage() {
  // Data fetching at the server level
  const products = await getProducts();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <ProductGrid initialProducts={products} />
    </div>
  );
}
```

```typescript
// app/products/ProductGrid.tsx - Client Component
'use client';
import { useState, useCallback, useMemo } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

type Props = {
  initialProducts: Product[];
};

export default function ProductGrid({ initialProducts }: Props): JSX.Element {
  const [filter, setFilter] = useState('');
  
  // ✅ useCallback for event handler
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  }, []);
  
  // ✅ useMemo for derived state
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => 
      p.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [initialProducts, filter]);
  
  return (
    <div>
      <input 
        type="text" 
        placeholder="Filter products..." 
        value={filter} 
        onChange={handleFilterChange} 
        className="p-2 border mb-4"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

#### ❌ Incorrect: Mixing Client/Server Concerns

```typescript
// ❌ BAD: Mixing client-side interactivity in what should be a server component
import { useState } from 'react';

export default async function ProductsPage() {
  const products = await fetch('/api/products').then(res => res.json());
  
  // ❌ Error: Using client hooks in a server component
  const [filter, setFilter] = useState('');
  
  return (
    <div>
      <input 
        value={filter}
        onChange={(e) => setFilter(e.target.value)} 
      />
      {/* Rest of component */}
    </div>
  );
}
```

### useEffect Dependency Management Example

#### ✅ Correct: Proper useEffect with Stable Dependencies

```typescript
import { useState, useEffect, useCallback } from 'react';

function DataFetcher({ userId }: { userId: string }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // ✅ Stable fetch function with useCallback
  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      const userData = await response.json();
      setData(userData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // Only depends on userId
  
  // ✅ Clean effect with proper dependencies
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      await fetchUserData();
      // Only update state if component is still mounted
      if (!isMounted) return;
    };
    
    loadData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [fetchUserData]); // Correctly depends on memoized fetch function
  
  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : data ? (
        <UserProfile userData={data} />
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}
```

#### ❌ Incorrect: Unstable Dependencies Causing Loops

```typescript
function DataFetcher({ userId }: { userId: string }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // ❌ BAD: Creating function inside effect without cleanup
    const fetchData = async () => {
      const response = await fetch(`/api/users/${userId}`);
      const userData = await response.json();
      setData(userData);
    };
    
    fetchData();
    
    // ❌ BAD: Missing cleanup for async operations
    // No cleanup function
  }, [userId]);
  
  // ❌ BAD: Object created inline in render
  const userConfig = { id: userId, timestamp: Date.now() };
  
  useEffect(() => {
    console.log('User config changed:', userConfig);
    // ❌ BAD: This will run on EVERY render because userConfig is a new object each time
  }, [userConfig]);
  
  return <div>{/* Component JSX */}</div>;
}
```

### Context Provider Optimization Example

#### ✅ Correct: Optimized Context Provider

```typescript
import { createContext, useContext, useState, useMemo, useCallback } from 'react';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // ✅ Stable callback that won't change between renders
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);
  
  // ✅ Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => {
    return { isDarkMode, toggleTheme };
  }, [isDarkMode, toggleTheme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

#### ❌ Incorrect: Inefficient Context Implementation

```typescript
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // ❌ BAD: Function recreated on every render
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // ❌ BAD: Object created inline without memoization
  // This causes all consumers to re-render on EVERY render of the provider
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
