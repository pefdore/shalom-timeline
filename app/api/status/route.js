import { NextResponse } from 'next/server'
import { getVotingDates, isVotingOpen } from '@/lib/sheets'

export async function GET() {
  const { startDate, endDate } = getVotingDates()
  const open = isVotingOpen(startDate, endDate)

  return NextResponse.json({
    open,
    startDate,
    endDate,
    message: open 
      ? 'Les votes sont ouverts!' 
      : `Les votes sont fermés. Réouverts du ${startDate} au ${endDate}`
  })
}