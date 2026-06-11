const { data } = await supabase
  .from("client_notes")
  .select("*")
  .eq("client_email", email)
  .order("session_date", { ascending: false });