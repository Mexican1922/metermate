"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/cloudinary";

export async function addReadings(formData: FormData) {
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

  const houseId = tenant.house_id;
  const unitPrice = parseFloat(formData.get("unit_price") as string);

  const elecCurrStr = formData.get("elec_current_reading") as string;
  const pumpCurrStr = formData.get("pump_current_reading") as string;
  const includeElec = elecCurrStr !== null && elecCurrStr !== "";
  const includePump = pumpCurrStr !== null && pumpCurrStr !== "";

  if (!includeElec && !includePump) {
    return { error: "Please include at least one reading." };
  }

  const { data: allTenants } = await supabase
    .from("tenants")
    .select("id")
    .eq("house_id", houseId)
    .eq("is_active", true);

  const activeTenants = allTenants || [];

  function getTenantsToBill(
    splitType: string,
    splitTenantIds: string[],
  ): { id: string }[] {
    if (splitType === "individual") return [{ id: tenant!.id }];
    if (splitType === "equal") return activeTenants;
    if (splitType === "custom" && splitTenantIds.length > 0)
      return splitTenantIds.map((id) => ({ id }));
    return activeTenants;
  }

  // Process Electricity
  let elecReading = null;
  let elecTenantsToBill: { id: string }[] = [];
  let elecSplitAmount = 0;

  if (includeElec) {
    const prevR = parseFloat(formData.get("elec_previous_reading") as string);
    const currR = parseFloat(elecCurrStr);

    if (currR < prevR) {
      return {
        error: "Electricity: current reading cannot be lower than previous.",
      };
    }

    const unitsUsed = currR - prevR;
    const totalCost = unitsUsed * unitPrice;
    const splitType = formData.get("elec_split_type") as string;
    const splitIds = formData.getAll("elec_split_tenant_ids") as string[];

    // Upload to Cloudinary
    const imageFile = formData.get("elec_proof_image") as File | null;
    const proofUrl =
      imageFile && imageFile.size > 0
        ? await uploadImage(imageFile, `readings/${houseId}`)
        : null;

    elecTenantsToBill = getTenantsToBill(splitType, splitIds);
    elecSplitAmount = totalCost / (elecTenantsToBill.length || 1);

    const { data, error } = await supabase
      .from("readings")
      .insert([
        {
          house_id: houseId,
          recorded_by: user.id,
          type: "electricity",
          previous_reading: prevR,
          current_reading: currR,
          units_used: unitsUsed,
          unit_price: unitPrice,
          total_cost: totalCost,
          proof_image_url: proofUrl,
          split_type: splitType,
          split_tenant_ids: splitType === "custom" ? splitIds : null,
        },
      ])
      .select()
      .single();

    if (error || !data) return { error: "Failed to save electricity reading." };
    elecReading = data;
  }

  // Process Pumping Machine
  let pumpReading = null;
  let pumpTenantsToBill: { id: string }[] = [];
  let pumpSplitAmount = 0;

  if (includePump) {
    const prevR = parseFloat(formData.get("pump_previous_reading") as string);
    const currR = parseFloat(pumpCurrStr);

    if (currR < prevR) {
      return {
        error:
          "Pumping machine: current reading cannot be lower than previous.",
      };
    }

    const unitsUsed = currR - prevR;
    const totalCost = unitsUsed * unitPrice;
    const splitType = formData.get("pump_split_type") as string;
    const splitIds = formData.getAll("pump_split_tenant_ids") as string[];

    // Upload to Cloudinary
    const imageFile = formData.get("pump_proof_image") as File | null;
    const proofUrl =
      imageFile && imageFile.size > 0
        ? await uploadImage(imageFile, `readings/${houseId}`)
        : null;

    pumpTenantsToBill = getTenantsToBill(splitType, splitIds);
    pumpSplitAmount = totalCost / (pumpTenantsToBill.length || 1);

    const { data, error } = await supabase
      .from("readings")
      .insert([
        {
          house_id: houseId,
          recorded_by: user.id,
          type: "pumping_machine",
          previous_reading: prevR,
          current_reading: currR,
          units_used: unitsUsed,
          unit_price: unitPrice,
          total_cost: totalCost,
          proof_image_url: proofUrl,
          split_type: splitType,
          split_tenant_ids: splitType === "custom" ? splitIds : null,
        },
      ])
      .select()
      .single();

    if (error || !data)
      return { error: "Failed to save pumping machine reading." };
    pumpReading = data;
  }

  // Combine into one bill
  const allBilledTenantIds = [
    ...new Set([
      ...elecTenantsToBill.map((t) => t.id),
      ...pumpTenantsToBill.map((t) => t.id),
    ]),
  ];

  const primaryReading = elecReading || pumpReading;
  const totalCombined =
    (elecReading?.total_cost || 0) + (pumpReading?.total_cost || 0);

  const { data: bill, error: billError } = await supabase
    .from("bills")
    .insert([
      {
        house_id: houseId,
        reading_id: primaryReading!.id,
        total_amount: totalCombined,
        split_amount: totalCombined / (allBilledTenantIds.length || 1),
      },
    ])
    .select()
    .single();

  if (billError || !bill) return { error: "Failed to create bill." };

  const paymentsToInsert = allBilledTenantIds.map((tenantId) => {
    const elecShare = elecTenantsToBill.find((t) => t.id === tenantId)
      ? elecSplitAmount
      : 0;
    const pumpShare = pumpTenantsToBill.find((t) => t.id === tenantId)
      ? pumpSplitAmount
      : 0;
    return {
      bill_id: bill.id,
      tenant_id: tenantId,
      amount_due: elecShare + pumpShare,
      status: "pending",
    };
  });

  const { error: paymentError } = await supabase
    .from("payments")
    .insert(paymentsToInsert);

  if (paymentError) return { error: "Failed to assign payments." };

  revalidatePath("/dashboard/readings");
  revalidatePath("/dashboard");
  return { success: true };
}
