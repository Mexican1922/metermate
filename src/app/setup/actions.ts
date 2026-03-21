"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function createHouse(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const houseName = formData.get("house_name") as string;
  const tenantName = formData.get("tenant_name") as string;

  // 1. Create House
  const { data: house, error: houseError } = await supabase
    .from("houses")
    .insert([{ name: houseName, created_by: user.id }])
    .select()
    .single();

  if (houseError || !house) {
    console.error("Error creating house:", houseError);
    // Include the actual error message or code
    let errorMsg = houseError?.message || "Failed to create house";
    redirect(`/setup?error=${encodeURIComponent(errorMsg)}`);
  }

  // 2. Create Tenant (The creator is also a tenant)
  const { error: tenantError } = await supabase
    .from("tenants")
    .insert([{ house_id: house.id, user_id: user.id, name: tenantName }]);

  if (tenantError) {
    console.error("Error creating initial tenant:", tenantError);
    let errorMsg = tenantError?.message || "Failed to create tenant profile";
    redirect(`/setup?error=${encodeURIComponent(errorMsg)}`);
  }

  // Redirect to dashboard on success
  redirect("/dashboard");
}

export async function joinHouse(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const houseId = formData.get("house_id") as string;
  const tenantName = formData.get("tenant_name") as string;

  // Note: For a real app, you might want an invite code system,
  // but for MVP, we'll let them join if they have the exact UUID.
  const { error } = await supabase
    .from("tenants")
    .insert([{ house_id: houseId, user_id: user.id, name: tenantName }]);

  if (error) {
    console.error("Error joining house:", error);
    redirect("/setup?error=Failed to join house. Check the ID.");
  }

  redirect("/dashboard");
}
