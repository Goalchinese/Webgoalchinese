<template>
  <VChip
    v-if="value"
    size="small"
    :color="color"
    variant="tonal"
    :rounded="rounded"
    :label="label"
  >
    <VIcon v-if="icon" start :icon="icon" size="16" />
    {{ text }}
  </VChip>
  <span v-else>-</span>
</template>

<script setup lang="ts">
type ChipType =
  | "studentType"
  | "classType"
  | "status"
  | "documentType"
  | "gender"
  | "avaliableForClass"
  | "day"
  | "timeSlot"

const props = withDefaults(
  defineProps<{
    type: ChipType
    value?: string | null
    rounded?: string | number | boolean
    label?: boolean
  }>(),
  {
    value: "",
    rounded: "pill",
    label: false,
  }
)

const STUDENT_TYPE_MAP: Record<string, { color: string; icon: string }> = {
  Online: { color: "success", icon: "tabler-wifi" },
  Offline: { color: "error", icon: "tabler-wifi-off" },
}

const CLASS_TYPE_MAP: Record<string, { color: string; icon: string }> = {
  Private: { color: "primary", icon: "tabler-lock" },
  Group: { color: "info", icon: "tabler-users" },
}

const STATUS_MAP: Record<string, { color: string; icon: string }> = {
  Active: { color: "success", icon: "tabler-circle-check" },
  Inactive: { color: "error", icon: "tabler-circle-x" },
}

const GENDER_MAP: Record<string, { color: string; icon: string }> = {
  Male: { color: "info", icon: "tabler-gender-male" },
  Female: { color: "pink", icon: "tabler-gender-female" },
}

const AVALIABLE_FOR_CLASS_MAP: Record<string, { color: string; icon: string }> = {
  Kids: { color: "success", icon: "tabler-baby-carriage" },
  Adult: { color: "info", icon: "tabler-user" },
  "Kids & Adult": { color: "primary", icon: "tabler-users" },
}

const DAY_MAP: Record<string, { color: string; icon: string }> = {
  Mon: { color: "warning", icon: "" },
  Tue: { color: "pink", icon: "" },
  Wed: { color: "success", icon: "" },
  Thu: { color: "orange", icon: "" },
  Fri: { color: "info", icon: "" },
  Sat: { color: "purple", icon: "" },
  Sun: { color: "error", icon: "" },
}

const DOCUMENT_TYPE_MAP: Record<string, { color: string; icon: string }> = {
  pdf: { color: "error", icon: "tabler-file-type-pdf" },
  pptx: { color: "warning", icon: "tabler-presentation" },
  mp4: { color: "purple", icon: "tabler-video" },
  youtube: { color: "error", icon: "tabler-brand-youtube" },
  canva: { color: "info", icon: "tabler-brush" },
  link: { color: "primary", icon: "tabler-link" },
  image: { color: "success", icon: "tabler-photo" },
}

const MAP_BY_TYPE: Partial<Record<ChipType, Record<string, { color: string; icon: string }>>> = {
  studentType: STUDENT_TYPE_MAP,
  classType: CLASS_TYPE_MAP,
  status: STATUS_MAP,
  documentType: DOCUMENT_TYPE_MAP,
  gender: GENDER_MAP,
  avaliableForClass: AVALIABLE_FOR_CLASS_MAP,
  day: DAY_MAP,
}

// timeSlot value looks like "09:00 - 10:00" — bucket by start hour instead of an exact-string map
function timeSlotMeta(value: string): { color: string; icon: string } {
  const startHour = Number(value.split(":")[0])

  if (Number.isNaN(startHour)) return { color: "grey", icon: "" }
  if (startHour < 12) return { color: "info", icon: "" }
  if (startHour < 17) return { color: "warning", icon: "" }
  if (startHour < 21) return { color: "purple", icon: "" }

  return { color: "indigo", icon: "" }
}

const meta = computed(() => {
  const key = props.value ?? ""

  if (props.type === "timeSlot") return timeSlotMeta(key)

  const map = MAP_BY_TYPE[props.type] ?? {}
  const matchedKey = Object.keys(map).find(
    (mapKey) => mapKey.toLowerCase() === key.toLowerCase()
  )

  return (matchedKey ? map[matchedKey] : undefined) ?? { color: "grey", icon: "tabler-tag" }
})

const color = computed(() => meta.value.color)
const icon = computed(() => meta.value.icon)
const text = computed(() => props.value)
</script>
