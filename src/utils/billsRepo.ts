import type { SupabaseClient } from '@supabase/supabase-js';
import type { Transaction } from '../types';

type BillRow = {
  id: string;
  device_id: string;
  data: Transaction;
  updated_at?: string;
  created_at?: string;
};

function toRow(deviceId: string, tx: Transaction): BillRow {
  return {
    id: tx.id,
    device_id: deviceId,
    data: tx,
    updated_at: new Date().toISOString(),
  };
}

export const billsRepo = {
  async listByDeviceId(supabase: SupabaseClient, deviceId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('bills')
      .select('data')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const rows = (data ?? []) as Array<Pick<BillRow, 'data'>>;
    return rows.map((r) => r.data).filter(Boolean);
  },

  async upsertOne(supabase: SupabaseClient, deviceId: string, tx: Transaction): Promise<void> {
    const { error } = await supabase.from('bills').upsert(toRow(deviceId, tx), { onConflict: 'id' });
    if (error) throw error;
  },

  async upsertMany(supabase: SupabaseClient, deviceId: string, txs: Transaction[]): Promise<void> {
    if (txs.length === 0) return;
    const rows = txs.map((tx) => toRow(deviceId, tx));
    const { error } = await supabase.from('bills').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  },

  async deleteOne(supabase: SupabaseClient, deviceId: string, id: string): Promise<void> {
    const { error } = await supabase.from('bills').delete().eq('device_id', deviceId).eq('id', id);
    if (error) throw error;
  },
};

