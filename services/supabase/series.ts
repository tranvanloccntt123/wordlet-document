import { SUPABASE_SCHEMA, SUPABASE_TABLE } from "@/constants/Supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { getUsers, supabase } from "./client";

let ownerSeriesFetching: any = null;

export const clearOwnerSeriesFetching = () => {
  ownerSeriesFetching = null;
};

const fetchOwnerSeries = async () => {
  const user = await getUsers();
  if (!user) {
    throw "User not found";
  }
  const response = await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.SERIES)
    .select("*")
    .eq("user_id", user?.id);
  return response;
};

export const getOwnerSeries = async () => {
  if (!ownerSeriesFetching) {
    ownerSeriesFetching = fetchOwnerSeries();
  }
  const response: PostgrestSingleResponse<Series[]> = await ownerSeriesFetching;

  ownerSeriesFetching = null;

  return response;
};

export const insertOwnerSeries = async (
  serie: Omit<Omit<Omit<Series, "id">, "user_id">, "is_boosted">
) => {
  try {
    const user = await getUsers();
    if (!user) {
      throw "User not found";
    }
    const response: PostgrestSingleResponse<Series> = await supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.SERIES)
      .insert({ ...serie, user_id: user?.id })
      .select()
      .single();

    return response;
  } catch (e) {
    throw e;
  }
};

export const updateOwnerSeries = async (serie: Series) => {
  try {
    const { id, ...newData } = serie;
    const user = await getUsers();
    const { user_id, ...params } = newData;
    if (user?.id != user_id) {
      throw "Not owner";
    }
    const response = await supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.SERIES)
      .update(params)
      .eq("id", id)
      .select()
      .single();
    return response;
  } catch (e) {
    throw e;
  }
};

export const deleteOwnerSeries = async (serieId: number) => {
  await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.SERIES)
    .delete()
    .eq("id", serieId);
};

export const getSerieDetail = async (serieId: number) => {
  try {
    const response: PostgrestSingleResponse<Series> = await supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.SERIES)
      .select("*")
      .eq("id", serieId)
      .single();

    return response;
  } catch (e) {
    throw e;
  }
};
