import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formata intervalo de amperagem para exibição (ex.: "32 A" ou "32–125 A"). */
export function formatAmperageRange(station: {
  min_current_a?: number
  max_current_a?: number
}): string {
  const min = station.min_current_a
  const max = station.max_current_a
  if (min == null || max == null) return "—"
  if (min === max) return `${min} A`
  return `${min}–${max} A`
}

/** Formata intervalo de potência em kW para exibição (ex.: "22 kW" ou "22–50 kW"). */
export function formatPowerRange(station: {
  min_power_kw?: number
  max_power_kw?: number
  power_output?: string
}): string {
  const min = station.min_power_kw
  const max = station.max_power_kw
  if (min != null && max != null) {
    if (min === max) return `${min} kW`
    return `${min}–${max} kW`
  }
  return station.power_output?.trim() || "—"
}
