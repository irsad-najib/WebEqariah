# 🚀 Quick Reference - Error Handling & UI Components

## Toast Notifications

```tsx
// Import
import { useToast, ToastContainer } from "@/components/ui/toast";

// Setup
const { toasts, closeToast, success, error, info, warning } = useToast();

// Use
<ToastContainer toasts={toasts} onClose={closeToast} />;

success("Title", "Description");
error("Title", "Description");
info("Title", "Description");
warning("Title", "Description");
```

## Error Handler

```tsx
// Import
import { handleError, handleAsync } from "@/lib/utils/errorHandler";

// Method 1: Try-Catch
try {
  await operation();
} catch (err) {
  const appError = handleError(err);
  toast.error(appError.message, appError.description);
}

// Method 2: handleAsync
const [err, data] = await handleAsync(operation());
if (err) {
  toast.error(err.message, err.description);
}
```

## Loading Components

```tsx
// Import
import {
  Loading,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ButtonLoader
} from "@/components/ui/loading";

// Spinner
<Loading size="md" variant="spinner" text="Loading..." />

// Full screen
<Loading fullScreen size="lg" text="Loading..." />

// Skeleton
<Skeleton count={3} height="h-4" width="w-full" />

// Card Skeleton
<CardSkeleton count={2} />

// Table Skeleton
<TableSkeleton rows={5} columns={4} />

// Button Loader
<button disabled={loading}>
  {loading ? (
    <>
      <ButtonLoader className="mr-2" />
      Loading...
    </>
  ) : (
    "Submit"
  )}
</button>
```

## Complete Form Example

```tsx
"use client";
import { useState } from "react";
import { useToast, ToastContainer } from "@/components/ui/toast";
import { handleError } from "@/lib/utils/errorHandler";
import { ButtonLoader } from "@/components/ui/loading";
import { axiosInstance } from "@/lib/utils/api";

export default function MyForm() {
  const { toasts, closeToast, success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email) {
      error("Validation Error", "All fields are required");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/endpoint", formData);
      success("Success!", "Data saved successfully");
      // Reset form or redirect
    } catch (err) {
      const appError = handleError(err);
      error(appError.message, appError.description);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={closeToast} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Name"
          disabled={loading}
        />

        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Email"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg disabled:opacity-50">
          {loading ? (
            <>
              <ButtonLoader className="mr-2" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    </>
  );
}
```

## API Call with Loading State

```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await axiosInstance.get("/api/data");
    setData(response.data);
    success("Data Loaded", "Successfully fetched data");
  } catch (err) {
    const appError = handleError(err);
    error(appError.message, appError.description);
  } finally {
    setLoading(false);
  }
};

// In render
{
  loading ? (
    <CardSkeleton count={3} />
  ) : (
    data?.map((item) => <Card key={item.id} {...item} />)
  );
}
```

## Styling Classes (Tailwind)

```tsx
// Buttons
className =
  "bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed";

// Inputs
className =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200";

// Cards
className =
  "bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300";

// Container
className = "container mx-auto px-4 max-w-6xl";

// Page Background
className = "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100";
```

## Common Patterns

### Pattern 1: Form with Validation

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validation
  if (!formData.field) {
    error("Validation Error", "Field is required");
    return;
  }

  setLoading(true);
  try {
    await api.post("/endpoint", formData);
    success("Success!", "Data saved");
  } catch (err) {
    const appError = handleError(err);
    error(appError.message, appError.description);
  } finally {
    setLoading(false);
  }
};
```

### Pattern 2: Data Fetching with Loading

```tsx
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/endpoint");
      setData(response.data);
    } catch (err) {
      const appError = handleError(err);
      error(appError.message, appError.description);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

return loading ? <Loading fullScreen /> : <YourComponent data={data} />;
```

### Pattern 3: Delete with Confirmation

```tsx
const handleDelete = async (id: string) => {
  if (!confirm("Are you sure?")) return;

  setLoading(true);
  try {
    await api.delete(`/endpoint/${id}`);
    success("Deleted!", "Item removed successfully");
    // Refresh data
  } catch (err) {
    const appError = handleError(err);
    error(appError.message, appError.description);
  } finally {
    setLoading(false);
  }
};
```

## Files Location

- Toast: `/src/components/ui/toast.tsx`
- Loading: `/src/components/ui/loading.tsx`
- Error Handler: `/src/lib/utils/errorHandler.ts`
- API Client: `/src/lib/utils/api.ts`
- Examples: `/src/app/ui-examples/page.tsx`

## Resources

- Full Docs: `IMPROVEMENTS.md`
- Indonesian Guide: `PANDUAN-BAHASA-INDONESIA.md`
- Live Examples: Visit `/ui-examples` in browser
- Reference Login: `/src/app/login/page.tsx`
