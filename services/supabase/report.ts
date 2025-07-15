import { SUPABASE_SCHEMA, SUPABASE_TABLE } from "@/constants/Supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { getUsers, supabase } from "./client";

export const getOwnerReportOnGroup = async (groupId: number) => {
  const user = await getUsers();
  if (!user) {
    throw "User not found";
  }
  const response: PostgrestSingleResponse<ReportGroup> = await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.REPORT)
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", user?.id)
    .single();
  return response;
};

export const inserReportOnGroup = async (
  description: string,
  groupId: number
) => {
  try {
    const user = await getUsers();
    if (!user) {
      throw "User not found";
    }
    const response = await supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.REPORT)
      .insert({ description, group_id: groupId, user_id: user?.id })
      .select()
      .single();

    return response;
  } catch (e) {
    throw e;
  }
};
