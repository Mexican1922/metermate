"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/cloudinary";

export async function markAsPaid(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, house_id")
    .eq("user_id", user.id)
    .single();

  if (!tenant) redirect("/setup");

  const paymentId = formData.get("payment_id") as string;
  const imageFile = formData.get("proof_image") as File | null;

  if (!imageFile || imageFile.size === 0) {
    return { error: "Please upload a payment receipt as proof." };
  }

  // Upload to Cloudinary
  const proofImageUrl = await uploadImage(
    imageFile,
    `payments/${tenant.house_id}`,
  );

  if (!proofImageUrl) {
    return { error: "Failed to upload proof image. Please try again." };
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({
      status: "pending_approval",
      proof_image_url: proofImageUrl,
      paid_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .eq("tenant_id", tenant.id);

  if (updateError) {
    return { error: "Failed to update payment status." };
  }

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard");
  return { success: true };
}
