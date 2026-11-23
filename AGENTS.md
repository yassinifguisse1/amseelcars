# Project instructions

## Gift wheel: keep disabled

The owner requested on 2026-11-23 that the gift wheel stay disabled until they explicitly ask to bring it back.

- Keep `WHEEL_OF_CHANCE_ENABLED = false` in `src/lib/wheelOfChance.ts`.
- Do not re-enable it automatically after Black Friday, on a schedule, or during design, promotion, or deployment work.
- Only an explicit new request from the owner to restore the wheel authorizes enabling it.
- The existing disabled state hides the popup and ignores saved wheel gifts in bookings. Preserve stored claims for a possible future reactivation.
