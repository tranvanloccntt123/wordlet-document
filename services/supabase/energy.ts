import {
  SUPABASE_FUNCTION,
  SUPABASE_SCHEMA,
  SUPABASE_TABLE,
} from "@/constants/Supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { getUsers, supabase } from "./client";

let energyFetching: any = null;

export const clearEnergyFetching = () => {
  energyFetching = null;
};

export const fetchEnergy = async () => {
  const user = await getUsers();
  const response: PostgrestSingleResponse<Energy> = await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.ENERGY)
    .select()
    .eq("user_id", user?.id)
    .single();

  return response;
};

export const getEnergy = async () => {
  try {
    if (!energyFetching) {
      energyFetching = fetchEnergy();
    }

    const response = await energyFetching;
    clearEnergyFetching();
    return response;
  } catch (e) {
    throw e;
  }
};

export const decreaseEnergy = async ({
  historyId,
  score,
  message,
}: {
  historyId?: number | null;
  score: number;
  message: string;
}) => {
  const response = await supabase!.functions.invoke(
    SUPABASE_FUNCTION.DECREASE_ENERGY,
    {
      body: { historyId, score, message },
    }
  );
  return response;
};

export const decreaseSuggest = async () => {
  const response = await supabase!.functions.invoke(
    SUPABASE_FUNCTION.DECREASE_SUGGEST
  );
  return response;
};

export const createNewGame = async (groupId?: number) => {
  try {
    const response = await supabase!.functions.invoke(
      SUPABASE_FUNCTION.NEW_GAME,
      {
        body: { groupId },
      }
    );
    return response;
  } catch (e) {
    throw e;
  }
};
