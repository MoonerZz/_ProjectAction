"use server";
import { requireProfile } from "@/lib/auth/service";
import {
  getMemberDetails,
  lookupError,
  searchMembers,
  type Member,
  type MemberDetails,
} from "@/lib/parliament";
export type LookupState = {
  error?: string;
  members?: Member[];
  more?: boolean;
  details?: MemberDetails;
  searched?: boolean;
};
export async function lookupRepresentative(
  _: LookupState,
  form: FormData,
): Promise<LookupState> {
  await requireProfile();
  try {
    if (form.has("memberId")) {
      const memberId = Number(form.get("memberId"));
      if (!Number.isSafeInteger(memberId) || memberId < 1)
        return { error: "Choose an MP from the search results." };
      return { details: await getMemberDetails(memberId) };
    }
    const query = String(form.get("location") || "")
      .trim()
      .replace(/\s+/g, " ");
    const error = lookupError(query);
    if (error) return { error };
    const result = await searchMembers(query);
    return {
      ...result,
      searched: true,
      ...(result.members.length === 1
        ? { details: await getMemberDetails(result.members[0].id) }
        : {}),
    };
  } catch {
    // Do not log upstream URLs/errors: they can contain a postcode.
    return {
      error:
        "Parliament’s records could not be loaded. Please try again shortly.",
    };
  }
}
