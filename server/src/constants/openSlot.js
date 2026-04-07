'use strict'

/** 数据库 games.player1..4 中表示「尚未报名空位」的占位 UUID（非 players 表真实记录） */
exports.OPEN_SLOT_PLAYER_ID = '00000000-0000-0000-0000-000000000000'

exports.isOpenSlotPlayerId = (id) => {
  if (id === null || id === undefined) return true
  return String(id) === exports.OPEN_SLOT_PLAYER_ID
}
