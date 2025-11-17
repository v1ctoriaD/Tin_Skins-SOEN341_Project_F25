import { createClient } from '@supabase/supabase-js'

let supabase

if (process.env.NODE_ENV === 'test') {
  // Jest will automatically use __mocks__/supabase.js
  supabase = {}
} else {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export default supabase
