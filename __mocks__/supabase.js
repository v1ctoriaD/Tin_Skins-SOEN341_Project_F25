// __mocks__/supabase.js

// This mock replaces all calls to Supabase during tests.
// You can customize returned data per test if you want.

export const supabase = {
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: [], error: null }),
    update: () => ({ data: [], error: null }),
    delete: () => ({ data: [], error: null })
  })
};

export default supabase;
