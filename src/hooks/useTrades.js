import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTrades() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTrades()
  }, [])

  async function fetchTrades() {
    setLoading(true)
    const { data, error } = await supabase
      .from('trades')
      .select(`
        *,
        trade_tags (
          tags ( id, name )
        )
      `)
      .order('trade_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setTrades(data || [])
    setLoading(false)
  }

  async function addTrade(tradeData, selectedTagNames) {
    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert([tradeData])
      .select()
      .single()

    if (tradeError) return { error: tradeError.message }

    if (selectedTagNames.length > 0) {
      for (const name of selectedTagNames) {
        let { data: tag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', name)
          .eq('user_id', tradeData.user_id)
          .maybeSingle()

        if (!tag) {
          const { data: newTag } = await supabase
            .from('tags')
            .insert([{ name, user_id: tradeData.user_id }])
            .select()
            .single()
          tag = newTag
        }

        await supabase
          .from('trade_tags')
          .insert([{ trade_id: trade.id, tag_id: tag.id }])
      }
    }

    await fetchTrades()
    return { success: true }
  }

  return { trades, loading, error, addTrade, refetch: fetchTrades }
}