"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: tenant } = await supabase
    .from("tenants")
    .select("house_id, houses(created_by)")
    .eq("user_id", user.id)
    .single();

  // @ts-ignore
  if (!tenant || tenant.houses?.created_by !== user.id) {
    return { error: "Unauthorized" };
  }

  return { supabase, user, houseId: tenant.house_id };
}

export async function approvePayment(paymentId: string) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) return { error: adminCheck.error };

  const { error } = await adminCheck
    .supabase!.from("payments")
    .update({ status: "paid" })
    .eq("id", paymentId);

  if (error) return { error: "Failed to approve payment" };

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/payments");
  return { success: true };
}

export async function rejectPayment(paymentId: string) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) return { error: adminCheck.error };

  const { error } = await adminCheck
    .supabase!.from("payments")
    .update({
      status: "pending",
      proof_image_url: null,
      paid_at: null,
    })
    .eq("id", paymentId);

  if (error) return { error: "Failed to reject payment" };

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/payments");
  return { success: true };
}

export async function deactivateTenant(tenantId: string) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) return { error: adminCheck.error };

  const { data: targetTenant } = await adminCheck
    .supabase!.from("tenants")
    .select("user_id")
    .eq("id", tenantId)
    .single();

  if (targetTenant?.user_id === adminCheck.user?.id) {
    return { error: "Cannot deactivate yourself" };
  }

  const { error } = await adminCheck
    .supabase!.from("tenants")
    .update({ is_active: false })
    .eq("id", tenantId);

  if (error) return { error: "Failed to deactivate tenant" };

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addTenant(formData: FormData) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) return { error: adminCheck.error };

  const name = formData.get("name") as string;

  if (!name || name.trim() === "") {
    return { error: "Please enter a tenant name." };
  }

  // Check if tenant name already exists in house
  const { data: existing } = await adminCheck
    .supabase!.from("tenants")
    .select("id")
    .eq("house_id", adminCheck.houseId)
    .ilike("name", name.trim())
    .single();

  if (existing) {
    return { error: "A tenant with this name already exists." };
  }

  // Insert tenant without user_id (manual/offline tenant)
  const { error } = await adminCheck.supabase!.from("tenants").insert([
    {
      house_id: adminCheck.houseId,
      name: name.trim(),
      user_id: null,
      is_active: true,
    },
  ]);

  if (error) {
    return { error: "Failed to add tenant." };
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");
  return { success: true };
}
