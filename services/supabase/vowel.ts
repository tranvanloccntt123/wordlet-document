import { SUPABASE_SCHEMA, SUPABASE_TABLE } from "@/constants/Supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { getUsers, supabase } from "./client";

let vowelFetching: any = null;

export const clearVowelFetching = () => {
  vowelFetching = null;
};

export const fetchVowelPercent = async () => {
  const user = await getUsers();
  const response: PostgrestSingleResponse<VowelPercent[]> = await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.VOWEL_PERCENT)
    .select("*")
    .eq("user_id", user?.id);
  return response;
};

export const getVowelPercent = async () => {
  try {
    if (!vowelFetching) {
      vowelFetching = fetchVowelPercent();
    }

    const response: PostgrestSingleResponse<VowelPercent[]> =
      await vowelFetching;

    return response;
  } catch (e) {
    throw e;
  }
};

export const insertVowelPercent = async (char: string, percent: number) => {
  const user = await getUsers();
  const response = await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.VOWEL_PERCENT)
    .insert({ percent, char, user_id: user?.id })
    .select()
    .single();

  return response;
};

export const updateVowelPercent = async (char: string, percent: number) => {
  const user = await getUsers();
  const response = await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.VOWEL_PERCENT)
    .update({ percent })
    .eq("user_id", user?.id)
    .eq("char", char)
    .select()
    .single();

  return response;
};
