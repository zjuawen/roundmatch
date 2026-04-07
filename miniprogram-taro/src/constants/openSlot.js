/** 与服务端 openSlot 常量一致：空位占位 id */
export const OPEN_SLOT_PLAYER_ID = '00000000-0000-0000-0000-000000000000'

export function isOpenSlotPlayer (player) {
  if (!player) return true
  const id = typeof player === 'string' ? player : player._id
  return id === OPEN_SLOT_PLAYER_ID || player.isOpenSlot === true || player.openSlot === true
}
