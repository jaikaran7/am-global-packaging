import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ENQUIRY_STATUSES } from "@/lib/enquiry-status";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "10", 10)));
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from("enquiries")
      .select("*, enquiry_items(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ENQUIRY_STATUSES.includes(status as typeof ENQUIRY_STATUSES[number])) {
      const legacyMap: Record<string, string[]> = {
        contact: ["contact", "contacted"],
        cancelled: ["cancelled", "closed"],
      };
      const statuses = legacyMap[status] ?? [status];
      query = statuses.length === 1 ? query.eq("status", statuses[0]) : query.in("status", statuses);
    }

    if (search?.trim()) {
      const term = search.trim();
      query = query.or(
        `full_name.ilike.%${term}%,email.ilike.%${term}%,company_name.ilike.%${term}%,phone.ilike.%${term}%,product.ilike.%${term}%,project_details.ilike.%${term}%`
      );
    }

    const { data: enquiries, error, count } = await query;

    if (error) {
      console.error("[api/admin/enquiries] list error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      items: enquiries ?? [],
      total: count ?? 0,
      page,
      limit,
    });
  } catch (e) {
    console.error("[api/admin/enquiries] GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
