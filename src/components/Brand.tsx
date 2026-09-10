import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'

export function Icon({ icon, size = 20 }: { icon: IconSvgElement; size?: number }) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={size >= 32 ? 1.5 : 2} aria-hidden="true" />
}

export function Brand() {
  return <span className="inline-flex items-center gap-2.5 text-title-2-medium text-text-primary"><span className="grid size-7 place-items-center rounded-full bg-accent-600 text-body-semibold text-text-white" aria-hidden="true">S</span>stockdrop</span>
}
